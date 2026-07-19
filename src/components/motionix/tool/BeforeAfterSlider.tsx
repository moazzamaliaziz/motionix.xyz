"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Before/After image comparison slider. Drag the divider to reveal
 * the original (left) vs processed (right) image.
 */
export function BeforeAfterSlider({
  original,
  processed,
}: {
  original: string;
  processed: string;
}) {
  const [split, setSplit] = useState(50);
  const dragging = useRef(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const getPct = useCallback((clientX: number) => {
    const rect = sliderRef.current?.getBoundingClientRect();
    if (!rect) return 50;
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setSplit(getPct(e.clientX));
    };
    const onUp = () => {
      dragging.current = false;
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [getPct]);

  const onTouchMove = (e: React.TouchEvent) => {
    if (dragging.current && e.nativeEvent.touches?.[0]) {
      setSplit(getPct(e.nativeEvent.touches[0].clientX));
    }
  };

  return (
    <div className="rounded-2xl border border-foreground/10 bg-white p-3">
      <p className="eyebrow-mono text-foreground/50 mb-2 px-1">
        Before &amp; after — drag the divider
        <span className="text-foreground/30 ml-2">{split}%</span>
      </p>
      <div
        ref={sliderRef}
        className="relative rounded-xl overflow-hidden aspect-square select-none"
        style={{
          background:
            "linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%) 0 0/16px 16px, linear-gradient(45deg, #e5e7eb 25%, #fff 25%, #fff 75%, #e5e7eb 75%) 8px 8px/16px 16px",
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          dragging.current = true;
        }}
        onTouchStart={() => {
          dragging.current = true;
        }}
        onTouchEnd={() => {
          dragging.current = false;
        }}
        onTouchMove={onTouchMove}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={processed}
          alt="Processed"
          className="absolute inset-0 w-full h-full object-contain"
        />
        <div
          className="absolute inset-0 select-none"
          style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={original}
            alt="Original"
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
        <div
          className="absolute top-0 bottom-0 z-10"
          style={{ left: `${split}%` }}
        >
          <div className="h-full w-0.5 bg-white shadow-md" />
          <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 size-8 rounded-full bg-white border-2 border-foreground/20 shadow flex items-center justify-center cursor-ew-resize">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              className="text-foreground/60"
            >
              <line
                x1="3"
                y1="2"
                x2="3"
                y2="10"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <line
                x1="7"
                y1="2"
                x2="7"
                y2="10"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-2 px-1 text-xs text-foreground/40">
        <span>Original</span>
        <span>Processed</span>
      </div>
    </div>
  );
}
