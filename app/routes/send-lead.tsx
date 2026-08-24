import { useLocation } from "react-router";

import { pageMeta } from "../components/layout/page-meta";
import type { LeadEntryContext } from "../domain/lead-creation";
import { LeadCreation } from "../features/leads/LeadCreation";
import { fictionalLeadCreationService } from "../services/fictional/lead-creation";

export function meta() {
  return pageMeta("Send Lead", "Fictional Territory Desk lead-creation route.");
}

export default function SendLead() {
  const location = useLocation();
  const state = location.state as {
    leadEntryContext?: LeadEntryContext;
    routingSnapshot?: Extract<
      LeadEntryContext,
      { source: "territory" }
    >["routingSnapshot"];
  } | null;

  const entryContext: LeadEntryContext = state?.routingSnapshot
    ? { routingSnapshot: state.routingSnapshot, source: "territory" }
    : (state?.leadEntryContext ?? { source: "global" });

  return (
    <LeadCreation
      entryContext={entryContext}
      leadService={fictionalLeadCreationService}
    />
  );
}
