import {
  filterNotifications,
  sortNotifications,
  type NotificationRecord,
} from "../../domain/notifications";
import type {
  NotificationCommandResult,
  NotificationService,
} from "../notification-service";

type FictionalNotificationOptions = {
  failCount?: boolean;
  failList?: boolean;
  failMarkAll?: boolean;
  failMarkRead?: boolean;
  failPagination?: boolean;
  markAllLimit?: number;
  stale?: boolean;
};

function notification(
  input: Omit<
    NotificationRecord,
    | "authorized"
    | "createdAt"
    | "createdLabel"
    | "detailsState"
    | "exactTimeLabel"
    | "groupLabel"
    | "read"
  > &
    Partial<
      Pick<
        NotificationRecord,
        | "authorized"
        | "createdAt"
        | "createdLabel"
        | "detailsState"
        | "exactTimeLabel"
        | "groupLabel"
        | "read"
      >
    >,
): NotificationRecord {
  return {
    authorized: true,
    createdAt: "2026-08-24T14:00:00Z",
    createdLabel: "1 hour ago",
    detailsState: "current",
    exactTimeLabel: "Monday, August 24, 2026 at 9:00 AM CT",
    groupLabel: "Today",
    read: true,
    ...input,
  };
}

const coreNotifications: NotificationRecord[] = [
  notification({
    actionLabel: "Review Lead",
    actorDepartment: "Facility Services",
    actorName: "Alex Grant",
    category: "lead-alerts",
    createdAt: "2026-08-24T14:40:00Z",
    createdLabel: "20 minutes ago",
    destination: { leadId: "demo-lead-1004", type: "lead" },
    exactTimeLabel: "Monday, August 24, 2026 at 9:40 AM CT",
    id: "demo-notification-001",
    linkedState: "action_needed",
    message: "New peer lead from Alex Grant · Facility Services.",
    read: false,
    typeLabel: "New handoff assigned",
  }),
  notification({
    actionLabel: "Open Lead",
    actorDepartment: "Uniform",
    actorName: "Taylor Morgan",
    category: "feedback-outcomes",
    createdAt: "2026-08-24T14:20:00Z",
    createdLabel: "40 minutes ago",
    destination: { leadId: "demo-lead-1005", type: "lead" },
    exactTimeLabel: "Monday, August 24, 2026 at 9:20 AM CT",
    id: "demo-notification-002",
    linkedState: "resolved",
    message: "Riley Brooks accepted the shared peer lead.",
    read: false,
    typeLabel: "Lead accepted",
  }),
  notification({
    actionLabel: "Open Follow-Up",
    category: "reminders-system",
    createdAt: "2026-08-24T14:00:00Z",
    createdLabel: "1 hour ago",
    destination: { leadId: "demo-lead-1002", type: "lead" },
    exactTimeLabel: "Monday, August 24, 2026 at 9:00 AM CT",
    id: "demo-notification-003",
    linkedState: "action_needed",
    message: "Follow-up reminder: customer qualification call is overdue.",
    read: false,
    typeLabel: "Follow-up overdue",
  }),
  notification({
    actionLabel: "Provide Information",
    actorDepartment: "First Aid & Safety",
    actorName: "Morgan Davis",
    category: "lead-alerts",
    createdAt: "2026-08-24T13:30:00Z",
    createdLabel: "1 hour 30 minutes ago",
    destination: { leadId: "demo-lead-1006", type: "lead" },
    exactTimeLabel: "Monday, August 24, 2026 at 8:30 AM CT",
    id: "demo-notification-004",
    linkedState: "action_needed",
    message: "Morgan Davis needs information before responding.",
    typeLabel: "Information requested",
  }),
  notification({
    actionLabel: "Review Information",
    actorDepartment: "Uniform",
    actorName: "Casey Rivera",
    category: "lead-alerts",
    createdAt: "2026-08-24T13:10:00Z",
    createdLabel: "1 hour 50 minutes ago",
    destination: { leadId: "demo-lead-1003", type: "lead" },
    exactTimeLabel: "Monday, August 24, 2026 at 8:10 AM CT",
    id: "demo-notification-005",
    linkedState: "action_needed",
    message: "Requested information was supplied by Casey Rivera.",
    typeLabel: "Information supplied",
  }),
  notification({
    actionLabel: "Review Assignment",
    actorDepartment: "Sales Management",
    actorName: "Avery Brooks",
    category: "lead-alerts",
    createdAt: "2026-08-24T12:45:00Z",
    createdLabel: "2 hours ago",
    destination: { leadId: "demo-lead-1012", type: "lead" },
    exactTimeLabel: "Monday, August 24, 2026 at 7:45 AM CT",
    id: "demo-notification-006",
    linkedState: "waiting",
    message: "A peer lead was reassigned to you by Avery Brooks.",
    typeLabel: "Assignment changed",
  }),
  notification({
    actionLabel: "Review Routing",
    category: "lead-alerts",
    createdAt: "2026-08-24T12:20:00Z",
    createdLabel: "2 hours 40 minutes ago",
    destination: { leadId: "demo-lead-1013", type: "lead" },
    exactTimeLabel: "Monday, August 24, 2026 at 7:20 AM CT",
    id: "demo-notification-007",
    linkedState: "waiting",
    message: "Routing help was updated for your peer lead.",
    typeLabel: "Routing help updated",
  }),
  notification({
    actionLabel: "View Progress",
    actorDepartment: "Facility Services",
    actorName: "Jordan Lee",
    category: "feedback-outcomes",
    createdAt: "2026-08-23T20:20:00Z",
    createdLabel: "Yesterday",
    destination: { leadId: "demo-lead-1007", type: "lead" },
    exactTimeLabel: "Sunday, August 23, 2026 at 3:20 PM CT",
    groupLabel: "Yesterday",
    id: "demo-notification-008",
    linkedState: "resolved",
    message: "Jordan Lee shared a material progress update.",
    typeLabel: "Progress shared",
  }),
  notification({
    actionLabel: "View Appointment",
    actorDepartment: "Facility Services",
    actorName: "Jordan Lee",
    category: "feedback-outcomes",
    createdAt: "2026-08-23T18:35:00Z",
    createdLabel: "Yesterday",
    destination: { leadId: "demo-lead-1007", type: "lead" },
    exactTimeLabel: "Sunday, August 23, 2026 at 1:35 PM CT",
    groupLabel: "Yesterday",
    id: "demo-notification-009",
    linkedState: "resolved",
    message: "A fictional customer appointment was set.",
    typeLabel: "Appointment set",
  }),
  notification({
    actionLabel: "View Outcome",
    actorDepartment: "First Aid & Safety",
    actorName: "Quinn Patel",
    category: "feedback-outcomes",
    createdAt: "2026-08-23T16:00:00Z",
    createdLabel: "Yesterday",
    destination: { leadId: "demo-lead-1100", type: "lead" },
    exactTimeLabel: "Sunday, August 23, 2026 at 11:00 AM CT",
    groupLabel: "Yesterday",
    id: "demo-notification-010",
    linkedState: "resolved",
    message: "The shared peer lead was recorded as Won — Demo.",
    typeLabel: "Outcome recorded",
  }),
  notification({
    actionLabel: "Open Lead",
    actorDepartment: "Facility Services",
    actorName: "Jordan Lee",
    category: "feedback-outcomes",
    createdAt: "2026-08-22T20:00:00Z",
    createdLabel: "August 22",
    destination: { leadId: "demo-lead-1101", type: "lead" },
    exactTimeLabel: "Saturday, August 22, 2026 at 3:00 PM CT",
    groupLabel: "August 22, 2026",
    id: "demo-notification-011",
    linkedState: "resolved",
    message: "The peer lead was declined with an approved reason.",
    typeLabel: "Lead declined",
  }),
  notification({
    actionLabel: "Review Exception",
    category: "reminders-system",
    createdAt: "2026-08-22T18:00:00Z",
    createdLabel: "August 22",
    destination: { leadId: "demo-lead-1013", type: "lead" },
    exactTimeLabel: "Saturday, August 22, 2026 at 1:00 PM CT",
    groupLabel: "August 22, 2026",
    id: "demo-notification-012",
    linkedState: "action_needed",
    message: "A territory or directory issue requires review.",
    typeLabel: "Data exception",
  }),
  notification({
    actionLabel: "View Data Status",
    category: "reminders-system",
    createdAt: "2026-08-22T16:00:00Z",
    createdLabel: "August 22",
    destination: { href: "/data-status", type: "data-status" },
    detailsState: "partial",
    exactTimeLabel: "Saturday, August 22, 2026 at 11:00 AM CT",
    groupLabel: "August 22, 2026",
    id: "demo-notification-013",
    linkedState: "action_needed",
    message: "Some notification preference information is unavailable.",
    typeLabel: "Notification setting needs review",
  }),
  notification({
    actionLabel: "Open Lead",
    category: "feedback-outcomes",
    createdAt: "2026-08-21T18:00:00Z",
    createdLabel: "August 21",
    detailsState: "unavailable",
    exactTimeLabel: "Friday, August 21, 2026 at 1:00 PM CT",
    groupLabel: "August 21, 2026",
    id: "demo-notification-014",
    linkedState: "unavailable",
    message: "A peer-lead update is no longer available.",
    typeLabel: "Lead update",
  }),
  notification({
    actionLabel: "Open Lead",
    authorized: false,
    category: "lead-alerts",
    id: "demo-notification-hidden",
    linkedState: "unavailable",
    message: "This record must never appear.",
    typeLabel: "Unauthorized fixture",
  }),
];

const outcomeLabels = [
  "Appointment rescheduled",
  "Appointment canceled",
  "Appointment completed",
  "Won — Demo",
  "Lost — Demo",
  "Closed — Not Qualified",
  "Lead corrected",
  "Lead reopened",
  "Follow-up reminder",
  "First-response target missed",
  "Information-review target missed",
  "Assignment changed",
];

const historicalNotifications = outcomeLabels.map((typeLabel, index) => {
  const feedback = index < 8;
  const day = 20 - index;
  return notification({
    actionLabel: feedback ? "View Outcome" : "Open Lead",
    category: feedback ? "feedback-outcomes" : "reminders-system",
    createdAt: `2026-08-${String(day).padStart(2, "0")}T15:00:00Z`,
    createdLabel: `August ${day}`,
    destination: {
      leadId: `demo-lead-${1102 + (index % 12)}`,
      type: "lead",
    },
    exactTimeLabel: `August ${day}, 2026 at 10:00 AM CT`,
    groupLabel: `August ${day}, 2026`,
    id: `demo-notification-${String(100 + index)}`,
    linkedState: feedback ? "resolved" : "waiting",
    message: feedback
      ? `A fictional ${typeLabel.toLowerCase()} update was recorded.`
      : `A fictional ${typeLabel.toLowerCase()} notice is available.`,
    typeLabel,
  });
});

const baseRecords = [...coreNotifications, ...historicalNotifications];

function commandError(code: string) {
  return Object.assign(new Error(code), { code });
}

export function createFictionalNotificationService(
  options: FictionalNotificationOptions = {},
): NotificationService {
  const records = structuredClone(baseRecords);
  const commandResults = new Map<string, NotificationCommandResult>();

  function unreadCount() {
    return records.filter((record) => record.authorized && !record.read).length;
  }

  function result(changedCount: number) {
    const unread = unreadCount();
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("territory-desk:notifications-updated", {
          detail: { count: unread, countAvailable: true },
        }),
      );
    }
    return { changedCount, unreadCount: unread };
  }

  return {
    async getNotifications({ cursor, filters }) {
      await Promise.resolve();
      if (options.failList) throw new Error("notification-list-failure");
      if (cursor && options.failPagination)
        throw new Error("notification-pagination-failure");
      const filtered = sortNotifications(filterNotifications(records, filters));
      const offset = Number.parseInt(cursor ?? "0", 10) || 0;
      const items = filtered.slice(offset, offset + 20);
      const next = offset + items.length;
      return {
        dataState: options.stale ? "stale" : "current",
        hasMore: next < filtered.length,
        items: structuredClone(items),
        lastUpdatedLabel: "August 24, 2026 at 10:00 AM CT",
        nextCursor: next < filtered.length ? String(next) : undefined,
        resultTotal: filtered.length,
      };
    },
    async getUnreadCount() {
      await Promise.resolve();
      return options.failCount || options.stale
        ? ({ type: "unavailable" } as const)
        : ({ count: unreadCount(), type: "available" } as const);
    },
    async markAllRead({ idempotencyKey }) {
      await Promise.resolve();
      const prior = commandResults.get(idempotencyKey);
      if (prior) return structuredClone(prior);
      if (options.failMarkAll) throw commandError("mark-all-failure");
      const unread = records.filter(
        (record) => record.authorized && !record.read,
      );
      const limit = options.markAllLimit ?? unread.length;
      const changed = unread.slice(0, limit);
      for (const record of changed) record.read = true;
      const next = result(changed.length);
      commandResults.set(idempotencyKey, next);
      return structuredClone(next);
    },
    async markRead({ idempotencyKey, notificationId }) {
      await Promise.resolve();
      const prior = commandResults.get(idempotencyKey);
      if (prior) return structuredClone(prior);
      if (options.failMarkRead) throw commandError("mark-read-failure");
      const record = records.find(
        (item) => item.id === notificationId && item.authorized,
      );
      if (!record) throw commandError("unavailable");
      const changedCount = record.read ? 0 : 1;
      record.read = true;
      const next = result(changedCount);
      commandResults.set(idempotencyKey, next);
      return structuredClone(next);
    },
  };
}

export const fictionalNotificationService =
  createFictionalNotificationService();
