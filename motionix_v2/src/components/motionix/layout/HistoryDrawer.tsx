"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteHistoryItem,
  listHistory,
  makeThumbnail,
  saveHistory,
  type HistoryEntry,
} from "@/lib/history";
import { useAuthEnabled } from "@/components/motionix/auth/AuthShell";
import { LuHistory, LuTrash2, LuX } from "react-icons/lu";

/**
 * Right-side drawer that lists recent saves for the current user (or
 * session, when no Clerk key is configured). Triggered by a button in the
 * main nav when a user has at least one entry, or by `?history=open` in URL.
 */

export function HistoryDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const auth = useAuthEnabled();
  const userId = auth.isSignedIn ? "self" : null;
  const [items, setItems] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listHistory(userId);
      setItems(list);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Couldn&apos;t load history.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (open) void refresh();
  }, [open, refresh]);

  const remove = async (id: string) => {
    await deleteHistoryItem(id, userId);
    setItems((it) => it.filter((i) => i.id !== id));
  };

  const recordCurrent = useCallback(
    async (entry: Omit<HistoryEntry, "id" | "createdAt" | "userId">) => {
      const thumb = await makeThumbnail(new Blob([new Uint8Array([0, 1, 2])], { type: "image/jpeg" })).catch(() => undefined);
      // If the caller wants a thumb, they should pass it via blob-to-thumb themselves;
      // this helper supports the small data-only path.
      void thumb;
      await saveHistory({ ...entry, userId: userId ?? "guest" });
      await refresh();
    },
    [userId, refresh],
  );

  return (
    <>
      {open ? (
        <div
          aria-hidden
          className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-40 animate-fade-up"
          onClick={onClose}
        />
      ) : null}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full md:w-[420px] bg-background border-l border-foreground/10 shadow-2xl shadow-foreground/20 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <header className="flex items-center justify-between gap-3 px-6 py-5 border-b border-foreground/10">
          <div className="flex items-center gap-2">
            <LuHistory className="size-4 text-primary" />
            <p className="eyebrow-mono text-foreground/45">History</p>
          </div>
          <button
            type="button"
            aria-label="Close history"
            onClick={onClose}
            className="size-8 grid place-items-center rounded-full hover:bg-foreground/5 transition"
          >
            <LuX className="size-4" />
          </button>
        </header>

        <div className="px-5 py-4 overflow-y-auto h-[calc(100%-72px)]">
          {loading ? (
            <p className="text-sm text-foreground/50">Loading…</p>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : items.length === 0 ? (
            <div className="text-sm text-foreground/55 py-12 text-center space-y-3">
              <p>No history yet.</p>
              <p className="text-foreground/40">
                After you complete a tool, tap &ldquo;Save to history&rdquo; to bookmark the
                result. We only store a thumbnail + description — never the
                photo itself.
              </p>
              {!auth.isSignedIn ? (
                <p className="text-foreground/40">
                  Sign in <a className="underline" href="/sign-in">here</a> when auth is
                  live to keep history across sessions.
                </p>
              ) : null}
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-2xl border border-foreground/10 bg-white p-3 flex gap-3"
                >
                  {entry.thumbnailDataUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={entry.thumbnailDataUrl}
                      alt="thumb"
                      className="size-16 rounded-lg object-cover bg-paper shrink-0"
                    />
                  ) : (
                    <div className="size-16 rounded-lg bg-paper/80 grid place-items-center text-foreground/40 shrink-0">
                      ·
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug truncate">{entry.description}</p>
                    <p className="text-xs text-foreground/55 mt-0.5">
                      {new Date(entry.createdAt).toLocaleString()} ·{" "}
                      {(entry.outputSize / 1024).toFixed(0)} KB
                    </p>
                    <p className="text-[10px] uppercase tracking-widest font-mono text-foreground/45 mt-0.5">
                      {entry.tool}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(entry.id)}
                    className="size-8 rounded-full grid place-items-center text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition self-start"
                    aria-label="Delete from history"
                  >
                    <LuTrash2 className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}

/**
 * HistoryToggle — a button + drawer shell. Used inside tool pages and the
 * main nav. Exposes a helper `persistCurrent(...)` via React state injection
 * — easier: callers just call `saveHistory(...)` directly from the tool body
 * with their own blob preview, then open the drawer themselves.
 */
export function HistoryTrigger({
  open,
  setOpen,
  count,
}: {
  open: boolean;
  setOpen: (b: boolean) => void;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 bg-white/60 backdrop-blur px-3 py-1.5 text-[12px] text-foreground/65 hover:text-foreground hover:bg-white transition"
      aria-label="History"
    >
      <LuHistory className="size-3.5" />
      History{typeof count === "number" && count > 0 ? ` (${count})` : ""}
    </button>
  );
}
