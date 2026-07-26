"use client";

import { useEffect, useState } from "react";
import { LuDownload } from "react-icons/lu";
import { ToolDropzone } from "../ToolDropzone";
import { ToolResult } from "../ToolResult";

/**
 * Image converter — change a JPG, PNG, WebP, or AVIF into another format,
 * entirely in the browser via a canvas re-encode. No upload, no account.
 *
 * Notes:
 *   - PNG output preserves transparency; JPEG flattens onto white.
 *   - AVIF/WebP encode support depends on the browser's canvas.toBlob — we
 *     verify the output MIME and fall back to PNG with a clear message if the
 *     browser can't encode the chosen format.
 */

type OutFormat = "image/png" | "image/jpeg" | "image/webp" | "image/avif";

const FORMATS: { id: OutFormat; label: string; ext: string }[] = [
  { id: "image/png", label: "PNG", ext: "png" },
  { id: "image/jpeg", label: "JPG", ext: "jpg" },
  { id: "image/webp", label: "WebP", ext: "webp" },
  { id: "image/avif", label: "AVIF", ext: "avif" },
];

export function ImageConverterImpl() {
  const [file, setFile] = useState<File | null>(null);
  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [outBlob, setOutBlob] = useState<Blob | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const [outFormat, setOutFormat] = useState<OutFormat>("image/png");
  const [quality, setQuality] = useState(0.9);
  const [inSize, setInSize] = useState(0);
  const [outSize, setOutSize] = useState(0);

  useEffect(
    () => () => {
      if (srcUrl) URL.revokeObjectURL(srcUrl);
      if (outUrl) URL.revokeObjectURL(outUrl);
    },
    [srcUrl, outUrl],
  );

  const handleFile = (f: File) => {
    setFile(f);
    setInSize(f.size);
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
      const { blob, actualType } = await convert(file, outFormat, quality);
      if (actualType !== outFormat) {
        const wanted = FORMATS.find((f) => f.id === outFormat)?.label ?? outFormat;
        throw new Error(
          `Your browser can't encode ${wanted} on a canvas. Try PNG or WebP instead.`,
        );
      }
      setOutBlob(blob);
      setOutSize(blob.size);
      if (outUrl) URL.revokeObjectURL(outUrl);
      setOutUrl(URL.createObjectURL(blob));
      setStatus("done");
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Couldn't convert that image.");
      setStatus("error");
    }
  };

  const outMeta = FORMATS.find((f) => f.id === outFormat)!;
  const isLossy = outFormat !== "image/png";
  const downloadName = file
    ? `${file.name.replace(/\.[^.]+$/, "")}.${outMeta.ext}`
    : `converted.${outMeta.ext}`;

  if (!file) {
    return (
      <ToolDropzone
        onFile={handleFile}
        accept="image/jpeg,image/png,image/webp,image/avif"
        hint="Drop an image to convert"
        subhint="JPG, PNG, WebP, AVIF. Runs in your browser — nothing is uploaded."
      />
    );
  }

  return (
    <div className="space-y-5">
      <ToolResult>
        {/* Format picker */}
        <div>
          <p className="text-sm font-medium mb-2">Convert to</p>
          <div className="flex flex-wrap gap-2">
            {FORMATS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setOutFormat(f.id)}
                aria-pressed={outFormat === f.id}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  outFormat === f.id
                    ? "bg-foreground text-background"
                    : "border border-foreground/15 hover:bg-foreground/5"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quality (lossy formats only) */}
        {isLossy ? (
          <label className="block">
            <span className="text-sm font-medium">Quality · {Math.round(quality * 100)}%</span>
            <input
              type="range"
              min={0.3}
              max={1}
              step={0.05}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full mt-2 accent-primary"
            />
          </label>
        ) : (
          <p className="text-sm text-foreground/55">
            PNG is lossless and keeps transparency.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={start}
            disabled={status === "running"}
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
          >
            {status === "running" ? "Converting…" : `Convert to ${outMeta.label}`}
          </button>
          <button
            type="button"
            onClick={() => handleFile(file)}
            className="text-sm text-foreground/60 hover:text-foreground transition"
          >
            Reset
          </button>
        </div>

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </ToolResult>

      {status === "done" && outUrl ? (
        <ToolResult>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="text-sm text-foreground/70">
              <span className="font-medium text-foreground">{outMeta.label}</span> ·{" "}
              {(outSize / 1024).toFixed(0)} KB
              <span className="text-foreground/40">
                {" "}
                (was {(inSize / 1024).toFixed(0)} KB)
              </span>
            </div>
            <a
              href={outUrl}
              download={downloadName}
              className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:bg-primary hover:text-primary-foreground transition"
            >
              <LuDownload className="size-4" /> Download {outMeta.label}
            </a>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={outUrl}
            alt="Converted result"
            className="max-h-80 w-auto rounded-2xl border border-foreground/10 mx-auto"
          />
        </ToolResult>
      ) : null}
    </div>
  );
}

/** Load a File into an HTMLImageElement, revoking the object URL after load. */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That image couldn't be decoded by your browser."));
    };
    img.src = url;
  });
}

/**
 * Re-encode an image to the target format via canvas. Returns the blob plus
 * its actual MIME type so the caller can detect an unsupported encoder
 * (canvas.toBlob silently falls back to PNG when a format isn't supported).
 */
async function convert(
  file: File,
  type: OutFormat,
  quality: number,
): Promise<{ blob: Blob; actualType: string }> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");

  // JPEG has no alpha channel — flatten transparency onto white so it doesn't
  // render as black.
  if (type === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), type, type === "image/png" ? undefined : quality),
  );
  if (!blob) throw new Error("Conversion failed — the canvas returned no data.");
  return { blob, actualType: blob.type };
}
