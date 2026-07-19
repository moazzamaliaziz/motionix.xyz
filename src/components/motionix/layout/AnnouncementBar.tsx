"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LuSparkles } from "react-icons/lu";

export function AnnouncementBar({ message }: { message?: string }) {
  const [show, setShow] = useState(true);
  const t = useTranslations("AnnouncementBar");
  if (!show) return null;
  return (
    <div className="relative z-50 bg-foreground text-background text-[11px] md:text-[12px] py-2 px-4 text-center font-mono uppercase tracking-widest">
      <LuSparkles className="inline-block mr-2 align-[-2px]" />
      {message ?? t("defaultMessage")}
      <button
        type="button"
        aria-label={t("closeLabel")}
        onClick={() => setShow(false)}
        className="ml-3 opacity-70 hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </div>
  );
}
