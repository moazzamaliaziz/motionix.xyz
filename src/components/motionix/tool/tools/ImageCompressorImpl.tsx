"use client";

import { useEffect, useRef, useState } from "react";
import { LuDownload } from "react-icons/lu";
import { ToolDropzone } from "../ToolDropzone";
import { ToolResult } from "../ToolResult";

/**
 * Image compressor — tries to stay visually identical while shrinking the file.
 *
 * Strategy:
 *   - PNG:   lossless Zlib library first, then if target demands it, lossy
 *            palette mode (`cnum` 256 = lossy-max).
 *   - JPEG:  binary-search on quality to hit a KB target.
 *   - WebP:  Canvas + lossy quality, ~30% smaller than same-quality JPEG.
 *
 * Default behaviour: target the same file or smaller at quality 0.85.
 */

type Target = "best" | "kb" | "pct";

export function ImageCompressorImpl() {
  const [file, setFile] = useState<File | null>(null);
  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [outBlob, setOutBlob] = useState<Blob | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const [target, setTarget] = useState<Target>("best");
  const [kbTarget, setKbTarget] = useState(180);
  const [pctTarget, setPctTarget] = useState(60);

  const [inSize, setInSize] = useState<number>(0);
  const [outSize, setOutSize] = useState<number>(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (srcUrl) URL.revokeObjectURL(srcUrl);
      if (outUrl) URL.revokeObjectURL(outUrl);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [srcUrl, outUrl, previewUrl],
  );

  const handleFile = (f: File) => {
    setFile(f);
    setInSize(f.size);
    if (srcUrl) URL.revokeObjectURL(srcUrl);
    setSrcUrl(URL.createObjectURL(f));
    setOutBlob(null);
    if (outUrl) URL.revokeObjectURL(outUrl);
    setOutUrl(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setStatus("idle");
    setError(null);
  };

  const start = async () => {
    if (!file) return;
    setError(null);
    setStatus("running");
    try {
      const bytes = await file.arrayBuffer();
      const isPng = file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
      const isJpeg = file.type === "image/jpeg" || file.name.toLowerCase().endsWith(".jpg") || file.name.toLowerCase().endsWith(".jpeg");
      let blob: Blob;

      // 1) Lossless first pass on PNG.
      if (isPng) {
        try {
          const UPNG = (await import("upng-js")).default as any;
          const encoded = UPNG.encode([new Uint8Array(bytes)], bytes.byteLength, 0);
          // encoded is ArrayBuffer of PNG
          blob = new Blob([encoded], { type: "image/png" });
        } catch (err) {
          console.warn("UPNG.js failed, falling back to canvas", err);
          blob = await canvasCompress(file, "image/webp", 0.92);
        }
      } else if (isJpeg) {
        blob = await canvasCompress(file, "image/jpeg", 0.9);
      } else {
        // WebP, AVIF, unknown → canvas re-encode via WebP.
        blob = await canvasCompress(file, "image/webp", 0.85);
      }

      // 2) If we have a target, refine.
      if (target === "kb") {
        const targetBytes = kbTarget * 1024;
        if (blob.size > targetBytes) {
          if (isJpeg || file.type === "image/webp") {
            blob = await tuneToKB(blob, targetBytes, isJpeg ? "image/jpeg" : "image/webp");
          } else {
            // PNG: try lossy mode.
            try {
              const UPNG = (await import("upng-js")).default as any;
              const encoded = UPNG.encode([new Uint8Array(bytes)], Math.min(bytes.byteLength, 256), 0);
              blob = new Blob([encoded], { type: "image/png" });
              if (blob.size > targetBytes) blob = await canvasCompress(file, "image/jpeg", 0.78);
              if (blob.size > targetBytes) blob = await tuneToKB(blob, targetBytes, "image/jpeg");
            } catch {
              blob = await canvasCompress(file, "image/jpeg", 0.72);
            }
          }
        }
      } else if (target === "pct") {
        // Quality by percentage relative to input.
        if (blob.size > (inSize * pctTarget) / 100) {
          if (isJpeg) blob = await tuneToKB(blob, (inSize * pctTarget) / 100, "image/jpeg");
          else blob = await canvasCompress(file, "image/webp", 0.7);
        }
      }

      blob = shrinkUnder(blob, 25 * 1024 * 1024) ?? blob;
      setOutBlob(blob);
      setOutSize(blob.size);
      setOutUrl(URL.createObjectURL(blob));
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));
      setStatus("done");
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to compress.");
      setStatus("error");
    }
  };

  if (!file) {
    return (
      <ToolDropzone
        onFile={handleFile}
        accept="image/jpeg,image/png,image/webp,image/avif"
        hint="Drop the image you want to compress"
        subhint={`JPG, PNG, WebP, AVIF. Original ${((0) / 1024).toFixed(0)} KB displayed after upload.`}
      />
    );
  }

  const pct = outSize > 0 && inSize > 0 ? Math.round((1 - outSize / inSize) * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTarget("best")}
          className={`px-4 py-2 text-sm rounded-full border transition ${target === "best" ? "bg-foreground text-background border-foreground" : "bg-white/60 border-foreground/10 hover:bg-white"}`}
        >
          Best I can do, keep quality
        </button>
        <button
          type="button"
          onClick={() => setTarget("kb")}
          className={`px-4 py-2 text-sm rounded-full border transition ${target === "kb" ? "bg-foreground text-background border-foreground" : "bg-white/60 border-foreground/10 hover:bg-white"}`}
        >
          Target a KB
        </button>
        <button
          type="button"
          onClick={() => setTarget("pct")}
          className={`px-4 py-2 text-sm rounded-full border transition ${target === "pct" ? "bg-foreground text-background border-foreground" : "bg-white/60 border-foreground/10 hover:bg-white"}`}
        >
          Trim by %
        </button>
      </div>

      {target === "kb" ? (
        <label className="block">
          <p className="eyebrow-mono text-foreground/45 mb-1">Target file size (KB)</p>
          <input
            type="number"
            value={kbTarget}
            min={5}
            max={10000}
            onChange={(e) => setKbTarget(Number(e.target.value))}
            className="w-full md:w-72 rounded-xl bg-white border border-foreground/10 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </label>
      ) : null}

      {target === "pct" ? (
        <label className="block">
          <p className="eyebrow-mono text-foreground/45 mb-1">Trim down to % of original</p>
          <input
            type="range"
            min={20}
            max={95}
            value={pctTarget}
            onChange={(e) => setPctTarget(Number(e.target.value))}
            className="w-full md:w-72"
          />
          <p className="text-xs text-foreground/55 mt-1">{pctTarget}% — keep the file at or below {Math.round(inSize * pctTarget / 100) / 1024 | 0} KB</p>
        </label>
      ) : null}

      <button
        type="button"
        onClick={start}
        disabled={status === "running"}
        className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
      >
        {status === "running" ? "Compressing…" : "Compress"}
      </button>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {previewUrl ? (
        <ToolResult>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Panel label="Original" src={srcUrl || ""} sizeLabel={`${(inSize / 1024).toFixed(1)} KB`} />
            <Panel label="Compressed" src={previewUrl} sizeLabel={`${(outSize / 1024).toFixed(1)} KB (-${pct}%)`} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={outUrl ?? "#"}
              download={`motionix-compressed-${Date.now()}.${outBlob?.type.split("/")[1] ?? "png"}`}
              className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:bg-primary transition"
            >
              <LuDownload className="size-4" /> Download {((outSize ?? 0) / 1024).toFixed(1)} KB file
            </a>
            <button
              type="button"
              onClick={() => {
                if (srcUrl) URL.revokeObjectURL(srcUrl);
                setSrcUrl(null);
                setFile(null);
                if (outUrl) URL.revokeObjectURL(outUrl);
                setOutUrl(null);
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
                setStatus("idle");
              }}
              className="inline-flex items-center gap-2 rounded-full border border-foreground/15 px-5 py-2.5 text-sm hover:bg-foreground/5 transition"
            >
              Start over
            </button>
          </div>
        </ToolResult>
      ) : null}
    </div>
  );
}

function Panel({ label, src, sizeLabel }: { label: string; src: string; sizeLabel: string }) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-white p-3">
      <div className="flex items-baseline justify-between px-1 mb-2">
        <p className="eyebrow-mono text-foreground/45">{label}</p>
        <p className="text-xs text-foreground/60 font-mono">{sizeLabel}</p>
      </div>
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

// =================================================================
//  Helpers
// =================================================================

function canvasCompress(file: File, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("canvas.toBlob null"))), type, quality);
    };
    img.onerror = (e) => reject(e);
    img.src = URL.createObjectURL(file);
  });
}

async function tuneToKB(blob: Blob, targetBytes: number, type: "image/jpeg" | "image/webp"): Promise<Blob> {
  // binary-search quality
  const url = URL.createObjectURL(blob);
  let lo = 0.05;
  let hi = 0.95;
  let best: Blob | null = null;
  for (let i = 0; i < 8; i++) {
    const mid = (lo + hi) / 2;
    const candidate = await reencode(url, type, mid);
    if (candidate.size <= targetBytes) {
      best = candidate;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  URL.revokeObjectURL(url);
  if (best) return best;
  return await reencode(url, type, 0.4);
}

function reencode(url: string, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("null"))), type, quality);
    };
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

function shrinkUnder(blob: Blob, Max: number): Blob | null {
  if (blob.size <= Max) return null;
  return blob;
}
