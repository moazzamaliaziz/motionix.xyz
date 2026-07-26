"use client";

import { useEffect, useState } from "react";
import { LuDownload} from "react-icons/lu";
import { ToolDropzone } from "../ToolDropzone";
import { ToolResult } from "../ToolResult";

/**
 * Photo resizer — Canvas-based, with optional KB target and resampler choice.
 *
 * - Resize to exact pixel dimensions.
 * - Or: hit a target KB by stepping the JPEG/WebP quality down.
 * - Or: both — first resize, then compress to KB.
 */

type Mode = "pixels" | "kb" | "dpi";
type FitMode = "contain" | "cover" | "fill";

export function PhotoResizerImpl() {
  const [mode, setMode] = useState<Mode>("pixels");

  const [file, setFile] = useState<File | null>(null);
  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [outBlob, setOutBlob] = useState<Blob | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  // Mode 1: pixel dimensions
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(600);
  const [fit, setFit] = useState<FitMode>("contain");

  // Mode 2: KB target
  const [targetKB, setTargetKB] = useState(200);
  const [maxWidth, setMaxWidth] = useState(2048);

  // Mode 3: print at DPI
  const [inchesW, setInchesW] = useState(4);
  const [inchesH, setInchesH] = useState(4);
  const [dpi, setDpi] = useState(300);

  const [resampler, setResampler] = useState<"high" | "fast" | "nearest">("high");

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
    setOutBlob(null);
    if (outUrl) URL.revokeObjectURL(outUrl);
    setOutUrl(null);
    setStatus("idle");
    setError(null);
  };

  const start = async () => {
    if (!file) return;
    setError(null);
    setStatus("running");
    try {
      const objUrl = URL.createObjectURL(file);
      let img: HTMLImageElement;
      try {
        img = await loadImg(objUrl);
      } finally {
        // Image is decoded once loaded; the blob URL is no longer needed.
        URL.revokeObjectURL(objUrl);
      }
      let targetW: number, targetH: number;
      if (mode === "pixels") {
        targetW = width;
        targetH = height;
      } else if (mode === "kb") {
        targetW = Math.min(img.naturalWidth, maxWidth);
        targetH = Math.round((img.naturalHeight / img.naturalWidth) * targetW);
      } else {
        targetW = Math.round(inchesW * dpi);
        targetH = Math.round(inchesH * dpi);
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = resampler !== "nearest";
      ctx.imageSmoothingQuality = resampler === "high" ? "high" : resampler === "fast" ? "low" : "low";

      // Output is JPEG (no alpha), so flatten transparency onto white and
      // letterbox any Contain remainder with the same white background.
      drawFitted(ctx, img, targetW, targetH, fit);

      let blob: Blob;
      if (mode === "kb") {
        blob = await compressToKB(canvas, targetKB);
      } else {
        blob = await canvasToBlob(canvas, "image/jpeg", 0.94);
      }
      if (outUrl) URL.revokeObjectURL(outUrl);
      setOutBlob(blob);
      setOutUrl(URL.createObjectURL(blob));
      setStatus("done");
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to resize.");
      setStatus("error");
    }
  };

  if (!file) {
    return (
      <ToolDropzone
        onFile={handleFile}
        accept="image/jpeg,image/png,image/webp"
        hint="Drop the image you want to resize"
        subhint="JPG, PNG, WebP — up to 4096 pixels on the long side."
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Mode tabs */}
      <div className="flex flex-wrap gap-2">
        <ModeTab active={mode === "pixels"} onClick={() => setMode("pixels")}>By pixels</ModeTab>
        <ModeTab active={mode === "kb"} onClick={() => setMode("kb")}>By KB target</ModeTab>
        <ModeTab active={mode === "dpi"} onClick={() => setMode("dpi")}>By inches @ DPI</ModeTab>
      </div>

      {mode === "pixels" ? (
        <div className="grid grid-cols-3 gap-3">
          <NumberField label="Width (px)" value={width} onChange={setWidth} min={16} max={4096} />
          <NumberField label="Height (px)" value={height} onChange={setHeight} min={16} max={4096} />
          <SelectField label="Fit" value={fit} onChange={(v) => setFit(v as FitMode)} options={[
            { value: "contain", label: "Contain (letterbox)" },
            { value: "cover", label: "Cover (crop)" },
            { value: "fill", label: "Fill (stretch)" },
          ]} />
        </div>
      ) : null}

      {mode === "kb" ? (
        <div className="grid grid-cols-3 gap-3">
          <NumberField label="Target KB" value={targetKB} onChange={setTargetKB} min={5} max={5000} />
          <NumberField label="Max width (px)" value={maxWidth} onChange={setMaxWidth} min={200} max={4096} />
          <SelectField label="Fit" value={fit} onChange={(v) => setFit(v as FitMode)} options={[
            { value: "contain", label: "Contain" },
            { value: "cover", label: "Cover" },
            { value: "fill", label: "Fill (stretch)" },
          ]} />
        </div>
      ) : null}

      {mode === "dpi" ? (
        <div className="grid grid-cols-3 gap-3">
          <NumberField label="Width (in)" value={inchesW} onChange={(v) => setInchesW(v)} min={1} max={40} />
          <NumberField label="Height (in)" value={inchesH} onChange={(v) => setInchesH(v)} min={1} max={40} />
          <NumberField label="DPI" value={dpi} onChange={setDpi} min={72} max={600} />
          <p className="col-span-3 text-xs text-foreground/45">
            Sets the pixel dimensions ({Math.round(inchesW * dpi)} x {Math.round(inchesH * dpi)} px) for a{" "}
            {inchesW}&quot; x {inchesH}&quot; print at {dpi} DPI. The DPI value is not written into the file&apos;s
            metadata; your print software controls the physical size from these pixels.
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <p className="eyebrow-mono text-foreground/40">Resampler</p>
        {[
          { id: "high" as const, label: "High" },
          { id: "fast" as const, label: "Fast" },
          { id: "nearest" as const, label: "Nearest (pixel art)" },
        ].map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setResampler(r.id)}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${
              resampler === r.id
                ? "bg-foreground text-background border-foreground"
                : "bg-white/50 border-foreground/10 hover:bg-white"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={start}
          className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition"
        >
          Run
        </button>
        {outUrl ? (
          <a
            href={outUrl}
            download={`motionix-resized-${Date.now()}.jpg`}
            className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:bg-primary transition"
          >
            <LuDownload className="size-4" /> Download JPEG ({(((outBlob?.size ?? 0) / 1024) | 0)} KB)
          </a>
        ) : null}
        <button
          type="button"
          onClick={() => {
            if (srcUrl) URL.revokeObjectURL(srcUrl);
            setSrcUrl(null);
            setFile(null);
            setOutBlob(null);
            if (outUrl) URL.revokeObjectURL(outUrl);
            setOutUrl(null);
            setStatus("idle");
          }}
          className="inline-flex items-center gap-2 rounded-full border border-foreground/15 px-5 py-2.5 text-sm hover:bg-foreground/5 transition"
        >
          Start over
        </button>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {status === "done" && outUrl ? (
        <ToolResult>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PreviewPanel label="Original" src={srcUrl ?? ""} />
            <PreviewPanel label="Resized" src={outUrl} />
          </div>
        </ToolResult>
      ) : null}
    </div>
  );
}

function ModeTab({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm rounded-full border transition ${
        active ? "bg-foreground text-background border-foreground" : "bg-white/60 border-foreground/10 hover:bg-white"
      }`}
    >
      {children}
    </button>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="block">
      <p className="eyebrow-mono text-foreground/45 mb-1">{label}</p>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-xl bg-white border border-foreground/10 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <p className="eyebrow-mono text-foreground/45 mb-1">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl bg-white border border-foreground/10 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function PreviewPanel({ label, src }: { label: string; src: string }) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-white p-3">
      <p className="eyebrow-mono text-foreground/45 mb-2 px-1">{label}</p>
      <div
        className="rounded-xl overflow-hidden aspect-square bg-paper"
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

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Draw `img` into the full target box honoring the chosen fit mode. Output is
 * JPEG (no alpha) so any letterbox / flatten uses a white background.
 *
 * - fill:    stretch to the full target box (ignores aspect ratio).
 * - cover:   scale to cover the box preserving aspect, center-crop the overflow.
 * - contain: scale to fit inside the box preserving aspect, letterbox remainder.
 */
function drawFitted(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  targetW: number,
  targetH: number,
  fit: FitMode,
) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;

  if (fit === "fill") {
    ctx.drawImage(img, 0, 0, targetW, targetH);
    return;
  }

  const targetAspect = targetW / targetH;
  const imgAspect = iw / ih;

  if (fit === "cover") {
    // Take the largest source rect matching the target aspect, centered.
    let sx = 0, sy = 0, sw = iw, sh = ih;
    if (imgAspect > targetAspect) {
      sw = ih * targetAspect;
      sx = (iw - sw) / 2;
    } else {
      sh = iw / targetAspect;
      sy = (ih - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
    return;
  }

  // contain — fit whole image inside the box, white-letterbox the remainder.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, targetW, targetH);
  let dw = targetW, dh = targetH;
  if (imgAspect > targetAspect) {
    dh = targetW / imgAspect;
  } else {
    dw = targetH * imgAspect;
  }
  const dx = (targetW - dw) / 2;
  const dy = (targetH - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("canvas.toBlob null"))), type, quality);
  });
}

async function compressToKB(canvas: HTMLCanvasElement, targetKB: number): Promise<Blob> {
  // Binary search on JPEG quality to hit the target KB. Alpha has already been
  // flattened onto white by drawFitted, so JPEG encoding is safe here.
  let lo = 0.1;
  let hi = 0.95;
  let best: Blob | null = null;
  for (let i = 0; i < 8; i++) {
    const mid = (lo + hi) / 2;
    const blob = await canvasToBlob(canvas, "image/jpeg", mid);
    if (blob.size <= targetKB * 1024) {
      best = blob;
      lo = mid;
    } else {
      hi = mid;
    }
  }
  if (best) return best;
  const f = await canvasToBlob(canvas, "image/jpeg", 0.4);
  return f;
}
