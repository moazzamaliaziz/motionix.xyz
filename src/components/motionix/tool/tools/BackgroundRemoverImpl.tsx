"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LuDownload, LuLoader, LuTrash2, LuShieldAlert, LuX, LuPenTool } from "react-icons/lu";
import { ToolDropzone } from "../ToolDropzone";
import { ToolResult } from "../ToolResult";
import { SaveToHistory } from "../SaveToHistory";
import { CloudflareUpload } from "../CloudflareUpload";
import { BeforeAfterSlider } from "../BeforeAfterSlider";
import Link from "next/link";
import { removeBackgroundOnce } from "../lib/useBackgroundRemoval";
import { RefineCanvas } from "./RefineCanvas";

export function BackgroundRemoverImpl() {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "running" | "done" | "error">("idle");
  const [progress, setProgress] = useState<string>("");
  const [progressPct, setProgressPct] = useState<number>(0);
  const [srcBlob, setSrcBlob] = useState<File | null>(null);
  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [outBlob, setOutBlob] = useState<Blob | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState<string>("transparent");
  const [shadowOpacity, setShadowOpacity] = useState<number>(0.25);
  const [shadowSize, setShadowSize] = useState<number>(1);
  const [showComplianceNudge, setShowComplianceNudge] = useState<boolean>(true);
  const [refineMode, setRefineMode] = useState<boolean>(false);
  const [imgDimensions, setImgDimensions] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [error, setError] = useState<string | null>(null);

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

    // Get image dimensions for refine canvas
    const img = new Image();
    img.onload = () => setImgDimensions({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = URL.createObjectURL(file);

    try {
      setStatus("loading");
      setProgressPct(0);
      setProgress("Downloading the AI model (cached after first run)…");
      const blob = await removeBackgroundOnce(file, (key, current, total) => {
        const pct = total > 0 ? Math.round((current / total) * 100) : 0;
        setProgressPct(pct);
        const mb = (current / (1024 * 1024)).toFixed(1);
        setProgress(`${key}: ${pct}% (${mb} MB)`);
      });
      if (outUrl) URL.revokeObjectURL(outUrl);
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
    const outImg = new Image();
    outImg.src = URL.createObjectURL(outBlob);
    await new Promise((res) => (outImg.onload = res));

    const w = outImg.naturalWidth;
    const h = outImg.naturalHeight;
    const isTransparent = bgColor === "transparent";
    const hasShadow = !isTransparent && shadowOpacity > 0;

    const main = document.createElement("canvas");
    main.width = w;
    main.height = h + (hasShadow ? Math.round(h * 0.12 * shadowSize) : 0);
    const ctx = main.getContext("2d")!;

    if (!isTransparent) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, main.width, main.height);
    }

    if (hasShadow) {
      const shadowCanvas = document.createElement("canvas");
      shadowCanvas.width = w;
      shadowCanvas.height = h;
      const sctx = shadowCanvas.getContext("2d")!;
      sctx.drawImage(outImg, 0, 0);

      const imageData = sctx.getImageData(0, 0, w, h);
      const alpha = imageData.data;

      // Build bottom contour: for each column, find the lowest opaque pixel
      const contour: { x: number; y: number }[] = [];
      const step = Math.max(1, Math.round(w / 120)); // ~120 points along width
      for (let col = 0; col < w; col += step) {
        let lowestY = -1;
        for (let row = h - 1; row >= 0; row--) {
          const a = alpha[(row * w + col) * 4 + 3];
          if (a > 30) {
            // Find the actual bottom-most opaque pixel in this column for the bottom edge
            for (let r = row; r < Math.min(h, row + 5); r++) {
              if (alpha[(r * w + col) * 4 + 3] === 0) break;
              lowestY = r;
            }
            break;
          }
        }
        if (lowestY >= 0) contour.push({ x: col, y: lowestY });
      }

      // Discard points that are noise above others in the same region
      const filtered: { x: number; y: number }[] = [];
      for (let i = 0; i < contour.length; i++) {
        const neighbors = contour.filter((_, j) => Math.abs(j - i) <= 3 && j !== i);
        const avgNeighborY = neighbors.length ? neighbors.reduce((s, c) => s + c.y, 0) / neighbors.length : contour[i].y;
        if (contour[i].y >= avgNeighborY - 10) filtered.push(contour[i]); // keep only points not too far above neighbors
      }

      if (filtered.length >= 2) {
        const shadowY = h + Math.round(h * 0.06 * shadowSize);
        const blurPx = Math.round(Math.min(w, h) * 0.04 * shadowSize);

        // ponytail: shadowBlur is GPU-accelerated canvas, no CPU overhead
        ctx.save();
        ctx.shadowColor = `rgba(0,0,0,${shadowOpacity})`;
        ctx.shadowBlur = blurPx;
        ctx.shadowOffsetY = 0;
        ctx.beginPath();
        ctx.moveTo(filtered[0].x, shadowY + (filtered[0].y - h * 0.5) * 0.08);
        for (let i = 1; i < filtered.length; i++) {
          const pointY = shadowY + (filtered[i].y - h * 0.5) * 0.08; // slight Y modulation for natural shape
          ctx.lineTo(filtered[i].x, pointY);
        }
        for (let i = filtered.length - 1; i >= 0; i--) {
          ctx.lineTo(filtered[i].x, shadowY - shadowSize * 6);
        }
        ctx.closePath();
        ctx.fillStyle = "#000";
        ctx.fill();
        ctx.restore();
      }
    }

    // Draw the subject on top (at y=0, above shadow)
    ctx.drawImage(outImg, 0, 0);

    const finalBlob: Blob = await new Promise((resolve) =>
      main.toBlob((b) => resolve(b!), "image/png"),
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
    setProgressPct(0);
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
      {outUrl && refineMode && imgDimensions.w > 0 ? (
        <RefineCanvas
          originalUrl={srcUrl || ""}
          processedUrl={outUrl}
          width={imgDimensions.w}
          height={imgDimensions.h}
          onExport={(blob) => {
            if (outUrl) URL.revokeObjectURL(outUrl);
            setOutBlob(blob);
            setOutUrl(URL.createObjectURL(blob));
            setRefineMode(false);
          }}
        />
      ) : outUrl ? (
        <BeforeAfterSlider original={srcUrl || ""} processed={outUrl} />
      ) : (
        <ResultPanel label="Original" src={srcUrl || ""} />
      )}

      {status === "loading" ? (
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm text-foreground/60">
            <LuLoader className="size-4 animate-spin shrink-0" />
            {progress}
          </div>
          {progressPct > 0 ? (
            <div className="w-full max-w-xs h-1.5 bg-foreground/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          ) : null}
        </div>
      ) : null}
      {status === "running" ? (
        <div className="flex items-center gap-3 text-sm text-foreground/60">
          <LuLoader className="size-4 animate-spin shrink-0" />
          {progress}
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}

      {outUrl ? (
        <ToolResult>
          <div className="space-y-4">
            {showComplianceNudge ? (
              <div className="flex items-start gap-2.5 rounded-2xl border border-amber-300/40 bg-amber-50/70 p-3 text-xs text-foreground/70 leading-relaxed">
                <LuShieldAlert className="size-4 shrink-0 mt-0.5 text-amber-700" />
                <div className="flex-1">
                  <strong>Using this for a passport, visa, or government ID?</strong>{" "}
                  Digital edits get rejected by most issuing authorities. The{" "}
                  <Link
                    href="/tools/passport-photo-maker"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Passport Photo Maker
                  </Link>{" "}
                  never edits a single pixel of your face.
                </div>
                <button
                  type="button"
                  aria-label="Dismiss"
                  onClick={() => setShowComplianceNudge(false)}
                  className="text-foreground/40 hover:text-foreground/70 shrink-0"
                >
                  <LuX className="size-3.5" />
                </button>
              </div>
            ) : null}
            <div>
              <p className="eyebrow-mono text-foreground/50 mb-2">Background color</p>
              <div className="flex flex-wrap gap-2">
                {bgChoices.map((c) => (
                  <button
                    key={c.token}
                    type="button"
                    onClick={() => {
                        setBgColor(c.token);
                        if (c.token !== "transparent") setTimeout(applyBackground, 0);
                      }}
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
            {bgColor !== "transparent" ? (
              <div>
                <p className="eyebrow-mono text-foreground/50 mb-2">Shadow</p>
                <div className="grid grid-cols-2 gap-3 max-w-xs">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-foreground/50">Opacity</span>
                    <input
                      type="range"
                      min="0"
                      max="0.6"
                      step="0.05"
                      value={shadowOpacity}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setShadowOpacity(v);
                        if (v === 0) return;
                        // ponytail: auto-apply on slide — no separate "apply" click
                        setTimeout(applyBackground, 0);
                      }}
                      className="accent-primary w-full"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-foreground/50">Size</span>
                    <input
                      type="range"
                      min="0.5"
                      max="2.5"
                      step="0.1"
                      value={shadowSize}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setShadowSize(v);
                        if (shadowOpacity === 0) return;
                        setTimeout(applyBackground, 0);
                      }}
                      className="accent-primary w-full"
                    />
                  </label>
                </div>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-3">
              {!refineMode && imgDimensions.w > 0 ? (
                <button
                  type="button"
                  onClick={() => setRefineMode(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-white px-5 py-2.5 text-sm font-medium hover:bg-foreground/5 transition"
                >
                  <LuPenTool className="size-4" /> Refine edges
                </button>
              ) : refineMode ? (
                <button
                  type="button"
                  onClick={() => setRefineMode(false)}
                  className="inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-white px-5 py-2.5 text-sm font-medium hover:bg-foreground/5 transition"
                >
                  Back to preview
                </button>
              ) : null}
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
                  Apply background &amp; shadow
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
