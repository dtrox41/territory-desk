import { PlaceholderPage } from "../components/layout/PageFrame";
import { pageMeta } from "../components/layout/page-meta";

export function meta() {
  return pageMeta(
    "Directory",
    "Fictional Territory Desk representative-directory route.",
  );
}

export default function Directory() {
  return (
    <PlaceholderPage
      description="Find representatives by department, division, territory, or approved availability."
      title="Directory"
    />
  );
}
