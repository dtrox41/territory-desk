import type {
  NotificationFilters,
  NotificationRecord,
} from "../domain/notifications";

export type NotificationListResult = {
  dataState: "current" | "stale";
  hasMore: boolean;
  items: NotificationRecord[];
  lastUpdatedLabel: string;
  nextCursor?: string;
  resultTotal: number;
};

export type NotificationCountResult =
  { count: number; type: "available" } | { type: "unavailable" };

export type NotificationCommandResult = {
  changedCount: number;
  unreadCount: number;
};

export interface NotificationService {
  getNotifications(input: {
    cursor?: string;
    filters: NotificationFilters;
  }): Promise<NotificationListResult>;
  getUnreadCount(): Promise<NotificationCountResult>;
  markAllRead(input: {
    idempotencyKey: string;
  }): Promise<NotificationCommandResult>;
  markRead(input: {
    idempotencyKey: string;
    notificationId: string;
  }): Promise<NotificationCommandResult>;
}
