import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locales } from "@/i18n/config";
import { TOOLS_SITE_URL } from "@/lib/cn";
import { alternatesFor } from "@/lib/hreflang";
import { SiteHeader } from "@/components/motionix/layout/SiteHeader";
import { SiteFooter } from "@/components/motionix/layout/SiteFooter";
import {
  getPostBySlug,
  getAllSlugs,
  getTOC,
  getRelatedPosts,
  computeReadTime,
} from "@/components/site/blog-data";
import { ProgressBar, TOC, FAQAccordion, ShareRow, KeepReading } from "./_components";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return getAllSlugs().flatMap((slug) => locales.map((locale) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return { robots: { index: false, follow: false } };
  }
  const url = `${TOOLS_SITE_URL}/${locale}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author }],
    alternates: {
      ...(await alternatesFor(`/blog/${post.slug}`, locale)),
      canonical: post.canonical,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url,
      publishedTime: post.date,
      modifiedTime: post.dateModified,
      authors: [post.author],
      tags: [post.category],
      images: [{ url: post.image, width: 1200, height: 630, alt: post.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

function formatDate(s: string): string {
  try {
    return new Date(s).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return s;
  }
}

function renderInline(text: string) {
  // split markdown links [label](href)
  const parts: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <a key={key++} href={m[2]} className="text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary transition">
        {m[1]}
      </a>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
}

// Lightweight block renderer (unknown blocks skip)
function BlockRenderer({ blocks }: { blocks: ReturnType<typeof getPostBySlug> extends infer P ? P extends { body: infer B } ? B : never : never }) {
  // ponytail: type assertion keeps file count low — body is Block[]
  const b = blocks as unknown as import("@/components/site/blog-data").Block[];
  return (
    <div className="space-y-6">
      {b.map((block, i) => {
        if (block.type === "h2") {
          return (
            <h2 key={i} id={block.id} className="font-display text-[28px] md:text-[32px] leading-tight tracking-tight text-ink scroll-mt-28 mt-14 first:mt-0">
              {block.text}
            </h2>
          );
        }
        if (block.type === "h3") {
          return (
            <h3 key={i} id={block.id} className="font-display text-xl md:text-2xl leading-snug tracking-tight text-ink scroll-mt-28 mt-10">
              {block.text}
            </h3>
          );
        }
        if (block.type === "p") {
          return (
            <p key={i} className="text-[17px] leading-[1.75] text-ink/80">
              {renderInline(block.text)}
            </p>
          );
        }
        if (block.type === "list") {
          const Tag = block.ordered ? "ol" : "ul";
          return (
            <Tag key={i} className={`pl-6 space-y-2 text-[17px] leading-[1.7] text-ink/80 ${block.ordered ? "list-decimal" : "list-disc marker:text-primary/50"}`}>
              {block.items.map((it, j) => (
                <li key={j} className="pl-1">{renderInline(it)}</li>
              ))}
            </Tag>
          );
        }
        if (block.type === "quote") {
          return (
            <blockquote key={i} className="border-l-[3px] border-primary/30 pl-5 py-1 font-serif italic text-[18px] leading-relaxed text-ink/70">
              {renderInline(block.text)}
            </blockquote>
          );
        }
        if (block.type === "callout") {
          return (
            <div key={i} className="rounded-2xl bg-mint/60 border border-mint/30 px-5 py-4 text-[15px] leading-relaxed text-ink/80">
              {renderInline(block.text)}
            </div>
          );
        }
        if (block.type === "faq") {
          return <FAQAccordion key={i} items={block.items} />;
        }
        return null; // unknown block — skip, never crash
      })}
    </div>
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();
  const t = await getTranslations({ locale, namespace: "Blog" });
  const toc = getTOC(slug);
  const related = getRelatedPosts(slug, 3);
  const readTime = computeReadTime(post.body);
  const showTOC = toc.length >= 2;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${TOOLS_SITE_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${TOOLS_SITE_URL}/${locale}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${TOOLS_SITE_URL}/${locale}/blog/${post.slug}` },
    ],
  };

  const blogPostingLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.dateModified,
    author: { "@type": "Person", name: post.author },
    image: post.image.startsWith("http") ? post.image : `${TOOLS_SITE_URL}${post.image}`,
    publisher: {
      "@type": "Organization",
      name: "Motionix",
      logo: { "@type": "ImageObject", url: `${TOOLS_SITE_URL}/og/og-default.png` },
    },
    mainEntityOfPage: post.canonical,
  };

  const faqBlocks = post.body.filter((b): b is Extract<typeof b, { type: "faq" }> => b.type === "faq");
  const faqLd =
    faqBlocks.length
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqBlocks.flatMap((b) =>
            b.items.map((it) => ({
              "@type": "Question",
              name: it.q,
              acceptedAnswer: { "@type": "Answer", text: it.a },
            }))
          ),
        }
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-ink">
      <SiteHeader />
      <ProgressBar />

      {/* Header on warm gradient */}
      <header className="relative pt-32 md:pt-40 pb-10 md:pb-14 bg-gradient-to-b from-peach/70 via-paper/60 to-background border-b border-foreground/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center gap-2 text-xs">
            <Link href={`/${locale}/blog`} className="inline-flex items-center gap-1.5 text-foreground/60 hover:text-foreground transition">
              <span aria-hidden>←</span> {t("allPosts")}
            </Link>
            <span className="text-foreground/20">/</span>
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-foreground/40">
              <Link href={`/${locale}`} className="hover:text-foreground/60">Home</Link>
              <span aria-hidden>›</span>
              <Link href={`/${locale}/blog`} className="hover:text-foreground/60">Blog</Link>
              <span aria-hidden>›</span>
              <span className="text-foreground/60 truncate max-w-[18ch]">{post.title}</span>
            </nav>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-ink text-background px-3 py-1 text-[11px] font-mono uppercase tracking-widest">{post.category}</span>
            <span className="eyebrow-mono text-foreground/45">
              {formatDate(post.date)} · {readTime} {t("minRead")}
            </span>
          </div>

          <h1 className="mt-4 font-display text-[32px] md:text-[52px] leading-[0.95] tracking-tight text-ink text-balance max-w-3xl">{post.title}</h1>
          <p className="mt-4 max-w-2xl text-[18px] md:text-[19px] leading-relaxed text-ink/65">{post.excerpt}</p>

          <div className="mt-8 flex items-center gap-3">
            <div className="size-10 rounded-full bg-ink text-background flex items-center justify-center text-sm font-medium">
              {post.author.slice(0, 1).toUpperCase()}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-medium text-ink">{post.author}</p>
              <p className="text-xs text-foreground/55">{post.authorBio}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Cover */}
      <div className="max-w-5xl mx-auto w-full px-6 -mt-2">
        <div className={`relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] border border-foreground/5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] ${post.tint} p-2 md:p-3`}>
          <div className="relative aspect-[16/9] overflow-hidden rounded-[1rem] md:rounded-[1.5rem] bg-white">
            <Image
              src={post.image}
              alt={post.alt}
              width={1200}
              height={675}
              priority
              sizes="(min-width: 1024px) 1024px, 100vw"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
            />
          </div>
        </div>
      </div>

      {/* Body + TOC */}
      <div className="max-w-7xl mx-auto w-full px-6 mt-10 md:mt-14 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 lg:gap-12">
        <article className="min-w-0 max-w-3xl">
          {showTOC ? (
            <details className="lg:hidden mb-8 rounded-2xl border border-foreground/10 bg-white p-4">
              <summary className="cursor-pointer list-none flex items-center justify-between text-sm font-medium">
                Jump to <span aria-hidden className="text-foreground/40">▾</span>
              </summary>
              <nav className="mt-4 space-y-2">
                {toc.map((it) => (
                  <a key={it.id} href={`#${it.id}`} className="block text-sm text-foreground/60 hover:text-ink">
                    {it.text}
                  </a>
                ))}
              </nav>
            </details>
          ) : null}

          <BlockRenderer blocks={post.body} />

          <ShareRow url={post.canonical} title={post.title} />

          <KeepReading posts={related} locale={locale} t={t} />
        </article>

        {showTOC ? (
          <aside className="hidden lg:block">
            <TOC items={toc} />
          </aside>
        ) : null}
      </div>

      {/* Ink CTA */}
      <section className="max-w-5xl mx-auto w-full px-6 mt-16">
        <div className="rounded-[2rem] bg-ink text-background p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="eyebrow-mono text-background/50">Motionix</p>
            <h3 className="mt-2 font-display text-2xl md:text-3xl leading-tight tracking-tight">Try it in your browser — no upload.</h3>
            <p className="mt-2 text-background/60 text-sm max-w-xl">Background remover, passport photos, compressor & more. Your files stay on device.</p>
          </div>
          <Link href="/tools" className="inline-flex items-center gap-2 rounded-full bg-background text-ink px-6 h-11 text-sm font-medium hover:bg-white transition group shrink-0">
            Open tools <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </section>

      <SiteFooter />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingLd) }} />
      {faqLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} /> : null}
    </div>
  );
}
