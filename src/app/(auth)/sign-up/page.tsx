import Link from "next/link";
import { AnnouncementBar } from "@/components/motionix/layout/AnnouncementBar";
import { SiteHeader } from "@/components/motionix/layout/SiteHeader";
import { SiteFooter } from "@/components/motionix/layout/SiteFooter";
import { isAuthEnabledServer } from "@/lib/auth-server";
import { AuthSignUpButtonCta } from "./AuthSignUpButtonCta";

export default function SignUpPage() {
  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1 max-w-2xl mx-auto px-6 py-40">
        <p className="eyebrow-mono text-primary mb-2">Sign up</p>
        <h1 className="font-display text-5xl md:text-7xl tracking-tight">A free account. No spam.</h1>
        <p className="mt-4 text-foreground/60">
          If you want to keep an automatic history of your photo edits and pass photos, that&apos;s the
          one reason we ask for an email. We will never sell it or send you marketing nonsense.
        </p>

        {isAuthEnabledServer() ? (
          <div className="mt-8">
            <AuthSignUpButtonCta />
          </div>
        ) : (
          <Link
            href="/tools"
            className="inline-flex mt-8 items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm hover:bg-primary transition"
          >
            Use any tool without signing up →
          </Link>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
