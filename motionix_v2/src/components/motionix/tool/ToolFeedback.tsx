"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LuThumbsDown, LuThumbsUp } from "react-icons/lu";
import { track } from "@/lib/analytics";

export function ToolFeedback({ toolSlug }: { toolSlug: string }) {
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const t = useTranslations("ToolPage");

  const fire = (which: "up" | "down") => {
    setVote(which);
    if (typeof window !== "undefined") {
      track(`feedback_thumb_${which}`, { tool: toolSlug });
    }
  };

  return (
    <div className="flex items-center gap-3 text-sm text-foreground/60">
      <span>{t("didItWork")}</span>
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
      {vote === "up" ? <span>{t("feedbackNice")}</span> : null}
      {vote === "down" ? <span>{t("feedbackSorry")}</span> : null}
    </div>
  );
}
