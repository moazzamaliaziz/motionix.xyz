"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";
import { cn } from "@/lib/cn";
import { ViewfinderCorners } from "@/components/motionix/visuals/ViewfinderCorners";
import { LuUpload } from "react-icons/lu";

/**
 * Viewfinder-styled drag/drop zone. Emits the File via onFile().
 * Place inside a tool page; the parent handles reading it.
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
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null | undefined) => {
      if (!files || files.length === 0) return;
      const f = files[0];
      if (f.size > maxSize) {
        alert(`File too large. Max size is ${(maxSize / 1024 / 1024).toFixed(0)}MB.`);
        return;
      }
      onFile(f);
    },
    [onFile, maxSize],
  );

  return (
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
      role="button"
      tabIndex={0}
      className={cn(
        "group relative aspect-[16/10] md:aspect-[21/9]",
        "flex flex-col items-center justify-center cursor-pointer",
        "rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8",
        "border-2 border-dashed transition-all",
        over ? "border-primary bg-primary/5" : "border-foreground/15 bg-white/65 hover:bg-white",
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
          Files stay in your browser · max {Math.round(maxSize / 1024 / 1024)} MB
        </p>
      </div>
    </div>
  );
}
