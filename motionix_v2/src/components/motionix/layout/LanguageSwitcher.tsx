"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/config";

const STORAGE_KEY = "motionix-locale";

function getSavedLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && locales.includes(saved as Locale)) return saved as Locale;
  } catch {}
  return null;
}

function saveLocale(locale: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {}
}

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Locale>("en");
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const saved = getSavedLocale();
    if (saved) setCurrent(saved);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function switchLocale(locale: Locale) {
    setCurrent(locale);
    saveLocale(locale);
    setOpen(false);
    router.replace(pathname, { locale });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[12px] text-foreground/50 px-2 py-1 rounded-full hover:bg-foreground/5 transition"
        aria-label="Change language"
        aria-expanded={open}
      >
        <span>{localeFlags[current]}</span>
        <span className="hidden sm:inline">{localeNames[current]}</span>
        <svg className={`size-3 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 4.5L6 7.5L9 4.5" />
        </svg>
      </button>

      {open ? (
        <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-foreground/10 bg-white shadow-xl shadow-foreground/10 py-1 z-50">
          {locales.map((locale) => (
            <button
              key={locale}
              type="button"
              onClick={() => switchLocale(locale)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                current === locale
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground/70 hover:bg-foreground/5"
              }`}
            >
              <span>{localeFlags[locale]}</span>
              <span>{localeNames[locale]}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
