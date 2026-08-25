import { pageMeta } from "../components/layout/page-meta";
import { SystemStatePage } from "../features/authentication/SystemStatePage";

export function meta() {
  return pageMeta(
    "Unsupported browser",
    "This browser cannot safely run Territory Desk.",
  );
}

export default function UnsupportedBrowser() {
  return <SystemStatePage state="unsupported-browser" />;
}
