import { Navigate } from "react-router";

import { pageMeta } from "../components/layout/page-meta";
import { useFictionalSession } from "../features/authentication/fictional-session-context";
import { ManagerInsights } from "../features/insights/ManagerInsights";
import { fictionalManagerInsightsService } from "../services/fictional/manager-insights";

export function meta() {
  return pageMeta(
    "Team Insights",
    "Authorized fictional cross-department workflow insights for Territory Desk managers.",
  );
}

export default function Insights() {
  const session = useFictionalSession();
  if (session.status !== "authenticated" || !session.session.manager)
    return <Navigate replace to="/access-denied" />;
  return <ManagerInsights service={fictionalManagerInsightsService} />;
}
