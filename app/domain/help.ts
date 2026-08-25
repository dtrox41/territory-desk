export type HelpAudience = "All users" | "Managers" | "Representatives";

export type HelpTopicGroup =
  | "Start here"
  | "Collaborate on a handoff"
  | "Notifications and reminders"
  | "Territory and people"
  | "Managers"
  | "Account and privacy";

export type HelpTopic = {
  audience: HelpAudience;
  expectedResult: string;
  group: HelpTopicGroup;
  keywords: string[];
  lastReviewed: string;
  notDo: string;
  prerequisites: string[];
  problems: string[];
  purpose: string;
  relatedSlugs: string[];
  recommended: boolean;
  slug: string;
  steps: string[];
  summary: string;
  title: string;
  version: string;
};

export type HelpRequestType = "application-problem" | "product-suggestion";

export type HelpRequestStatus =
  | "Submitted"
  | "Acknowledged"
  | "Under review"
  | "Resolved"
  | "Closed — no application change"
  | "Planned"
  | "Not planned"
  | "Delivered"
  | "Withdrawn";

export type HelpRequest = {
  category: string;
  id: string;
  lastUpdate: string;
  reporterVisibleNote?: string;
  routingState: "Routed" | "Routing delayed";
  status: HelpRequestStatus;
  submittedAt: string;
  summary: string;
  type: HelpRequestType;
};

export type SafeDiagnostic = {
  label: string;
  optional: boolean;
  value: string;
};

export type HelpSnapshot = {
  appVersion: string;
  environment: "Fictional prototype";
  requests: HelpRequest[];
  safeDiagnostics: SafeDiagnostic[];
  topics: HelpTopic[];
};

export const helpTopicGroups: HelpTopicGroup[] = [
  "Start here",
  "Collaborate on a handoff",
  "Notifications and reminders",
  "Territory and people",
  "Managers",
  "Account and privacy",
];

export const applicationCategoryLabels = {
  accessibility: "Accessibility",
  action: "Action or control",
  "data-display": "Data display",
  notification: "Notification display",
  other: "Other application problem",
  "page-load": "Page load",
  performance: "Performance",
  save: "Save result",
} as const;

export const applicationImpactLabels = {
  blocked: "Blocked",
  confusing: "Confusing",
  limited: "Limited",
  minor: "Minor",
} as const;

export const suggestionAreaLabels = {
  data: "Data Status",
  directory: "Directory",
  help: "Help",
  home: "Home",
  insights: "Manager Insights",
  leads: "Leads",
  notifications: "Notifications",
  other: "Other",
  profile: "Profile",
  send: "Send Lead",
  territory: "Territory",
} as const;

export const suggestionFrequencyLabels = {
  "every-time": "Every time",
  "first-time": "First time",
  often: "Often",
  sometimes: "Sometimes",
} as const;

export const suggestionImpactLabels = {
  accessibility: "Improves accessibility",
  collaboration: "Improves collaboration",
  mistakes: "Reduces mistakes",
  other: "Other",
  routing: "Improves routing",
  time: "Saves time",
} as const;

function normalized(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export function searchHelpTopics(topics: HelpTopic[], rawQuery: string) {
  const query = normalized(rawQuery);
  if (query.length < 2) return topics.filter((topic) => topic.recommended);

  return topics
    .map((topic) => {
      const title = normalized(topic.title);
      const keywords = topic.keywords.map(normalized);
      const body = normalized(`${topic.summary} ${topic.purpose}`);
      const score =
        title === query
          ? 0
          : keywords.includes(query)
            ? 1
            : title.startsWith(query)
              ? 2
              : title.includes(query)
                ? 3
                : keywords.some((keyword) => keyword.includes(query))
                  ? 4
                  : body.includes(query)
                    ? 5
                    : Number.POSITIVE_INFINITY;
      return { score, topic };
    })
    .filter(({ score }) => Number.isFinite(score))
    .sort(
      (left, right) =>
        left.score - right.score ||
        left.topic.title.localeCompare(right.topic.title),
    )
    .map(({ topic }) => topic);
}

const prohibitedPatterns = [
  /\bpassword\b/i,
  /\b(one[- ]?time|authentication|recovery) code\b/i,
  /\b(access|auth|bearer|refresh) token\b/i,
  /\bcookie\b/i,
  /\bcustomer(?:'s)? (?:name|phone|email|address)\b/i,
  /https?:\/\//i,
];

export function containsProhibitedHelpContent(...values: string[]) {
  return values.some((value) =>
    prohibitedPatterns.some((pattern) => pattern.test(value)),
  );
}

export function isApplicationStatus(status: HelpRequestStatus) {
  return [
    "Submitted",
    "Acknowledged",
    "Under review",
    "Resolved",
    "Closed — no application change",
    "Withdrawn",
  ].includes(status);
}
