import { PlaceholderPage } from "../components/layout/PageFrame";
import { pageMeta } from "../components/layout/page-meta";

export function meta() {
  return pageMeta("Territory", "Fictional Territory Desk territory route.");
}

export default function Territory() {
  return (
    <PlaceholderPage
      description="Find the correct department and representative from an approved ZIP or city search."
      title="Territory"
    />
  );
}
