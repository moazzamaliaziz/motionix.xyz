"use client";

import { useEffect, useState } from "react";
import { LuDownload } from "react-icons/lu";
import { ToolDropzone } from "../ToolDropzone";
import { ToolResult } from "../ToolResult";
import { removeBackgroundOnce } from "../lib/useBackgroundRemoval";

/**
 * Student ID photo maker — looser "compliance" mode off the passport engine.
 *
 * Difference from passport:
 *   - No strict pixel enforcement — accept equally a 600x600 spec and a 350x350 spec.
 *   - Custom dimensions if the user knows them.
 *   - Background can stay the existing photo, or we cut out the subject on-device
 *     and drop them on a clean white background if you want.
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
      const w = width;
      const h = height;
      const targetAspect = w / h;

      // For "white" we cut the subject out on-device and drop them on a clean
      // white background. For "keep" we composite the original photo as-is.
      // When a cutout exists we frame on the subject's alpha bbox so the head
      // isn't cropped; otherwise we fall back to a centred cover-fit.
      const source: Blob = bg === "white" ? await removeBackgroundOnce(file) : file;

      const objUrl = URL.createObjectURL(source);
      let img: HTMLImageElement;
      try {
        img = await loadImg(objUrl);
      } finally {
        URL.revokeObjectURL(objUrl);
      }

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      // White matte for the cutout; a neutral warm tone behind the untouched
      // original (only visible if the source has transparency — normally not).
      ctx.fillStyle = bg === "white" ? "#ffffff" : "#f8f4ec";
      ctx.fillRect(0, 0, w, h);

      const { sx, sy, sw, sh } =
        bg === "white" ? subjectCoverRect(img, targetAspect) : fullCoverRect(img, targetAspect);
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
            <option value="white">White (remove background)</option>
            <option value="keep">Keep original background</option>
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

/**
 * Cover-fit source rect that matches the target aspect, centred on the full
 * image. Used for the "keep original background" path where we have no alpha
 * subject to key off.
 */
function fullCoverRect(
  img: HTMLImageElement,
  targetAspect: number,
): { sx: number; sy: number; sw: number; sh: number } {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  let sx = 0, sy = 0, sw = iw, sh = ih;
  if (iw / ih > targetAspect) {
    sw = ih * targetAspect;
    sx = (iw - sw) / 2;
  } else {
    sh = iw / targetAspect;
    sy = (ih - sh) / 2;
  }
  return { sx, sy, sw, sh };
}

/**
 * Cover-fit source rect centred on the subject's alpha bounding box, biased so
 * the head sits slightly higher in the frame. Falls back to a centred full
 * cover-fit if the alpha bbox is empty or degenerate.
 */
function subjectCoverRect(
  img: HTMLImageElement,
  targetAspect: number,
): { sx: number; sy: number; sw: number; sh: number } {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;

  const bbox = alphaBoundingBox(img);
  if (!bbox) return fullCoverRect(img, targetAspect);

  // Pad the subject bbox by ~15% of its size for breathing room.
  const padX = bbox.w * 0.15;
  const padY = bbox.h * 0.15;
  let bx = bbox.x - padX;
  let by = bbox.y - padY;
  let bw = bbox.w + padX * 2;
  let bh = bbox.h + padY * 2;

  // Grow the padded bbox to the target aspect ratio.
  if (bw / bh > targetAspect) {
    const nh = bw / targetAspect;
    by -= (nh - bh) / 2;
    bh = nh;
  } else {
    const nw = bh * targetAspect;
    bx -= (nw - bw) / 2;
    bw = nw;
  }

  // Bias the crop upward so the head sits higher in the frame.
  by -= bh * 0.08;

  // Clamp inside the image; if the desired crop can't fit, fall back.
  if (bw > iw || bh > ih) return fullCoverRect(img, targetAspect);
  bx = Math.max(0, Math.min(bx, iw - bw));
  by = Math.max(0, Math.min(by, ih - bh));
  if (bw <= 0 || bh <= 0) return fullCoverRect(img, targetAspect);
  return { sx: bx, sy: by, sw: bw, sh: bh };
}

/**
 * Scan the image's alpha channel and return the bounding box of pixels above a
 * small alpha threshold. Returns null if empty or if the subject fills almost
 * the whole frame (no useful transparency).
 */
function alphaBoundingBox(
  img: HTMLImageElement,
): { x: number; y: number; w: number; h: number } | null {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (!iw || !ih) return null;

  const c = document.createElement("canvas");
  c.width = iw;
  c.height = ih;
  const cx = c.getContext("2d", { willReadFrequently: true });
  if (!cx) return null;
  cx.drawImage(img, 0, 0);

  let data: Uint8ClampedArray;
  try {
    data = cx.getImageData(0, 0, iw, ih).data;
  } catch {
    return null;
  }

  const threshold = 10;
  let minX = iw, minY = ih, maxX = -1, maxY = -1;
  for (let y = 0; y < ih; y++) {
    for (let x = 0; x < iw; x++) {
      if (data[(y * iw + x) * 4 + 3] > threshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) return null;
  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  if (w >= iw * 0.98 && h >= ih * 0.98) return null;
  return { x: minX, y: minY, w, h };
}

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
