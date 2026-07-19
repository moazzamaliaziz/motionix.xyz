import Link from "next/link";
import { tools } from "@/lib/tools";
import { TOOLS_SITE_URL } from "@/lib/cn";
import { listBlogPosts } from "@/lib/blog";

/**
 * HTML sitemap — a crawlable fallback for Google in case the XML sitemap
 * has cache-header issues with Cloudflare. Plain HTML, no JS required.
 */
export default function SitemapPage() {
  let blogPosts: { slug: string; frontmatter: { title: string; date: string } }[] = [];
  try {
    blogPosts = listBlogPosts();
  } catch {
    blogPosts = [];
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-32">
      <p className="eyebrow-mono text-primary mb-3">Sitemap</p>
      <h1 className="font-display text-5xl md:text-7xl leading-[0.92] tracking-tight">
        Every page on Motionix.
      </h1>
      <p className="mt-6 text-base text-foreground/60">
        A plain list of all tool pages, blog posts, and site pages.
      </p>

      <section className="mt-12">
        <h2 className="eyebrow-mono text-foreground/50 mb-4">Tools</h2>
        <ul className="space-y-2">
          {tools.map((t) => (
            <li key={t.slug}>
              <Link href={`/tools/${t.slug}`} className="text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline">
                {t.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {blogPosts.length > 0 ? (
        <section className="mt-12">
          <h2 className="eyebrow-mono text-foreground/50 mb-4">Blog</h2>
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
        <h2 className="eyebrow-mono text-foreground/50 mb-4">Pages</h2>
        <ul className="space-y-2">
          <li><Link href="/" className="text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline">Home</Link></li>
          <li><Link href="/about" className="text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline">About</Link></li>
          <li><Link href="/contact" className="text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline">Contact</Link></li>
          <li><Link href="/privacy" className="text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline">Privacy</Link></li>
          <li><Link href="/terms" className="text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline">Terms</Link></li>
          <li><Link href="/cookies" className="text-foreground/70 hover:text-foreground transition-colors underline-offset-4 hover:underline">Cookies</Link></li>
        </ul>
      </section>
    </div>
  );
}
