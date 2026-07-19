import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { TOOLS_SITE_URL } from "@/lib/cn";

export async function SiteFooter() {
  const t = await getTranslations("Footer");

  const productLinks = [
    { href: "/tools/background-remover", label: t("toolBackgroundRemover") },
    { href: "/tools/passport-photo-maker", label: t("toolPassportPhotoMaker") },
    { href: "/tools/student-id-photo-maker", label: t("toolStudentIdPhotoMaker") },
    { href: "/tools/resume-photo-maker", label: t("toolResumePhotoMaker") },
    { href: "/tools/signature-maker", label: t("toolSignatureMaker") },
    { href: "/tools/photo-resizer", label: t("toolPhotoResizer") },
    { href: "/tools/image-compressor", label: t("toolImageCompressor") },
  ];

  const trustLinks = [
    { href: "/about", label: t("linkAbout") },
    { href: "/blog", label: t("linkBlog") },
    { href: "/privacy", label: t("linkPrivacy") },
    { href: "/terms", label: t("linkTerms") },
    { href: "/cookies", label: t("linkCookies") },
    { href: "/contact", label: t("linkContact") },
  ];

  return (
    <footer className="mt-32 border-t border-foreground/5 bg-cream/40">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="size-6 rounded-full bg-primary" aria-hidden />
            <span className="font-display text-base tracking-tight">
              motion<span className="text-primary">ix</span>
            </span>
          </div>
          <p className="text-sm text-foreground/60 max-w-sm leading-relaxed">
            {t("description")}
          </p>
          <p className="mt-6 text-xs text-foreground/40 font-mono uppercase tracking-widest">
            {t("tagline")}
          </p>
        </div>

        <div className="md:col-span-4">
          <p className="eyebrow-mono text-foreground/40 mb-3">{t("toolsHeading")}</p>
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
          <p className="eyebrow-mono text-foreground/40 mb-3">{t("companyHeading")}</p>
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
          <p>© {new Date().getFullYear()} Motionix. {t("copyright")}</p>
          <p className="font-mono uppercase tracking-widest">
            {t("hostedOn")} · <a className="hover:underline" href={`${TOOLS_SITE_URL}/sitemap`} rel="nofollow">{t("sitemap")}</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
