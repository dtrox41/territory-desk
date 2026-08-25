import { pageMeta } from "../components/layout/page-meta";
import { HelpAndFeedback } from "../features/help/HelpAndFeedback";
import { fictionalHelpService } from "../services/fictional/help";

export function meta() {
  return pageMeta("Help and Feedback", "Fictional Territory Desk help route.");
}

export default function Help() {
  return <HelpAndFeedback service={fictionalHelpService} />;
}
