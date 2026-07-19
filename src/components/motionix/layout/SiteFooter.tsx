import Link from "next/link";
import { TOOLS_SITE_URL } from "@/lib/cn";

const productLinks = [
  { href: "/tools/background-remover", label: "Background remover" },
  { href: "/tools/passport-photo-maker", label: "Passport photo maker" },
  { href: "/tools/student-id-photo-maker", label: "Student ID photo" },
  { href: "/tools/resume-photo-maker", label: "Resume photo" },
  { href: "/tools/signature-maker", label: "Signature maker" },
  { href: "/tools/photo-resizer", label: "Photo resizer" },
  { href: "/tools/image-compressor", label: "Image compressor" },
];

const trustLinks = [
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-foreground/5 bg-cream/40">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-5">
          <div className="flex items-center gap-2.5 mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-full.svg" alt="Motionix" className="h-8 w-auto" />
          </div>
          <p className="text-sm text-foreground/60 max-w-sm leading-relaxed">
            Free image and video tools that respect your privacy. We don&apos;t upload anything unless a tool explicitly says we have to.
          </p>
          <p className="mt-6 text-xs text-foreground/40 font-mono uppercase tracking-widest">
            Made with a small slice of pineapple pizza.
          </p>
        </div>

        <div className="md:col-span-4">
          <p className="eyebrow-mono text-foreground/40 mb-3">Tools</p>
          <ul className="space-y-2 text-sm">
            {productLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-foreground/70 hover:text-foreground transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <p className="eyebrow-mono text-foreground/40 mb-3">Company</p>
          <ul className="space-y-2 text-sm">
            {trustLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-foreground/70 hover:text-foreground transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-foreground/5">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-foreground/50">
          <p>© {new Date().getFullYear()} Motionix. No accounts required.</p>
          <p className="font-mono uppercase tracking-widest">
            Hosted on the edge · <a className="hover:underline" href={`${TOOLS_SITE_URL}/sitemap.xml`} rel="nofollow">sitemap</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
