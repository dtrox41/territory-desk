import { PlaceholderPage } from "../components/layout/PageFrame";
import { pageMeta } from "../components/layout/page-meta";

export function meta() {
  return pageMeta("Leads", "Fictional Territory Desk lead-list route.");
}

export default function Leads() {
  return (
    <PlaceholderPage
      description="Review received, sent, action-required, waiting, and completed peer handoffs."
      title="Leads"
    />
  );
}
