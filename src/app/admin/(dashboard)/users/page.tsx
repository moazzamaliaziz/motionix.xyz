import { PlaceholderPage } from "@/components/admin/PlaceholderPage";

export default function UsersPage() {
  return (
    <PlaceholderPage
      title="Users"
      description="Manage admin users, view login history, and control access."
      icon="👥"
      features={["User management", "Login history", "Access control", "Role assignment"]}
    />
  );
}
