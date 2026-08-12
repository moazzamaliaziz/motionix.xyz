import { PlaceholderPage } from "@/components/admin/PlaceholderPage";

export default function FeatureFlagsPage() {
  return (
    <PlaceholderPage
      title="Feature Flags"
      description="Toggle features on/off without deploying. Control rollouts and A/B tests."
      icon="🚩"
      features={["Toggle flags", "Percentage rollouts", "User targeting", "A/B testing"]}
    />
  );
}
