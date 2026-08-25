export const reminderOptions = [
  { label: "At due time", value: "at-due-time" },
  { label: "15 minutes before", value: "15-minutes-before" },
  { label: "One hour before", value: "one-hour-before" },
  { label: "One day before", value: "one-day-before" },
  { label: "No extra reminder", value: "none" },
] as const;

export type ReminderLeadTime = (typeof reminderOptions)[number]["value"];

export type ProfileAccessRole = {
  description: string;
  label: "Manager access" | "Representative access";
};

export type ProfileSnapshot = {
  accessState: "active" | "access-changed" | "inactive" | "needs-review";
  accountStatus: string;
  authenticationMethod: string;
  currentRepresentativeId: string;
  department: string;
  directoryStatus: string;
  displayName: string;
  divisions: string[];
  inAppChannel: "available" | "delayed" | "unavailable" | "status-unavailable";
  lastAuthenticatedAt: string;
  lastRefreshedAt: string;
  lastVerifiedAt: string;
  location: string;
  managerScope?: string;
  maskedEmail: string;
  maskedSmsDestination: string;
  preferenceState: "available" | "unavailable";
  preference: {
    defaultReminderLeadTime: ReminderLeadTime;
    updatedAt: string;
    version: number;
  };
  roles: ProfileAccessRole[];
  routing: {
    assignmentCount: number;
    context: string;
    regions: string[];
    sourceVersion: string;
    state: "available" | "needs-review" | "version-mismatch";
  };
  smsChannel:
    | "available"
    | "needs-verification"
    | "not-configured"
    | "simulation-only"
    | "unavailable";
  sourceUpdatedAt: string;
  workTimezone: string;
};

export const profileStateLabels: Record<
  ProfileSnapshot["accessState"],
  string
> = {
  active: "Active",
  "access-changed": "Access changed",
  inactive: "Inactive",
  "needs-review": "Needs review",
};

export const channelStateLabels = {
  available: "Available",
  delayed: "Delayed",
  "needs-verification": "Needs verification",
  "not-configured": "Not configured",
  "simulation-only": "Simulation only",
  unavailable: "Unavailable",
  "status-unavailable": "Status unavailable",
} as const;

export function reminderLabel(value: ReminderLeadTime) {
  return (
    reminderOptions.find((option) => option.value === value)?.label ??
    "Not provided"
  );
}

export function initials(displayName: string) {
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
