import {
  filterNotifications,
  groupNotifications,
  notificationEmptyState,
  sortNotifications,
  type NotificationRecord,
} from "./notifications";

function record(
  id: string,
  input: Partial<NotificationRecord> = {},
): NotificationRecord {
  return {
    actionLabel: "Open Lead",
    authorized: true,
    category: "lead-alerts",
    createdAt: "2026-08-24T14:00:00Z",
    createdLabel: "1 hour ago",
    detailsState: "current",
    exactTimeLabel: "August 24, 2026 at 9:00 AM CT",
    groupLabel: "Today",
    id,
    linkedState: "action_needed",
    message: "Fictional notification",
    read: false,
    typeLabel: "Lead alert",
    ...input,
  };
}

describe("notification domain", () => {
  it("filters authorization, category, and unread state independently", () => {
    const records = [
      record("a"),
      record("b", { category: "feedback-outcomes", read: true }),
      record("hidden", { authorized: false }),
    ];
    expect(
      filterNotifications(records, {
        category: "all",
        unreadOnly: false,
      }).map((item) => item.id),
    ).toEqual(["a", "b"]);
    expect(
      filterNotifications(records, {
        category: "feedback-outcomes",
        unreadOnly: false,
      }).map((item) => item.id),
    ).toEqual(["b"]);
    expect(
      filterNotifications(records, {
        category: "all",
        unreadOnly: true,
      }).map((item) => item.id),
    ).toEqual(["a"]);
  });

  it("orders newest first with a stable identifier tie-break and groups dates", () => {
    const sorted = sortNotifications([
      record("b"),
      record("a"),
      record("c", {
        createdAt: "2026-08-23T14:00:00Z",
        groupLabel: "Yesterday",
      }),
    ]);
    expect(sorted.map((item) => item.id)).toEqual(["a", "b", "c"]);
    expect(groupNotifications(sorted).map((group) => group.label)).toEqual([
      "Today",
      "Yesterday",
    ]);
  });

  it("provides distinct category and unread empty states", () => {
    expect(
      notificationEmptyState({ category: "all", unreadOnly: true }).message,
    ).toBe("You're caught up on notifications.");
    expect(
      notificationEmptyState({
        category: "feedback-outcomes",
        unreadOnly: false,
      }).actionLabel,
    ).toBe("View Sent Leads");
  });
});
