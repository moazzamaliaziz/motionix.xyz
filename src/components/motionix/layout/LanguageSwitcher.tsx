"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  const [focusIndex, setFocusIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
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
        setFocusIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // A-4: Focus the first item when menu opens
  useEffect(() => {
    if (open) {
      setFocusIndex(locales.indexOf(current as (typeof locales)[number]));
      requestAnimationFrame(() => {
        itemRefs.current[locales.indexOf(current as (typeof locales)[number])]?.focus();
      });
    }
  }, [open, current]);

  const switchLocale = useCallback(
    (locale: Locale) => {
      setCurrent(locale);
      saveLocale(locale);
      setOpen(false);
      setFocusIndex(-1);
      router.replace(pathname, { locale });
      buttonRef.current?.focus();
    },
    [pathname, router],
  );

  // A-4: Keyboard navigation for the dropdown
  const handleButtonKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Enter":
      case " ":
      case "ArrowDown":
        e.preventDefault();
        setOpen(true);
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
          setFocusIndex(-1);
        }
        break;
    }
  };

  const handleItemKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusIndex((i) => {
          const next = Math.min(i + 1, locales.length - 1);
          itemRefs.current[next]?.focus();
          return next;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusIndex((i) => {
          const prev = Math.max(i - 1, 0);
          itemRefs.current[prev]?.focus();
          return prev;
        });
        break;
      case "Home":
        e.preventDefault();
        setFocusIndex(0);
        itemRefs.current[0]?.focus();
        break;
      case "End":
        e.preventDefault();
        setFocusIndex(locales.length - 1);
        itemRefs.current[locales.length - 1]?.focus();
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        setFocusIndex(-1);
        buttonRef.current?.focus();
        break;
      case "Tab":
        // Close menu on Tab (let focus move naturally)
        setOpen(false);
        setFocusIndex(-1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusIndex >= 0) switchLocale(locales[focusIndex]);
        break;
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        onKeyDown={handleButtonKeyDown}
        className="flex items-center gap-1.5 text-[12px] text-foreground/50 px-2 py-1 rounded-full hover:bg-foreground/5 transition"
        aria-label="Change language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span>{localeFlags[current]}</span>
        <span className="hidden sm:inline">{localeNames[current]}</span>
        <svg className={`size-3 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 4.5L6 7.5L9 4.5" />
        </svg>
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-foreground/10 bg-white shadow-xl shadow-foreground/10 py-1 z-50"
          role="listbox"
          aria-label="Select language"
          onKeyDown={handleItemKeyDown}
        >
          {locales.map((locale, i) => (
            <button
              key={locale}
              ref={(el) => { itemRefs.current[i] = el; }}
              type="button"
              role="option"
              aria-selected={current === locale}
              onClick={() => switchLocale(locale)}
              onFocus={() => setFocusIndex(i)}
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
