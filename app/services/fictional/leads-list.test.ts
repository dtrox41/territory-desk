import { defaultLeadListFilters } from "../../domain/leads-list";
import {
  createFictionalLeadsListService,
  fictionalLeadsListService,
} from "./leads-list";

describe("fictional leads-list service", () => {
  it("aligns the action count and ranking with the Home dashboard", async () => {
    const counts = await fictionalLeadsListService.getCounts();
    const result = await fictionalLeadsListService.getLeads({
      filters: defaultLeadListFilters,
      search: "",
      view: "action-required",
    });

    expect(counts["action-required"]).toBe(5);
    expect(result.items.map((item) => item.id)).toEqual([
      "demo-lead-1001",
      "demo-lead-1002",
      "demo-lead-1003",
      "demo-lead-1004",
      "demo-lead-1010",
    ]);
  });

  it("paginates sent history in bounded pages without duplicate records", async () => {
    const first = await fictionalLeadsListService.getLeads({
      filters: defaultLeadListFilters,
      search: "",
      view: "sent",
    });
    const second = await fictionalLeadsListService.getLeads({
      cursor: first.nextCursor,
      filters: defaultLeadListFilters,
      search: "",
      view: "sent",
    });

    expect(first.items).toHaveLength(20);
    expect(first.hasMore).toBe(true);
    expect(
      new Set([...first.items, ...second.items].map((item) => item.id)).size,
    ).toBe(first.items.length + second.items.length);
  });

  it("searches company, reference, sender, and recipient names", async () => {
    for (const search of [
      "Northstar",
      "demo-lead-1001",
      "Jamie Chen",
      "Taylor Morgan",
    ]) {
      const result = await fictionalLeadsListService.getLeads({
        filters: defaultLeadListFilters,
        search,
        view: "received",
      });
      expect(result.items.some((item) => item.id === "demo-lead-1001")).toBe(
        true,
      );
    }
  });

  it("provides independent count, list, and stale-state failure fixtures", async () => {
    await expect(
      createFictionalLeadsListService({ failCounts: true }).getCounts(),
    ).rejects.toThrow("count-failure");
    await expect(
      createFictionalLeadsListService({ failList: true }).getLeads({
        filters: defaultLeadListFilters,
        search: "",
        view: "received",
      }),
    ).rejects.toThrow("list-failure");
    await expect(
      createFictionalLeadsListService({ stale: true }).getLeads({
        filters: defaultLeadListFilters,
        search: "",
        view: "received",
      }),
    ).resolves.toMatchObject({ dataState: "stale" });
  });
});
