import { PlaceholderPage } from "../components/layout/PageFrame";
import { pageMeta } from "../components/layout/page-meta";

export function meta() {
  return pageMeta("Data Status", "Fictional Territory Desk data-status route.");
}

export default function DataStatus() {
  return (
    <PlaceholderPage
      description="Understand fictional source freshness, known issues, and which actions are currently safe."
      title="Data Status"
    />
  );
}
