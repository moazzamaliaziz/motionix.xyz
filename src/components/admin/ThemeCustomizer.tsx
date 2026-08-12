"use client";

import { useState } from "react";
import { Settings, X } from "lucide-react";

const PRESET_COLORS = [
  { name: "Violet", accent: "oklch(0.634 0.209 287.6)", glow: "oklch(0.755 0.141 295.4)" },
  { name: "Blue", accent: "oklch(0.634 0.2 250)", glow: "oklch(0.755 0.14 260)" },
  { name: "Emerald", accent: "oklch(0.634 0.2 155)", glow: "oklch(0.755 0.14 165)" },
  { name: "Rose", accent: "oklch(0.634 0.22 15)", glow: "oklch(0.755 0.15 25)" },
  { name: "Amber", accent: "oklch(0.75 0.18 70)", glow: "oklch(0.82 0.12 80)" },
  { name: "Cyan", accent: "oklch(0.634 0.15 210)", glow: "oklch(0.755 0.1 220)" },
];

export function ThemeCustomizer() {
  const [open, setOpen] = useState(false);
  const [activeColor, setActiveColor] = useState(0);

  function applyColor(index: number) {
    setActiveColor(index);
    const color = PRESET_COLORS[index];
    const root = document.documentElement;
    root.style.setProperty("--a-accent", color.accent);
    root.style.setProperty("--a-accent-glow", color.glow);
    root.style.setProperty("--a-gradient", `linear-gradient(120deg, ${color.accent} 0%, ${color.glow} 100%)`);
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-[60] grid size-12 place-items-center rounded-full bg-[var(--a-accent)] text-white shadow-lg hover:opacity-90 transition-opacity"
        aria-label="Customize theme"
      >
        <Settings className="size-5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[59]" onClick={() => setOpen(false)} />
          <div className="fixed bottom-20 right-6 z-[60] w-64 rounded-xl border border-[var(--a-border)] bg-[var(--a-bg-surface)] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--a-text-1)]">Theme Customizer</h3>
              <button onClick={() => setOpen(false)} className="text-[var(--a-text-4)] hover:text-[var(--a-text-1)]">
                <X className="size-4" />
              </button>
            </div>

            <p className="text-[11px] text-[var(--a-text-4)] mb-3">Accent Color</p>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_COLORS.map((color, i) => (
                <button
                  key={color.name}
                  onClick={() => applyColor(i)}
                  className={`flex flex-col items-center gap-1.5 rounded-lg p-2 transition-all ${
                    activeColor === i
                      ? "bg-[var(--a-bg-elevated)] ring-1 ring-[var(--a-accent)]"
                      : "hover:bg-[var(--a-bg-hover)]"
                  }`}
                >
                  <span
                    className="size-6 rounded-full"
                    style={{ background: color.accent }}
                  />
                  <span className="text-[10px] text-[var(--a-text-3)]">{color.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--a-border)]">
              <p className="text-[11px] text-[var(--a-text-4)]">
                Keyboard shortcut: <kbd className="rounded bg-[var(--a-bg-elevated)] px-1.5 py-0.5 text-[10px] font-mono">Ctrl+B</kbd> to toggle sidebar
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
