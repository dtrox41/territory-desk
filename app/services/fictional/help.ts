import type {
  HelpAudience,
  HelpRequest,
  HelpTopic,
  HelpTopicGroup,
} from "../../domain/help";
import type {
  HelpService,
  SubmitApplicationProblemCommand,
  SubmitSuggestionCommand,
} from "../help-service";

type HelpOptions = {
  access?: "authorized" | "unauthorized";
  failLoad?: boolean;
  failSubmit?: boolean;
  manager?: boolean;
  requestOwner?: "current" | "other";
  routingDelayed?: boolean;
  unknownSubmit?: boolean;
};

type TopicSeed = {
  audience?: HelpAudience;
  group: HelpTopicGroup;
  keywords: string[];
  recommended?: boolean;
  slug: string;
  summary: string;
  title: string;
};

const topicSeeds: TopicSeed[] = [
  {
    group: "Start here",
    keywords: ["Dynamics", "purpose", "overview"],
    recommended: true,
    slug: "territory-desk-and-dynamics",
    summary:
      "Understand the peer-handoff work owned by Territory Desk and what remains in Dynamics 365.",
    title: "What Territory Desk does—and what remains in Dynamics 365",
  },
  {
    group: "Start here",
    keywords: ["ZIP", "city", "rep", "lookup"],
    recommended: true,
    slug: "find-territory-representative",
    summary: "Find a validated territory and its eligible representative.",
    title: "Find the correct territory and representative",
  },
  {
    group: "Start here",
    keywords: ["send", "send a lead", "handoff", "cross department"],
    recommended: true,
    slug: "send-cross-department-lead",
    summary:
      "Create a privacy-safe handoff to an eligible new-business representative.",
    title: "Send a cross-department lead",
  },
  {
    group: "Start here",
    keywords: ["accept", "decline", "need information", "respond"],
    recommended: true,
    slug: "respond-to-lead",
    summary: "Choose the response that accurately reflects the next action.",
    title: "Respond with Accept, Need Information, or Decline",
  },
  {
    group: "Start here",
    keywords: ["ownership", "status", "action required"],
    recommended: true,
    slug: "ownership-status-action-required",
    summary: "Distinguish who owns the next action from the lead's status.",
    title: "Understand ownership, status, and Action Required",
  },
  {
    group: "Collaborate on a handoff",
    keywords: ["next action", "follow up", "reminder"],
    slug: "next-action-follow-up",
    summary: "Record the next commitment and an in-app follow-up reminder.",
    title: "Add a next action and follow-up",
  },
  {
    group: "Collaborate on a handoff",
    keywords: ["progress", "activity", "status"],
    slug: "record-progress-safely",
    summary:
      "Add factual progress without triggering an unintended status change.",
    title: "Record progress without changing status accidentally",
  },
  {
    group: "Collaborate on a handoff",
    keywords: ["appointment", "outcome", "complete"],
    slug: "appointment-final-outcome",
    summary: "Record an appointment or final outcome through its review step.",
    title: "Set an appointment or final outcome",
  },
  {
    group: "Collaborate on a handoff",
    keywords: ["history", "correction", "audit"],
    slug: "activity-history-corrections",
    summary: "Read the append-only history and add a visible correction.",
    title: "Understand activity history and corrections",
  },
  {
    group: "Collaborate on a handoff",
    keywords: ["copy", "department", "opportunity"],
    slug: "copy-opportunity-department",
    summary:
      "Start a separate department handoff without overwriting the original.",
    title: "Copy an existing opportunity to another department safely",
  },
  {
    group: "Notifications and reminders",
    keywords: ["bell", "badge", "unread"],
    slug: "bell-versus-leads-badge",
    summary: "Know the difference between event history and required work.",
    title: "Understand the notification bell versus the Leads badge",
  },
  {
    group: "Notifications and reminders",
    keywords: ["SMS", "text", "alert"],
    slug: "in-app-versus-sms",
    summary: "Understand the fictional in-app and simulated SMS channels.",
    title: "Understand in-app alerts versus Territory Desk SMS",
  },
  {
    group: "Notifications and reminders",
    keywords: ["read", "notification", "status"],
    slug: "mark-notification-read",
    summary: "Clear an alert without changing its lead or next action.",
    title: "Mark a notification read without changing the lead",
  },
  {
    group: "Notifications and reminders",
    keywords: ["follow-up", "reminder", "due"],
    slug: "choose-follow-up-reminder",
    summary: "Choose an in-app reminder tied to an approved follow-up.",
    title: "Choose an in-app follow-up reminder",
  },
  {
    group: "Notifications and reminders",
    keywords: ["calendar", "Outlook", "privacy"],
    slug: "calendar-snapshot",
    summary:
      "Prepare a privacy-safe calendar snapshot without live integration.",
    title: "Add a privacy-safe calendar snapshot",
  },
  {
    group: "Territory and people",
    keywords: ["ZIP", "city", "search"],
    slug: "search-zip-city",
    summary: "Use a five-digit ZIP or city and state to find a territory.",
    title: "Search by ZIP or city",
  },
  {
    group: "Territory and people",
    keywords: ["ambiguous", "open", "unassigned"],
    slug: "ambiguous-open-territory",
    summary: "Stop safely when routing cannot identify one eligible owner.",
    title: "Handle an ambiguous or open territory",
  },
  {
    group: "Territory and people",
    keywords: ["directory", "territory lookup", "people"],
    slug: "directory-versus-territory",
    summary:
      "Choose the right lookup based on whether you know the place or person.",
    title: "Use Directory versus Territory Lookup",
  },
  {
    group: "Territory and people",
    keywords: ["wrong", "incorrect", "employee", "territory"],
    slug: "report-incorrect-data",
    summary: "Send a source-aware correction report through Data Status.",
    title: "Report incorrect territory or employee information",
  },
  {
    group: "Territory and people",
    keywords: ["updated", "validated", "verified", "refreshed"],
    slug: "data-date-definitions",
    summary: "Interpret the dates that describe source and workflow freshness.",
    title:
      "Understand source updated, validated, verified, and refreshed dates",
  },
  {
    audience: "Managers",
    group: "Managers",
    keywords: ["my work", "team insights", "manager"],
    slug: "my-work-versus-team-insights",
    summary: "Keep individual action queues separate from team-level patterns.",
    title: "Understand My Work versus Team Insights",
  },
  {
    audience: "Managers",
    group: "Managers",
    keywords: ["missed response", "open loop", "overdue"],
    slug: "missed-responses-open-loops",
    summary:
      "Review actionable exceptions without turning insights into surveillance.",
    title: "Review missed responses and open loops",
  },
  {
    audience: "Managers",
    group: "Managers",
    keywords: ["KPI", "denominator", "metric"],
    slug: "workflow-kpis",
    summary: "Read each workflow metric with its scope and denominator.",
    title: "Interpret workflow KPIs and denominators",
  },
  {
    audience: "Managers",
    group: "Managers",
    keywords: ["reassign", "reason", "manager"],
    slug: "reassign-handoff",
    summary: "Use the audited reassignment flow and give a factual reason.",
    title: "Reassign a handoff with a reason",
  },
  {
    audience: "Managers",
    group: "Managers",
    keywords: ["scope", "privacy", "sample"],
    slug: "scope-small-samples",
    summary: "Understand authorized scope and protected small-sample results.",
    title: "Understand authorized scope and small-sample safeguards",
  },
  {
    group: "Account and privacy",
    keywords: ["profile", "timezone", "identity"],
    slug: "verify-profile-timezone",
    summary: "Confirm the identity, work scope, and timezone used by the app.",
    title: "Verify My Profile and work timezone",
  },
  {
    group: "Account and privacy",
    keywords: ["source controlled", "editable", "preference"],
    slug: "source-controlled-editable",
    summary:
      "Know which profile values are authoritative and which preference is editable.",
    title: "Understand source-controlled versus editable information",
  },
  {
    group: "Account and privacy",
    keywords: ["personal phone", "privacy", "customer"],
    slug: "protect-information-phone",
    summary:
      "Keep customer and employee information out of device storage and support forms.",
    title: "Protect customer information on a personal smartphone",
  },
  {
    group: "Account and privacy",
    keywords: ["sign out", "clear", "session"],
    slug: "sign-out-clear-session",
    summary: "End the session and clear session-held information safely.",
    title: "Sign out and clear session-held data",
  },
  {
    group: "Account and privacy",
    keywords: ["sign in", "role", "scope", "access"],
    slug: "account-access",
    summary:
      "Choose the correct recovery path for identity, role, or scope problems.",
    title: "Get sign-in or access help",
  },
];

function buildTopic(seed: TopicSeed): HelpTopic {
  const specialSteps: Record<string, string[]> = {
    "account-access": [
      "If you cannot sign in or see the wrong identity, select Get Sign-In Help.",
      "If you are signed in but a representative or manager role is missing, review My Profile.",
      "Select Report Access Problem; do not use Suggest an Improvement.",
      "Never provide a password, one-time code, token, or recovery code.",
    ],
    "find-territory-representative": [
      "Open Territory Lookup.",
      "Enter a five-digit ZIP or a city and state, then select Search.",
      "Review the data-status and routing warnings before using the result.",
      "Open the eligible representative or select Send Lead.",
    ],
    "report-incorrect-data": [
      "Open Data Status.",
      "Choose the affected source and select Report Incorrect Information.",
      "Enter only a short factual description without customer information.",
      "Review the report in My Submitted Reports; the active source continues to control routing.",
    ],
    "send-cross-department-lead": [
      "Open Send Lead from Home, Territory Lookup, or Directory.",
      "Confirm the territory and receiving representative are validated.",
      "Enter only the approved minimum handoff information and a clear next action.",
      "Review the receiving department, representative, and alert choices.",
      "Select Send Lead once and wait for the committed tracking reference.",
    ],
    "territory-desk-and-dynamics": [
      "Use Territory Desk for cross-department peer handoffs, feedback, and follow-ups.",
      "Continue using Dynamics 365 for the corporate lead records and processes shown there.",
      "Treat the two systems as separate until an approved integration and reconciliation process exists.",
      "Review Data Status before relying on any future Dynamics-backed result.",
    ],
  };
  return {
    audience: seed.audience ?? "All users",
    expectedResult: `You can complete “${seed.title}” without bypassing ownership, privacy, or review controls.`,
    group: seed.group,
    keywords: seed.keywords,
    lastReviewed: "August 24, 2026",
    notDo:
      "This guidance does not change a lead, grant access, correct a source record, or contact another representative automatically.",
    prerequisites: [
      "An authorized fictional Territory Desk session",
      "A current connection for any save or submission action",
    ],
    problems: [
      "If the displayed data is incorrect, use Data Status instead of working around it.",
      "If an action is unavailable, preserve your work and retry only after the app confirms a safe state.",
    ],
    purpose: seed.summary,
    relatedSlugs: ["territory-desk-and-dynamics", "account-access"].filter(
      (slug) => slug !== seed.slug,
    ),
    recommended: seed.recommended ?? false,
    slug: seed.slug,
    steps: specialSteps[seed.slug] ?? [
      `Open the relevant Territory Desk screen for ${seed.title.toLocaleLowerCase()}.`,
      "Review the displayed scope, status, and any Action Required explanation.",
      "Choose the explicit action and review its result before continuing.",
      "Use Activity History or the relevant status screen to confirm the result.",
    ],
    summary: seed.summary,
    title: seed.title,
    version: "Territory Desk demo 0.1",
  };
}

const baseTopics = topicSeeds.map(buildTopic);

const baseRequests: HelpRequest[] = [
  {
    category: "Accessibility",
    id: "HELP-DEMO-K8V4",
    lastUpdate: "August 24, 2026 at 8:35 AM CT",
    reporterVisibleNote:
      "The keyboard focus issue is reproduced in the fictional preview and is under review.",
    routingState: "Routed",
    status: "Under review",
    submittedAt: "August 23, 2026 at 2:18 PM CT",
    summary: "Keyboard focus is unclear after closing the filter panel",
    type: "application-problem",
  },
  {
    category: "Send Lead",
    id: "IDEA-DEMO-M3Q9",
    lastUpdate: "August 22, 2026 at 11:12 AM CT",
    reporterVisibleNote:
      "The product owner is reviewing this workflow problem. No feature commitment has been made.",
    routingState: "Routed",
    status: "Under review",
    submittedAt: "August 20, 2026 at 4:05 PM CT",
    summary: "Make the receiving department easier to confirm before send",
    type: "product-suggestion",
  },
  {
    category: "Save result",
    id: "HELP-DEMO-R7T2",
    lastUpdate: "August 19, 2026 at 9:40 AM CT",
    reporterVisibleNote:
      "The fictional confirmation wording was updated and this request is resolved.",
    routingState: "Routed",
    status: "Resolved",
    submittedAt: "August 18, 2026 at 3:22 PM CT",
    summary: "Saved follow-up confirmation was difficult to notice",
    type: "application-problem",
  },
];

function cloneRequests(requests: HelpRequest[]) {
  return structuredClone(requests).sort((left, right) =>
    right.lastUpdate.localeCompare(left.lastUpdate),
  );
}

export function createFictionalHelpService(
  options: HelpOptions = {},
): HelpService {
  const requests = structuredClone(baseRequests);
  const completed = new Map<string, string>();

  function lookupRequest(requestId: string) {
    if (options.requestOwner === "other")
      return { type: "unavailable" as const };
    const request = requests.find((item) => item.id === requestId);
    return request
      ? { request: structuredClone(request), type: "found" as const }
      : { type: "unavailable" as const };
  }

  function save(
    idempotencyKey: string,
    input: Pick<HelpRequest, "category" | "summary" | "type">,
  ) {
    if (options.failSubmit) throw new Error("request-not-submitted");
    const priorId = completed.get(idempotencyKey);
    if (priorId) {
      const prior = requests.find((request) => request.id === priorId);
      if (prior)
        return { request: structuredClone(prior), type: "saved" as const };
    }
    if (options.unknownSubmit) return { type: "unknown" as const };
    const prefix = input.type === "application-problem" ? "HELP" : "IDEA";
    const request: HelpRequest = {
      ...input,
      id: `${prefix}-DEMO-${1200 + requests.length}`,
      lastUpdate: "August 24, 2026 at 9:32 AM CT",
      reporterVisibleNote:
        input.type === "application-problem"
          ? "Fictional request saved. No real support team was contacted."
          : "Fictional suggestion received. This is not a feature commitment.",
      routingState: options.routingDelayed ? "Routing delayed" : "Routed",
      status: "Submitted",
      submittedAt: "August 24, 2026 at 9:32 AM CT",
    };
    requests.unshift(request);
    completed.set(idempotencyKey, request.id);
    return { request: structuredClone(request), type: "saved" as const };
  }

  return {
    async getAccess() {
      await Promise.resolve();
      return options.access === "unauthorized"
        ? { type: "unauthorized" as const }
        : {
            manager: options.manager ?? true,
            reporterId: "fictional-current-reporter",
            type: "authorized" as const,
          };
    },
    async getRequest(requestId) {
      await Promise.resolve();
      return lookupRequest(requestId);
    },
    async getSnapshot() {
      await Promise.resolve();
      if (options.failLoad) throw new Error("help-unavailable");
      const manager = options.manager ?? true;
      return {
        appVersion: "0.1.0-demo",
        environment: "Fictional prototype" as const,
        requests: cloneRequests(requests),
        safeDiagnostics: [
          {
            label: "Application version",
            optional: false,
            value: "0.1.0-demo",
          },
          {
            label: "Environment",
            optional: false,
            value: "Fictional prototype",
          },
          { label: "Route template", optional: true, value: "help" },
          { label: "Work timezone", optional: true, value: "Central Time" },
          {
            label: "Device category",
            optional: true,
            value: "Responsive web browser",
          },
          { label: "Connection state", optional: true, value: "Online" },
        ],
        topics: structuredClone(
          baseTopics.filter(
            (topic) => topic.audience !== "Managers" || manager,
          ),
        ),
      };
    },
    async getTopic(topicSlug) {
      await Promise.resolve();
      const topic = baseTopics.find((item) => item.slug === topicSlug);
      if (
        !topic ||
        (topic.audience === "Managers" && options.manager === false)
      )
        return {
          replacementSlugs: [
            "territory-desk-and-dynamics",
            "find-territory-representative",
          ],
          type: "unavailable" as const,
        };
      return { topic: structuredClone(topic), type: "found" as const };
    },
    async reopenProblem(requestId, idempotencyKey) {
      await Promise.resolve();
      const source = requests.find(
        (request) =>
          request.id === requestId &&
          request.type === "application-problem" &&
          ["Resolved", "Closed — no application change"].includes(
            request.status,
          ),
      );
      if (!source) return { type: "unknown" as const };
      return save(idempotencyKey, {
        category: source.category,
        summary: `Problem still occurring: ${source.summary}`,
        type: "application-problem",
      });
    },
    async submitApplicationProblem(command: SubmitApplicationProblemCommand) {
      await Promise.resolve();
      return save(command.idempotencyKey, {
        category:
          command.category === "other"
            ? "Other application problem"
            : command.category,
        summary: command.summary,
        type: "application-problem",
      });
    },
    async submitSuggestion(command: SubmitSuggestionCommand) {
      await Promise.resolve();
      return save(command.idempotencyKey, {
        category: command.area,
        summary: command.problem,
        type: "product-suggestion",
      });
    },
    async withdrawRequest(requestId) {
      await Promise.resolve();
      const request = requests.find((item) => item.id === requestId);
      if (
        !request ||
        !["Submitted", "Acknowledged", "Under review"].includes(request.status)
      )
        return { type: "unavailable" as const };
      request.status = "Withdrawn";
      request.lastUpdate = "August 24, 2026 at 9:35 AM CT";
      request.reporterVisibleNote =
        "You withdrew this fictional request. Its existing history was preserved.";
      return { request: structuredClone(request), type: "found" as const };
    },
  };
}

export const fictionalHelpService = createFictionalHelpService();
