import { PlaceholderPage } from "@/components/admin/PlaceholderPage";

export default function ToolAnalyticsPage() {
  return (
    <PlaceholderPage
      title="Tool Analytics"
      description="Usage statistics for each tool: completions, errors, and performance metrics."
      icon="🛠️"
      features={["Usage counts", "Error rates", "Processing times", "Format breakdown"]}
    />
  );
}
