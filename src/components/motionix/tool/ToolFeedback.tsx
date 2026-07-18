"use client";

import { useState } from "react";
import { LuThumbsDown, LuThumbsUp } from "react-icons/lu";
import { track } from "@/lib/analytics";

/**
 * Tiny feedback widget — no third-party deps. Fires `feedback_thumb_{up|down}`
 * across whichever analytics providers are configured (GA4, Plausible, Clarity).
 */
export function ToolFeedback({ toolSlug }: { toolSlug: string }) {
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  const fire = (which: "up" | "down") => {
    setVote(which);
    if (typeof window !== "undefined") {
      track(`feedback_thumb_${which}`, { tool: toolSlug });
    }
  };

  return (
    <div className="flex items-center gap-3 text-sm text-foreground/60">
      <span>Did it work?</span>
      <button
        type="button"
        aria-label="Yes, it worked"
        onClick={() => fire("up")}
        className={`size-9 rounded-full border grid place-items-center transition-colors ${
          vote === "up" ? "bg-primary text-primary-foreground border-primary" : "border-foreground/15 hover:bg-foreground/5"
        }`}
      >
        <LuThumbsUp className="size-4" />
      </button>
      <button
        type="button"
        aria-label="No, something was off"
        onClick={() => fire("down")}
        className={`size-9 rounded-full border grid place-items-center transition-colors ${
          vote === "down" ? "bg-destructive text-destructive-foreground border-destructive" : "border-foreground/15 hover:bg-foreground/5"
        }`}
      >
        <LuThumbsDown className="size-4" />
      </button>
      {vote === "up" ? <span>Nice. Thanks for the signal.</span> : null}
      {vote === "down" ? <span>Sorry — what went wrong? Email us via the contact page.</span> : null}
    </div>
  );
}
