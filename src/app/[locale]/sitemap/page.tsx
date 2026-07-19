import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { tools } from "@/lib/tools";
import { TOOLS_SITE_URL } from "@/lib/cn";
import { listBlogPosts } from "@/lib/blog";

export default async function SitemapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Sitemap" });

  let blogPosts: { slug: string; frontmatter: { title: string; date: string } }[] = [];
  try {
    blogPosts = listBlogPosts();
  } catch {
    blogPosts = [];
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-32">
      <p className="eyebrow-mono text-primary mb-3">{t("eyebrow")}</p>
      <h1 className="font-display text-5xl md:text-7xl leading-[0.92] tracking-tight">
        {t("title")}
      </h1>
      <p className="mt-6 text-base text-foreground/60">
        {t("subtitle")}
      </p>

      <section className="mt-12">
        <h2 className="eyebrow-mono text-foreground/50 mb-4">{t("toolsHeading")}</h2>
        <ul className="space-y-2">
          {tools.map((tool) => (
            <li key={tool.slug}>
              <Link href={`/tools/${tool.slug}`} className="text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline">
                {tool.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {blogPosts.length > 0 ? (
        <section className="mt-12">
          <h2 className="eyebrow-mono text-foreground/50 mb-4">{t("blogHeading")}</h2>
          <ul className="space-y-2">
            {blogPosts.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline">
                  {p.frontmatter.title}
                </Link>
                <span className="text-xs text-foreground/40 ml-2">{p.frontmatter.date}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="eyebrow-mono text-foreground/50 mb-4">{t("pagesHeading")}</h2>
        <ul className="space-y-2">
          <li><Link href="/" className="text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline">{t("home")}</Link></li>
          <li><Link href="/about" className="text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline">{t("about")}</Link></li>
          <li><Link href="/contact" className="text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline">{t("contact")}</Link></li>
          <li><Link href="/privacy" className="text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline">{t("privacy")}</Link></li>
          <li><Link href="/terms" className="text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline">{t("terms")}</Link></li>
          <li><Link href="/cookies" className="text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline">{t("cookies")}</Link></li>
        </ul>
      </section>
    </div>
  );
}
