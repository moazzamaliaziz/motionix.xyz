"use client";

import { useEffect, useState, useCallback } from "react";
import { LuCloudUpload, LuCopy, LuCheck, LuExternalLink, LuLoader } from "react-icons/lu";
import { cn } from "@/lib/cn";
import { probeR2, uploadBlobToR2, type R2Probe, resetR2Probe } from "@/lib/r2-client";

/**
 * Drop-in "Upload to Cloudflare R2" button.
 *
 * What it does:
 *   - Probes /api/uploads/probe on mount; renders nothing if R2 is disabled.
 *   - On click, requests a signed PUT key from /api/uploads, then PUTs the
 *     blob directly to R2, then resolves a 24h signed download URL.
 *   - Shows a small inline panel with the resulting key + link + a copy button.
 *
 * Why "Cloudflare" in the public name and "R2" in the code?
 *   - Public copy: "Cloudflare" is the brand users recognise.
 *   - Code: R2 is the product name; helps us grep the codebase.
 *
 * Props:
 *   - blob, filename, tool — same shape as SaveToHistory's tool/filename.
 *   - label — optional override of the button text.
 *   - compact — render as icon-only chip instead of pill.
 */
export function CloudflareUpload({
  blob,
  filename,
  tool,
  label = "Save to cloud",
  compact = false,
}: {
  blob: Blob | null;
  filename: string;
  tool: string;
  label?: string;
  compact?: boolean;
}) {
  const [probe, setProbe] = useState<R2Probe | null>(null);
  const [state, setState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [result, setResult] = useState<{ downloadUrl: string; publicUrl: string | null; key: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Probe once on mount. If the user installs/upgrades env mid-session the
  // 30s cache will pick it up next time `resetR2Probe()` is called.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const p = await probeR2();
      if (cancelled) return;
      setProbe(p);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const upload = useCallback(async () => {
    if (!blob) return;
    setState("uploading");
    setError(null);
    setResult(null);
    setCopied(false);
    try {
      const r = await uploadBlobToR2({ blob, filename, tool });
      setResult({
        downloadUrl: r.downloadUrl,
        publicUrl: r.publicUrl,
        key: r.key,
      });
      setState("done");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "upload_failed";
      // If the plan said disabled mid-way, refresh the probe cache.
      if (msg.includes("r2_disabled")) resetR2Probe();
      setError(msg);
      setState("error");
    }
  }, [blob, filename, tool]);

  const copyLink = useCallback(async () => {
    if (!result) return;
    const url = result.publicUrl ?? result.downloadUrl;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Older browsers without Clipboard API — fall back to selecting link.
      setCopied(false);
    }
  }, [result]);

  // Hide entirely if R2 isn't enabled, or there is nothing to upload yet.
  if (!probe?.enabled) return null;
  if (!blob) return null;

  const linkToShow = result ? (result.publicUrl ?? result.downloadUrl) : null;

  if (compact) {
    return (
      <div className="inline-flex flex-col gap-2">
        <button
          type="button"
          onClick={upload}
          disabled={state === "uploading"}
          aria-label={label}
          className="inline-flex items-center gap-1.5 rounded-full border border-foreground/20 bg-white px-3 py-1.5 text-xs font-medium hover:bg-foreground/5 transition disabled:opacity-50"
        >
          {state === "uploading" ? (
            <LuLoader className="size-3.5 animate-spin" />
          ) : state === "done" ? (
            <LuCheck className="size-3.5 text-primary" />
          ) : (
            <LuCloudUpload className="size-3.5" />
          )}
          {state === "done" ? "Saved" : state === "uploading" ? "Uploading…" : "Cloud"}
        </button>
        {result ? <ResultLink link={linkToShow} copied={copied} onCopy={copyLink} compact /> : null}
        {error ? <p className="text-[11px] text-destructive">Couldn't save: {prettifyError(error)}</p> : null}
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col gap-2">
      <button
        type="button"
        onClick={upload}
        disabled={state === "uploading"}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition disabled:opacity-50",
          state === "done"
            ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15"
            : "border-foreground/20 bg-white hover:bg-foreground/5",
        )}
      >
        {state === "uploading" ? (
          <>
            <LuLoader className="size-4 animate-spin" />
            Uploading to Cloudflare…
          </>
        ) : state === "done" ? (
          <>
            <LuCheck className="size-4" />
            Saved to cloud
          </>
        ) : (
          <>
            <LuCloudUpload className="size-4" />
            {label}
          </>
        )}
      </button>

      {result ? (
        <ResultLink link={linkToShow} copied={copied} onCopy={copyLink} compact={false} />
      ) : null}

      {error ? (
        <p className="text-xs text-destructive">Couldn't save: {prettifyError(error)}</p>
      ) : null}
    </div>
  );
}

function ResultLink({
  link,
  copied,
  onCopy,
  compact,
}: {
  link: string | null;
  copied: boolean;
  onCopy: () => void;
  compact: boolean;
}) {
  if (!link) return null;
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border border-foreground/15 bg-white",
        compact ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm",
      )}
    >
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 truncate font-mono text-foreground/80 hover:text-primary transition"
      >
        <LuExternalLink className={compact ? "size-3" : "size-4"} />
        <span className="truncate max-w-[14rem]">{shortenKey(link)}</span>
      </a>
      <button
        type="button"
        onClick={onCopy}
        aria-label="Copy link"
        className="inline-flex items-center justify-center size-7 rounded-full hover:bg-foreground/5 transition"
      >
        {copied ? (
          <LuCheck className="size-3.5 text-primary" />
        ) : (
          <LuCopy className="size-3.5 text-foreground/60" />
        )}
      </button>
    </div>
  );
}

function shortenKey(url: string): string {
  // Show the host + last 8 chars of the path — long signed URLs are unreadable.
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/^\//, "");
    const tail = path.slice(-10);
    return `${u.host}/…/${tail}`;
  } catch {
    return url.slice(0, 32) + "…";
  }
}

function prettifyError(code: string): string {
  if (code.startsWith("size_too_large")) return "file is larger than the cloud limit";
  if (code.startsWith("unsupported_type")) return "this file type can't go to the cloud";
  if (code === "r2_disabled") return "cloud uploads are disabled";
  if (code.startsWith("put_failed:413")) return "file is too large for the cloud";
  if (code.startsWith("put_failed:403")) return "signature expired — try again";
  if (code.startsWith("put_failed")) return "upload didn't complete";
  if (code.startsWith("plan_failed")) return "couldn't get an upload slot";
  if (code.startsWith("download_failed")) return "couldn't resolve the download link";
  return "something went wrong";
}
