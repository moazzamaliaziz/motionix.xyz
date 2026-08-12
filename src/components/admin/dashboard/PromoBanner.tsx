"use client";

import Link from "next/link";

interface PromoBannerProps {
  headline: string;
  subcopy: string;
  ctaLabel: string;
  ctaHref: string;
  className?: string;
}

export function PromoBanner({ headline, subcopy, ctaLabel, ctaHref, className = "" }: PromoBannerProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl p-6 sm:p-8 ${className}`}
      style={{ background: "var(--a-gradient)" }}
    >
      <div className="relative z-10 max-w-lg">
        <h2 className="text-3xl sm:text-4xl font-bold leading-tight text-white">
          {headline}
        </h2>
        <p className="mt-3 text-sm sm:text-base text-white/80">
          {subcopy}
        </p>
        <Link
          href={ctaHref}
          className="mt-5 inline-flex items-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[var(--a-bg-page)] transition-transform hover:scale-105"
        >
          {ctaLabel}
        </Link>
      </div>
      {/* Decorative circles */}
      <div className="absolute -right-12 -bottom-12 size-48 rounded-full bg-white/10" />
      <div className="absolute -right-4 -bottom-4 size-24 rounded-full bg-white/5" />
    </div>
  );
}
