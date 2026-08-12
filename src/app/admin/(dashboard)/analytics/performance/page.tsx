import { PlaceholderPage } from "@/components/admin/PlaceholderPage";

export default function PerformancePage() {
  return (
    <PlaceholderPage
      title="Performance"
      description="Core Web Vitals, Lighthouse scores, and page load performance tracking."
      icon="⚡"
      features={["LCP tracking", "CLS monitoring", "FID/INP scores", "TTFB analysis"]}
    />
  );
}
