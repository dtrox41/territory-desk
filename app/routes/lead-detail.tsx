import { useLocation } from "react-router";

import { pageMeta } from "../components/layout/page-meta";
import type { LeadEntryContext } from "../domain/lead-creation";
import { LeadDetail as LeadDetailScreen } from "../features/leads/LeadDetail";
import { LeadCreationSuccess } from "../features/leads/LeadCreationSuccess";
import type { LeadSubmissionResult } from "../services/lead-creation-service";
import { fictionalLeadDetailService } from "../services/fictional/lead-detail";

export function meta() {
  return pageMeta("Lead Detail", "Fictional Territory Desk lead-detail route.");
}

export default function LeadDetail() {
  const location = useLocation();
  const state = location.state as {
    anotherDepartmentContext?: Extract<
      LeadEntryContext,
      { source: "another-department" }
    >;
    creationReceipt?: LeadSubmissionResult;
  } | null;

  if (state?.creationReceipt && state.anotherDepartmentContext) {
    return (
      <LeadCreationSuccess
        anotherDepartmentContext={state.anotherDepartmentContext}
        receipt={state.creationReceipt}
      />
    );
  }

  return <LeadDetailScreen leadService={fictionalLeadDetailService} />;
}
