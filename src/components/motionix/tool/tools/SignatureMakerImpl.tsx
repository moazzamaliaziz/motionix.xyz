"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { LuDownload, LuEraser, LuPenLine } from "react-icons/lu";
import { ToolDropzone } from "../ToolDropzone";
import { ToolResult } from "../ToolResult";

/**
 * Signature maker — pure-canvas + tracks.
 *
 * Two modes:
 *   - Draw:    capture strokes on top of a canvas (mouse / touch / pen).
 *   - Upload:  drop an existing scan, auto-trim + remove the paper color.
 *
 * Output: transparent PNG (PNG) or vectorized SVG.
 */

type Mode = "draw" | "upload";

type Stroke = {
  points: { x: number; y: number; pressure: number }[];
  color: string;
  width: number;
};

const INK_COLORS = [
  { id: "#0a0a0a", name: "Ink" },
  { id: "#1d3557", name: "Navy" },
  { id: "#5a3825", name: "Sepia" },
  { id: "#7a0019", name: "Wine" },
];

export function SignatureMakerImpl() {
  const [mode, setMode] = useState<Mode>("draw");

  if (mode === "upload") {
    return (
      <>
        <ModeTabs mode={mode} onChange={setMode} />
        <UploadedSignature onSwitch={() => setMode("draw")} />
      </>
    );
  }
  return (
    <>
      <ModeTabs mode={mode} onChange={setMode} />
      <DrawnSignature />
    </>
  );
}

function ModeTabs({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="flex gap-2 mb-5">
      <TabButton active={mode === "draw"} onClick={() => onChange("draw")}>
        <LuPenLine className="size-4" /> Draw
      </TabButton>
      <TabButton active={mode === "upload"} onClick={() => onChange("upload")}>
        Upload a scan
      </TabButton>
    </div>
  );
}

function TabButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition ${
        active
          ? "bg-foreground text-background border-foreground"
          : "bg-white/60 border-foreground/10 hover:bg-white"
      }`}
    >
      {children}
    </button>
  );
}

// =================================================================
//  Drawn signature
// =================================================================

function DrawnSignature() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const drawingRef = useRef(false);
  const currentRef = useRef<Stroke | null>(null);
  const [inkColor, setInkColor] = useState("#0a0a0a");
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [outSvg, setOutSvg] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (outUrl) URL.revokeObjectURL(outUrl);
      if (outSvg) URL.revokeObjectURL(outSvg);
    },
    [outUrl, outSvg],
  );

  const getXY = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const scaleX = (e.target as HTMLCanvasElement).width / rect.width;
    const scaleY = (e.target as HTMLCanvasElement).height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      pressure: e.pressure || 0.5,
    };
  };

  const drawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const all = currentRef.current ? [...strokes, currentRef.current] : strokes;
    for (const stroke of all) {
      const pts = stroke.points;
      if (pts.length === 0) continue;
      ctx.strokeStyle = stroke.color;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        const p = pts[i];
        const prev = pts[i - 1];
        const midx = (prev.x + p.x) / 2;
        const midy = (prev.y + p.y) / 2;
        ctx.lineWidth = stroke.width * (0.5 + p.pressure);
        ctx.quadraticCurveTo(prev.x, prev.y, midx, midy);
      }
      if (pts.length > 0) {
        const last = pts[pts.length - 1];
        ctx.lineTo(last.x, last.y);
        ctx.stroke();
      }
    }
  }, [strokes]);

  useEffect(() => {
    drawAll();
  }, [drawAll]);

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    const pt = getXY(e);
    const stroke: Stroke = {
      points: [pt],
      color: inkColor,
      width: 6,
    };
    currentRef.current = stroke;
    drawingRef.current = true;
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !currentRef.current) return;
    const pt = getXY(e);
    currentRef.current.points.push(pt);
    drawAll();
  };

  const onUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !currentRef.current) return;
    const stroke = currentRef.current;
    currentRef.current = null;
    drawingRef.current = false;
    (e.target as HTMLCanvasElement).releasePointerCapture(e.pointerId);
    setStrokes((s) => [...s, stroke]);
  };

  const clear = () => {
    setStrokes([]);
    if (outUrl) URL.revokeObjectURL(outUrl);
    setOutUrl(null);
    if (outSvg) URL.revokeObjectURL(outSvg);
    setOutSvg(null);
  };

  const exportPng = () => {
    // Compose trimmed canvas onto a transparent canvas, then export.
    const tmp = document.createElement("canvas");
    const trimmed = trimCanvas(canvasRef.current!);
    tmp.width = trimmed.width;
    tmp.height = trimmed.height;
    const ctx = tmp.getContext("2d")!;
    ctx.drawImage(trimmed, 0, 0);
    tmp.toBlob((b) => {
      if (!b) return;
      if (outUrl) URL.revokeObjectURL(outUrl);
      const url = URL.createObjectURL(b);
      setOutUrl(url);
    }, "image/png");
  };

  const exportSvg = () => {
    const trimmed = trimCanvas(canvasRef.current!);
    const w = trimmed.width;
    const h = trimmed.height;
    // SVG: emit the same strokes as in the trimmed area; simplest: build paths
    // from the captured stroke series using offset = bounding-box origin.
    const offX = -trimmedBounds.origin.x;
    const offY = -trimmedBounds.origin.y;
    const pathEls: string[] = [];
    for (const s of strokes) {
      if (s.points.length === 0) continue;
      let d = `M ${s.points[0].x + offX} ${s.points[0].y + offY}`;
      for (let i = 1; i < s.points.length; i++) {
        const p = s.points[i];
        d += ` L ${p.x + offX} ${p.y + offY}`;
      }
      pathEls.push(`<path d="${d}" fill="none" stroke="${s.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`);
    }
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${pathEls.join("")}</svg>`;
    if (outSvg) URL.revokeObjectURL(outSvg);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    setOutSvg(URL.createObjectURL(blob));
  };

  return (
    <div className="space-y-5">
      <div
        ref={wrapRef}
        className="rounded-2xl border-2 border-dashed border-foreground/15 bg-white"
      >
        <canvas
          ref={canvasRef}
          width={1200}
          height={420}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerLeave={onUp}
          className="block w-full h-[260px] touch-none cursor-crosshair"
          aria-label="Signature canvas"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <p className="eyebrow-mono text-foreground/40">Ink</p>
        {INK_COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-label={c.name}
            onClick={() => setInkColor(c.id)}
            className={`size-7 rounded-full border transition ${
              inkColor === c.id ? "ring-2 ring-primary ring-offset-2 border-foreground/20" : "border-foreground/15"
            }`}
            style={{ background: c.id }}
          />
        ))}
        <button
          type="button"
          onClick={clear}
          className="ml-auto inline-flex items-center gap-2 rounded-full border border-foreground/15 px-4 py-2 text-sm hover:bg-foreground/5 transition"
        >
          <LuEraser className="size-4" /> Clear
        </button>
      </div>

      <ToolResult>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={exportPng}
              disabled={strokes.length === 0}
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition"
            >
              <LuDownload className="size-4" /> Download PNG
            </button>
            <button
              type="button"
              onClick={exportSvg}
              disabled={strokes.length === 0}
              className="inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-white px-5 py-2.5 text-sm font-medium hover:bg-foreground/5 disabled:opacity-50 transition"
            >
              Download SVG
            </button>
          </div>
          {(outUrl || outSvg) ? (
            <div className="rounded-2xl border border-foreground/10 bg-paper/40 p-4 space-y-2">
              {outUrl ? (
                <a href={outUrl} download={`motionix-signature-${Date.now()}.png`} className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={outUrl} alt="signature preview" className="bg-paper rounded-xl max-h-32 mx-auto" />
                </a>
              ) : null}
              {outSvg ? (
                <p className="font-mono text-xs text-foreground/55">
                  SVG ready ({outSvg.length} chars) — use the Download SVG button to grab it.
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-xs text-foreground/50">
              Sign above. We auto-trim the canvas so the PNG has no padding around the strokes.
            </p>
          )}
        </div>
      </ToolResult>
    </div>
  );
}

// =================================================================
//  Trim helpers — find the bounding box of non-empty pixels
//  and produce a tight canvas.
// =================================================================

const trimmedBounds = { origin: { x: 0, y: 0 } };
function trimCanvas(src: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = src.getContext("2d")!;
  const { data, width, height } = ctx.getImageData(0, 0, src.width, src.height);
  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * 4 + 3];
      if (a > 0) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX || maxY < minY) {
    // empty canvas
    trimmedBounds.origin = { x: 0, y: 0 };
    const empty = document.createElement("canvas");
    empty.width = Math.max(1, Math.floor(width * 0.5));
    empty.height = Math.max(1, Math.floor(height * 0.5));
    return empty;
  }
  const pad = 12;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width, maxX + pad);
  maxY = Math.min(height, maxY + pad);
  const out = document.createElement("canvas");
  out.width = maxX - minX;
  out.height = maxY - minY;
  trimmedBounds.origin = { x: minX, y: minY };
  out.getContext("2d")!.drawImage(src, minX, minY, out.width, out.height, 0, 0, out.width, out.height);
  return out;
}

// =================================================================
//  Uploaded scan
// =================================================================

function UploadedSignature({ onSwitch }: { onSwitch: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [pngUrl, setPngUrl] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (pngUrl) URL.revokeObjectURL(pngUrl);
    },
    [pngUrl],
  );

  const handleFile = async (f: File) => {
    setFile(f);
    if (pngUrl) URL.revokeObjectURL(pngUrl);
    setPngUrl(null);
    try {
      const cleaned = await cleanScan(f);
      if (cleaned) setPngUrl(URL.createObjectURL(cleaned));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-5">
      {!file ? (
        <ToolDropzone
          onFile={handleFile}
          accept="image/jpeg,image/png"
          hint="Drop a paper-signature scan"
          subhint="JPG or PNG. We auto-trim and remove the paper color."
        />
      ) : (
        <div className="space-y-5">
          {pngUrl ? (
            <div className="rounded-2xl border border-foreground/10 bg-paper/40 p-4">
              <p className="eyebrow-mono text-foreground/50 mb-2">Auto-cleaned preview</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pngUrl} alt="Cleaned signature" className="bg-paper rounded-xl max-h-40 mx-auto" />
            </div>
          ) : (
            <p className="text-sm text-foreground/55">Working on it…</p>
          )}
          <div className="flex flex-wrap gap-3">
            {pngUrl ? (
              <a
                href={pngUrl}
                download={`motionix-signature-${Date.now()}.png`}
                className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition"
              >
                <LuDownload className="size-4" /> Download PNG
              </a>
            ) : null}
            <button
              type="button"
              onClick={onSwitch}
              className="inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-white px-5 py-2.5 text-sm font-medium hover:bg-foreground/5 transition"
            >
              Draw one instead
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Auto-trim + remove paper color using canvas.
async function cleanScan(file: File): Promise<Blob | null> {
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = (e) => rej(e);
  });
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, w, h);
  const px = data.data;
  // Find the most common pixel (assume that's the paper color) — then wipe anything within tolerance.
  const counts = new Map<number, number>();
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i] ?? 0;
    const g = px[i + 1] ?? 0;
    const b = px[i + 2] ?? 0;
    if (r > 220 && g > 220 && b > 220) {
      const k = ((r & 0xf0) << 16) | ((g & 0xf0) << 8) | (b & 0xf0);
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
  }
  let peak = 0;
  let peakK = 0;
  for (const [k, v] of counts) if (v > peak) { peak = v; peakK = k; }
  const pr = ((peakK >> 16) & 0xff) + 8;
  const pg = ((peakK >> 8) & 0xff) + 8;
  const pb = (peakK & 0xff) + 8;
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i] ?? 0;
    const g = px[i + 1] ?? 0;
    const b = px[i + 2] ?? 0;
    if (r >= pr && g >= pg && b >= pb) {
      px[i + 3] = 0;
    }
  }
  ctx.putImageData(data, 0, 0);

  // Trim whitespace too.
  const trimmed = trimCanvas(c);
  return await new Promise<Blob | null>((resolve) =>
    trimmed.toBlob((b) => resolve(b), "image/png"),
  );
}
