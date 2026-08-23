import { PlaceholderPage } from "../components/layout/PageFrame";
import { pageMeta } from "../components/layout/page-meta";

export function meta() {
  return pageMeta("Help Topic", "Fictional Territory Desk help-topic route.");
}

export default function HelpTopic() {
  return (
    <PlaceholderPage
      description="Read one approved, versioned task-guidance topic."
      title="Help Topic"
    />
  );
}
