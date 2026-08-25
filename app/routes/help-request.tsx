import { pageMeta } from "../components/layout/page-meta";
import { HelpRequestDetail } from "../features/help/HelpRequestDetail";
import { fictionalHelpService } from "../services/fictional/help";

export function meta() {
  return pageMeta(
    "Help Request",
    "Fictional Territory Desk help-request route.",
  );
}

export default function HelpRequest() {
  return <HelpRequestDetail service={fictionalHelpService} />;
}
