import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { listBlogPosts, getBlogPost } from "@/lib/blog";
import { SiteHeader } from "@/components/motionix/layout/SiteHeader";
import { SiteFooter } from "@/components/motionix/layout/SiteFooter";
import { AnnouncementBar } from "@/components/motionix/layout/AnnouncementBar";
import { TOOLS_SITE_URL } from "@/lib/cn";

export async function generateStaticParams() {
  return listBlogPosts({ includeDrafts: false }).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  const fm = post.frontmatter;
  return {
    title: `${fm.title} — Motionix`,
    description: fm.description,
    openGraph: {
      title: fm.title,
      description: fm.description,
      type: "article",
      publishedTime: fm.date,
      authors: [fm.author],
      tags: fm.tags,
      url: `${TOOLS_SITE_URL}/blog/${post.slug}`,
    },
    twitter: { card: "summary_large_image", title: fm.title, description: fm.description },
    alternates: { canonical: `/blog/${post.slug}` },
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
    "@type": "BlogPosting",
    headline: fm.title,
    description: fm.description,
    datePublished: fm.date,
    author: { "@type": "Organization", name: fm.author },
    keywords: (fm.tags ?? []).join(", "),
    publisher: {
      "@type": "Organization",
      name: "Motionix",
      url: TOOLS_SITE_URL,
    },
    mainEntityOfPage: `${TOOLS_SITE_URL}/blog/${post.slug}`,
  };

  return (
    <div data-mode="tool" className="min-h-screen flex flex-col bg-cream text-ink">
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1 pt-32 md:pt-40 px-6 pb-24">
        <article className="max-w-2xl mx-auto">
          <p className="eyebrow-mono text-foreground/55 mb-3">
            <Link href="/blog" className="hover:text-primary transition">
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
            {formatDate(fm.date)} · by {fm.author} · {post.readingMinutes} {t("minRead")}
          </p>

          <hr className="my-10 border-foreground/10" />

          <div className="prose prose-neutral max-w-none text-[16.5px] leading-[1.75] text-foreground/85 prose-headings:font-display prose-headings:text-ink prose-h2:mt-12 prose-h2:text-2xl prose-h2:tracking-tight prose-h3:mt-8 prose-h3:text-xl prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-ink prose-code:text-primary prose-code:before:content-none prose-code:after:content-none">
            {content}
          </div>

          <hr className="mt-16 border-foreground/10" />
          <p className="text-sm text-foreground/60 mt-6">
            <Link href="/blog" className="text-primary hover:underline">
              {t("backToPosts")}
            </Link>
          </p>
        </article>
      </main>
      <SiteFooter />

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
