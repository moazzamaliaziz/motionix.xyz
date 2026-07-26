"use client";

import Link from "next/link";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "accent" | "ghost";
type ShinyButtonProps =
  | ({ variant?: Variant; href: string; className?: string; children: React.ReactNode } & Record<string, unknown>)
  | ({ variant?: Variant; href?: undefined; className?: string; children: React.ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>);

const styles: Record<Variant, string> = {
  primary: "bg-foreground text-background hover:bg-foreground/90 ring-foreground/10",
  accent: "bg-primary text-primary-foreground hover:bg-primary/90 ring-primary/20",
  ghost: "bg-foreground/5 text-foreground hover:bg-foreground/10 ring-foreground/5",
};

function ShineSpan() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(110deg,transparent_0%,transparent_45%,rgba(255,255,255,0.25)_50%,transparent_55%,transparent_100%)] bg-[length:220%_100%] bg-no-repeat bg-[position:-180%_0] group-hover:bg-[position:200%_0] transition-[background-position] duration-1000 ease-out"
    />
  );
}

export const ShinyButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, ShinyButtonProps>(
  function ShinyButton(props, ref) {
    const safeProps = props as ShinyButtonProps;
    const variant: Variant = (safeProps.variant ?? "primary") as Variant;
    const className: string | undefined = safeProps.className as string | undefined;
    const children: React.ReactNode = safeProps.children;
    const href = (safeProps as { href?: string }).href;

    if (typeof href === "string") {
      return (
        <Link
          href={href}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={cn(
            "relative isolate overflow-hidden group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors ring-1",
            styles[variant],
            className,
          )}
        >
          <ShineSpan />
          <span className="relative">{children}</span>
        </Link>
      );
    }

    const buttonRest = safeProps as ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        {...buttonRest}
        className={cn(
          "relative isolate overflow-hidden group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors ring-1",
          styles[variant],
          className,
        )}
      >
        <ShineSpan />
        <span className="relative">{children}</span>
      </button>
    );
  },
);
