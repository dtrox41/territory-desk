import {
  buildActionSafety,
  deriveOverallStatus,
  type DataStatusIssue,
  type DataStatusReport,
  type DataStatusSource,
} from "../../domain/data-status";
import type {
  DataStatusService,
  SubmitDataReportCommand,
} from "../data-status-service";

type DataStatusOptions = {
  access?: "authorized" | "unauthorized";
  failLoad?: boolean;
  failReport?: boolean;
  mismatch?: boolean;
  stale?: boolean;
  unavailableSource?: "territory" | "directory" | "workflow" | "notifications";
};

const sourceTimes = [
  { label: "Source updated" as const, value: "August 23, 2026 at 6:00 PM CT" },
  { label: "Imported" as const, value: "August 23, 2026 at 6:12 PM CT" },
  { label: "Validated" as const, value: "August 23, 2026 at 6:14 PM CT" },
];

const baseSources: DataStatusSource[] = [
  {
    actionImpact: "Search and new lead routing",
    details: [
      "1,238 of 1,240 fictional assignments validated (99.8%)",
      "2 ambiguous assignments need review",
      "City aliases are recognized and shown with the canonical result",
    ],
    freshness: "Target: validated within 7 days",
    key: "territory",
    name: "Territory routing",
    state: "attention",
    timestamps: [
      ...sourceTimes,
      { label: "Last verified", value: "August 22, 2026 at 3:30 PM CT" },
    ],
    version: "Demo routing v12",
  },
  {
    actionImpact: "Representative selection and routing eligibility",
    details: [
      "71 of 72 fictional profiles have complete routing identity (98.6%)",
      "1 identity conflict is excluded from automatic routing",
      "Compatible with Demo routing v12",
    ],
    freshness: "Target: validated within 7 days",
    key: "directory",
    name: "Representative directory",
    state: "attention",
    timestamps: [
      ...sourceTimes,
      { label: "Last verified", value: "Not yet verified" },
    ],
    version: "Demo directory v12",
  },
  {
    actionImpact: "Peer handoffs, responses, follow-ups, and insights",
    details: [
      "New writes and updates are available",
      "Latest fictional workflow event validated",
      "Manager insight calculations are current",
    ],
    freshness: "Target: refreshed within 15 minutes",
    key: "workflow",
    name: "Territory Desk workflow data",
    state: "available",
    timestamps: [
      { label: "Last refreshed", value: "August 24, 2026 at 9:12 AM CT" },
      { label: "Validated", value: "August 24, 2026 at 9:12 AM CT" },
    ],
    version: "Demo workflow v6",
  },
  {
    actionImpact: "Lead alerts and delivery confirmation",
    details: [
      "In-app notifications: Available",
      "Territory Desk SMS: Simulation only — no carrier text is sent",
      "A simulated SMS result never changes whether a lead was submitted",
    ],
    freshness: "Service check target: 15 minutes",
    key: "notifications",
    name: "Notification channels",
    state: "simulation",
    timestamps: [
      { label: "Status checked", value: "August 24, 2026 at 9:15 AM CT" },
    ],
  },
  {
    actionImpact: "Dynamics-backed outcomes and reconciliation",
    details: [
      "Territory Desk peer handoffs remain separate from corporate Dynamics leads",
      "Dynamics-backed outcomes and reconciliation are unavailable",
      "No Azure configuration or credentials are requested",
    ],
    freshness: "No connection configured",
    key: "dynamics",
    name: "Dynamics 365 connection",
    state: "not-connected",
    timestamps: [{ label: "Last refreshed", value: "Not provided" }],
  },
];

const baseIssues: DataStatusIssue[] = [
  {
    affectedCapability: "Could route a new lead to the wrong person",
    category: "Ambiguous territory assignment",
    confirmedAt: "August 24, 2026 at 8:45 AM CT",
    context: "North Location · Uniform · 2 routing groups",
    detectedAt: "August 22, 2026 at 4:20 PM CT",
    id: "demo-issue-routing-002",
    priority: 2,
    source: "territory",
    status: "Under review",
    workaround:
      "Search remains available. Do not send when the result displays an ambiguous-routing warning.",
  },
  {
    affectedCapability: "Representative selection",
    category: "Representative identity conflict",
    confirmedAt: "August 23, 2026 at 2:10 PM CT",
    context: "North Location · Facility Services · 1 profile",
    detectedAt: "August 23, 2026 at 11:35 AM CT",
    id: "demo-issue-directory-001",
    priority: 2,
    source: "directory",
    status: "Acknowledged",
    workaround:
      "The affected profile is excluded from automatic routing. Use another validated representative.",
  },
];

const baseReports: DataStatusReport[] = [
  {
    category: "location-issue",
    context: "North Location · Territory routing",
    id: "DQ-DEMO-1042",
    lastUpdate: "August 24, 2026 at 8:20 AM CT",
    status: "Under review",
    submittedAt: "August 23, 2026 at 3:42 PM CT",
  },
  {
    category: "representative-outdated",
    context: "North Location · Representative directory",
    id: "DQ-DEMO-1031",
    lastUpdate: "August 22, 2026 at 1:05 PM CT",
    resolution:
      "The approved directory version now reflects the corrected routing eligibility.",
    status: "Resolved",
    submittedAt: "August 20, 2026 at 10:15 AM CT",
  },
];

function cloneSources(options: DataStatusOptions) {
  return structuredClone(baseSources).map((source) => {
    if (options.mismatch && ["territory", "directory"].includes(source.key)) {
      source.state = "version-mismatch";
      if (source.key === "directory") source.version = "Demo directory v11";
    }
    if (options.stale && source.key === "territory") source.state = "stale";
    if (options.unavailableSource === source.key) source.state = "unavailable";
    return source;
  });
}

export function createFictionalDataStatusService(
  options: DataStatusOptions = {},
): DataStatusService {
  const reports = structuredClone(baseReports);
  const completed = new Map<string, string>();

  function snapshot() {
    const sources = cloneSources(options);
    const issues = structuredClone(baseIssues).sort(
      (a, b) =>
        a.priority - b.priority ||
        a.detectedAt.localeCompare(b.detectedAt) ||
        a.id.localeCompare(b.id),
    );
    return {
      actions: buildActionSafety(sources),
      checkedAt: "August 24, 2026 at 9:15 AM CT",
      issues,
      ...deriveOverallStatus(sources, issues.length),
      reports: structuredClone(reports),
      scopeLabel: "North Location · Uniform + Facility Services + First Aid",
      sources,
    };
  }

  return {
    async getAccess() {
      await Promise.resolve();
      return options.access === "unauthorized"
        ? { type: "unauthorized" as const }
        : {
            scopeLabel:
              "North Location · Uniform + Facility Services + First Aid",
            type: "authorized" as const,
          };
    },
    async getSnapshot() {
      await Promise.resolve();
      if (options.failLoad) throw new Error("status-unavailable");
      return snapshot();
    },
    async submitReport(command: SubmitDataReportCommand) {
      await Promise.resolve();
      if (options.failReport) throw new Error("report-not-submitted");
      const prior = completed.get(command.idempotencyKey);
      if (prior) return { reportId: prior, snapshot: snapshot() };
      const reportId = `DQ-DEMO-${1100 + reports.length}`;
      reports.unshift({
        category: command.category,
        context: command.context,
        id: reportId,
        lastUpdate: "August 24, 2026 at 9:16 AM CT",
        status: "Submitted",
        submittedAt: "August 24, 2026 at 9:16 AM CT",
      });
      completed.set(command.idempotencyKey, reportId);
      return { reportId, snapshot: snapshot() };
    },
  };
}

export const fictionalDataStatusService = createFictionalDataStatusService();
