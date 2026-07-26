"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { LuCommand, LuMenu, LuX } from "react-icons/lu";
import { AnimatedShinyText } from "@/components/motionix/visuals/AnimatedShinyText";
import { AuthUserButton, AuthSignInButton } from "@/components/motionix/auth/AuthShell";
import { LanguageSwitcher } from "@/components/motionix/layout/LanguageSwitcher";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="fixed top-10 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-2xl px-2 animate-fade-up">
      <div
        className={`inline-flex w-full items-center justify-between rounded-full border border-black/5 bg-white/75 backdrop-blur-xl pl-5 pr-2 py-2 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] transition-all ${
          scrolled ? "scale-[0.98]" : ""
        }`}
      >
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-icon.svg" alt="" className="size-6 w-6 h-6" aria-hidden="true" />
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
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            className="md:hidden inline-flex items-center justify-center size-9 rounded-full hover:bg-foreground/5 transition"
          >
            {menuOpen ? <LuX className="size-5" /> : <LuMenu className="size-5" />}
          </button>
          <LanguageSwitcher />
          <Link
            href="/tools"
            className="hidden lg:flex items-center gap-1.5 text-[12px] text-foreground/50 px-2 py-1 rounded-full hover:bg-foreground/5 transition"
            aria-label={t("quickFind")}
          >
            <LuCommand className="size-3.5" /> {t("quickFind")}
          </Link>
          <Link
            href="/tools/background-remover"
            className="bg-foreground text-background text-[12px] font-medium px-4 py-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors shrink-0 inline-flex items-center gap-1"
          >
            <AnimatedShinyText>{t("tryATool")}</AnimatedShinyText>
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      {/* Mobile dropdown — the primary nav is hidden under md, so without this
          phones have no way to reach Tools / How it works / FAQ / Blog. */}
      {menuOpen ? (
        <nav
          id="mobile-nav"
          className="md:hidden mt-2 rounded-3xl border border-black/5 bg-white/90 backdrop-blur-xl p-3 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] animate-fade-up"
        >
          <ul className="flex flex-col">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block rounded-2xl px-4 py-3 text-sm font-medium transition-colors hover:bg-foreground/5 ${
                    pathname === link.href ? "text-foreground" : "text-foreground/70"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
