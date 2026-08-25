import { pageMeta } from "../components/layout/page-meta";
import { SystemStatePage } from "../features/authentication/SystemStatePage";

export function meta() {
  return pageMeta(
    "Page not found",
    "The requested fictional Territory Desk page was not found.",
  );
}

export default function NotFound() {
  return <SystemStatePage state="not-found" />;
}
