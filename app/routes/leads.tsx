import { pageMeta } from "../components/layout/page-meta";
import { LeadsList } from "../features/leads/LeadsList";
import { fictionalLeadsListService } from "../services/fictional/leads-list";

export function meta() {
  return pageMeta("Leads", "Fictional Territory Desk lead-list route.");
}

export default function Leads() {
  return <LeadsList leadsService={fictionalLeadsListService} />;
}
