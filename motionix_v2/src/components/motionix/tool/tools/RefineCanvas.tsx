"use client";

/**
 * RefineCanvas — manual restore/erase brush for background-remover output.
 *
 * Two layers drawn on a single <canvas>:
 *   - cutout: the AI background removal result (transparent bg)
 *   - original: the user's source photo
 *
 * Restore mode:  paints the original's pixels INTO the cutout (additive)
 * Erase mode:    paints transparency INTO the cutout (subtractive)
 *
 * Each stroke is recorded as a small event; strokes are redrawn from scratch
 * on every frame to avoid canvas corruption. This is O(strokes × pixels)
 * but strokes are tiny and canvas is GPU-accelerated — fast enough for
 * a few hundred brush strokes.
 *
 * On export: composite the edited cutout onto the chosen background color.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { LuUndo2, LuEraser, LuPaintbrush } from "react-icons/lu";

type Stroke = {
  mode: "restore" | "erase";
  x: number;
  y: number; // normalised 0..1 relative to canvas
  r: number; // brush radius normalised
};

type Props = {
  originalUrl: string;
  processedUrl: string; // the AI cutout with transparent bg
  width: number;
  height: number;
  onExport: (blob: Blob) => void;
};

export function RefineCanvas({
  originalUrl,
  processedUrl,
  width,
  height,
  onExport,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [mode, setMode] = useState<"restore" | "erase">("restore");
  const [brushSize, setBrushSize] = useState(12); // px
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const originalImgRef = useRef<HTMLImageElement | null>(null);
  const processedImgRef = useRef<HTMLImageElement | null>(null);

  // Load both images once
  useEffect(() => {
    const load = (src: string) =>
      new Promise<HTMLImageElement>((res, rej) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => res(img);
        img.onerror = rej;
        img.src = src;
      });
    (async () => {
      const [orig, proc] = await Promise.all([
        load(originalUrl),
        load(processedUrl),
      ]);
      originalImgRef.current = orig;
      processedImgRef.current = proc;
      redraw();
    })();
  }, [originalUrl, processedUrl]);

  // Redraw canvas from scratch each time
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const orig = originalImgRef.current;
    const proc = processedImgRef.current;
    if (!canvas || !orig || !proc) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, width, height);

    // Draw the cutout (processed) as the base layer
    ctx.drawImage(proc, 0, 0, width, height);

    // Replay strokes
    for (const s of strokes) {
      const sx = s.x * width;
      const sy = s.y * height;
      const sr = s.r * Math.min(width, height);

      if (s.mode === "restore") {
        // Stamp the original's pixels into the cutout (additive)
        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(orig, 0, 0, width, height);
        ctx.restore();
      } else {
        // Erase: stamp transparent (subtractive)
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
  }, [strokes, width, height]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const getNorm = useCallback(
    (e: MouseEvent | React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0]?.clientX ?? e.changedTouches[0]?.clientX ?? 0 : e.clientX;
      const clientY = "touches" in e ? e.touches[0]?.clientY ?? e.changedTouches[0]?.clientY ?? 0 : e.clientY;
      return {
        x: (clientX - rect.left) / rect.width,
        y: (clientY - rect.top) / rect.height,
      };
    },
    [],
  );

  const addStroke = useCallback(
    (norm: { x: number; y: number }) => {
      setStrokes((prev) => [
        ...prev,
        { mode, x: norm.x, y: norm.y, r: brushSize / Math.min(width, height) },
      ]);
    },
    [mode, brushSize, width, height],
  );

  const onDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      drawingRef.current = true;
      const n = getNorm(e);
      if (n) addStroke(n);
    },
    [getNorm, addStroke],
  );

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      if (!drawingRef.current) return;
      const n = getNorm(e);
      if (n) addStroke(n);
    },
    [getNorm, addStroke],
  );

  const onUp = useCallback(() => {
    drawingRef.current = false;
  }, []);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      drawingRef.current = true;
      const n = getNorm(e);
      if (n) addStroke(n);
    },
    [getNorm, addStroke],
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!drawingRef.current) return;
      const n = getNorm(e);
      if (n) addStroke(n);
    },
    [getNorm, addStroke],
  );

  const undo = () => setStrokes((s) => s.slice(0, -1));

  const exportBlob = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/png"),
    );
    onExport(blob);
  }, [onExport]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => setMode("restore")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium border transition ${
            mode === "restore"
              ? "bg-primary text-white border-primary"
              : "border-foreground/20 text-foreground/60 hover:bg-foreground/5"
          }`}
        >
          <LuPaintbrush className="size-3.5" /> Restore
        </button>
        <button
          type="button"
          onClick={() => setMode("erase")}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium border transition ${
            mode === "erase"
              ? "bg-destructive text-destructive-foreground border-destructive"
              : "border-foreground/20 text-foreground/60 hover:bg-foreground/5"
          }`}
        >
          <LuEraser className="size-3.5" /> Erase
        </button>
        <label className="flex items-center gap-2 text-xs text-foreground/50">
          Size
          <input
            type="range"
            min="4"
            max="40"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-20 accent-primary"
          />
        </label>
        <button
          type="button"
          onClick={undo}
          disabled={strokes.length === 0}
          className="inline-flex items-center gap-1.5 rounded-full border border-foreground/20 px-3.5 py-1.5 text-xs font-medium hover:bg-foreground/5 disabled:opacity-30 transition"
        >
          <LuUndo2 className="size-3.5" /> Undo
        </button>
      </div>

      <div
        className="relative rounded-xl overflow-hidden cursor-crosshair border border-foreground/10 bg-white"
        style={{ aspectRatio: `${width}/${height}` }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full h-full touch-none"
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
          onMouseLeave={onUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onUp}
        />
      </div>

      <button
        type="button"
        onClick={exportBlob}
        className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:bg-primary transition-colors"
      >
        Save refinements
      </button>
    </div>
  );
}
