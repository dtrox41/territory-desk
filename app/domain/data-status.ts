export type DataSourceKey =
  "territory" | "directory" | "workflow" | "notifications" | "dynamics";

export type DataSourceState =
  | "available"
  | "attention"
  | "stale"
  | "unavailable"
  | "version-mismatch"
  | "not-connected"
  | "simulation";

export type ActionSafetyState =
  | "available"
  | "available-with-exceptions"
  | "read-only"
  | "temporarily-unavailable"
  | "not-connected"
  | "simulation-only";

export type DataTimestamp = {
  label:
    | "Source updated"
    | "Imported"
    | "Validated"
    | "Last verified"
    | "Last refreshed"
    | "Status checked";
  value: string;
};

export type DataStatusSource = {
  actionImpact: string;
  details: string[];
  freshness: string;
  key: DataSourceKey;
  name: string;
  state: DataSourceState;
  timestamps: DataTimestamp[];
  version?: string;
};

export type DataStatusIssue = {
  affectedCapability: string;
  category: string;
  confirmedAt: string;
  context: string;
  detectedAt: string;
  id: string;
  priority: 1 | 2 | 3 | 4 | 5;
  source: DataSourceKey;
  status: "Acknowledged" | "Under review";
  workaround: string;
};

export type DataReportCategory =
  | "wrong-representative"
  | "missing-assignment"
  | "ambiguous-assignment"
  | "incorrect-service"
  | "location-issue"
  | "representative-outdated"
  | "stale-data"
  | "other";

export type DataStatusReport = {
  category: DataReportCategory;
  context: string;
  id: string;
  lastUpdate: string;
  resolution?: string;
  status:
    | "Submitted"
    | "Acknowledged"
    | "Under review"
    | "Resolved"
    | "Closed — no source change";
  submittedAt: string;
};

export type ActionSafety = {
  detail: string;
  label: string;
  state: ActionSafetyState;
};

export type DataStatusSnapshot = {
  actions: ActionSafety[];
  checkedAt: string;
  issues: DataStatusIssue[];
  overallDetail: string;
  overallState: Exclude<DataSourceState, "not-connected" | "simulation">;
  overallTitle: string;
  reports: DataStatusReport[];
  scopeLabel: string;
  sources: DataStatusSource[];
};

function sourceState(sources: DataStatusSource[], key: DataSourceKey) {
  return sources.find((source) => source.key === key)?.state ?? "unavailable";
}

export function buildActionSafety(sources: DataStatusSource[]): ActionSafety[] {
  const territory = sourceState(sources, "territory");
  const directory = sourceState(sources, "directory");
  const workflow = sourceState(sources, "workflow");
  const notifications = sourceState(sources, "notifications");
  const dynamics = sourceState(sources, "dynamics");
  const routingMismatch =
    territory === "version-mismatch" || directory === "version-mismatch";
  const routingDown = ["stale", "unavailable"].includes(territory);
  const directoryDown = ["stale", "unavailable"].includes(directory);

  return [
    {
      detail: routingDown
        ? "A current routing version is required before searching again."
        : territory === "attention"
          ? "Search is available; affected results display a routing warning."
          : "Validated territory routing is available.",
      label: "Search territories",
      state: routingDown
        ? "temporarily-unavailable"
        : territory === "attention"
          ? "available-with-exceptions"
          : "available",
    },
    {
      detail: directoryDown
        ? "The directory cannot safely confirm routing eligibility."
        : directory === "attention"
          ? "Directory is available; one identity conflict is flagged."
          : "Validated representative profiles are available.",
      label: "Choose a representative",
      state: directoryDown
        ? "temporarily-unavailable"
        : directory === "attention"
          ? "available-with-exceptions"
          : "available",
    },
    {
      detail: routingMismatch
        ? "New sends are blocked until territory and directory versions agree."
        : routingDown || directoryDown || workflow === "unavailable"
          ? "Required routing or workflow checks are unavailable."
          : territory === "attention" || directory === "attention"
            ? "Send is available only for records without a routing warning."
            : "New peer handoffs can be validated and sent.",
      label: "Send a lead",
      state:
        routingMismatch ||
        routingDown ||
        directoryDown ||
        workflow === "unavailable"
          ? "temporarily-unavailable"
          : territory === "attention" || directory === "attention"
            ? "available-with-exceptions"
            : "available",
    },
    {
      detail:
        workflow === "unavailable"
          ? "Loaded information remains readable; updates require reconnection."
          : workflow === "stale"
            ? "Review is available, but changes require a current workflow check."
            : "Existing peer handoffs can be updated.",
      label: "Update an existing lead",
      state:
        workflow === "unavailable" || workflow === "stale"
          ? "read-only"
          : "available",
    },
    {
      detail:
        notifications === "unavailable"
          ? "Open My Work directly until alerts recover."
          : "New in-app alerts and read state are available.",
      label: "Receive in-app alerts",
      state:
        notifications === "unavailable"
          ? "temporarily-unavailable"
          : "available",
    },
    {
      detail:
        "Prototype records delivery intent only; no carrier text is sent.",
      label: "Send Territory Desk SMS alerts",
      state: "simulation-only",
    },
    {
      detail:
        dynamics === "not-connected"
          ? "Peer handoffs remain separate from corporate Dynamics leads."
          : "Dynamics-backed outcomes are available.",
      label: "Use Dynamics-backed outcomes",
      state: dynamics === "not-connected" ? "not-connected" : "available",
    },
  ];
}

export function deriveOverallStatus(
  sources: DataStatusSource[],
  issueCount: number,
): Pick<DataStatusSnapshot, "overallDetail" | "overallState" | "overallTitle"> {
  const core = sources.filter((source) => source.key !== "dynamics");
  if (core.some((source) => source.state === "version-mismatch"))
    return {
      overallDetail:
        "Search may remain available, but new lead routing is blocked until source versions agree.",
      overallState: "version-mismatch",
      overallTitle: "Routing versions do not match",
    };
  if (core.some((source) => source.state === "unavailable"))
    return {
      overallDetail:
        "At least one core action cannot be validated. Independently validated information remains visible.",
      overallState: "unavailable",
      overallTitle: "Some actions are temporarily unavailable",
    };
  if (core.some((source) => source.state === "stale"))
    return {
      overallDetail:
        "Last validated information is visible, but affected writes require a current source check.",
      overallState: "stale",
      overallTitle: "A core source needs refresh",
    };
  if (issueCount > 0 || core.some((source) => source.state === "attention"))
    return {
      overallDetail:
        "Core Territory Desk actions are available for records without a displayed exception.",
      overallState: "attention",
      overallTitle: `Routing available with ${issueCount} known ${issueCount === 1 ? "exception" : "exceptions"}`,
    };
  return {
    overallDetail:
      "All core Territory Desk actions passed their current validation checks.",
    overallState: "available",
    overallTitle: "Core actions are available",
  };
}

export const dataSourceStateLabels: Record<DataSourceState, string> = {
  attention: "Attention needed",
  available: "Available",
  "not-connected": "Not connected",
  simulation: "Simulation only",
  stale: "Stale",
  unavailable: "Unavailable",
  "version-mismatch": "Version mismatch",
};

export const actionStateLabels: Record<ActionSafetyState, string> = {
  available: "Available",
  "available-with-exceptions": "Available with exceptions",
  "not-connected": "Not connected",
  "read-only": "Read only",
  "simulation-only": "Simulation only",
  "temporarily-unavailable": "Temporarily unavailable",
};

export const reportCategoryLabels: Record<DataReportCategory, string> = {
  "ambiguous-assignment": "Duplicate or ambiguous assignment",
  "incorrect-service": "Incorrect department, division, or service",
  "location-issue": "ZIP, city, state, or location issue",
  "missing-assignment": "Missing or open assignment",
  other: "Other",
  "representative-outdated":
    "Representative inactive or contact information outdated",
  "stale-data": "Data appears stale",
  "wrong-representative": "Wrong representative",
};
