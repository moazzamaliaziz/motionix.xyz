import { PlaceholderPage } from "@/components/admin/PlaceholderPage";

export default function RedirectsPage() {
  return (
    <PlaceholderPage
      title="Redirects"
      description="Manage URL redirects, monitor redirect chains, and fix broken paths."
      icon="↪️"
      features={["301/302 redirects", "Chain detection", "Hit counters", "Bulk import"]}
    />
  );
}
