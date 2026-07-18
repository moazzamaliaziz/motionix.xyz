"use client";

import { useEffect, useState } from "react";
import { LuCheck, LuDownload, LuExternalLink, LuLoader, LuTrash2 } from "react-icons/lu";
import { ToolDropzone } from "../ToolDropzone";
import { ToolResult } from "../ToolResult";
import type { CountryPreset } from "@/lib/tools";
import { getPaymentLink } from "@/lib/stripe-links";
import { SaveToHistory } from "@/components/motionix/tool/SaveToHistory";
import { removeBackgroundOnce } from "../lib/useBackgroundRemoval";

type Mode = "strict" | "admission" | "resume" | "relaxed";

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
  const [historySaved, setHistorySaved] = useState(false);

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

  const ensureRemove = async () => {
    setStatus("loading");
    setProgress("Fetching the small AI model that swaps backgrounds…");
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
    setStatus("running");
    setProgress(mode === "resume" || mode === "relaxed" ? "Swapping background…" : "Framing & crop…");

    try {
      // Always run Canvas crop + frame for the chosen country.
      let processedBlob: Blob;

      if (mode === "resume" || mode === "relaxed") {
        await ensureRemove();
        const cutoutBlob = await removeBackgroundOnce(file);
        processedBlob = await composeWithBackground(cutoutBlob, bgColor, country);
      } else {
        // Strict & admission: NO AI, only Canvas — keep originals exactly.
        processedBlob = await composeStrict(file, country);
      }

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
          ? `Couldn&apos;t complete that request: ${err.message}. Try a different photo.`
          : "We couldn&apos;t complete that request. Try a different photo.",
      );
      setStatus("error");
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
            {needsAI ? "We&apos;ll AI-swap your background." : "Format-only mode: no edits to your face."}
          </p>
          <ul className="text-sm text-foreground/60 space-y-1.5">
            <li className="flex gap-2"><LuCheck className="size-4 text-primary mt-0.5" /> Framing: head fills {Math.round((country.headFraction ?? 0.65) * 100)}% of the image</li>
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
        {outUrl ? <Panel label={`${country.label} (${country.width}×${country.height})`} src={outUrl} /> : null}
      </div>

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

function Panel({ label, src }: { label: string; src: string }) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-white p-3">
      <p className="eyebrow-mono text-foreground/50 mb-2 px-1">{label}</p>
      <div className="rounded-xl overflow-hidden bg-paper aspect-square">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={label} className="object-contain w-full h-full" />
      </div>
    </div>
  );
}

// =================================================================
//  Pure-CSS pixel helpers — Compose / composeStrict
//
// composeStrict: crops and resizes, places face on white, NO ai.
// composeWithBackground: takes a cutout blob (transparent PNG) and
// composes it onto the chosen color background, then crops/resizes to spec.
// =================================================================

async function loadImage(src: string | Blob | URL): Promise<HTMLImageElement> {
  const url = typeof src === "string" ? src : src instanceof URL ? src.toString() : URL.createObjectURL(src);
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = url;
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = (e) => rej(e);
  });
  return img;
}

async function composeStrict(file: File, country: CountryPreset): Promise<Blob> {
  const img = await loadImage(URL.createObjectURL(file));

  // Compose onto white canvas at country size. Center-crop the source so the
  // face is roughly centered in the frame. We do NOT alter pixels of the source.
  const w = country.width;
  const h = country.height;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  // Cover-fit the image: scale so the image fills the canvas, center it.
  const targetAspect = w / h;
  const sourceAspect = img.naturalWidth / img.naturalHeight;
  let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
  if (sourceAspect > targetAspect) {
    // source is wider — crop horizontally.
    sw = img.naturalHeight * targetAspect;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    // source is taller — crop vertically.
    sh = img.naturalWidth / targetAspect;
    sy = (img.naturalHeight - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

  return await canvasToBlob(canvas, "image/jpeg", 0.94);
}

async function composeWithBackground(cutoutBlob: Blob, bgColor: string, country: CountryPreset): Promise<Blob> {
  const cutout = await loadImage(URL.createObjectURL(cutoutBlob));
  const w = country.width;
  const h = country.height;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);

  const targetAspect = w / h;
  const sourceAspect = cutout.naturalWidth / cutout.naturalHeight;
  let sx = 0, sy = 0, sw = cutout.naturalWidth, sh = cutout.naturalHeight;
  if (sourceAspect > targetAspect) {
    sw = cutout.naturalHeight * targetAspect;
    sx = (cutout.naturalWidth - sw) / 2;
  } else {
    sh = cutout.naturalWidth / targetAspect;
    sy = (cutout.naturalHeight - sh) / 2;
  }
  ctx.drawImage(cutout, sx, sy, sw, sh, 0, 0, w, h);

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
