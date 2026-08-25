import { pageMeta } from "../components/layout/page-meta";
import { SystemStatePage } from "../features/authentication/SystemStatePage";

export function meta() {
  return pageMeta(
    "Access denied",
    "The requested protected destination is unavailable.",
  );
}

export default function AccessDenied() {
  return <SystemStatePage state="access-denied" />;
}
