import { defaultManagerInsightFilters } from "../../domain/manager-insights";
import { createFictionalManagerInsightsService } from "./manager-insights";

describe("fictional manager insight service", () => {
  it("returns one versioned authorized snapshot with reconciling records", async () => {
    const service = createFictionalManagerInsightsService();
    const access = await service.getAccess();
    const snapshot = await service.getSnapshot(defaultManagerInsightFilters);
    const support = await service.getSupportingRecords({
      filters: defaultManagerInsightFilters,
      type: "response-support",
    });

    expect(access.type).toBe("authorized");
    expect(snapshot.definitionVersion).toBe("manager-insights-v1");
    expect(snapshot.result.records).toHaveLength(26);
    expect(support.total).toBe(snapshot.result.firstResponse.denominator);
    expect(snapshot.result.departmentPairs).toHaveLength(3);
    expect(
      snapshot.result.departmentPairs.some((pair) => pair.comparisonEligible),
    ).toBe(true);
    expect(
      snapshot.result.departmentPairs.some(
        (pair) => pair.warning === "Insufficient volume for comparison",
      ),
    ).toBe(true);
    expect(
      snapshot.result.departmentPairs.some((pair) =>
        pair.warning?.startsWith("Comparison unavailable"),
      ),
    ).toBe(true);
  });

  it("paginates bounded supporting records", async () => {
    const service = createFictionalManagerInsightsService();
    const first = await service.getSupportingRecords({
      filters: defaultManagerInsightFilters,
      type: "response-support",
    });

    expect(first.items.length).toBeLessThanOrEqual(20);
    if (first.hasMore) {
      const second = await service.getSupportingRecords({
        cursor: first.nextCursor,
        filters: defaultManagerInsightFilters,
        type: "response-support",
      });
      expect(first.items.length + second.items.length).toBe(first.total);
    }
  });

  it("fails closed for unauthorized and no-scope profiles", async () => {
    const unauthorized = createFictionalManagerInsightsService({
      access: "unauthorized",
    });
    const noScope = createFictionalManagerInsightsService({
      access: "no-scope",
    });

    await expect(unauthorized.getAccess()).resolves.toEqual({
      type: "unauthorized",
    });
    await expect(noScope.getAccess()).resolves.toEqual({ type: "no-scope" });
    await expect(
      unauthorized.getSnapshot(defaultManagerInsightFilters),
    ).rejects.toThrow("not-authorized");
  });

  it("clears an authorized service after a simulated scope removal", async () => {
    const service = createFictionalManagerInsightsService();
    expect((await service.getAccess()).type).toBe("authorized");

    service.setAccess("unauthorized");

    expect(await service.getAccess()).toEqual({ type: "unauthorized" });
    await expect(
      service.getSnapshot(defaultManagerInsightFilters),
    ).rejects.toThrow("not-authorized");
  });

  it("labels partial and stale snapshots instead of guessing freshness", async () => {
    const partial = createFictionalManagerInsightsService({
      partialSection: "department-pairs",
    });
    const stale = createFictionalManagerInsightsService({ stale: true });

    await expect(
      partial.getSnapshot(defaultManagerInsightFilters),
    ).resolves.toMatchObject({
      dataState: "partial",
      partialSection: "department-pairs",
    });
    await expect(
      stale.getSnapshot(defaultManagerInsightFilters),
    ).resolves.toMatchObject({ dataState: "stale" });
  });

  it("rejects a result-version mismatch before exposing conflicting metrics", async () => {
    const service = createFictionalManagerInsightsService({ mismatch: true });

    await expect(
      service.getSnapshot(defaultManagerInsightFilters),
    ).rejects.toThrow("result-mismatch");
  });
});
