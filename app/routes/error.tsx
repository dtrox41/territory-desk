import { pageMeta } from "../components/layout/page-meta";
import { SystemStatePage } from "../features/authentication/SystemStatePage";

export function meta() {
  return pageMeta(
    "Unexpected error",
    "Territory Desk could not safely complete this page.",
  );
}

export default function UnexpectedError() {
  return <SystemStatePage state="unexpected-error" />;
}
