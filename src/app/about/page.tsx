import type { Metadata } from "next";
import Link from "next/link";
import { SpotlightCard } from "@/components/motionix/visuals/SpotlightCard";

export const metadata: Metadata = {
  title: "About — Motionix",
  description:
    "Motionix builds free, privacy-first image and video tools that run in your browser. No signup, no uploads, no watermarks.",
  openGraph: {
    title: "About — Motionix",
    description:
      "Motionix builds free, privacy-first image and video tools that run in your browser. No signup, no uploads, no watermarks.",
    url: "https://motionix.xyz/about",
    siteName: "Motionix",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About — Motionix",
    description:
      "Motionix builds free, privacy-first image and video tools that run in your browser. No signup, no uploads, no watermarks.",
  },
  alternates: { canonical: "https://motionix.xyz/about" },
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-32">
      <p className="eyebrow-mono text-primary mb-3">About</p>
      <h1 className="font-display text-5xl md:text-7xl leading-[0.92] tracking-tight">
        We build the boring tools no one pays for — so you don&apos;t have to subscribe.
      </h1>

      <div className="prose prose-neutral max-w-none mt-10 space-y-6 text-[15px] leading-relaxed">
        <p>
          Motionix is a single operator&apos;s pet project. The mission is plain: turn the awkward,
          quick-utility tasks you do on the web — resize a passport photo, cut out a background,
          compress an image to fit an email cap — into tab-side tools with no signup, no watermark,
          no ad-overlay, and, where possible, no server round-trip.
        </p>
        <p>
          I run it from my laptop. I designed the homepage. I wrote the small AI code that swaps
          your background. I read every note sent through the contact form. If something breaks,
          I know about it before you do, but if I miss it, tell me anyway.
        </p>
        <p>
          The site is open about its limits. All eight tools run in your browser — no server calls,
          no hidden uploads. If we can&apos;t run something client-side because the model is too big,
          we say so and don&apos;t hide a server call behind a &quot;magic&quot; button.
        </p>
        <p>
          The site runs free. We make a small amount of money from ads on the log/blog side of
          the site, never on tool pages. We will never sell your data or your photos. There is no
          part of the product you can&apos;t run without an account.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SpotlightCard tone="paper">
          <p className="eyebrow-mono text-foreground/50">What we will</p>
          <ul className="text-sm mt-3 space-y-1.5">
            <li>• Run your tool in the browser when we can.</li>
            <li>• Tell you the truth when we can&apos;t.</li>
            <li>• Label every country spec we support.</li>
            <li>• Email honestly. Subscriptions later.</li>
          </ul>
        </SpotlightCard>
        <SpotlightCard tone="mint">
          <p className="eyebrow-mono text-foreground/50">What we won&apos;t</p>
          <ul className="text-sm mt-3 space-y-1.5">
            <li>• No tracking of your photos.</li>
            <li>• No &quot;Sign in to download&quot; walls.</li>
            <li>• No watermarks on free outputs.</li>
            <li>• No fake &quot;AI&quot; tools that just call a server.</li>
          </ul>
        </SpotlightCard>
      </div>

      <div className="mt-12 flex flex-wrap gap-3 text-sm">
        <Link href="/tools" className="text-primary underline-offset-4 hover:underline">Try a tool →</Link>
        <Link href="/privacy" className="text-foreground/70 underline-offset-4 hover:underline">Privacy policy</Link>
        <Link href="/contact" className="text-foreground/70 underline-offset-4 hover:underline">Contact us</Link>
      </div>
    </div>
  );
}
