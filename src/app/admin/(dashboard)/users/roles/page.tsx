import { PlaceholderPage } from "@/components/admin/PlaceholderPage";

export default function RolesPage() {
  return (
    <PlaceholderPage
      title="Roles & Permissions"
      description="Define roles and granular permissions for admin panel access."
      icon="🔐"
      features={["Role definitions", "Permission matrix", "Custom roles", "Audit trail"]}
    />
  );
}
