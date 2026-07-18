"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LuCommand } from "react-icons/lu";
import { AnimatedShinyText } from "@/components/motionix/visuals/AnimatedShinyText";
import { AuthUserButton, AuthSignInButton } from "@/components/motionix/auth/AuthShell";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/tools", label: "Tools" },
  { href: "/#how", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
  { href: "/blog", label: "Blog" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-10 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-2xl px-2 animate-fade-up">
      <div
        className={`inline-flex w-full items-center justify-between rounded-full border border-black/5 bg-white/75 backdrop-blur-xl pl-5 pr-2 py-2 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] transition-all ${
          scrolled ? "scale-[0.98]" : ""
        }`}
      >
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="size-6 rounded-full bg-primary animate-pulse-ring" aria-hidden />
          <span className="font-display text-sm tracking-tight">
            <span className="text-foreground">motion</span>
            <span className="text-primary">ix</span>
          </span>
        </Link>

        <nav className="hidden md:flex gap-6 text-[13px] font-medium text-foreground/60">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:text-foreground transition-colors ${
                pathname === link.href ? "text-foreground" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/tools"
            className="hidden lg:flex items-center gap-1.5 text-[12px] text-foreground/50 px-2 py-1 rounded-full hover:bg-foreground/5 transition"
            aria-label="Search tools"
          >
            <LuCommand className="size-3.5" /> Quick find
          </Link>
          <Link
            href="/tools/background-remover"
            className="bg-foreground text-background text-[12px] font-medium px-4 py-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors shrink-0 inline-flex items-center gap-1"
          >
            <AnimatedShinyText>Try a tool</AnimatedShinyText>
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
