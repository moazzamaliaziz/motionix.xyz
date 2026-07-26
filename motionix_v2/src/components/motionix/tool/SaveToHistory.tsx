"use client";

import { useState } from "react";
import { LuBookmark, LuCheck } from "react-icons/lu";
import { useHistory } from "@/components/motionix/tool/HistoryHost";
import { makeThumbnail, saveHistory } from "@/lib/history";
import { useAuthEnabled } from "@/components/motionix/auth/AuthShell";

/**
 * Self-contained "Save to history" button — generates the small thumbnail,
 * writes a HistoryEntry, and pops the drawer open so users see they have a
 * record. Pure button + side-effects; no parent wiring needed.
 */
export function SaveToHistory({
  tool,
  blob,
  filename,
  description,
  children,
}: {
  tool: string;
  blob: Blob | null;
  filename: string;
  description: string;
  children?: React.ReactNode;
}) {
  const auth = useAuthEnabled();
  const { openDrawer } = useHistory();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!blob) return null;

  const onClick = async () => {
    if (saving) return;
    setSaving(true);
    setSaved(false);
    try {
      const thumb = await makeThumbnail(blob);
      await saveHistory({
        userId: auth.isSignedIn ? "self" : "guest",
        tool,
        filename,
        inputSize: 0,
        outputSize: blob.size,
        description,
        thumbnailDataUrl: thumb,
      });
      setSaved(true);
      openDrawer();
      setTimeout(() => setSaved(false), 1800);
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      aria-label="Save to history"
      className="inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-white px-5 py-2.5 text-sm font-medium hover:bg-foreground/5 transition disabled:opacity-50"
    >
      {saved ? (
        <>
          <LuCheck className="size-4 text-primary" /> Saved
        </>
      ) : (
        <>
          {children ?? (
            <>
              <LuBookmark className="size-4" /> {saving ? "Saving…" : "Save to history"}
            </>
          )}
        </>
      )}
    </button>
  );
}
