import { pageMeta } from "../components/layout/page-meta";
import { HelpTopic as HelpTopicScreen } from "../features/help/HelpTopic";
import { fictionalHelpService } from "../services/fictional/help";

export function meta() {
  return pageMeta("Help Topic", "Fictional Territory Desk help-topic route.");
}

export default function HelpTopic() {
  return <HelpTopicScreen service={fictionalHelpService} />;
}
