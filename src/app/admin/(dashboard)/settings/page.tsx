import { PlaceholderPage } from "@/components/admin/PlaceholderPage";

export default function SettingsPage() {
  return (
    <PlaceholderPage
      title="Site Settings"
      description="Global site configuration: branding, defaults, integrations, and maintenance mode."
      icon="⚙️"
      features={["Branding", "Default locale", "Integrations", "Maintenance mode"]}
    />
  );
}
