"use client";

import { useEffect, useState } from "react";
import { LuCheck, LuDownload, LuLoader } from "react-icons/lu";
import { ToolDropzone } from "../ToolDropzone";
import { ToolResult } from "../ToolResult";

/**
 * Resume / LinkedIn photo maker — leans on the same background-removal engine
 * the dedicated bg tool uses (no server). It wraps the cutout into LinkedIn /
 * resume-friendly framing presets.
 */

type Framings = {
  code: string;
  label: string;
  width: number;
  height: number;
  description: string;
};

const FRAMES: Framings[] = [
  { code: "linkedin-1x1",  label: "LinkedIn (1:1)",   width: 800, height: 800, description: "800×800 px square, LinkedIn crop safe." },
  { code: "linkedin-4x5",  label: "LinkedIn (4:5)",   width: 800, height: 1000, description: "Wider feed crop." },
  { code: "resume-3x4",    label: "Resume (3:4)",     width: 750, height: 1000, description: "Vertical, paper-friendly." },
  { code: "signature-3x1", label: "Email signature",  width: 1200, height: 400, description: "Wide horizontal strip." },
];

const BG_PRESETS = [
  { token: "#ffffff", label: "White" },
  { token: "#f5f5f4", label: "Light grey" },
  { token: "#faecd8", label: "Cream" },
  { token: "#e2eaf5", label: "Sky tint" },
  { token: "#dff0e5", label: "Mint" },
  { token: "#1f2937", label: "Soft black" },
];

export function ResumePhotoMakerImpl() {
  const [file, setFile] = useState<File | null>(null);
  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [frame, setFrame] = useState<Framings>(FRAMES[0]);
  const [bg, setBg] = useState(BG_PRESETS[0].token);
  const [status, setStatus] = useState<"idle" | "loading_model" | "running" | "composing" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");

  const removeFnRef = useState<(() => (b: Blob) => Promise<Blob>) | null>(null);

  useEffect(
    () => () => {
      if (srcUrl) URL.revokeObjectURL(srcUrl);
      if (cutoutUrl) URL.revokeObjectURL(cutoutUrl);
      if (outUrl) URL.revokeObjectURL(outUrl);
    },
    [srcUrl, cutoutUrl, outUrl],
  );

  const [, setRemoveFn] = removeFnRef;

  const handleFile = (f: File) => {
    setFile(f);
    if (srcUrl) URL.revokeObjectURL(srcUrl);
    setSrcUrl(URL.createObjectURL(f));
    if (cutoutUrl) URL.revokeObjectURL(cutoutUrl);
    setCutoutUrl(null);
    if (outUrl) URL.revokeObjectURL(outUrl);
    setOutUrl(null);
    setStatus("idle");
    setError(null);
  };

  const run = async () => {
    if (!file) return;
    setStatus("loading_model");
    setText("Loading the on-device AI model…");
    setError(null);

    let remove: null | ((b: Blob) => Promise<Blob>) = null;
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      remove = async (b) => await removeBackground(b);
      setRemoveFn(() => remove!);
    } catch (e) {
      console.warn("imgly load failed", e);
      setError("Could not load the AI model in your browser. Try again in Chrome or Edge.");
      setStatus("error");
      return;
    }

    setStatus("running");
    setText("Cutting out your headshot on-device…");
    try {
      const cutout = await remove(file);
      if (cutoutUrl) URL.revokeObjectURL(cutoutUrl);
      setCutoutUrl(URL.createObjectURL(cutout));

      setStatus("composing");
      setText(`Composing in the ${frame.label} frame…`);

      const cImg = await loadImg(URL.createObjectURL(cutout));
      const canvas = document.createElement("canvas");
      canvas.width = frame.width;
      canvas.height = frame.height;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, frame.width, frame.height);

      // Cover-fit the cutout fully into the frame.
      const targetAspect = frame.width / frame.height;
      const imgAspect = cImg.naturalWidth / cImg.naturalHeight;
      let sx = 0, sy = 0, sw = cImg.naturalWidth, sh = cImg.naturalHeight;
      if (imgAspect > targetAspect) {
        sh = cImg.naturalWidth / targetAspect;
        sy = (cImg.naturalHeight - sh) / 2;
      } else {
        sw = cImg.naturalHeight * targetAspect;
        sx = (cImg.naturalWidth - sw) / 2;
      }
      ctx.drawImage(cImg, sx, sy, sw, sh, 0, 0, frame.width, frame.height);

      const composed: Blob = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.95),
      );
      if (outUrl) URL.revokeObjectURL(outUrl);
      setOutUrl(URL.createObjectURL(composed));
      setStatus("done");
      setText("");
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed. Try a different photo.");
      setStatus("error");
    }
  };

  if (!file) {
    return (
      <ToolDropzone
        onFile={handleFile}
        accept="image/jpeg,image/png,image/webp"
        hint="Drop your headshot"
        subhint="We trim and clean the background for a recruiter-friendly look."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {FRAMES.map((f) => (
          <button
            key={f.code}
            type="button"
            onClick={() => setFrame(f)}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${
              frame.code === f.code ? "bg-foreground text-background border-foreground" : "bg-white/60 border-foreground/10 hover:bg-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-foreground/55 -mt-2">{frame.description}</p>

      <div className="flex flex-wrap gap-2 items-center">
        <p className="eyebrow-mono text-foreground/45">Background</p>
        {BG_PRESETS.map((p) => (
          <button
            key={p.token}
            type="button"
            onClick={() => setBg(p.token)}
            className={`size-8 rounded-full border transition ${
              bg === p.token ? "ring-2 ring-primary ring-offset-2 border-foreground/20" : "border-foreground/20"
            }`}
            style={{ background: p.token }}
            aria-label={p.label}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={run}
        disabled={status === "loading_model" || status === "running" || status === "composing"}
        className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
      >
        {status === "loading_model" || status === "running" || status === "composing" ? (
          <>
            <LuLoader className="size-4 animate-spin" /> {text || "Working…"}
          </>
        ) : (
          <>Generate headshot</>
        )}
      </button>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {outUrl ? (
        <ToolResult>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Panel label="Original" src={srcUrl ?? ""} />
            <Panel label={frame.label} src={outUrl} />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={outUrl}
              download={`motionix-headshot-${frame.code}-${Date.now()}.jpg`}
              className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:bg-primary transition"
            >
              <LuDownload className="size-4" /> Download
            </a>
            <button
              type="button"
              onClick={() => {
                if (srcUrl) URL.revokeObjectURL(srcUrl);
                setSrcUrl(null);
                setFile(null);
                if (cutoutUrl) URL.revokeObjectURL(cutoutUrl);
                setCutoutUrl(null);
                if (outUrl) URL.revokeObjectURL(outUrl);
                setOutUrl(null);
                setStatus("idle");
              }}
              className="inline-flex items-center gap-2 rounded-full border border-foreground/15 px-5 py-2.5 text-sm hover:bg-foreground/5 transition"
            >
              Start over
            </button>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-foreground/55">
            <LuCheck className="size-4 text-primary" />
            The face stays untouched — only the background changes.
          </p>
        </ToolResult>
      ) : null}
    </div>
  );
}

function Panel({ label, src }: { label: string; src: string }) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-white p-3">
      <p className="eyebrow-mono text-foreground/45 mb-2 px-1">{label}</p>
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

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}
