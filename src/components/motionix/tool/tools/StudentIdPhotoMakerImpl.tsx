"use client";

import { useEffect, useState } from "react";
import { LuDownload } from "react-icons/lu";
import { ToolDropzone } from "../ToolDropzone";
import { ToolResult } from "../ToolResult";

/**
 * Student ID photo maker — looser "compliance" mode off the passport engine.
 *
 * Difference from passport:
 *   - No strict pixel enforcement — accept equally a 600x600 spec and a 350x350 spec.
 *   - Custom dimensions if the user knows them.
 *   - Background can stay the existing photo (no AI swap), or we swap to white if you want.
 *   - Output is JPEG, capped at 200KB by default.
 */

type Preset = {
  code: string;
  label: string;
  width: number;
  height: number;
  maxKB: number;
};

const PRESETS: Preset[] = [
  { code: "common-app",        label: "Common App",         width: 600, height: 600, maxKB: 150 },
  { code: "scholarship-2x2",   label: "Scholarship (2×2)",  width: 600, height: 600, maxKB: 240 },
  { code: "circular-300",      label: "Circular 300",       width: 300, height: 300, maxKB: 80 },
  { code: "scholarship-200x250", label: "Scholarship 200×250", width: 200, height: 250, maxKB: 50 },
  { code: "exam-200x200",      label: "Exam 200×200",       width: 200, height: 200, maxKB: 50 },
  { code: "custom",            label: "Custom…",            width: 600, height: 600, maxKB: 150 },
];

export function StudentIdPhotoMakerImpl() {
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(600);
  const [maxKB, setMaxKB] = useState(150);
  const [bg, setBg] = useState<"keep" | "white">("white");

  const [file, setFile] = useState<File | null>(null);
  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (srcUrl) URL.revokeObjectURL(srcUrl);
      if (outUrl) URL.revokeObjectURL(outUrl);
    },
    [srcUrl, outUrl],
  );

  const handleFile = (f: File) => {
    setFile(f);
    if (srcUrl) URL.revokeObjectURL(srcUrl);
    setSrcUrl(URL.createObjectURL(f));
    if (outUrl) URL.revokeObjectURL(outUrl);
    setOutUrl(null);
    setStatus("idle");
    setError(null);
  };

  const run = async () => {
    if (!file) return;
    setError(null);
    setStatus("running");
    try {
      const img = await loadImg(URL.createObjectURL(file));
      const w = width;
      const h = height;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      if (bg === "white") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.fillStyle = "#f8f4ec";
        ctx.fillRect(0, 0, w, h);
      }

      // cover-fit
      const targetAspect = w / h;
      const imgAspect = img.naturalWidth / img.naturalHeight;
      let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
      if (imgAspect > targetAspect) {
        sw = img.naturalHeight * targetAspect;
        sx = (img.naturalWidth - sw) / 2;
      } else {
        sh = img.naturalWidth / targetAspect;
        sy = (img.naturalHeight - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

      // binary search JPEG quality → fit maxKB
      const blob = await tuneJpegToKB(canvas, maxKB * 1024);
      if (outUrl) URL.revokeObjectURL(outUrl);
      const url = URL.createObjectURL(blob);
      setOutUrl(url);
      setStatus("done");
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed.");
      setStatus("error");
    }
  };

  if (!file) {
    return (
      <ToolDropzone
        onFile={handleFile}
        accept="image/jpeg,image/png"
        hint="Drop your headshot"
        subhint="Front-facing, eyes open, no heavy shadows."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.code}
            type="button"
            onClick={() => {
              setPreset(p);
              setWidth(p.width);
              setHeight(p.height);
              setMaxKB(p.maxKB);
            }}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${
              preset.code === p.code
                ? "bg-foreground text-background border-foreground"
                : "bg-white/60 border-foreground/10 hover:bg-white"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <label className="block">
          <p className="eyebrow-mono text-foreground/45 mb-1">Width (px)</p>
          <input
            type="number"
            value={width}
            min={50}
            max={2000}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="w-full rounded-xl bg-white border border-foreground/10 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </label>
        <label className="block">
          <p className="eyebrow-mono text-foreground/45 mb-1">Height (px)</p>
          <input
            type="number"
            value={height}
            min={50}
            max={2000}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="w-full rounded-xl bg-white border border-foreground/10 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </label>
        <label className="block">
          <p className="eyebrow-mono text-foreground/45 mb-1">Max KB</p>
          <input
            type="number"
            value={maxKB}
            min={10}
            max={2000}
            onChange={(e) => setMaxKB(Number(e.target.value))}
            className="w-full rounded-xl bg-white border border-foreground/10 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </label>
        <label className="block">
          <p className="eyebrow-mono text-foreground/45 mb-1">Background</p>
          <select
            value={bg}
            onChange={(e) => setBg(e.target.value as "keep" | "white")}
            className="w-full rounded-xl bg-white border border-foreground/10 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="white">White</option>
            <option value="keep">Keep original (extend edges)</option>
          </select>
        </label>
      </div>

      <button
        type="button"
        onClick={run}
        disabled={status === "running"}
        className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
      >
        {status === "running" ? "Building…" : `Make a ${width}×${height} photo`}
      </button>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {outUrl ? (
        <ToolResult>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PreviewPanel label="Original" src={srcUrl ?? ""} />
            <PreviewPanel label={`${width}×${height} photo`} src={outUrl} />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={outUrl}
              download={`motionix-id-${preset.code}-${Date.now()}.jpg`}
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
                if (outUrl) URL.revokeObjectURL(outUrl);
                setOutUrl(null);
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

function PreviewPanel({ label, src }: { label: string; src: string }) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-white p-3">
      <p className="eyebrow-mono text-foreground/45 mb-2 px-1">{label}</p>
      <div className="rounded-xl overflow-hidden bg-paper aspect-square">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={label} className="object-contain w-full h-full" />
      </div>
    </div>
  );
}

// =================================================================
//  Helpers
// =================================================================

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

async function tuneJpegToKB(canvas: HTMLCanvasElement, targetBytes: number): Promise<Blob> {
  let lo = 0.2;
  let hi = 0.96;
  let best: Blob | null = null;
  for (let i = 0; i < 9; i++) {
    const mid = (lo + hi) / 2;
    const b = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((x) => resolve(x), "image/jpeg", mid),
    );
    if (!b) throw new Error("toBlob null");
    if (b.size <= targetBytes) {
      best = b;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  if (best) return best;
  return (
    (await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((x) => resolve(x), "image/jpeg", 0.45),
    ))!
  );
}
