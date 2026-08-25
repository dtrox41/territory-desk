import { pageMeta } from "../components/layout/page-meta";
import { ManagerInsights } from "../features/insights/ManagerInsights";
import { fictionalManagerInsightsService } from "../services/fictional/manager-insights";

export function meta() {
  return pageMeta(
    "Team Insights",
    "Authorized fictional cross-department workflow insights for Territory Desk managers.",
  );
}

export default function Insights() {
  return <ManagerInsights service={fictionalManagerInsightsService} />;
}
