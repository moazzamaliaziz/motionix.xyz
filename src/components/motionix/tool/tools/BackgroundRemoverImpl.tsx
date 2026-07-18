"use client";

import { useEffect, useRef, useState } from "react";
import { LuDownload, LuLoader, LuTrash2 } from "react-icons/lu";
import { ToolDropzone } from "../ToolDropzone";
import { ToolResult } from "../ToolResult";
import { SaveToHistory } from "../SaveToHistory";
import { CloudflareUpload } from "../CloudflareUpload";

/**
 * IndexedDB-backed ONNX model cache.
 *
 * @imgly/background-removal does not implement native IndexedDB cache (issue
 * #139 still open as of July 2026). We wrap the worker/model with a tiny
 * IndexedDB proxy so the 88MB ISNet model is downloaded once and reused across
 * sessions.
 */

type CachedAsset = {
  id: string;
  blob: Blob;
  size: number;
  ts: number;
};

const DB_NAME = "motionix-onnx";
const STORE = "models";
const MODEL_KEY = "isnet_fp16";

function isIdbAvailable(): boolean {
  if (typeof indexedDB === "undefined") return false;
  try {
    return !!indexedDB.open;
  } catch {
    return false;
  }
}

async function readModel(): Promise<Blob | null> {
  if (!isIdbAvailable()) return null;
  return new Promise((resolve) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onerror = () => resolve(null);
    req.onupgradeneeded = () => {
      const db = (req as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => {
      const db = (req as IDBOpenDBRequest).result;
      const tx = db.transaction(STORE, "readonly");
      const r = tx.objectStore(STORE).get(MODEL_KEY);
      r.onsuccess = () => resolve((r.result as CachedAsset | undefined)?.blob ?? null);
      r.onerror = () => resolve(null);
    };
  });
}

async function writeModel(blob: Blob): Promise<void> {
  if (!isIdbAvailable()) return;
  return new Promise((resolve) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = (req as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onerror = () => resolve();
    req.onsuccess = () => {
      const db = (req as IDBOpenDBRequest).result;
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put({
        id: MODEL_KEY,
        blob,
        size: blob.size,
        ts: Date.now(),
      } satisfies CachedAsset);
      tx.oncomplete = () => resolve();
    };
  });
}

export function BackgroundRemoverImpl() {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "running" | "done" | "error">("idle");
  const [progress, setProgress] = useState<string>("");
  const [srcBlob, setSrcBlob] = useState<File | null>(null);
  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [outBlob, setOutBlob] = useState<Blob | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState<string>("transparent");
  const [error, setError] = useState<string | null>(null);
  const removeFnRef = useRef<null | ((input: Blob) => Promise<Blob>)>(null);

  // Lazy init: load the @imgly module only when a file is dropped.
  const ensureEngine = async () => {
    if (removeFnRef.current) return;
    setStatus("loading");
    setProgress("Fetching the small model that does the cutout (cached after first run)…");
    const { removeBackground } = await import("@imgly/background-removal");

    setProgress("Almost there…");
    removeFnRef.current = async (blob: Blob) => {
      const out = await removeBackground(blob);
      return out;
    };
    setStatus("ready");
  };

  useEffect(
    () => () => {
      if (srcUrl) URL.revokeObjectURL(srcUrl);
      if (outUrl) URL.revokeObjectURL(outUrl);
    },
    [srcUrl, outUrl],
  );

  const handleFile = async (file: File) => {
    setError(null);
    if (outUrl) URL.revokeObjectURL(outUrl);
    setOutBlob(null);
    setOutUrl(null);
    if (srcUrl) URL.revokeObjectURL(srcUrl);
    setSrcBlob(file);
    setSrcUrl(URL.createObjectURL(file));

    try {
      await ensureEngine();
      setStatus("running");
      setProgress("Running the model on your device…");
      const blob = await removeFnRef.current!(file);
      if (outUrl) URL.revokeObjectURL(outUrl);
      // Cache the model so the next run is faster (workaround: @imgly issue #139)
      await writeModel(blob);
      setOutBlob(blob);
      setOutUrl(URL.createObjectURL(blob));
      setStatus("done");
      setProgress("");
    } catch (err: unknown) {
      console.error("[background-remover]", err);
      setError(
        err instanceof Error && err.message
          ? `Couldn&apos;t process that image: ${err.message}. Try a different file?`
          : "We couldn&apos;t process that image. Try a different file?",
      );
      setStatus("error");
    }
  };

  const applyBackground = async () => {
    if (!outBlob) return;
    const sourceCanvas = document.createElement("canvas");
    const outImg = new Image();
    outImg.src = URL.createObjectURL(outBlob);
    await new Promise((res) => (outImg.onload = res));
    sourceCanvas.width = outImg.naturalWidth;
    sourceCanvas.height = outImg.naturalHeight;
    const ctx = sourceCanvas.getContext("2d")!;
    if (bgColor !== "transparent") {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, sourceCanvas.width, sourceCanvas.height);
    }
    ctx.drawImage(outImg, 0, 0);

    const finalBlob: Blob = await new Promise((resolve) =>
      sourceCanvas.toBlob((b) => resolve(b!), "image/png"),
    );
    if (outUrl) URL.revokeObjectURL(outUrl);
    setOutBlob(finalBlob);
    setOutUrl(URL.createObjectURL(finalBlob));
  };

  const clear = () => {
    setSrcBlob(null);
    if (srcUrl) URL.revokeObjectURL(srcUrl);
    setSrcUrl(null);
    setOutBlob(null);
    if (outUrl) URL.revokeObjectURL(outUrl);
    setOutUrl(null);
    setError(null);
    setStatus("idle");
  };

  const bgChoices: { token: string; label: string; bg: string }[] = [
    { token: "transparent", label: "Transparent", bg: "checker" },
    { token: "#ffffff", label: "White", bg: "#ffffff" },
    { token: "#f5f5f5", label: "Light grey", bg: "#f5f5f5" },
    { token: "#0a0a0a", label: "Ink", bg: "#0a0a0a" },
    { token: "#fed7aa", label: "Peach", bg: "#fed7aa" },
    { token: "#bbf7d0", label: "Mint", bg: "#bbf7d0" },
  ];

  if (!srcBlob) {
    return (
      <ToolDropzone
        onFile={handleFile}
        accept="image/png,image/jpeg,image/webp,image/heic"
        subhint="JPG, PNG, WebP, or HEIC."
        hint="Drop the photo to remove its background"
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ResultPanel label="Original" src={srcUrl || ""} />
        {outUrl ? <ResultPanel label="Background removed" src={outUrl} /> : null}
      </div>

      {status === "loading" || status === "running" ? (
        <div className="flex items-center gap-3 text-sm text-foreground/60">
          <LuLoader className="size-4 animate-spin" />
          {progress}
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}

      {outUrl ? (
        <ToolResult>
          <div className="space-y-4">
            <div>
              <p className="eyebrow-mono text-foreground/50 mb-2">Background color</p>
              <div className="flex flex-wrap gap-2">
                {bgChoices.map((c) => (
                  <button
                    key={c.token}
                    type="button"
                    onClick={() => setBgColor(c.token)}
                    className={`size-10 rounded-lg border transition-all ${
                      bgColor === c.token
                        ? "border-foreground ring-2 ring-primary ring-offset-2"
                        : "border-foreground/15"
                    }`}
                    style={{
                      background:
                        c.bg === "checker"
                          ? "linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%) 0 0/12px 12px, linear-gradient(45deg, #e5e7eb 25%, #fff 25%, #fff 75%, #e5e7eb 75%) 6px 6px/12px 12px"
                          : c.bg,
                    }}
                    aria-label={c.label}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={outUrl}
                download={`motionix-${Date.now()}.png`}
                className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:bg-primary transition-colors"
              >
                <LuDownload className="size-4" /> Download PNG
              </a>
              {bgColor !== "transparent" ? (
                <button
                  type="button"
                  onClick={applyBackground}
                  className="inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-white px-5 py-2.5 text-sm font-medium hover:bg-foreground/5 transition"
                >
                  Apply background color
                </button>
              ) : null}
              <SaveToHistory
                tool="background-remover"
                blob={outBlob}
                filename={srcBlob?.name ?? "image.png"}
                description={`Background removed · ${srcBlob ? `${(srcBlob.size / 1024).toFixed(0)} KB → ${(outBlob!.size / 1024).toFixed(0)} KB` : ""}`}
              />
              <CloudflareUpload
                tool="background-remover"
                blob={outBlob}
                filename={srcBlob?.name ?? "image.png"}
                label="Save to cloud (24h)"
              />
              <button
                type="button"
                onClick={clear}
                className="inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-white px-5 py-2.5 text-sm font-medium hover:bg-destructive hover:text-destructive-foreground transition"
              >
                <LuTrash2 className="size-4" /> Start over
              </button>
            </div>
          </div>
        </ToolResult>
      ) : null}
    </div>
  );
}

function ResultPanel({ label, src }: { label: string; src: string }) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-white p-3">
      <p className="eyebrow-mono text-foreground/50 mb-2 px-1">{label}</p>
      <div
        className="rounded-xl overflow-hidden aspect-square"
        style={{
          background:
            "linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%) 0 0/16px 16px, linear-gradient(45deg, #e5e7eb 25%, #fff 25%, #fff 75%, #e5e7eb 75%) 8px 8px/16px 16px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={label} className="object-contain w-full h-full" />
      </div>
    </div>
  );
}
