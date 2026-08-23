import { PlaceholderPage } from "../components/layout/PageFrame";
import { pageMeta } from "../components/layout/page-meta";

export function meta() {
  return pageMeta("Help and Feedback", "Fictional Territory Desk help route.");
}

export default function Help() {
  return (
    <PlaceholderPage
      description="Find task guidance, request support, or provide product feedback."
      title="Help and Feedback"
    />
  );
}
