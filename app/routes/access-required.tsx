import { pageMeta } from "../components/layout/page-meta";
import { SystemStatePage } from "../features/authentication/SystemStatePage";

export function meta() {
  return pageMeta(
    "Access required",
    "Territory Desk access is not configured.",
  );
}

export default function AccessRequired() {
  return <SystemStatePage state="access-required" />;
}
