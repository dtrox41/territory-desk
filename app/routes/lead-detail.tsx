import { useLocation } from "react-router";

import { PlaceholderPage } from "../components/layout/PageFrame";
import { pageMeta } from "../components/layout/page-meta";
import type { LeadEntryContext } from "../domain/lead-creation";
import { LeadCreationSuccess } from "../features/leads/LeadCreationSuccess";
import type { LeadSubmissionResult } from "../services/lead-creation-service";

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

  return (
    <PlaceholderPage
      description="Review one authorized peer handoff without exposing any real record information."
      title="Lead Detail"
    />
  );
}
