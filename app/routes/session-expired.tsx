import { pageMeta } from "../components/layout/page-meta";
import { SystemStatePage } from "../features/authentication/SystemStatePage";

export function meta() {
  return pageMeta(
    "Session expired",
    "The fictional Territory Desk session expired.",
  );
}

export default function SessionExpired() {
  return <SystemStatePage state="session-expired" />;
}
