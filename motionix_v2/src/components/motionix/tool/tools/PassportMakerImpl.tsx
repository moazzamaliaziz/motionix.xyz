"use client";

import { useEffect, useState } from "react";
import { LuCheck, LuDownload, LuExternalLink, LuLoader, LuTrash2 } from "react-icons/lu";
import { ToolDropzone } from "../ToolDropzone";
import { ToolResult } from "../ToolResult";
import type { CountryPreset } from "@/lib/tools";
import { getPaymentLink } from "@/lib/stripe-links";
import { SaveToHistory } from "@/components/motionix/tool/SaveToHistory";
import { preloadBackgroundRemoval, removeBackgroundOnce } from "../lib/useBackgroundRemoval";

type Mode = "strict" | "admission" | "resume" | "relaxed";

// User-driven framing transform. Because this tool is 100% client-side with
// NO face detection, the user aligns their head to the guide overlay; these
// values (zoom + normalised pan) drive the crop rectangle in the compose step.
type Framing = { zoom: number; panX: number; panY: number };
const DEFAULT_FRAMING: Framing = { zoom: 1, panX: 0, panY: -0.05 };

const MODES: { id: Mode; label: string; hint: string; aiRequired: boolean }[] = [
  { id: "strict",    label: "Passport / visa (strict)", hint: "US / UK passport + Schengen visa. We only frame and resize — no edits to your face.", aiRequired: false },
  { id: "admission", label: "School / ID / portal",      hint: "University, scholarship, or portal IDs. Plain background, normalised to spec.", aiRequired: false },
  { id: "resume",    label: "Resume / LinkedIn headshot", hint: "Optional background swap. Skin stays untouched.", aiRequired: true },
  { id: "relaxed",   label: "Other / general",            hint: "Standard passport photo with optional AI background swap.", aiRequired: true },
];

// Default country set; passport tool supports 4 highest-volume presets.
const STRICT_COUNTRIES: CountryPreset[] = [
  { code: "US", label: "United States", width: 600, height: 600, unit: "px", headFraction: 0.6, dpi: 300, background: "white" },
  { code: "UK", label: "United Kingdom", width: 600, height: 750, unit: "px", headFraction: 0.65, dpi: 300, background: "white" },
  { code: "IN", label: "India", width: 350, height: 350, unit: "px", headFraction: 0.65, dpi: 200, background: "white" },
  { code: "SCH", label: "Schengen / EU", width: 413, height: 531, unit: "px", headFraction: 0.7, dpi: 300, background: "white" },
];

const ADMISSION_COUNTRIES: { code: string; label: string; width: number; height: number }[] = [
  { code: "CUSTOM", label: "Custom…", width: 600, height: 600 },
  { code: "COMMONAPP", label: "Common App", width: 600, height: 600 },
  { code: "SCHOLAR-2x2", label: "Scholarship (2×2)", width: 600, height: 600 },
  { code: "CIRCULAR-300", label: "Circular 300×300", width: 300, height: 300 },
];

export function PassportMakerImpl() {
  const [step, setStep] = useState<"picker" | "tool">("picker");
  const [mode, setMode] = useState<Mode>("strict");
  const [country, setCountry] = useState<CountryPreset>(STRICT_COUNTRIES[0]);
  const [bgColor, setBgColor] = useState<string>("#ffffff");

  const [srcFile, setSrcFile] = useState<File | null>(null);
  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [outBlob, setOutBlob] = useState<Blob | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "running" | "done" | "error">("idle");
  const [progress, setProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Head-height target the user aligns to. Defaults to the preset's headFraction
  // but is adjustable (0.5–0.8) so the user — not an auto-detector — decides how
  // big the head sits in the frame. Drives the guide oval and the crop scale.
  const [headFraction, setHeadFraction] = useState<number>(country.headFraction ?? 0.65);
  // User framing transform, applied over the base cover-fit crop. zoom >= 1 makes
  // the head bigger; panX/panY (-1..1) slide the crop so eyes land in the upper
  // third. There is NO face detection here — the user aligns to the guide.
  const [framing, setFraming] = useState<Framing>(DEFAULT_FRAMING);
  // Cached working source for live re-framing: the raw file for strict/admission,
  // or the AI cutout for resume/relaxed, so we never re-run background removal
  // just because the user nudged a slider.
  const [workingBlob, setWorkingBlob] = useState<Blob | null>(null);

  useEffect(
    () => () => {
      if (srcUrl) URL.revokeObjectURL(srcUrl);
      if (outUrl) URL.revokeObjectURL(outUrl);
    },
    [srcUrl, outUrl],
  );

  useEffect(() => {
    setStep("picker");
  }, []);

  // Kick off the background-removal model download and show status while it
  // warms. preloadBackgroundRemoval() is fire-and-forget (safe to call more
  // than once); the subsequent removeBackgroundOnce() awaits the real work.
  const preloadRemover = async () => {
    setStatus("loading");
    setProgress("Fetching the small AI model that swaps backgrounds…");
    preloadBackgroundRemoval();
  };

  const startOver = () => {
    setStep("picker");
    if (srcFile) setSrcFile(null);
    if (srcUrl) URL.revokeObjectURL(srcUrl);
    setSrcUrl(null);
    if (outUrl) URL.revokeObjectURL(outUrl);
    setOutUrl(null);
    setOutBlob(null);
    setStatus("idle");
    setError(null);
  };

  const handleFile = async (file: File) => {
    setSrcFile(file);
    if (srcUrl) URL.revokeObjectURL(srcUrl);
    setSrcUrl(URL.createObjectURL(file));
    setError(null);
    // Reset framing so each new upload starts from the preset default.
    const startFraction = country.headFraction ?? 0.65;
    setHeadFraction(startFraction);
    setFraming(DEFAULT_FRAMING);
    setStatus("running");
    setProgress(mode === "resume" || mode === "relaxed" ? "Swapping background…" : "Framing & crop…");

    try {
      // Produce a "working" source once: the AI cutout for resume/relaxed, or
      // the raw file otherwise. Later slider nudges recompose from this blob so
      // background removal never re-runs.
      let working: Blob = file;
      if (mode === "resume" || mode === "relaxed") {
        await preloadRemover();
        setStatus("running");
        working = await removeBackgroundOnce(file);
      }
      setWorkingBlob(working);

      const processedBlob = await compose(working, country, startFraction, DEFAULT_FRAMING, {
        useBackground: mode === "resume" || mode === "relaxed",
        bgColor,
      });

      if (outUrl) URL.revokeObjectURL(outUrl);
      setOutBlob(processedBlob);
      setOutUrl(URL.createObjectURL(processedBlob));
      setStatus("done");
      setProgress("");

      if (typeof window !== "undefined") {
        import("@/lib/analytics").then(({ track, EVENTS }) => {
          track(EVENTS.TOOL_COMPLETE, { tool: "passport-photo-maker", mode });
        });
      }
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof Error && err.message
          ? `Couldn't complete that request: ${err.message}. Try a different photo.`
          : "We couldn't complete that request. Try a different photo.",
      );
      setStatus("error");
    }
  };

  // Re-run the crop when the user changes head-height or nudges the framing.
  // Uses the cached working blob so AI background removal is never repeated.
  const recompose = async (nextFraction: number, nextFraming: Framing) => {
    if (!workingBlob) return;
    setError(null);
    try {
      const processedBlob = await compose(workingBlob, country, nextFraction, nextFraming, {
        useBackground: mode === "resume" || mode === "relaxed",
        bgColor,
      });
      if (outUrl) URL.revokeObjectURL(outUrl);
      setOutBlob(processedBlob);
      setOutUrl(URL.createObjectURL(processedBlob));
    } catch (err: unknown) {
      console.error(err);
      setError("Couldn't update the framing. Try re-uploading the photo.");
    }
  };

  if (step === "picker") {
    const needsAI = mode === "resume" || mode === "relaxed";
    return (
      <div className="space-y-6">
        <fieldset>
          <legend className="eyebrow-mono text-foreground/50 mb-3">What&apos;s this for?</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`text-left p-4 rounded-2xl border transition-all ${
                  mode === m.id ? "border-foreground bg-white shadow-md" : "border-foreground/10 bg-white/50 hover:bg-white"
                }`}
              >
                <p className="font-medium">{m.label}</p>
                <p className="text-xs text-foreground/55 mt-1.5">{m.hint}</p>
                {m.aiRequired ? (
                  <p className="eyebrow-mono text-primary mt-2">uses on-device AI</p>
                ) : null}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="eyebrow-mono text-foreground/50 mb-3">
            {needsAI ? "Country / context" : "Country or document"}
          </legend>
          <div className="flex flex-wrap gap-2">
            {(needsAI ? ADMISSION_COUNTRIES : STRICT_COUNTRIES).map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  if ("headFraction" in c) {
                    setCountry(c as CountryPreset);
                  } else {
                    setCountry((prev) => ({
                      ...prev,
                      width: c.width,
                      height: c.height,
                      label: c.label,
                      code: c.code,
                    }));
                  }
                }}
                className={`px-4 py-2 rounded-full border text-sm transition ${
                  country.code === c.code && country.label === c.label
                    ? "bg-foreground text-background border-foreground"
                    : "bg-white/50 border-foreground/10 hover:bg-white"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </fieldset>

        {needsAI ? (
          <div>
            <p className="eyebrow-mono text-foreground/50 mb-3">Background color</p>
            <p className="text-sm text-foreground/60 mb-2">
              Most resume and portfolio sites expect white. Pick something neutral.
            </p>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "White", token: "#ffffff" },
                { label: "Paper", token: "#f8f4ec" },
                { label: "Light grey", token: "#e5e5e5" },
                { label: "Mint", token: "#dff5e4" },
                { label: "Peach", token: "#ffe1c6" },
                { label: "Ink", token: "#0a0a0a" },
              ].map((c) => (
                <button
                  key={c.token}
                  type="button"
                  onClick={() => setBgColor(c.token)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition ${
                    bgColor === c.token
                      ? "border-foreground bg-white shadow"
                      : "border-foreground/10 bg-white/40"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-foreground/10 bg-paper p-5">
          <p className="font-medium mb-2">
            {needsAI ? "We'll AI-swap your background." : "Format-only mode: no edits to your face."}
          </p>
          <ul className="text-sm text-foreground/60 space-y-1.5">
            <li className="flex gap-2"><LuCheck className="size-4 text-primary mt-0.5" /> After upload, you position your head inside a guide so it fills the marked {Math.round((country.headFraction ?? 0.65) * 100)}% zone — no face detection, you&apos;re in control</li>
            <li className="flex gap-2"><LuCheck className="size-4 text-primary mt-0.5" /> Output: {country.width}×{country.height} px JPEG</li>
            <li className="flex gap-2"><LuCheck className="size-4 text-primary mt-0.5" /> Files stays in your browser</li>
          </ul>
        </div>

        <button
          type="button"
          onClick={() => setStep("tool")}
          className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:bg-primary transition"
        >
          Continue → Upload a photo
        </button>
      </div>
    );
  }

  if (!srcFile) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-foreground/10 bg-paper px-4 py-2.5 text-sm flex items-center gap-3">
          <span className="eyebrow-mono text-foreground/50">chosen</span>
          {MODES.find((m) => m.id === mode)?.label} · {country.label}
          <button onClick={startOver} className="ml-auto text-xs text-primary hover:underline">change</button>
        </div>
        <ToolDropzone
          onFile={handleFile}
          accept="image/jpeg,image/png"
          hint="Drop a face-forward photo"
          subhint="Plain background if you can. No glasses for US / UK passport."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Panel label="Original" src={srcUrl!} />
        {outUrl ? (
          <Panel
            label={`${country.label} (${country.width}×${country.height})`}
            src={outUrl}
            headFraction={headFraction}
          />
        ) : null}
      </div>

      {outUrl ? (
        <div className="rounded-2xl border border-foreground/10 bg-paper p-5 space-y-4">
          <div>
            <p className="font-medium">Line up your head with the guide</p>
            <p className="text-sm text-foreground/60 mt-1">
              We don&apos;t detect faces automatically. Use the sliders so your head fills the marked
              oval — that&apos;s the compliant zone for {country.label}.
            </p>
          </div>

          <label className="block">
            <span className="flex justify-between text-sm">
              <span className="text-foreground/70">Head height</span>
              <span className="eyebrow-mono text-foreground/50">{Math.round(headFraction * 100)}% of frame</span>
            </span>
            <input
              type="range"
              min={0.5}
              max={0.8}
              step={0.01}
              value={headFraction}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setHeadFraction(v);
                void recompose(v, framing);
              }}
              className="w-full accent-primary mt-1.5"
            />
          </label>

          <label className="block">
            <span className="flex justify-between text-sm">
              <span className="text-foreground/70">Zoom</span>
              <span className="eyebrow-mono text-foreground/50">{framing.zoom.toFixed(2)}×</span>
            </span>
            <input
              type="range"
              min={0.6}
              max={2}
              step={0.02}
              value={framing.zoom}
              onChange={(e) => {
                const next = { ...framing, zoom: parseFloat(e.target.value) };
                setFraming(next);
                void recompose(headFraction, next);
              }}
              className="w-full accent-primary mt-1.5"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="flex justify-between text-sm">
                <span className="text-foreground/70">Move left / right</span>
              </span>
              <input
                type="range"
                min={-1}
                max={1}
                step={0.02}
                value={framing.panX}
                onChange={(e) => {
                  const next = { ...framing, panX: parseFloat(e.target.value) };
                  setFraming(next);
                  void recompose(headFraction, next);
                }}
                className="w-full accent-primary mt-1.5"
              />
            </label>
            <label className="block">
              <span className="flex justify-between text-sm">
                <span className="text-foreground/70">Move up / down</span>
              </span>
              <input
                type="range"
                min={-1}
                max={1}
                step={0.02}
                value={framing.panY}
                onChange={(e) => {
                  const next = { ...framing, panY: parseFloat(e.target.value) };
                  setFraming(next);
                  void recompose(headFraction, next);
                }}
                className="w-full accent-primary mt-1.5"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={() => {
              const reset = country.headFraction ?? 0.65;
              setHeadFraction(reset);
              setFraming(DEFAULT_FRAMING);
              void recompose(reset, DEFAULT_FRAMING);
            }}
            className="text-xs text-primary hover:underline"
          >
            Reset framing
          </button>
        </div>
      ) : null}

      {status === "loading" || status === "running" ? (
        <div className="flex items-center gap-3 text-sm text-foreground/60">
          <LuLoader className="size-4 animate-spin" />
          {progress}
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {outUrl ? (
        <ToolResult>
          <div className="flex flex-wrap gap-3">
            <a
              href={outUrl}
              download={`motionix-passport-${country.code.toLowerCase()}-${Date.now()}.jpg`}
              className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:bg-primary transition"
            >
              <LuDownload className="size-4" /> Download JPEG
            </a>
            {(() => {
              const link = getPaymentLink(country.code);
              if (!link) return null;
              return (
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition"
                >
                  <LuExternalLink className="size-4" /> Print-ready + refund guarantee — {link.price}
                </a>
              );
            })()}
            {outBlob ? (
              <SaveToHistory
                tool="passport-photo-maker"
                blob={outBlob}
                filename={srcFile?.name ?? `${country.code}-passport.jpg`}
                description={`${country.label} passport · ${country.width}×${country.height}px`}
              />
            ) : null}
            <button
              type="button"
              onClick={startOver}
              className="inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-white px-5 py-2.5 text-sm font-medium hover:bg-destructive hover:text-destructive-foreground transition"
            >
              <LuTrash2 className="size-4" /> Start over
            </button>
          </div>
        </ToolResult>
      ) : null}
    </div>
  );
}

function Panel({ label, src, headFraction }: { label: string; src: string; headFraction?: number }) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-white p-3">
      <p className="eyebrow-mono text-foreground/50 mb-2 px-1">{label}</p>
      <div className="relative rounded-xl overflow-hidden bg-paper aspect-square">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={label} className="object-contain w-full h-full" />
        {headFraction ? (
          // Guide oval reflecting the target head zone. Purely visual — the user
          // aligns their head to it; we do NOT auto-detect the face.
          <div className="pointer-events-none absolute inset-0 flex justify-center" style={{ paddingTop: "6%" }}>
            <div
              className="rounded-[50%] border-2 border-dashed border-primary/70"
              style={{ height: `${Math.round(headFraction * 100)}%`, aspectRatio: "3 / 4" }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

// =================================================================
//  Canvas pixel helpers — compose()
//
// compose(): crops + resizes the source to spec and paints it on a white
// (or chosen-color, for AI cutouts) frame. Pixels of the face are never
// altered — only cropped and scaled.
//
// Head sizing: there is NO face detection here. The user aligns their head
// to the guide overlay via the head-height, zoom and pan sliders; those
// values drive computeCrop(), which sizes the source crop so the marked
// head region maps to headFraction of the output height.
// =================================================================

async function loadImage(src: string | Blob | URL): Promise<HTMLImageElement> {
  const createdUrl = typeof src === "string" || src instanceof URL ? null : URL.createObjectURL(src);
  const url = typeof src === "string" ? src : src instanceof URL ? src.toString() : createdUrl!;
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = url;
  try {
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = (e) => rej(e);
    });
  } finally {
    // Revoke only URLs we created here; caller-owned string/URL srcs are left alone.
    if (createdUrl) URL.revokeObjectURL(createdUrl);
  }
  return img;
}

// We assume an uploaded head-and-shoulders photo has the head filling roughly
// this fraction of the SOURCE height. There is NO face detection, so this is an
// honest starting guess; the user corrects it with the zoom + pan sliders while
// watching the guide oval. Picked from typical phone selfies / webcam shots.
const ASSUMED_HEAD_SRC = 0.5;

// Turn the chosen head-height (fraction of OUTPUT height) into a source-pixel
// crop rectangle. Larger headFraction => smaller crop => head fills more of the
// frame. `framing.zoom` is a user multiplier over that base; panX/panY (-1..1)
// slide the crop so eyes can sit in the upper third. Returns pixels to draw.
function computeCrop(
  natW: number,
  natH: number,
  targetW: number,
  targetH: number,
  headFraction: number,
  framing: Framing,
): { sx: number; sy: number; sw: number; sh: number } {
  const targetAspect = targetW / targetH;

  // Crop height so the assumed head maps to headFraction of the output height.
  // sh = natH * (assumedHead / headFraction), then divided by the user zoom.
  const zoom = Math.max(0.1, framing.zoom);
  let sh = (natH * (ASSUMED_HEAD_SRC / headFraction)) / zoom;
  let sw = sh * targetAspect;

  // Never sample outside the source. If the derived crop is bigger than the
  // image on either axis, clamp it (keeps the largest valid rectangle).
  if (sw > natW) {
    sw = natW;
    sh = sw / targetAspect;
  }
  if (sh > natH) {
    sh = natH;
    sw = sh * targetAspect;
  }

  // Slack is the room to pan; centered when pan is 0.
  const slackX = (natW - sw) / 2;
  const slackY = (natH - sh) / 2;
  const clamp = (v: number) => Math.max(-1, Math.min(1, v));
  const sx = slackX + clamp(framing.panX) * slackX;
  const sy = slackY + clamp(framing.panY) * slackY;

  return { sx, sy, sw, sh };
}

// Single compose path for every mode. `useBackground` fills the chosen color
// first (for AI cutouts); otherwise a white frame. Head size and position come
// entirely from the user-driven headFraction + framing — no face detection.
async function compose(
  blob: Blob,
  country: CountryPreset,
  headFraction: number,
  framing: Framing,
  opts: { useBackground: boolean; bgColor: string },
): Promise<Blob> {
  const img = await loadImage(blob);
  const w = country.width;
  const h = country.height;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = opts.useBackground ? opts.bgColor : "#ffffff";
  ctx.fillRect(0, 0, w, h);

  const { sx, sy, sw, sh } = computeCrop(
    img.naturalWidth,
    img.naturalHeight,
    w,
    h,
    headFraction,
    framing,
  );
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

  return await canvasToBlob(canvas, "image/jpeg", 0.94);
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("canvas.toBlob returned null"))),
      type,
      quality,
    );
  });
}
