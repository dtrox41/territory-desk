import { SystemPage } from "../components/layout/SystemPage";
import { pageMeta } from "../components/layout/page-meta";

export function meta() {
  return pageMeta(
    "Page not found",
    "The requested fictional Territory Desk page was not found.",
  );
}

export default function NotFound() {
  return (
    <SystemPage
      actionLabel="Return to Home"
      actionTo="/"
      description="The page may have moved, may be unavailable, or may not exist. No record information is disclosed."
      eyebrow="Fictional prototype"
      title="Page not found"
    />
  );
}
