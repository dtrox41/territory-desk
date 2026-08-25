import { pageMeta } from "../components/layout/page-meta";
import { SystemStatePage } from "../features/authentication/SystemStatePage";

export function meta() {
  return pageMeta(
    "Offline",
    "A connection is required for protected Territory Desk work.",
  );
}

export default function Offline() {
  return <SystemStatePage state="offline" />;
}
