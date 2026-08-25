import { pageMeta } from "../components/layout/page-meta";
import { SystemStatePage } from "../features/authentication/SystemStatePage";

export function meta() {
  return pageMeta("Maintenance", "Territory Desk is temporarily unavailable.");
}

export default function Maintenance() {
  return <SystemStatePage state="maintenance" />;
}
