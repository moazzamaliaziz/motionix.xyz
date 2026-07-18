"use client";

import { createContext, useContext, useMemo, useState, type ReactNode, Suspense } from "react";
import { HistoryDrawer } from "@/components/motionix/layout/HistoryDrawer";
import { LuHistory } from "react-icons/lu";
import { isAuthEnabled } from "@/components/motionix/auth/AuthShell";

type HistoryContextShape = {
  openDrawer: () => void;
  closeDrawer: () => void;
  isOpen: boolean;
};

const HistoryContext = createContext<HistoryContextShape | null>(null);

/**
 * Use from any descendant tool body to open the history drawer programmatically
 * (e.g. after a successful save: `useHistory().openDrawer()`).
 */
export function useHistory(): HistoryContextShape {
  const ctx = useContext(HistoryContext);
  if (!ctx) {
    // Safe fallback for pages that don't host the drawer.
    return {
      openDrawer: () => {},
      closeDrawer: () => {},
      isOpen: false,
    };
  }
  return ctx;
}

/**
 * Provides the History drawer + context to any tool page rendered as its
 * children. Renders a small button near the bottom-right when auth is enabled
 * (or when sessionStorage history is in use).
 */
export function HistoryHost() {
  const [open, setOpen] = useState(false);
  const value = useMemo<HistoryContextShape>(
    () => ({
      openDrawer: () => setOpen(true),
      closeDrawer: () => setOpen(false),
      isOpen: open,
    }),
    [open],
  );

  return (
    <HistoryContext.Provider value={value}>
      <Suspense fallback={null}>
        <HistoryDrawer open={open} onClose={() => setOpen(false)} />
      </Suspense>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open history"
        className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2.5 text-sm font-medium hover:bg-primary transition shadow-lg shadow-foreground/15"
      >
        <LuHistory className="size-4" />
        History
      </button>
      {!isAuthEnabled() ? (
        <span className="fixed bottom-20 right-7 z-30 text-[10px] font-mono uppercase tracking-widest text-foreground/40">
          local-only while auth is staging
        </span>
      ) : null}
    </HistoryContext.Provider>
  );
}
