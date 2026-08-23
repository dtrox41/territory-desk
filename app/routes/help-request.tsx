import { PlaceholderPage } from "../components/layout/PageFrame";
import { pageMeta } from "../components/layout/page-meta";

export function meta() {
  return pageMeta(
    "Help Request",
    "Fictional Territory Desk help-request route.",
  );
}

export default function HelpRequest() {
  return (
    <PlaceholderPage
      description="Review one reporter-authorized fictional support or feedback request."
      title="Help Request"
    />
  );
}
