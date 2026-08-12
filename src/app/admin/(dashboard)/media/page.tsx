import { PlaceholderPage } from "@/components/admin/PlaceholderPage";

export default function MediaPage() {
  return (
    <PlaceholderPage
      title="Media Library"
      description="Manage uploaded images, icons, and assets used across the site."
      icon="📁"
      features={["Image uploads", "Asset management", "Usage tracking", "Bulk operations"]}
    />
  );
}
