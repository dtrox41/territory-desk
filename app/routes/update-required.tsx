import { pageMeta } from "../components/layout/page-meta";
import { SystemStatePage } from "../features/authentication/SystemStatePage";

export function meta() {
  return pageMeta(
    "Update required",
    "Territory Desk must refresh before protected work continues.",
  );
}

export default function UpdateRequired() {
  return <SystemStatePage state="update-required" />;
}
