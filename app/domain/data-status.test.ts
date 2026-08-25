import {
  buildActionSafety,
  deriveOverallStatus,
  type DataStatusSource,
} from "./data-status";

function sources(): DataStatusSource[] {
  return [
    {
      actionImpact: "",
      details: [],
      freshness: "",
      key: "territory",
      name: "Territory",
      state: "available",
      timestamps: [],
    },
    {
      actionImpact: "",
      details: [],
      freshness: "",
      key: "directory",
      name: "Directory",
      state: "available",
      timestamps: [],
    },
    {
      actionImpact: "",
      details: [],
      freshness: "",
      key: "workflow",
      name: "Workflow",
      state: "available",
      timestamps: [],
    },
    {
      actionImpact: "",
      details: [],
      freshness: "",
      key: "notifications",
      name: "Notifications",
      state: "simulation",
      timestamps: [],
    },
    {
      actionImpact: "",
      details: [],
      freshness: "",
      key: "dynamics",
      name: "Dynamics",
      state: "not-connected",
      timestamps: [],
    },
  ];
}

describe("data status action-safety model", () => {
  it("keeps peer collaboration available when Dynamics is not connected", () => {
    const result = buildActionSafety(sources());
    expect(result.find((action) => action.label === "Send a lead")?.state).toBe(
      "available",
    );
    expect(
      result.find((action) => action.label === "Use Dynamics-backed outcomes")
        ?.state,
    ).toBe("not-connected");
  });

  it("blocks new lead sends when territory and directory versions mismatch", () => {
    const input = sources();
    input[1]!.state = "version-mismatch";
    expect(
      buildActionSafety(input).find((action) => action.label === "Send a lead")
        ?.state,
    ).toBe("temporarily-unavailable");
    expect(deriveOverallStatus(input, 0).overallState).toBe("version-mismatch");
  });

  it("does not calculate a false available summary from a partial failure", () => {
    const input = sources();
    input[2]!.state = "unavailable";
    expect(deriveOverallStatus(input, 0)).toMatchObject({
      overallState: "unavailable",
      overallTitle: "Some actions are temporarily unavailable",
    });
  });

  it("turns source exceptions into attention rather than total outage", () => {
    const input = sources();
    input[0]!.state = "attention";
    const result = deriveOverallStatus(input, 2);
    expect(result.overallState).toBe("attention");
    expect(result.overallTitle).toBe(
      "Routing available with 2 known exceptions",
    );
  });
});
