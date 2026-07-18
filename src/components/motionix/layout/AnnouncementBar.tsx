"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LuSparkles } from "react-icons/lu";

export function AnnouncementBar({ message }: { message?: string }) {
  const [show, setShow] = useState(true);
  if (!show) return null;
  return (
    <div className="relative z-50 bg-foreground text-background text-[11px] md:text-[12px] py-2 px-4 text-center font-mono uppercase tracking-widest">
      <LuSparkles className="inline-block mr-2 align-[-2px]" />
      {message ?? "Motionix is free in your browser. No account. No upload. ✕"}
      <button
        type="button"
        aria-label="Close announcement"
        onClick={() => setShow(false)}
        className="ml-3 opacity-70 hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </div>
  );
}
