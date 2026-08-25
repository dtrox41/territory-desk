import { fictionalHomeDashboardService } from "./home-dashboard";

describe("fictionalHomeDashboardService", () => {
  it("returns deterministic, uniquely ranked fictional action items", async () => {
    const dashboard = await fictionalHomeDashboardService.getDashboard();
    const actionIds = dashboard.actionRequired.items.map(
      (item) => item.handoffId,
    );

    expect(dashboard.actionRequired.total).toBe(5);
    expect(actionIds).toHaveLength(new Set(actionIds).size);
    expect(
      dashboard.actionRequired.items.map((item) => item.visibleReason),
    ).toEqual([
      "Response target missed",
      "Follow-up overdue",
      "Information received",
      "New lead",
    ]);
    expect(dashboard.summary.map((item) => item.label)).toEqual([
      "New",
      "Needs Attention",
      "Waiting",
      "Outcomes",
    ]);
  });
});
