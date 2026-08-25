import { pageMeta } from "../components/layout/page-meta";
import { DataStatus } from "../features/data-status/DataStatus";
import { fictionalDataStatusService } from "../services/fictional/data-status";

export function meta() {
  return pageMeta(
    "Data Status",
    "Fictional Territory Desk action-safety and data-quality status.",
  );
}

export default function DataStatusRoute() {
  return <DataStatus service={fictionalDataStatusService} />;
}
