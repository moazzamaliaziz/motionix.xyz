"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { LuCommand } from "react-icons/lu";
import { AnimatedShinyText } from "@/components/motionix/visuals/AnimatedShinyText";
import { AuthUserButton } from "@/components/motionix/auth/AuthShell";
import { LanguageSwitcher } from "@/components/motionix/layout/LanguageSwitcher";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useTranslations("Nav");

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/tools", label: t("tools") },
    { href: "/#how", label: t("howItWorks") },
    { href: "/#faq", label: t("faq") },
    { href: "/blog", label: t("blog") },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-3xl transition-all duration-300 animate-fade-up ${
          scrolled ? "top-3" : ""
        }`}
      >
        <div
          className={`flex items-center h-[52px] md:h-[56px] rounded-full border border-black/[0.04] bg-white/80 backdrop-blur-xl shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.02)] transition-all duration-300 px-1.5 md:px-2 ${
            scrolled ? "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.12)] bg-white/90" : ""
          }`}
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 pl-3 pr-4 md:pl-4 md:pr-6 h-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-icon.svg" alt="" className="size-6 shrink-0" aria-hidden="true" />
            <span className="font-display text-[15px] tracking-tight whitespace-nowrap">
              <span className="text-foreground">motion</span>
              <span className="text-primary">ix</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center h-full gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center h-8 px-3 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors ${
                  pathname === link.href
                    ? "text-foreground bg-black/[0.04]"
                    : "text-foreground/55 hover:text-foreground hover:bg-black/[0.03]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-1 shrink-0">
            <LanguageSwitcher />

            <Link
              href="/tools"
              className="hidden lg:flex items-center h-8 px-2.5 rounded-full text-[12px] text-foreground/45 hover:text-foreground/70 hover:bg-black/[0.03] transition-colors whitespace-nowrap gap-1.5"
              aria-label={t("quickFind")}
            >
              <LuCommand className="size-3.5" />
              <span>{t("quickFind")}</span>
            </Link>

            <div className="w-px h-4 bg-black/[0.06] hidden lg:block mx-0.5" />

            <Link
              href="/tools/background-remover"
              className="flex items-center h-8 px-4 rounded-full bg-foreground text-[12px] font-medium text-background hover:bg-foreground/90 transition-colors shrink-0 gap-1 whitespace-nowrap"
            >
              <AnimatedShinyText>{t("tryATool")}</AnimatedShinyText>
              <span aria-hidden className="text-[11px]">→</span>
            </Link>

            {/* Mobile hamburger button — A-1 fix */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex items-center justify-center size-8 rounded-full hover:bg-black/[0.05] transition-colors ml-0.5"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                {mobileOpen ? (
                  <>
                    <line x1="4" y1="4" x2="14" y2="14" />
                    <line x1="14" y1="4" x2="4" y2="14" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="5" x2="15" y2="5" />
                    <line x1="3" y1="9" x2="15" y2="9" />
                    <line x1="3" y1="13" x2="15" y2="13" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav overlay */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <nav className="absolute top-4 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-sm bg-white rounded-2xl shadow-2xl p-4 animate-fade-up">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center h-10 px-4 rounded-xl text-[14px] font-medium transition-colors ${
                  pathname === link.href
                    ? "text-foreground bg-black/[0.04]"
                    : "text-foreground/60 hover:text-foreground hover:bg-black/[0.03]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </>
  );
}
