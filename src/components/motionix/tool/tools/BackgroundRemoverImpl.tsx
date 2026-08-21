"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { preloadBackgroundRemoval, removeBackgroundOnce } from "../lib/useBackgroundRemoval";
import { RefineCanvas } from "./RefineCanvas";
import { SaveToHistory } from "../SaveToHistory";
import { CloudflareUpload } from "../CloudflareUpload";

// Editorial monochrome — amber #fcbb00 is the only signal colour (btn-accent)
// Keep Motionix palette: ink #0a0a0a, paper #ffffff, surface #f8f7f4, border #e5e3df
const MAX_BYTES = 10 * 1024 * 1024;
const SWATCHES = [
  { id: "transparent", label: "Transparent", css: "transparent" },
  { id: "white", label: "White", css: "#ffffff" },
  { id: "black", label: "Black", css: "#0a0a0a" },
  { id: "amber", label: "Amber", css: "#fcbb00" },
  { id: "emerald", label: "Emerald", css: "#00bb7f" },
  { id: "studio", label: "Studio grey", css: "#f2f1ee" },
] as const;

// 5 export formats — ponytail: no new deps, canvas-native only
const EXPORT_FORMATS = [
  { id: "image/png", label: "PNG", ext: "png", alpha: true, quality: undefined as number | undefined },
  { id: "image/jpeg", label: "JPG", ext: "jpg", alpha: false, quality: 0.92 },
  { id: "image/webp", label: "WebP", ext: "webp", alpha: true, quality: 0.9 },
  { id: "image/avif", label: "AVIF", ext: "avif", alpha: true, quality: 0.8 },
  { id: "zip", label: "ZIP", ext: "zip", alpha: true, quality: undefined },
] as const;
type ExportId = typeof EXPORT_FORMATS[number]["id"];

type Status = "idle" | "loading" | "done" | "error";

export function BackgroundRemoverImpl() {
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null);
  const [cutoutBlob, setCutoutBlob] = useState<Blob | null>(null);
  const [fileName, setFileName] = useState("image");
  const [srcFile, setSrcFile] = useState<File | null>(null);
  const [bg, setBg] = useState<string>("transparent");
  const [shadowOpacity, setShadowOpacity] = useState(0.25);
  const [shadowSize, setShadowSize] = useState(1);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [refineMode, setRefineMode] = useState(false);
  const [imgDims, setImgDims] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [exportFormat, setExportFormat] = useState<ExportId>("image/png");
  const [exportQuality, setExportQuality] = useState(0.9);
  const [isExporting, setIsExporting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // fast: warm model cache on mount + on hover (ponytail: fire-and-forget)
  useEffect(() => { preloadBackgroundRemoval(); }, []);

  // cleanup object URLs
  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (cutoutUrl) URL.revokeObjectURL(cutoutUrl);
    };
  }, [originalUrl, cutoutUrl]);

  const run = useCallback(async (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic"].includes(file.type) && !/\.(jpe?g|png|webp|avif|heic)$/i.test(file.name)) {
      setStatus("error");
      setError("That file type isn't supported. Use JPG, PNG, WebP, AVIF or HEIC.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setStatus("error");
      setError(`That file is ${(file.size / 1048576).toFixed(1)}MB. The limit is 10MB.`);
      return;
    }
    setError(null);
    setCutoutUrl(null);
    setCutoutBlob(null);
    setElapsed(null);
    setProgress(0);
    setStage("Warming up the model…");
    setStatus("loading");
    setFileName(file.name.replace(/\.[^.]+$/, ""));
    setSrcFile(file);
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    const img = new Image();
    img.onload = () => setImgDims({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = url;

    const started = performance.now();
    try {
      const blob = await removeBackgroundOnce(file, (_key, current, total) => {
        const pct = total ? Math.round((current / total) * 100) : 0;
        setProgress(pct);
        setStage(_key.startsWith("fetch") ? `Downloading model — ${pct}% (one time only)` : `Separating subject — ${pct}%`);
      });
      const outUrl = URL.createObjectURL(blob);
      setCutoutBlob(blob);
      setCutoutUrl(outUrl);
      setElapsed((performance.now() - started) / 1000);
      setStatus("done");
    } catch (e) {
      console.error(e);
      setStatus("error");
      setError("The cutout failed on this image. Try a smaller file or a different photo.");
    }
  }, []);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.files ?? [])[0];
      if (file) void run(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [run]);

  const applyBackground = async (targetBg = bg) => {
    if (!cutoutBlob || !cutoutUrl) return;
    if (targetBg === "transparent") return; // nothing to composite
    const img = new Image();
    img.src = cutoutUrl;
    await img.decode();
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const hasShadow = shadowOpacity > 0;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h + (hasShadow ? Math.round(h * 0.12 * shadowSize) : 0);
    const ctx = canvas.getContext("2d")!;
    const sw = SWATCHES.find((s) => s.id === targetBg);
    ctx.fillStyle = sw?.css ?? "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (hasShadow) {
      // simple bottom shadow: reuse cutout alpha as shape
      const sh = document.createElement("canvas");
      sh.width = w;
      sh.height = h;
      const sctx = sh.getContext("2d")!;
      sctx.drawImage(img, 0, 0);
      const data = sctx.getImageData(0, 0, w, h).data;
      const contour: { x: number; y: number }[] = [];
      const step = Math.max(1, Math.round(w / 120));
      for (let col = 0; col < w; col += step) {
        let y = -1;
        for (let row = h - 1; row >= 0; row--) if (data[(row * w + col) * 4 + 3] > 30) { y = row; break; }
        if (y >= 0) contour.push({ x: col, y });
      }
      if (contour.length >= 2) {
        const shadowY = h + Math.round(h * 0.06 * shadowSize);
        const blur = Math.round(Math.min(w, h) * 0.04 * shadowSize);
        ctx.save();
        ctx.shadowColor = `rgba(0,0,0,${shadowOpacity})`;
        ctx.shadowBlur = blur;
        ctx.beginPath();
        ctx.moveTo(contour[0].x, shadowY);
        for (let i = 1; i < contour.length; i++) ctx.lineTo(contour[i].x, shadowY);
        for (let i = contour.length - 1; i >= 0; i--) ctx.lineTo(contour[i].x, shadowY - shadowSize * 6);
        ctx.closePath();
        ctx.fillStyle = "#000";
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.drawImage(img, 0, 0);
    const blob: Blob = await new Promise((r) => canvas.toBlob((b) => r(b!), "image/png"));
    const url = URL.createObjectURL(blob);
    if (cutoutUrl) URL.revokeObjectURL(cutoutUrl);
    setCutoutBlob(blob);
    setCutoutUrl(url);
  };

  // fast export: canvas re-encode with bg + format; ponytail: no new deps, browser-native
  const exportSingle = async (format: string, quality?: number): Promise<Blob> => {
    if (!cutoutUrl) throw new Error("No cutout");
    const img = new Image();
    img.src = cutoutUrl;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    // JPG has no alpha — flatten onto bg or white
    const needsFlatten = format === "image/jpeg" || (bg !== "transparent" && format !== "image/png" && format !== "image/webp" && format !== "image/avif");
    const flatBg = bg === "transparent" ? "#ffffff" : (SWATCHES.find((s) => s.id === bg)?.css ?? "#ffffff");
    if (needsFlatten || bg !== "transparent") {
      ctx.fillStyle = bg === "transparent" && format !== "image/jpeg" ? "transparent" : flatBg;
      if (bg !== "transparent" || format === "image/jpeg") {
        ctx.fillStyle = flatBg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
    ctx.drawImage(img, 0, 0);
    const blob: Blob | null = await new Promise((r) => canvas.toBlob((b) => r(b), format, quality));
    if (!blob) throw new Error(`Your browser can't encode ${format}. Try PNG.`);
    // AVIF fallback: canvas.toBlob may silently return PNG
    if (blob.type !== format && format === "image/avif") throw new Error("AVIF not supported in this browser — try WebP or PNG.");
    return blob;
  };

  const download = async () => {
    if (!cutoutUrl || !cutoutBlob) return;
    setIsExporting(true);
    try {
      if (exportFormat === "zip") {
        // 5th format: ZIP = download all 4 image formats sequentially (ponytail: no jszip dep)
        const formats: { id: string; ext: string; q?: number }[] = [
          { id: "image/png", ext: "png" },
          { id: "image/jpeg", ext: "jpg", q: 0.92 },
          { id: "image/webp", ext: "webp", q: 0.9 },
          { id: "image/avif", ext: "avif", q: 0.8 },
        ];
        for (const f of formats) {
          try {
            const b = await exportSingle(f.id, f.q);
            triggerDownload(URL.createObjectURL(b), `${fileName}-cutout.${f.ext}`);
            await new Promise((r) => setTimeout(r, 250));
          } catch {}
        }
        return;
      }
      const fmt = EXPORT_FORMATS.find((f) => f.id === exportFormat)!;
      const blob = await exportSingle(fmt.id, fmt.quality ?? exportQuality);
      triggerDownload(URL.createObjectURL(blob), `${fileName}-cutout.${fmt.ext}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  const clear = () => {
    setStatus("idle");
    setError(null);
    setOriginalUrl(null);
    setCutoutUrl(null);
    setCutoutBlob(null);
    setSrcFile(null);
    setElapsed(null);
    setProgress(0);
    setBg("transparent");
    setRefineMode(false);
  };

  const activeBg = SWATCHES.find((s) => s.id === bg)!;

  // refine mode takes over canvas
  if (refineMode && cutoutUrl && originalUrl && imgDims.w > 0) {
    return (
      <RefineCanvas
        originalUrl={originalUrl}
        processedUrl={cutoutUrl}
        width={imgDims.w}
        height={imgDims.h}
        onExport={(blob) => {
          if (cutoutUrl) URL.revokeObjectURL(cutoutUrl);
          setCutoutBlob(blob);
          setCutoutUrl(URL.createObjectURL(blob));
          setRefineMode(false);
        }}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-float">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success" />
          <span className="label-mono">On-device engine ready</span>
        </div>
        <span className="label-mono">JPG · PNG · WebP · AVIF · HEIC · max 10MB</span>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.35fr_1fr]">
        {/* Canvas */}
        <div className="relative min-h-[420px] border-b border-border p-5 lg:border-r lg:border-b-0">
          {status === "idle" && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) void run(f); }}
              className={`grid h-full min-h-[380px] w-full place-items-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${dragOver ? "border-accent bg-accent/10" : "border-border bg-surface hover:border-foreground"}`}
            >
              <span>
                <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-background text-xl shadow-lift">↑</span>
                <span className="block font-display text-xl font-semibold">Drop an image, or click to browse</span>
                <span className="mt-2 block text-sm text-muted-foreground">You can also paste from the clipboard with ⌘V. Nothing is uploaded.</span>
              </span>
            </button>
          )}

          {status === "loading" && (
            <div className="grid h-full min-h-[380px] place-items-center rounded-2xl bg-surface p-8 text-center">
              <div className="w-full max-w-sm">
                {originalUrl && <img src={originalUrl} alt="Processing" className="mx-auto mb-6 h-40 w-40 animate-pulse rounded-xl object-cover" />}
                <p className="font-display text-lg font-semibold">{stage}</p>
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-border">
                  <div className="h-full rounded-full bg-foreground transition-all duration-200" style={{ width: `${Math.max(6, progress)}%` }} />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">First run downloads the model once. Every image after that is near-instant.</p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="grid h-full min-h-[380px] place-items-center rounded-2xl bg-surface p-8 text-center">
              <div>
                <p className="font-display text-lg font-semibold text-destructive">{error}</p>
                <button type="button" onClick={clear} className="btn-ink mt-5">Try another image</button>
              </div>
            </div>
          )}

          {status === "done" && cutoutUrl && (
            <div className={`relative grid h-full min-h-[380px] place-items-center overflow-hidden rounded-2xl ${bg === "transparent" ? "checkerboard" : ""}`} style={bg === "transparent" ? undefined : { backgroundColor: activeBg.css }}>
              <img src={showOriginal ? originalUrl! : cutoutUrl} alt={showOriginal ? "Original" : "Cutout"} className="max-h-[420px] w-auto max-w-full object-contain p-4" />
              <button type="button" onPointerDown={() => setShowOriginal(true)} onPointerUp={() => setShowOriginal(false)} onPointerLeave={() => setShowOriginal(false)} className="absolute bottom-3 left-3 rounded-full border border-border bg-background/90 px-3 py-1.5 text-xs font-semibold backdrop-blur">Hold to compare</button>
              {elapsed !== null && <span className="absolute top-3 right-3 rounded-full bg-success/20 px-2.5 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase">Done in {elapsed.toFixed(1)}s</span>}
            </div>
          )}

          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void run(f); e.target.value = ""; }} />
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6 p-5">
          <div>
            <p className="label-mono">Background</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SWATCHES.map((s) => (
                <button key={s.id} type="button" title={s.label} aria-label={s.label} onClick={() => { setBg(s.id); if (s.id !== "transparent" && status === "done") setTimeout(() => void applyBackground(s.id), 0); }} className={`h-9 w-9 rounded-full border transition-transform ${bg === s.id ? "scale-110 border-foreground" : "border-border"} ${s.id === "transparent" ? "checkerboard" : ""}`} style={s.id === "transparent" ? undefined : { backgroundColor: s.css }} />
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Applied on download. Transparent exports a clean alpha-channel PNG.</p>
          </div>

          {bg !== "transparent" && status === "done" && (
            <div>
              <p className="label-mono">Shadow</p>
              <div className="mt-3 grid grid-cols-2 gap-3 max-w-xs">
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Opacity</span>
                  <input type="range" min="0" max="0.6" step="0.05" value={shadowOpacity} onChange={(e) => { const v = Number(e.target.value); setShadowOpacity(v); if (status === "done" && bg !== "transparent") setTimeout(() => void applyBackground(), 0); }} className="accent-primary w-full" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Size</span>
                  <input type="range" min="0.5" max="2.5" step="0.1" value={shadowSize} onChange={(e) => { const v = Number(e.target.value); setShadowSize(v); if (status === "done" && bg !== "transparent" && shadowOpacity > 0) setTimeout(() => void applyBackground(), 0); }} className="accent-primary w-full" />
                </label>
              </div>
            </div>
          )}

          <div>
            <p className="label-mono">Export as</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {EXPORT_FORMATS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setExportFormat(f.id as ExportId)}
                  aria-pressed={exportFormat === f.id}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium border transition ${exportFormat === f.id ? "bg-foreground text-background border-foreground" : "border-border bg-background hover:bg-surface"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {(exportFormat === "image/jpeg" || exportFormat === "image/webp" || exportFormat === "image/avif") && (
              <label className="mt-3 flex items-center gap-3">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Quality {Math.round(exportQuality * 100)}%</span>
                <input type="range" min={0.5} max={1} step={0.05} value={exportQuality} onChange={(e) => setExportQuality(Number(e.target.value))} className="flex-1 accent-primary" />
              </label>
            )}
            {exportFormat === "zip" && <p className="mt-2 text-xs text-muted-foreground">Downloads 4 files: PNG + JPG + WebP + AVIF</p>}
            {exportFormat === "image/avif" && <p className="mt-2 text-xs text-muted-foreground">AVIF needs modern browser; falls back to WebP if unsupported.</p>}
          </div>

          <div className="flex flex-col gap-2">
            <button type="button" onClick={download} disabled={status !== "done" || isExporting} className="btn-accent">
              {isExporting ? "Exporting…" : `Download ${EXPORT_FORMATS.find((f) => f.id === exportFormat)!.label}${exportFormat === "zip" ? " (4 files)" : ""}`}
            </button>
            <button type="button" onClick={() => inputRef.current?.click()} className="btn-ghost">{status === "done" ? "Remove another" : "Choose a file"}</button>
            {cutoutUrl && imgDims.w > 0 && !refineMode && (
              <button type="button" onClick={() => setRefineMode(true)} className="btn-ghost"><span aria-hidden>✎</span> Refine edges</button>
            )}
            {refineMode && (
              <button type="button" onClick={() => setRefineMode(false)} className="btn-ghost">Back to preview</button>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border">
            {[["Runs on", "Your device"], ["Uploads", "None"], ["Watermark", "Never"], ["Cost", "Free"]].map(([k, v]) => (
              <div key={k} className="bg-card p-3">
                <dt className="label-mono">{k}</dt>
                <dd className="mt-1 text-sm font-semibold">{v}</dd>
              </div>
            ))}
          </dl>

          {status === "done" && cutoutBlob && srcFile && (
            <div className="flex flex-wrap gap-2">
              <SaveToHistory tool="background-remover" blob={cutoutBlob} filename={srcFile.name} description={`Background removed · ${(srcFile.size / 1024).toFixed(0)} KB → ${(cutoutBlob.size / 1024).toFixed(0)} KB`} />
              <CloudflareUpload tool="background-remover" blob={cutoutBlob} filename={srcFile.name} label="Save to cloud (24h)" />
              <button type="button" onClick={clear} className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-surface transition">Start over</button>
            </div>
          )}

          <p className="text-xs leading-relaxed text-muted-foreground">Tip: photos with a clear subject and even lighting give the crispest edges. For long flyaway hair, export transparent and feather in your editor.</p>
        </div>
      </div>
    </div>
  );
}

function triggerDownload(href: string, name: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  a.click();
}
