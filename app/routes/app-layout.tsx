import { Navigate, useLocation } from "react-router";

import { SystemPage } from "../components/layout/SystemPage";
import { AppShell } from "../components/shell/AppShell";
import { sanitizeReturnDestination } from "../domain/authentication";
import { useFictionalSession } from "../features/authentication/fictional-session-context";

export default function AppLayout() {
  const location = useLocation();
  const session = useFictionalSession();

  if (session.status === "loading")
    return (
      <SystemPage
        description="Checking the current fictional demo session before protected content is displayed."
        eyebrow="Fictional prototype"
        title="Opening Territory Desk"
      >
        <p className="system-page__status" role="status">
          Checking demo access…
        </p>
      </SystemPage>
    );

  if (session.status === "signed-out") {
    const returnTo = sanitizeReturnDestination(location.pathname);
    return (
      <Navigate
        replace
        to={`/sign-in?returnTo=${encodeURIComponent(returnTo)}`}
      />
    );
  }

  return <AppShell managerView={session.session.manager} />;
}
