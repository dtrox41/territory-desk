import { pageMeta } from "../components/layout/page-meta";
import { SystemStatePage } from "../features/authentication/SystemStatePage";

export function meta() {
  return pageMeta(
    "Account unavailable",
    "Territory Desk account access is unavailable.",
  );
}

export default function AccountUnavailable() {
  return <SystemStatePage state="account-unavailable" />;
}
