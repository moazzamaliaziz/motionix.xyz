"use client";

import { useEffect, useState } from "react";
import { LuCheck, LuDownload, LuLoader } from "react-icons/lu";
import { ToolDropzone } from "../ToolDropzone";
import { ToolResult } from "../ToolResult";
import { removeBackgroundOnce } from "../lib/useBackgroundRemoval";

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

  useEffect(
    () => () => {
      if (srcUrl) URL.revokeObjectURL(srcUrl);
      if (cutoutUrl) URL.revokeObjectURL(cutoutUrl);
      if (outUrl) URL.revokeObjectURL(outUrl);
    },
    [srcUrl, cutoutUrl, outUrl],
  );
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

    setStatus("running");
    setText("Cutting out your headshot on-device…");
    try {
      const cutout = await removeBackgroundOnce(file);
      if (cutoutUrl) URL.revokeObjectURL(cutoutUrl);
      setCutoutUrl(URL.createObjectURL(cutout));

      setStatus("composing");
      setText(`Composing in the ${frame.label} frame…`);

      const cutoutObjUrl = URL.createObjectURL(cutout);
      let cImg: HTMLImageElement;
      try {
        cImg = await loadImg(cutoutObjUrl);
      } finally {
        URL.revokeObjectURL(cutoutObjUrl);
      }

      const canvas = document.createElement("canvas");
      canvas.width = frame.width;
      canvas.height = frame.height;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, frame.width, frame.height);

      // Frame on the subject's bounding box (derived from the cutout's alpha
      // channel) instead of the full image, so the head/shoulders sit in the
      // frame and aren't cropped off or offset. Falls back to a centred
      // cover-fit if no subject can be found.
      const targetAspect = frame.width / frame.height;
      const { sx, sy, sw, sh } = subjectCoverRect(cImg, targetAspect);
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

/**
 * Compute a source rectangle to draw from `img` that (a) matches the target
 * aspect ratio (cover-fit) and (b) is centred on the subject's alpha bounding
 * box, biased so the head sits in the upper portion of the frame. Falls back to
 * a plain centred cover-fit of the full image if the alpha bbox is empty or
 * degenerate (e.g. the removal produced an opaque image).
 */
function subjectCoverRect(
  img: HTMLImageElement,
  targetAspect: number,
): { sx: number; sy: number; sw: number; sh: number } {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;

  const fullCover = () => {
    let sx = 0, sy = 0, sw = iw, sh = ih;
    if (iw / ih > targetAspect) {
      sw = ih * targetAspect;
      sx = (iw - sw) / 2;
    } else {
      sh = iw / targetAspect;
      sy = (ih - sh) / 2;
    }
    return { sx, sy, sw, sh };
  };

  const bbox = alphaBoundingBox(img);
  if (!bbox) return fullCover();

  // Pad the subject bbox by ~15% of its size for breathing room.
  const padX = bbox.w * 0.15;
  const padY = bbox.h * 0.15;
  let bx = bbox.x - padX;
  let by = bbox.y - padY;
  let bw = bbox.w + padX * 2;
  let bh = bbox.h + padY * 2;

  // Grow the padded bbox to the target aspect ratio.
  const bboxAspect = bw / bh;
  if (bboxAspect > targetAspect) {
    const nh = bw / targetAspect;
    by -= (nh - bh) / 2;
    bh = nh;
  } else {
    const nw = bh * targetAspect;
    bx -= (nw - bw) / 2;
    bw = nw;
  }

  // Bias the crop upward so the head sits higher in the frame (shift the
  // vertical centre up by ~8% of the crop height).
  by -= bh * 0.08;

  // Clamp inside the image; if we can't fit the desired crop, fall back.
  if (bw > iw || bh > ih) return fullCover();
  bx = Math.max(0, Math.min(bx, iw - bw));
  by = Math.max(0, Math.min(by, ih - bh));

  if (bw <= 0 || bh <= 0) return fullCover();
  return { sx: bx, sy: by, sw: bw, sh: bh };
}

/**
 * Scan the image's alpha channel and return the bounding box of pixels with
 * alpha above a small threshold. Returns null if the subject is empty or fills
 * essentially the whole frame (no useful transparency to key off).
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
  // If the subject fills ~the whole frame there's no transparency to exploit.
  if (w >= iw * 0.98 && h >= ih * 0.98) return null;
  return { x: minX, y: minY, w, h };
}
