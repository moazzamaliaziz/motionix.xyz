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
 *   - Browsers without WebCodecs (`navigator.videoEncoder`) won't work — we detect.
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
    if (typeof navigator === "undefined") return;
    // @ts-expect-error — WebCodecs API is widely supported in evergreen browsers; we probe defensively.
    if (typeof navigator.videoEncoder === "undefined") {
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
      // Add support for multiple video tracks by using the first one only.
      const w = videoTrack.displayWidth ?? videoTrack.codedWidth ?? 1280;
      const h = videoTrack.displayHeight ?? videoTrack.codedHeight ?? 720;
      const fps = (() => {
        // Probe fps via a quick conversion: we can use fps=30 default.
        return 30;
      })();

      // Frame rate for mediabunny
      const frameRate = (v: number) => (m as any).QUALITY_HIGH && Math.max(1, Math.min(60, Math.round(v || 30)));
      const fr = frameRate(fps);

      // Pick an encoder.
      const targetCodec = m.getFirstEncodableVideoCodec?.(["avc", "vp9", "vp8"]);
      const codec = targetCodec ?? "avc";

      // Decide on bitrate based on quality target.
      let targetBitrate = 2_000_000;
      const inputKb = SIZE_TARGETS.find((s) => s.id === quality);
      if (inputKb?.sizeKB) {
        // approx 1 KB / 8 kbit  → targetBitrate = kb*8 / duration?
        // We don't know duration yet; use default-below.
        const dur = await (input.computeDuration?.() ?? Promise.resolve(0));
        if (dur && dur > 0) {
          const kbit = Math.floor((inputKb.sizeKB * 8) / dur);
          targetBitrate = Math.max(200, Math.min(kbit, 8_000));
        }
      }

      // Use mp4 (mov) output for H.264.
      const output = new m.Output({
        format: new m.Mp4OutputFormat({ fastStart: "in-memory" }),
        target: new m.BufferTarget(),
      });

      const width = w & ~1;
      const height = h & ~1;

      // Output tracks — addVideoTrack / addAudioTrack accept config objects.
      ((output as unknown as { addVideoTrack: (cfg: unknown) => unknown }).addVideoTrack)({
        codec,
        bitrate: targetBitrate * 1000,
        width,
        height,
        frameRate: fr,
      });
      if (audioTrack) {
        try {
          const aCodec = m.getFirstEncodableAudioCodec?.(["aac", "opus"]) ?? "aac";
          ((output as unknown as { addAudioTrack: (cfg: unknown) => unknown }).addAudioTrack)({
            codec: aCodec,
            bitrate: 96_000,
          });
        } catch { /* ignore */ }
      }

      type ConversionCtor = new (cfg: Record<string, unknown>) => {
        start: () => void;
        execute: () => Promise<void>;
        iterate?: () => AsyncIterable<{ progress?: number; done?: boolean }>;
        cancel: () => void;
      };
      const Conversion = (m as unknown as { Conversion: ConversionCtor }).Conversion;
      const conversion = new Conversion({ input, output });

      // Attach CanvasSink to the video track
      const canvasSink = new m.CanvasSink(videoTrack, {
        width,
        height,
      } as unknown as undefined);

      // Process video frames sequentially
      const outAny = output as unknown as {
        iterate?: () => AsyncIterable<{ progress?: number; done?: boolean }>;
      };

      // We loop with progress reporting. Mediabunny's API surface is rich; we
      // implement a manual await pattern that should work with the public API.
      // The `Conversion` already wires a default `VideoSampleSink` if you don't
      // specify one; so we keep the pipe and just emit progress.
      const total = (probe?.duration && probe.duration > 0) ? probe.duration : 10;

      // Simulated manual progress loop: we drive the conversion and listen for progress events.
      const runner = async () => {
        const it = outAny.iterate?.();
        if (!it) return;
        for await (const ev of it) {
          if (cancelRef.current) break;
          if (typeof ev?.progress === "number") {
            setProgress(Math.min(1, ev.progress));
          }
          if (ev?.done) break;
        }
      };
      // If iterate isn't available, just start the conversion and proceed:
      if (!(outAny.iterate)) {
        conversion.start();
        // poll on rAF for a UX progress
        const start = performance.now();
        const dur = Math.max(1, total) * 1000;
        await new Promise<void>((resolve) => {
          const tick = () => {
            if (cancelRef.current) return resolve();
            const t = (performance.now() - start) / dur;
            setProgress(Math.min(1, t));
            if (t < 1) requestAnimationFrame(tick);
            else resolve();
          };
          requestAnimationFrame(tick);
        });
      } else {
        await runner();
      }

      // finalise and read buffer
      await conversion.execute();
      const buf = (output.target as unknown as { buffer?: ArrayBuffer }).buffer;
      if (!buf) throw new Error("Output buffer empty.");
      const bl = new Blob([buf], { type: "video/mp4" });
      const size = bl.size;
      setOutSize(size);
      setOutBlob(bl);
      if (outUrl) URL.revokeObjectURL(outUrl);
      const url = URL.createObjectURL(bl);
      setOutUrl(url);
      setProgress(1);
      setStatus("done");
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Couldn&apos;t process that video.");
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
