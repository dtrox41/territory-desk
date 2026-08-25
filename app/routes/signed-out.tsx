import { SystemPage } from "../components/layout/SystemPage";
import { pageMeta } from "../components/layout/page-meta";

export function meta() {
  return pageMeta(
    "Signed out",
    "The fictional Territory Desk session has ended.",
  );
}

export default function SignedOut() {
  return (
    <SystemPage
      actionLabel="Sign In Again"
      actionTo="/"
      description="This fictional session ended and session-held demo business data was cleared. Close the browser if this were a shared device. Existing demo records were not deleted."
      eyebrow="Session ended"
      title="You are signed out"
    />
  );
}
