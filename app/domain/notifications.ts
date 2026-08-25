export type NotificationCategory =
  "all" | "lead-alerts" | "feedback-outcomes" | "reminders-system";

export type NotificationLinkedState =
  "action_needed" | "resolved" | "waiting" | "unavailable";

export type NotificationDetailsState = "current" | "partial" | "unavailable";

export type NotificationDestination =
  | { leadId: string; type: "lead" }
  | { href: "/data-status"; type: "data-status" };

export type NotificationRecord = {
  actionLabel: string;
  actorDepartment?: string;
  actorName?: string;
  authorized: boolean;
  category: Exclude<NotificationCategory, "all">;
  createdAt: string;
  createdLabel: string;
  destination?: NotificationDestination;
  detailsState: NotificationDetailsState;
  exactTimeLabel: string;
  groupLabel: string;
  id: string;
  linkedState: NotificationLinkedState;
  message: string;
  read: boolean;
  typeLabel: string;
};

export type NotificationFilters = {
  category: NotificationCategory;
  unreadOnly: boolean;
};

export const notificationCategories: Array<{
  label: string;
  value: NotificationCategory;
}> = [
  { label: "All", value: "all" },
  { label: "Lead Alerts", value: "lead-alerts" },
  { label: "Feedback & Outcomes", value: "feedback-outcomes" },
  { label: "Reminders & System", value: "reminders-system" },
];

export const notificationLinkedStateLabels: Record<
  NotificationLinkedState,
  string
> = {
  action_needed: "Action needed",
  resolved: "Resolved",
  waiting: "Waiting",
  unavailable: "Unavailable",
};

export function filterNotifications(
  records: NotificationRecord[],
  filters: NotificationFilters,
) {
  return records.filter(
    (record) =>
      record.authorized &&
      (filters.category === "all" || record.category === filters.category) &&
      (!filters.unreadOnly || !record.read),
  );
}

export function sortNotifications(records: NotificationRecord[]) {
  return [...records].sort((left, right) => {
    const dateDifference =
      Date.parse(right.createdAt) - Date.parse(left.createdAt);
    return dateDifference || left.id.localeCompare(right.id);
  });
}

export function groupNotifications(records: NotificationRecord[]) {
  const groups: Array<{ label: string; records: NotificationRecord[] }> = [];
  for (const record of records) {
    const current = groups.at(-1);
    if (current?.label === record.groupLabel) current.records.push(record);
    else groups.push({ label: record.groupLabel, records: [record] });
  }
  return groups;
}

export function notificationEmptyState(filters: NotificationFilters) {
  if (filters.unreadOnly) {
    return {
      actionHref: "/notifications",
      actionLabel: "Show All Notifications",
      message: "You're caught up on notifications.",
    } as const;
  }
  if (filters.category === "lead-alerts") {
    return {
      actionHref: "/leads?view=action-required",
      actionLabel: "View Action Required",
      message: "No lead alerts are available.",
    } as const;
  }
  if (filters.category === "feedback-outcomes") {
    return {
      actionHref: "/leads?view=sent",
      actionLabel: "View Sent Leads",
      message:
        "Feedback and outcomes will appear as teammates update shared leads.",
    } as const;
  }
  if (filters.category === "reminders-system") {
    return {
      actionHref: "/leads?view=in-progress",
      actionLabel: "View In Progress",
      message: "No reminders or system notices are available.",
    } as const;
  }
  return {
    actionHref: "/leads",
    actionLabel: "View Leads",
    message:
      "Notifications about peer leads, feedback, and reminders will appear here.",
  } as const;
}
