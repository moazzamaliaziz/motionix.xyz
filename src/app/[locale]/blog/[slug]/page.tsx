import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { listBlogPosts, getBlogPost } from "@/lib/blog";
import { locales } from "@/i18n/config";
import { SiteHeader } from "@/components/motionix/layout/SiteHeader";
import { SiteFooter } from "@/components/motionix/layout/SiteFooter";
import { TOOLS_SITE_URL } from "@/lib/cn";
import { alternatesFor } from "@/lib/hreflang";
import { SchemaProvider } from "@/components/seo/SchemaProvider";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    listBlogPosts({ includeDrafts: false }).map((p) => ({ locale, slug: p.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  const fm = post.frontmatter;
  return {
    title: fm.title,
    description: fm.description,
    openGraph: {
      title: fm.title,
      description: fm.description,
      type: "article",
      publishedTime: fm.date,
      authors: [fm.author],
      tags: fm.tags,
      url: `${TOOLS_SITE_URL}/${locale}/blog/${post.slug}`,
    },
    twitter: { card: "summary_large_image", title: fm.title, description: fm.description },
    alternates: await alternatesFor(`/blog/${post.slug}`, locale),
  };
}

function formatDate(s: string): string {
  try {
    return new Date(s).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return s;
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog" });
  const post = getBlogPost(slug);
  if (!post) notFound();
  const fm = post.frontmatter;

  const { content } = await compileMDX({
    source: post.body,
    options: { parseFrontmatter: false, mdxOptions: {} },
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: fm.title,
    description: fm.description,
    datePublished: fm.date,
    dateModified: fm.date,
    author: { "@type": "Person", name: fm.author },
    keywords: (fm.tags ?? []).join(", "),
    publisher: {
      "@type": "Organization",
      name: "Motionix",
      url: TOOLS_SITE_URL,
    },
    mainEntityOfPage: `${TOOLS_SITE_URL}/${locale}/blog/${post.slug}`,
  };

  return (
    <div data-mode="tool" className="min-h-screen flex flex-col bg-cream text-ink">
      <SchemaProvider schema={jsonLd} />
      <SiteHeader />
      <main className="flex-1 pt-32 md:pt-40 px-6 pb-24">
        <article className="max-w-2xl mx-auto">
          <p className="eyebrow-mono text-foreground/55 mb-3">
            <Link href={`/${locale}/blog`} className="hover:text-primary transition">
              {t("allPosts")}
            </Link>
          </p>
          <h1 className="font-display text-4xl md:text-6xl leading-[0.95] tracking-tight">
            {fm.title}
          </h1>
          <p className="mt-5 text-base md:text-lg text-foreground/65 leading-relaxed">
            {fm.description}
          </p>
          <p className="eyebrow-mono text-foreground/45 mt-6">
            {formatDate(fm.date)} � by {fm.author} � {post.readingMinutes} {t("minRead")}
          </p>

          <hr className="my-10 border-foreground/10" />

          <div className="prose prose-neutral max-w-none text-[16.5px] leading-[1.75] text-foreground/85 prose-headings:font-display prose-headings:text-ink prose-h2:mt-12 prose-h2:text-2xl prose-h2:tracking-tight prose-h3:mt-8 prose-h3:text-xl prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-ink prose-code:text-primary prose-code:before:content-none prose-code:after:content-none">
            {content}
          </div>

          <hr className="mt-16 border-foreground/10" />
          <p className="text-sm text-foreground/60 mt-6">
            <Link href={`/${locale}/blog`} className="text-primary hover:underline">
              {t("backToPosts")}
            </Link>
          </p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
