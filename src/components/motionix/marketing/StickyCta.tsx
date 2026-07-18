"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShinyButton } from "@/components/motionix/visuals/ShinyButton";

export function StickyCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 800);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 animate-fade-up">
      <div className="inline-flex items-center gap-3 rounded-full border border-foreground/10 bg-foreground text-background px-2 py-2 shadow-2xl shadow-foreground/20">
        <span className="px-3 text-[13px]">Try a tool — pick one →</span>
        <ShinyButton href="/tools/background-remover">Open background remover</ShinyButton>
      </div>
    </div>
  );
}
