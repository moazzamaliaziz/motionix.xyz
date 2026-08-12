import { PlaceholderPage } from "@/components/admin/PlaceholderPage";

export default function SearchConsolePage() {
  return (
    <PlaceholderPage
      title="Search Console"
      description="Google Search Console data: impressions, clicks, CTR, and position tracking."
      icon="📊"
      features={["Impressions & clicks", "CTR tracking", "Position history", "Query data"]}
    />
  );
}
