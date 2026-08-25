import { createFictionalHelpService } from "./help";

describe("fictional help service", () => {
  it("keeps manager topics permission-aware", async () => {
    const representative = createFictionalHelpService({ manager: false });
    const snapshot = await representative.getSnapshot();
    expect(snapshot.topics).not.toContainEqual(
      expect.objectContaining({ audience: "Managers" }),
    );
    expect(await representative.getTopic("workflow-kpis")).toEqual(
      expect.objectContaining({ type: "unavailable" }),
    );
  });

  it("returns the same request for an idempotent submission", async () => {
    const service = createFictionalHelpService();
    const command = {
      action: "Close filters",
      category: "accessibility",
      contactAllowed: false,
      details: "",
      diagnosticLabels: [],
      idempotencyKey: "same-command",
      impact: "limited",
      screen: "Leads",
      summary: "Keyboard focus is difficult to locate after closing filters",
    };
    const first = await service.submitApplicationProblem(command);
    const second = await service.submitApplicationProblem(command);
    expect(first).toEqual(second);
    expect((await service.getSnapshot()).requests).toHaveLength(4);
  });

  it("does not reveal a request owned by another reporter", async () => {
    const service = createFictionalHelpService({ requestOwner: "other" });
    expect(await service.getRequest("HELP-DEMO-K8V4")).toEqual({
      type: "unavailable",
    });
  });

  it("preserves a saved request when routing is delayed", async () => {
    const service = createFictionalHelpService({ routingDelayed: true });
    const result = await service.submitSuggestion({
      area: "help",
      contactAllowed: false,
      frequency: "often",
      idempotencyKey: "idea-1",
      impact: "time",
      problem: "Finding handoff instructions currently takes too many steps",
      suggestion: "",
    });
    expect(result).toEqual(
      expect.objectContaining({
        request: expect.objectContaining({ routingState: "Routing delayed" }),
        type: "saved",
      }),
    );
  });
});
