import { PlaceholderPage } from "@/components/admin/PlaceholderPage";

export default function InternalLinksPage() {
  return (
    <PlaceholderPage
      title="Internal Links"
      description="Manage internal link structure, find orphan pages, and optimize link equity flow."
      icon="🔗"
      features={["Link mapping", "Orphan detection", "Anchor text analysis", "Link equity flow"]}
    />
  );
}
