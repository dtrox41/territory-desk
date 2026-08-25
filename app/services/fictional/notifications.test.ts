import { createFictionalNotificationService } from "./notifications";

const all = { category: "all" as const, unreadOnly: false };

describe("fictional notification service", () => {
  it("returns three unread authorized records independently from lead actions", async () => {
    const service = createFictionalNotificationService();
    await expect(service.getUnreadCount()).resolves.toEqual({
      count: 3,
      type: "available",
    });
    const unread = await service.getNotifications({
      filters: { ...all, unreadOnly: true },
    });
    expect(unread.items).toHaveLength(3);
    expect(unread.items.every((item) => item.authorized && !item.read)).toBe(
      true,
    );
  });

  it("uses bounded stable pagination without duplicates", async () => {
    const service = createFictionalNotificationService();
    const first = await service.getNotifications({ filters: all });
    const second = await service.getNotifications({
      cursor: first.nextCursor,
      filters: all,
    });
    expect(first.items).toHaveLength(20);
    expect(first.hasMore).toBe(true);
    expect(second.hasMore).toBe(false);
    expect(
      new Set([...first.items, ...second.items].map((item) => item.id)).size,
    ).toBe(first.items.length + second.items.length);
  });

  it("marks one record read idempotently without changing notification history", async () => {
    const service = createFictionalNotificationService();
    const command = {
      idempotencyKey: "mark-1",
      notificationId: "demo-notification-001",
    };
    const first = await service.markRead(command);
    const repeated = await service.markRead(command);
    expect(first).toEqual({ changedCount: 1, unreadCount: 2 });
    expect(repeated).toEqual(first);
    const allRecords = await service.getNotifications({ filters: all });
    expect(allRecords.resultTotal).toBeGreaterThan(20);
  });

  it("marks every authorized unread record, not only the visible page", async () => {
    const service = createFictionalNotificationService();
    await expect(
      service.markAllRead({ idempotencyKey: "mark-all-1" }),
    ).resolves.toEqual({ changedCount: 3, unreadCount: 0 });
    await expect(service.getUnreadCount()).resolves.toEqual({
      count: 0,
      type: "available",
    });
  });

  it("supports partial and independent failure fixtures", async () => {
    const partial = createFictionalNotificationService({ markAllLimit: 1 });
    await expect(
      partial.markAllRead({ idempotencyKey: "partial-1" }),
    ).resolves.toEqual({ changedCount: 1, unreadCount: 2 });

    await expect(
      createFictionalNotificationService({ failCount: true }).getUnreadCount(),
    ).resolves.toEqual({ type: "unavailable" });
    await expect(
      createFictionalNotificationService({ failList: true }).getNotifications({
        filters: all,
      }),
    ).rejects.toThrow("notification-list-failure");
    await expect(
      createFictionalNotificationService({
        failMarkRead: true,
      }).markRead({
        idempotencyKey: "failed-read",
        notificationId: "demo-notification-001",
      }),
    ).rejects.toMatchObject({ code: "mark-read-failure" });
  });

  it("does not confirm whether an unknown notification exists", async () => {
    await expect(
      createFictionalNotificationService().markRead({
        idempotencyKey: "unknown-read",
        notificationId: "demo-notification-999",
      }),
    ).rejects.toMatchObject({ code: "unavailable" });
  });
});
