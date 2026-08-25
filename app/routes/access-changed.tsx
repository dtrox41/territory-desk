import { pageMeta } from "../components/layout/page-meta";
import { SystemStatePage } from "../features/authentication/SystemStatePage";

export function meta() {
  return pageMeta(
    "Access changed",
    "Territory Desk refreshed the current fictional scope.",
  );
}

export default function AccessChanged() {
  return <SystemStatePage state="access-changed" />;
}
