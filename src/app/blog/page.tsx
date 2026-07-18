import type { Metadata } from "next";
import Link from "next/link";
import { listBlogPosts } from "@/lib/blog";
import { SiteHeader } from "@/components/motionix/layout/SiteHeader";
import { SiteFooter } from "@/components/motionix/layout/SiteFooter";
import { AnnouncementBar } from "@/components/motionix/layout/AnnouncementBar";
import { SpotlightCard } from "@/components/motionix/visuals/SpotlightCard";

export const metadata: Metadata = {
  title: "Blog — Motionix",
  description:
    "Notes from the Motionix team. Engineering write-ups, how-tos, and the occasional opinion.",
  openGraph: {
    title: "Motionix blog",
    description:
      "Notes from the Motionix team. Engineering write-ups, how-tos, and the occasional opinion.",
    type: "website",
  },
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  const posts = listBlogPosts();
  return (
    <div data-mode="tool" className="min-h-screen flex flex-col bg-cream text-ink">
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1 pt-32 md:pt-40 px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <p className="eyebrow-mono text-primary mb-3">Blog</p>
          <h1 className="font-display text-5xl md:text-7xl leading-[0.92] tracking-tight">
            Notes from the team.
          </h1>
          <p className="mt-6 max-w-2xl text-base md:text-lg text-foreground/70 leading-relaxed">
            Engineering write-ups, how-tos, and the occasional opinion. We publish when we have
            something useful to share — not on a schedule.
          </p>

          <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
            {posts.length === 0 ? (
              <p className="text-foreground/60">No posts yet. Check back soon.</p>
            ) : (
              posts.map((p) => (
                <SpotlightCard key={p.slug} tone="paper">
                  <Link href={`/blog/${p.slug}`} className="block group">
                    <p className="eyebrow-mono text-foreground/50">
                      {formatDate(p.frontmatter.date)} · {p.readingMinutes} min read
                    </p>
                    <h2 className="mt-2 font-display text-2xl leading-snug group-hover:text-primary transition">
                      {p.frontmatter.title}
                    </h2>
                    <p className="text-sm text-foreground/60 mt-2 leading-relaxed">
                      {p.frontmatter.description}
                    </p>
                    {p.frontmatter.tags?.length ? (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {p.frontmatter.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-foreground/15 bg-white px-2.5 py-0.5 text-[11px] font-mono text-foreground/55"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </Link>
                </SpotlightCard>
              ))
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
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
