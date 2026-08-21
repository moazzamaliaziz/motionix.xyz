import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// ponytail: single-file adapter — no new deps, reuses gray-matter + MDX files already in repo

export type Block =
  | { type: "h2"; text: string; id: string }
  | { type: "h3"; text: string; id: string }
  | { type: "p"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "quote"; text: string }
  | { type: "callout"; text: string }
  | { type: "faq"; items: { q: string; a: string }[] };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string; // YYYY-MM-DD
  dateModified: string;
  author: string;
  authorBio: string;
  image: string;
  alt: string;
  tint: string; // tailwind bg class or hex
  canonical: string;
  body: Block[];
};

const POSTS_DIR = path.join(process.cwd(), "content", "blog");
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://motionix.xyz";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function tintForCategory(cat: string): string {
  const c = cat.toLowerCase();
  if (/(passport|visa|id|resume|headshot)/.test(c)) return "bg-peach";
  if (/(compress|resize|image|png|jpg|webp)/.test(c)) return "bg-mint";
  if (/(background|removal|product)/.test(c)) return "bg-blush";
  if (/(video|signature)/.test(c)) return "bg-sky";
  if (/(privacy|guide|compliance)/.test(c)) return "bg-paper";
  return "bg-paper";
}

// very small markdown -> blocks parser (covers 95% of our MDX)
function parseBody(md: string): Block[] {
  const blocks: Block[] = [];
  const lines = md.split("\n");
  let i = 0;
  let faqBuffer: { q: string; a: string }[] | null = null;

  const flushFaq = () => {
    if (faqBuffer && faqBuffer.length) {
      blocks.push({ type: "faq", items: faqBuffer });
      faqBuffer = null;
    }
  };

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line) {
      i++;
      continue;
    }

    // h2
    if (line.startsWith("## ")) {
      flushFaq();
      const text = line.slice(3).trim();
      // detect implicit faq section: if heading is FAQ, start collecting
      if (/^faq/i.test(text)) {
        faqBuffer = [];
        blocks.push({ type: "h2", text, id: slugify(text) });
      } else {
        blocks.push({ type: "h2", text, id: slugify(text) });
      }
      i++;
      continue;
    }
    // h3
    if (line.startsWith("### ")) {
      flushFaq();
      const text = line.slice(4).trim();
      blocks.push({ type: "h3", text, id: slugify(text) });
      i++;
      continue;
    }
    // quote / callout
    if (line.startsWith(">")) {
      flushFaq();
      let q = line.replace(/^>\s?/, "");
      // collect multiline quote
      let j = i + 1;
      while (j < lines.length && lines[j].trim().startsWith(">")) {
        q += " " + lines[j].trim().replace(/^>\s?/, "");
        j++;
      }
      // callout detection: [!NOTE] / [!TIP] or leading emoji
      if (/^\[!(NOTE|TIP|WARNING|IMPORTANT)\]/i.test(q) || /^Callout:/i.test(q)) {
        blocks.push({ type: "callout", text: q.replace(/^\[!.+?\]\s*/, "").replace(/^Callout:\s*/i, "") });
      } else {
        blocks.push({ type: "quote", text: q });
      }
      i = j;
      continue;
    }
    // unordered list
    if (/^[-*]\s+/.test(line)) {
      flushFaq();
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      // if we are inside a faq section and items look like Q/A, convert
      if (faqBuffer !== null && items.length && items[0].includes("?")) {
        // heuristic: faq items are Q? A pairs — not present in current MDX, skip
        blocks.push({ type: "list", ordered: false, items });
      } else {
        blocks.push({ type: "list", ordered: false, items });
      }
      continue;
    }
    // ordered list
    if (/^\d+\.\s+/.test(line)) {
      flushFaq();
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "list", ordered: true, items });
      continue;
    }
    // faq heuristic: "Q: ...? A: ..." lines under FAQ heading
    if (faqBuffer !== null && /^Q[:\s]/i.test(line)) {
      const q = line.replace(/^Q[:\s]*/i, "").trim();
      let a = "";
      let j = i + 1;
      if (j < lines.length && /^A[:\s]/i.test(lines[j].trim())) {
        a = lines[j].trim().replace(/^A[:\s]*/i, "").trim();
        j++;
      }
      if (q && a) faqBuffer.push({ q, a });
      i = j;
      continue;
    }
    // paragraph — collect consecutive non-blank, non-special lines
    flushFaq();
    let para = line;
    let j = i + 1;
    while (
      j < lines.length &&
      lines[j].trim() &&
      !lines[j].trim().startsWith("## ") &&
      !lines[j].trim().startsWith("### ") &&
      !lines[j].trim().startsWith(">") &&
      !/^[-*]\s+/.test(lines[j].trim()) &&
      !/^\d+\.\s+/.test(lines[j].trim())
    ) {
      para += " " + lines[j].trim();
      j++;
    }
    // skip unknown blocks that are pure HTML/MDX component tags — never crash
    if (/^<[^>]+>$/.test(para.trim()) || para.trim().startsWith("import ") || para.trim().startsWith("export ")) {
      i = j;
      continue;
    }
    blocks.push({ type: "p", text: para });
    i = j;
  }
  flushFaq();
  return blocks;
}

function wordCount(blocks: Block[]): number {
  let n = 0;
  for (const b of blocks) {
    if (b.type === "h2" || b.type === "h3") n += b.text.split(/\s+/).length;
    else if (b.type === "p" || b.type === "quote" || b.type === "callout") n += b.text.split(/\s+/).length;
    else if (b.type === "list") for (const it of b.items) n += it.split(/\s+/).length;
    else if (b.type === "faq") for (const { q, a } of b.items) n += (q + " " + a).split(/\s+/).length;
  }
  return n;
}

let cache: Post[] | null = null;

function loadAll(): Post[] {
  if (cache) return cache;
  if (!fs.existsSync(POSTS_DIR)) {
    cache = [];
    return cache;
  }
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
  const posts: Post[] = files.map((file) => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
    const parsed = matter(raw);
    const slug = file.replace(/\.mdx$/, "");
    const fm = parsed.data as Record<string, unknown>;
    const title = (fm.title as string) ?? slug;
    const excerpt = (fm.description as string) ?? "";
    const category = ((fm.tags as string[] | undefined)?.[0] ?? "guide").toLowerCase();
    const date = (fm.date as string) ?? new Date().toISOString().slice(0, 10);
    const dateModified = (fm.updated as string) ?? date;
    const author = (fm.author as string) ?? "Motionix";
    const authorBio = "Photo & media editor at Motionix. Writes about browser-based tooling.";
    const image = (fm.image as string) ?? `/og/og-default.png`;
    const alt = (fm.alt as string) ?? title;
    const tint = tintForCategory(category);
    const canonical = `${SITE_URL}/blog/${slug}`;
    const body = parseBody(parsed.content ?? "");
    return { slug, title, excerpt, category, date, dateModified, author, authorBio, image, alt, tint, canonical, body };
  });
  posts.sort((a, b) => (a.date > b.date ? -1 : 1));
  cache = posts;
  return cache;
}

export function getAllSlugs(): string[] {
  return loadAll().map((p) => p.slug);
}

export function getPostBySlug(slug: string): Post | null {
  return loadAll().find((p) => p.slug === slug) ?? null;
}

export function getPostBody(slug: string): Block[] {
  return getPostBySlug(slug)?.body ?? [];
}

export function getTOC(slug: string): { id: string; text: string; level: 2 | 3 }[] {
  const post = getPostBySlug(slug);
  if (!post) return [];
  return post.body
    .filter((b): b is Extract<Block, { type: "h2" | "h3" }> => b.type === "h2" || b.type === "h3")
    .map((b) => ({ id: b.id, text: b.text, level: b.type === "h2" ? 2 : 3 }));
}

export function getRelatedPosts(slug: string, limit = 3): Post[] {
  const all = loadAll();
  const cur = getPostBySlug(slug);
  if (!cur) return all.slice(0, limit);
  const sameCat = all.filter((p) => p.slug !== slug && p.category === cur.category);
  if (sameCat.length >= limit) return sameCat.slice(0, limit);
  const fallback = all.filter((p) => p.slug !== slug && !sameCat.includes(p)).slice(0, limit - sameCat.length);
  return [...sameCat, ...fallback].slice(0, limit);
}

export function computeReadTime(blocks: Block[]): number {
  return Math.max(1, Math.round(wordCount(blocks) / 200));
}

// test helper
export function _resetCache(): void {
  cache = null;
}
