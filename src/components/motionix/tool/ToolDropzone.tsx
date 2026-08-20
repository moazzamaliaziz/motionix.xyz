"use client";

import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";
import { cn } from "@/lib/cn";
import { ViewfinderCorners } from "@/components/motionix/visuals/ViewfinderCorners";
import { LuUpload } from "react-icons/lu";

/**
 * Viewfinder-styled drag/drop zone. Emits the File via onFile().
 * A-5 fix: replaced blocking alert() with accessible inline error.
 */
export function ToolDropzone({
  onFile,
  accept = "image/*",
  maxSize = 10 * 1024 * 1024, // 10MB
  hint = "Drop a file or click to browse",
  subhint,
  className,
}: {
  onFile: (file: File) => void;
  accept?: string;
  maxSize?: number;
  hint?: string;
  subhint?: string;
  className?: string;
}) {
  const [over, setOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Auto-clear error after 5 seconds
  const showError = useCallback((msg: string) => {
    setError(msg);
    clearTimeout(errorTimerRef.current ?? undefined);
    errorTimerRef.current = setTimeout(() => setError(null), 5000);
  }, []);

  useEffect(() => () => { clearTimeout(errorTimerRef.current ?? undefined); }, []);

  const handleFiles = useCallback(
    (files: FileList | null | undefined) => {
      if (!files || files.length === 0) return;
      const f = files[0];
      if (f.size > maxSize) {
        showError(
          `File too large. Max size is ${(maxSize / 1024 / 1024).toFixed(0)}MB. Your file is ${(f.size / 1024 / 1024).toFixed(1)}MB.`,
        );
        return;
      }
      setError(null);
      onFile(f);
    },
    [onFile, maxSize, showError],
  );

  // Ctrl+V / Cmd+V paste from clipboard
  useEffect(() => {
    const onPaste = (ev: ClipboardEvent) => {
      const items = ev.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === "file") {
          if (accept.startsWith("image/") || accept.startsWith("video/") || accept === "image/*,video/*") {
            // ponytail: clipboard images arrive as "image/png" regardless of source.
          }
          const file = items[i].getAsFile();
          if (file) handleFiles([file] as unknown as FileList);
          ev.preventDefault();
          return;
        }
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleFiles, accept]);

  return (
    <div className="relative">
      <div
        onDragOver={(e: DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={hint}
        aria-describedby={error ? "dropzone-error" : undefined}
        className={cn(
          "group relative aspect-[16/10] md:aspect-[21/9]",
          "flex flex-col items-center justify-center cursor-pointer",
          "rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8",
          "border-2 border-dashed transition-all",
          error
            ? "border-destructive bg-destructive/5"
            : over
              ? "border-primary bg-primary/5"
              : "border-foreground/15 bg-white/65 hover:bg-white",
          className,
        )}
      >
        <ViewfinderCorners length={20} gap={16} thickness={1.5} color="var(--color-foreground)" />

        <input
          ref={fileRef}
          type="file"
          accept={accept}
          onChange={(e) => handleFiles(e.target?.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4">
          <div className="size-16 rounded-2xl bg-white border border-foreground/10 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 animate-float">
            <LuUpload className="size-7 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="text-lg md:text-xl font-medium">{hint}</h3>
            {subhint ? (
              <p className="text-sm text-foreground/50 mt-1">{subhint}</p>
            ) : null}
          </div>
          <p className="eyebrow-mono text-foreground/40">
            Drop, click, or Ctrl+V Â· max {Math.round(maxSize / 1024 / 1024)} MB
          </p>
        </div>
      </div>

      {/* A-5: Accessible inline error (replaces alert()) */}
      {error ? (
        <div
          id="dropzone-error"
          role="alert"
          aria-live="assertive"
          className="mt-3 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
            <line x1="8" y1="4" x2="8" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
          </svg>
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto size-6 grid place-items-center rounded-full hover:bg-destructive/10 transition"
            aria-label="Dismiss error"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="2" y1="2" x2="10" y2="10" />
              <line x1="10" y1="2" x2="2" y2="10" />
            </svg>
          </button>
        </div>
      ) : null}
    </div>
  );
}
