import { createFictionalDataStatusService } from "./data-status";

describe("fictional data status service", () => {
  it("returns scope-safe issues ordered by impact", async () => {
    const snapshot = await createFictionalDataStatusService().getSnapshot();
    expect(snapshot.issues.map((issue) => issue.priority)).toEqual([2, 2]);
    expect(
      snapshot.sources.find((source) => source.key === "directory")?.details,
    ).toContain("1 identity conflict is excluded from automatic routing");
    expect(JSON.stringify(snapshot)).not.toMatch(/@|\+1|customer/i);
  });

  it("uses idempotency keys to prevent duplicate reports", async () => {
    const service = createFictionalDataStatusService();
    const command = {
      category: "stale-data" as const,
      context: "North Location · Territory routing",
      description: "The routing update appears older than expected.",
      idempotencyKey: "stable-demo-command",
      sourceVersion: "displayed-demo-snapshot-v1",
    };
    const first = await service.submitReport(command);
    const second = await service.submitReport(command);
    expect(second.reportId).toBe(first.reportId);
    expect(
      second.snapshot.reports.filter((report) => report.id === first.reportId),
    ).toHaveLength(1);
  });

  it("does not mutate routing status when a report is submitted", async () => {
    const service = createFictionalDataStatusService();
    const before = await service.getSnapshot();
    const result = await service.submitReport({
      category: "ambiguous-assignment",
      context: "North Location · Uniform",
      description: "This route appears to list two representatives.",
      idempotencyKey: "no-source-mutation",
      sourceVersion: "displayed-demo-snapshot-v1",
    });
    expect(result.snapshot.sources).toEqual(before.sources);
    expect(result.snapshot.issues).toEqual(before.issues);
    expect(result.snapshot.reports).toHaveLength(before.reports.length + 1);
  });

  it("fails safely for unauthorized, stale, mismatch, and unavailable scenarios", async () => {
    await expect(
      createFictionalDataStatusService({ access: "unauthorized" }).getAccess(),
    ).resolves.toEqual({ type: "unauthorized" });
    await expect(
      createFictionalDataStatusService({ failLoad: true }).getSnapshot(),
    ).rejects.toThrow("status-unavailable");
    expect(
      (await createFictionalDataStatusService({ stale: true }).getSnapshot())
        .overallState,
    ).toBe("stale");
    expect(
      (await createFictionalDataStatusService({ mismatch: true }).getSnapshot())
        .overallState,
    ).toBe("version-mismatch");
    expect(
      (
        await createFictionalDataStatusService({
          unavailableSource: "workflow",
        }).getSnapshot()
      ).overallState,
    ).toBe("unavailable");
  });
});
