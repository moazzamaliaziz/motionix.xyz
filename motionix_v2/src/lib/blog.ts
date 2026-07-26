/**

 * Blog content loader. Reads MDX files from /content/blog at build time.
 *
 * Why `gray-matter` instead of `@next/mdx` compileMDX loader?
 *   - We want frontmatter-driven metadata (title, date, tags) that can be
 *     statically enumerated for /blog and /sitemap.xml — gray-matter is
 *     the leanest way to do that.
 *   - The MDX bodies are compiled via next-mdx-remote at request time
 *     (within the App Router server component) so we get React Server
 *     Components' streaming model for free.
 *
 * Posts directory:
 *   /content/blog/<slug>.mdx
 *
 * Required frontmatter:
 *   - title: string
 *   - description: string
 *   - date: YYYY-MM-DD
 *   - author: string
 *   - tags: string[]
 */
import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type BlogFrontmatter = {
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  /** Optional canonical URL slug override */
  slug?: string;
  /** Optional reading time in minutes (we'll compute if omitted) */
  readingMinutes?: number;
  /** Whether the post is a draft (excluded from prod listing) */
  draft?: boolean;
};

export type BlogPost = {
  slug: string;
  frontmatter: BlogFrontmatter;
  /** Raw MDX body. Use with compileMDX from next-mdx-remote. */
  body: string;
  /** Reading time in minutes (computed simple estimate). */
  readingMinutes: number;
};

const POSTS_DIRECTORY = path.join(process.cwd(), "content", "blog");

/**
 * List all blog posts sorted by date (newest first). Optionally hide drafts
 * in production builds. Reads the filesystem lazily so concurrent reads on
 * each request don't pay a cost.
 */
let cached: BlogPost[] | null = null;
function loadAll(): BlogPost[] {
  if (cached) return cached;
  if (!fs.existsSync(POSTS_DIRECTORY)) {
    cached = [];
    return cached;
  }
  const files = fs.readdirSync(POSTS_DIRECTORY).filter((f) => f.endsWith(".mdx"));
  const posts: BlogPost[] = files.map((file) => {
    const raw = fs.readFileSync(path.join(POSTS_DIRECTORY, file), "utf-8");
    const parsed = matter(raw);
    const slug = file.replace(/\.mdx$/, "");
    const fm = parsed.data as Partial<BlogFrontmatter>;
    const title = (fm.title ?? slug) as string;
    const description = (fm.description ?? "") as string;
    const date = (fm.date ?? new Date().toISOString().slice(0, 10)) as string;
    const author = (fm.author ?? "Motionix") as string;
    const tags = Array.isArray(fm.tags) ? (fm.tags as string[]) : [];
    const readingMinutes =
      typeof fm.readingMinutes === "number"
        ? fm.readingMinutes
        : estimateReadingMinutes(parsed.content);
    const draft = Boolean(fm.draft);
    return {
      slug,
      frontmatter: { title, description, date, author, tags, draft },
      body: parsed.content,
      readingMinutes,
    };
  });
  posts.sort((a, b) => (a.frontmatter.date > b.frontmatter.date ? -1 : 1));
  cached = posts;
  return cached;
}

export function listBlogPosts(opts: { includeDrafts?: boolean } = {}): BlogPost[] {
  const all = loadAll();
  if (opts.includeDrafts) return all;
  return all.filter((p) => !p.frontmatter.draft);
}

export function getBlogPost(slug: string): BlogPost | null {
  return listBlogPosts({ includeDrafts: true }).find((p) => p.slug === slug) ?? null;
}

/** Estimate reading minutes from raw MDX text — ~200 wpm. */
function estimateReadingMinutes(content: string): number {
  const words = content.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Reset the cache — useful when files change in dev. */
export function reloadBlog(): void {
  cached = null;
}
