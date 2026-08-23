import { PlaceholderPage } from "../components/layout/PageFrame";
import { pageMeta } from "../components/layout/page-meta";

export function meta() {
  return pageMeta(
    "Notifications",
    "Fictional Territory Desk notification-center route.",
  );
}

export default function Notifications() {
  return (
    <PlaceholderPage
      description="Review unread lead alerts, feedback and outcomes, reminders, and system notices."
      title="Notifications"
    />
  );
}
