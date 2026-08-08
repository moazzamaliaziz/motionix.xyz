import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getBlogPost } from "@/lib/blog";

interface RelatedGuidesProps {
  guides: string[];
  locale: string;
}

export async function RelatedGuides({ guides, locale }: RelatedGuidesProps) {
  if (!guides || guides.length === 0) return null;

  const t = await getTranslations({ locale, namespace: "ToolPage" });

  const posts = guides
    .map((slug) => getBlogPost(slug))
    .filter(Boolean);

  if (posts.length === 0) return null;

  return (
    <section className="mt-16">
      <div className="mb-4">
        <p className="eyebrow-mono text-foreground/50 mb-1">{t("relatedGuides")}</p>
        <h2 className="font-serif text-2xl italic">{t("learnMore")}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {posts.map((post) => (
          <Link
            key={post!.slug}
            href={`/${locale}/blog/${post!.slug}`}
            className="group p-5 rounded-2xl border border-foreground/10 bg-white/60 hover:bg-white transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="font-medium leading-snug group-hover:text-primary transition">
              {post!.frontmatter.title}
            </p>
            <p className="text-xs text-foreground/60 mt-1 line-clamp-2">
              {post!.frontmatter.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
