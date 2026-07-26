"use client";

import { useEffect, useRef, useState } from "react";
import { LuDownload, LuLoader } from "react-icons/lu";
import { ToolDropzone } from "../ToolDropzone";
import { ToolResult } from "../ToolResult";
import { CloudflareUpload } from "../CloudflareUpload";

/**
 * Video compressor — runs in your browser via WebCodecs + Mediabunny.
 *
 * Strategy:
 *   - Decoded from the source media (Matroska / MP4 / WebM / MOV via Mediabunny's
 *     CanvasSink).
 *   - Re-encoded as H.264 if available, or AVC1 fallback, at a target bitrate.
 *   - Writes to a Buffer that we hand back as a Blob.
 *
 * Limits:
 *   - Roughly 200MB uploads.
 *   - Browsers without WebCodecs (`window.VideoEncoder`) won't work — we detect.
 */

// Lazy import the named exports we need.
type MediabunnyModule = typeof import("mediabunny");

type Quality = "fit" | "tight" | "standard" | "high";

const SIZE_TARGETS: { id: Quality; label: string; sizeKB?: number }[] = [
  { id: "tight",     label: "Email-tight (10 MB)", sizeKB: 10 * 1024 },
  { id: "fit",       label: "Small (25 MB)",         sizeKB: 25 * 1024 },
  { id: "standard",  label: "Standard (50 MB)",      sizeKB: 50 * 1024 },
  { id: "high",      label: "Keep quality",          sizeKB: undefined },
];

export function VideoCompressorImpl() {
  const [file, setFile] = useState<File | null>(null);
  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [outBlob, setOutBlob] = useState<Blob | null>(null);
  const [outSize, setOutSize] = useState<number>(0);
  const [inputSize, setInputSize] = useState<number>(0);
  const [quality, setQuality] = useState<Quality>("fit");

  const [status, setStatus] = useState<"idle" | "loading" | "running" | "done" | "error">("idle");
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const [supported, setSupported] = useState<boolean>(true);
  const [probe, setProbe] = useState<{ width?: number; height?: number; duration?: number } | null>(null);

  const cancelRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // WebCodecs exposes the encoder as a global constructor (window.VideoEncoder),
    // not on navigator. Absence means the browser can't transcode in-tab.
    if (typeof window.VideoEncoder === "undefined") {
      setSupported(false);
    }
  }, []);

  useEffect(
    () => () => {
      if (srcUrl) URL.revokeObjectURL(srcUrl);
      if (outUrl) URL.revokeObjectURL(outUrl);
    },
    [srcUrl, outUrl],
  );

  const handleFile = (f: File) => {
    cancelRef.current = false;
    setFile(f);
    setInputSize(f.size);
    if (srcUrl) URL.revokeObjectURL(srcUrl);
    setSrcUrl(URL.createObjectURL(f));
    if (outUrl) URL.revokeObjectURL(outUrl);
    setOutUrl(null);
    setOutSize(0);
    setStatus("idle");
    setError(null);

    // Probe metadata via mediabunny
    (async () => {
      try {
        const m = await loadMediabunny();
        const input = new m.Input({
          source: new m.BlobSource(f),
          formats: m.ALL_FORMATS,
        });
        const videoTrack = await input.getPrimaryVideoTrack();
        if (!videoTrack) {
          setProbe(null);
          return;
        }
        const w = (videoTrack.displayWidth ?? videoTrack.codedWidth) ?? undefined;
        const h = (videoTrack.displayHeight ?? videoTrack.codedHeight) ?? undefined;
        const duration = await (input.computeDuration?.() ?? Promise.resolve(0));
        setProbe({ width: w, height: h, duration });
      } catch (e) {
        console.warn(e);
        setProbe(null);
      }
    })();
  };

  const run = async () => {
    if (!file) return;
    cancelRef.current = false;
    setStatus("loading");
    setProgress(0);
    setError(null);

    try {
      const m = await loadMediabunny();
      setStatus("running");

      const input = new m.Input({
        source: new m.BlobSource(file!),
        formats: m.ALL_FORMATS,
      });

      const videoTrack = await input.getPrimaryVideoTrack();
      if (!videoTrack) throw new Error("No video track in this file.");
      const audioTrack = (await input.getPrimaryAudioTrack?.()) ?? null;

      // Source dimensions (fall back to a sane default), forced even for codec safety.
      const w = videoTrack.displayWidth ?? videoTrack.codedWidth ?? 1280;
      const h = videoTrack.displayHeight ?? videoTrack.codedHeight ?? 720;
      const width = w & ~1;
      const height = h & ~1;

      // Pick an encodable codec for the MP4 container; prefer H.264.
      const videoCodec = (await m.getFirstEncodableVideoCodec(["avc", "vp9", "vp8"], {
        width,
        height,
      })) ?? undefined;
      if (!videoCodec) {
        throw new Error("Your browser can't encode video in a supported format.");
      }

      // Decide the target video bitrate (bits/sec) from the chosen size target.
      const duration = await (input.computeDuration?.() ?? Promise.resolve(probe?.duration ?? 0));
      const sizeTarget = SIZE_TARGETS.find((s) => s.id === quality);
      let videoBitrate: number | undefined;
      const audioBitrate = audioTrack ? 96_000 : 0;
      if (sizeTarget?.sizeKB && duration && duration > 0) {
        // Budget the container to ~97% of the target, subtract the audio track,
        // then convert the remaining bytes to a per-second bitrate. Clamp to a
        // readable floor/ceiling so tiny clips don't get an absurd bitrate.
        const targetBits = sizeTarget.sizeKB * 1024 * 8 * 0.97;
        const audioBits = audioBitrate * duration;
        const videoBits = Math.max(targetBits - audioBits, targetBits * 0.5);
        videoBitrate = Math.round(
          Math.min(Math.max(videoBits / duration, 150_000), 12_000_000),
        );
      }

      const output = new m.Output({
        format: new m.Mp4OutputFormat({ fastStart: "in-memory" }),
        target: new m.BufferTarget(),
      });

      const conversion = await m.Conversion.init({
        input,
        output,
        video: {
          codec: videoCodec,
          width,
          height,
          fit: "contain",
          // "Keep quality" (no sizeKB) → let mediabunny pick a high-quality bitrate.
          bitrate: videoBitrate ?? m.QUALITY_HIGH,
        },
        audio: audioTrack
          ? {
              codec: (await m.getFirstEncodableAudioCodec(["aac", "opus"])) ?? undefined,
              bitrate: audioBitrate,
            }
          : { discard: true },
      });

      if (!conversion.isValid) {
        const reason = conversion.discardedTracks[0]?.reason;
        throw new Error(
          reason
            ? `Can't convert this video (${reason.replace(/_/g, " ")}).`
            : "Can't convert this video in the browser.",
        );
      }

      conversion.onProgress = (p) => {
        if (!cancelRef.current) setProgress(Math.min(1, p));
      };

      if (cancelRef.current) {
        await conversion.cancel();
        setStatus("idle");
        return;
      }

      await conversion.execute();

      const buf = output.target.buffer;
      if (!buf) throw new Error("Output buffer empty.");
      const bl = new Blob([buf], { type: "video/mp4" });
      setOutSize(bl.size);
      setOutBlob(bl);
      if (outUrl) URL.revokeObjectURL(outUrl);
      setOutUrl(URL.createObjectURL(bl));
      setProgress(1);
      setStatus("done");
    } catch (e) {
      // A user-triggered cancel surfaces as ConversionCanceledError — treat as idle.
      if (e instanceof Error && e.name === "ConversionCanceledError") {
        setStatus("idle");
        return;
      }
      console.error(e);
      setError(e instanceof Error ? e.message : "Couldn't process that video.");
      setStatus("error");
    }
  };

  if (!supported) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-foreground/20 paper/40 p-8 text-center space-y-3">
        <p className="font-medium">Your browser doesn&apos;t support WebCodecs yet.</p>
        <p className="text-sm text-foreground/60">
          Try Chrome / Edge / Safari 16.4+. We need hardware video encoding for this tool to run in your tab without uploading.
        </p>
      </div>
    );
  }

  if (!file) {
    return (
      <ToolDropzone
        onFile={handleFile}
        accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
        maxSize={200 * 1024 * 1024}
        hint="Drop your video"
        subhint="MP4, MOV, WebM, MKV. Up to 200 MB. Runs in your browser via WebCodecs."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {SIZE_TARGETS.map((q) => (
          <button
            key={q.id}
            type="button"
            onClick={() => setQuality(q.id)}
            className={`px-4 py-2 text-sm rounded-full border transition ${
              quality === q.id ? "bg-foreground text-background border-foreground" : "bg-white/60 border-foreground/10 hover:bg-white"
            }`}
          >
            {q.label}
          </button>
        ))}
      </div>
      <div className="space-y-1">
        <button
          type="button"
          onClick={run}
          disabled={status === "running" || status === "loading"}
          className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
        >
          {status === "running" || status === "loading" ? (
            <>
              <LuLoader className="size-4 animate-spin" /> Compressing…
            </>
          ) : (
            <>Run</>
          )}
        </button>
        {(status === "running" || status === "loading") ? (
          <div className="w-full md:w-80 h-2 rounded-full bg-foreground/10 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        ) : null}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {outUrl ? (
        <ToolResult>
          <div className="space-y-3">
            <p className="text-sm text-foreground/70">
              Saved {(outSize / 1024).toFixed(0)} KB
              {inputSize > 0 ? ` — saved ${Math.round((1 - outSize / inputSize) * 100)}% over the original ${(inputSize / 1024 / 1024).toFixed(1)} MB` : ""}.
            </p>
            <video
              src={outUrl}
              controls
              className="w-full rounded-2xl bg-foreground overflow-hidden"
            />
            <div className="flex flex-wrap gap-3">
              <a
                href={outUrl}
                download={`motionix-compressed-${Date.now()}.mp4`}
                className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:bg-primary transition"
              >
                <LuDownload className="size-4" /> Download MP4 ({(outSize / 1024).toFixed(0)} KB)
              </a>
              <CloudflareUpload
                tool="video-compressor"
                blob={outBlob}
                filename={`motionix-compressed-${Date.now()}.mp4`}
                label="Save to cloud (24h)"
              />
              <button
                type="button"
                onClick={() => {
                  cancelRef.current = true;
                  if (srcUrl) URL.revokeObjectURL(srcUrl);
                  setSrcUrl(null);
                  setFile(null);
                  if (outUrl) URL.revokeObjectURL(outUrl);
                  setOutUrl(null);
                  setOutBlob(null);
                  setOutSize(0);
                  setProbe(null);
                  setStatus("idle");
                }}
                className="inline-flex items-center gap-2 rounded-full border border-foreground/15 px-5 py-2.5 text-sm hover:bg-foreground/5 transition"
              >
                Start over
              </button>
            </div>
          </div>
        </ToolResult>
      ) : null}
    </div>
  );
}

let cachedMediabunny: MediabunnyModule | null = null;
async function loadMediabunny(): Promise<MediabunnyModule> {
  if (cachedMediabunny) return cachedMediabunny;
  cachedMediabunny = (await import("mediabunny")) as MediabunnyModule;
  return cachedMediabunny;
}
