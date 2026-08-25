import { pageMeta } from "../components/layout/page-meta";
import { NotificationCenter } from "../features/notifications/NotificationCenter";
import { fictionalNotificationService } from "../services/fictional/notifications";

export function meta() {
  return pageMeta(
    "Notifications",
    "Fictional Territory Desk notification-center route.",
  );
}

export default function Notifications() {
  return (
    <NotificationCenter notificationService={fictionalNotificationService} />
  );
}
