import {
  buildManagerInsightResult,
  defaultManagerInsightFilters,
  recordsForDrilldown,
  type ManagerInsightRecord,
} from "./manager-insights";

const now = "2026-08-24T14:10:00Z";

function record(
  id: string,
  input: Partial<ManagerInsightRecord> = {},
): ManagerInsightRecord {
  return {
    acceptedAt: "2026-08-20T14:00:00Z",
    companyName: `Company ${id}`,
    createdAt: "2026-08-19T14:00:00Z",
    currentOwnerName: "Fictional Owner",
    direction: "received",
    hasValidNextAction: true,
    id,
    measurementComplete: true,
    meaningfulResponseAt: "2026-08-20T13:00:00Z",
    receivingDepartment: "facility-services",
    requiredActionOwnerName: "Fictional Owner",
    responseDisposition: "accept",
    responseTargetAt: "2026-08-20T14:00:00Z",
    routingStatus: "unique",
    sendingDepartment: "uniform",
    status: "in_progress",
    structuredUpdateAt: "2026-08-22T13:00:00Z",
    updateDueAt: "2026-08-22T14:00:00Z",
    ...input,
  };
}

describe("manager insight metric model", () => {
  it("treats the exact response deadline as on time and preserves visible denominators", () => {
    const result = buildManagerInsightResult(
      [
        record("boundary", {
          meaningfulResponseAt: "2026-08-20T14:00:00Z",
        }),
        record("late", {
          meaningfulResponseAt: "2026-08-20T14:00:01Z",
        }),
      ],
      defaultManagerInsightFilters,
      now,
    );

    expect(result.firstResponse).toMatchObject({
      denominator: 2,
      excluded: 0,
      numerator: 1,
      rate: 0.5,
    });
  });

  it("deduplicates the Needs Attention headline without hiding multi-cause records", () => {
    const result = buildManagerInsightResult(
      [
        record("multi", {
          hasValidNextAction: false,
          meaningfulResponseAt: undefined,
          structuredUpdateAt: undefined,
        }),
      ],
      defaultManagerInsightFilters,
      now,
    );

    expect(result.needsAttentionCount).toBe(1);
    expect(
      result.attentionGroups.reduce((total, group) => total + group.count, 0),
    ).toBeGreaterThan(1);
  });

  it("excludes routing and incomplete records instead of guessing a favorable rate", () => {
    const result = buildManagerInsightResult(
      [
        record("valid"),
        record("routing", { routingStatus: "ambiguous" }),
        record("incomplete", { measurementComplete: false }),
      ],
      defaultManagerInsightFilters,
      now,
    );

    expect(result.firstResponse.denominator).toBe(1);
    expect(result.firstResponse.excluded).toBe(2);
    expect(result.routing.numerator).toBe(1);
    expect(result.measurement.excluded).toBe(1);
  });

  it("suppresses department comparison below ten eligible records while retaining counts", () => {
    const result = buildManagerInsightResult(
      Array.from({ length: 9 }, (_, index) => record(String(index))),
      defaultManagerInsightFilters,
      now,
    );

    expect(result.departmentPairs[0]).toMatchObject({
      comparisonEligible: false,
      eligibleDenominator: 9,
      warning: "Insufficient volume for comparison",
    });
  });

  it("reconciles metric and exception drill-downs to the same result", () => {
    const result = buildManagerInsightResult(
      [record("valid"), record("missed", { meaningfulResponseAt: undefined })],
      defaultManagerInsightFilters,
      now,
    );

    expect(recordsForDrilldown(result, "response-support")).toHaveLength(
      result.firstResponse.denominator,
    );
    expect(recordsForDrilldown(result, "missed-first-response")).toHaveLength(
      1,
    );
  });
});
