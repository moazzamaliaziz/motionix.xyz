import { PlaceholderPage } from "@/components/admin/PlaceholderPage";

export default function ActivityLogsPage() {
  return (
    <PlaceholderPage
      title="Activity Logs"
      description="Audit trail of all admin actions: who changed what and when."
      icon="📋"
      features={["Action logging", "User attribution", "Change diffs", "Export to CSV"]}
    />
  );
}
