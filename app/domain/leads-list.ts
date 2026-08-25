import type { DashboardTone } from "./home-dashboard";
import type { TerritoryDepartmentCode } from "./territory-result";

export type LeadsView =
  | "action-required"
  | "waiting"
  | "received"
  | "sent"
  | "in-progress"
  | "completed";

export type LeadListStatus =
  | "pending_acceptance"
  | "needs_information"
  | "accepted"
  | "in_progress"
  | "appointment_set"
  | "declined"
  | "won"
  | "lost"
  | "closed_not_qualified"
  | "withdrawn";

export type LeadAttentionState =
  "action_required" | "waiting" | "needs_attention" | "up_to_date" | "closed";

export type LeadActionReason =
  | "response-target-missed"
  | "follow-up-overdue"
  | "information-received"
  | "new-lead"
  | "response-needed"
  | "follow-up-due-today"
  | "next-action-missing"
  | "reassignment-pending";

export type LeadSourceDivisionCode =
  | "education-specialist"
  | "facility-services"
  | "fas-account-executive"
  | "first-aid-safety"
  | "uniform-rental";

export type LeadListParticipant = {
  department: string;
  displayName: string;
  id: string;
};

export type LeadListRecord = {
  actionReason?: LeadActionReason;
  attentionState: LeadAttentionState;
  closedAt?: string;
  closureSummary?: string;
  companyName: string;
  createdAt: string;
  currentOwner: LeadListParticipant;
  departmentCode: TerritoryDepartmentCode;
  departmentLabel: string;
  dueAt?: string;
  exactSourceDivision: string;
  hasException: boolean;
  id: string;
  latestFeedback: string;
  materialUpdatedAt: string;
  partialData?: boolean;
  primaryFollowUp?: string;
  reassignedAway?: boolean;
  requestedRecipient: LeadListParticipant;
  requiredActionAt?: string;
  requiredActionOwnerId?: string;
  sender: LeadListParticipant;
  sourceDivisionCode: LeadSourceDivisionCode;
  status: LeadListStatus;
};

export type LeadListFilters = {
  attention: LeadAttentionState | "all";
  department: TerritoryDepartmentCode | "all";
  direction: "sent" | "received" | "all";
  exception: boolean;
  period: "7d" | "30d" | "90d" | "all";
  sourceDivision: LeadSourceDivisionCode | "all";
  status: LeadListStatus | "all";
};

export type LeadListCard = LeadListRecord & {
  directionLabel: string;
  exactTimeLabel: string;
  primaryAction: string;
  rankExplanation?: string;
  relativeTimeLabel: string;
  tone: DashboardTone;
  visibleReason: string;
};

export const leadsViews: Array<{ label: string; value: LeadsView }> = [
  { label: "Action Required", value: "action-required" },
  { label: "Waiting on Others", value: "waiting" },
  { label: "Received", value: "received" },
  { label: "Sent", value: "sent" },
  { label: "In Progress", value: "in-progress" },
  { label: "Completed", value: "completed" },
];

export const leadSourceDivisionOptions: Array<{
  label: string;
  value: LeadSourceDivisionCode;
}> = [
  { label: "Education Specialist", value: "education-specialist" },
  { label: "Facility Services", value: "facility-services" },
  { label: "FAS Account Executive", value: "fas-account-executive" },
  { label: "First Aid & Safety", value: "first-aid-safety" },
  { label: "Uniform Rental", value: "uniform-rental" },
];

export const leadStatusLabels: Record<LeadListStatus, string> = {
  pending_acceptance: "Pending Acceptance",
  needs_information: "Needs Information",
  accepted: "Accepted",
  in_progress: "In Progress",
  appointment_set: "Appointment Set",
  declined: "Declined",
  won: "Won — Demo",
  lost: "Lost — Demo",
  closed_not_qualified: "Closed — Not Qualified",
  withdrawn: "Withdrawn",
};

const actionRule: Record<
  LeadActionReason,
  {
    primaryAction: string;
    rank: number;
    rankExplanation: string;
    tone: DashboardTone;
    visibleReason: string;
  }
> = {
  "response-target-missed": {
    primaryAction: "Respond Now",
    rank: 1,
    rankExplanation:
      "Ranked first because the one-business-day response target was missed.",
    tone: "danger",
    visibleReason: "Response target missed",
  },
  "follow-up-overdue": {
    primaryAction: "Complete Follow-Up",
    rank: 2,
    rankExplanation: "Ranked because a lead-derived follow-up is overdue.",
    tone: "warning",
    visibleReason: "Follow-up overdue",
  },
  "information-received": {
    primaryAction: "Review Information",
    rank: 3,
    rankExplanation: "Ranked because requested information was supplied.",
    tone: "information",
    visibleReason: "Information received",
  },
  "new-lead": {
    primaryAction: "Review Lead",
    rank: 4,
    rankExplanation:
      "Ranked because this new peer handoff has not been viewed.",
    tone: "information",
    visibleReason: "New lead",
  },
  "response-needed": {
    primaryAction: "Respond",
    rank: 5,
    rankExplanation:
      "Ranked because the handoff was viewed but still needs a response.",
    tone: "warning",
    visibleReason: "Response needed",
  },
  "follow-up-due-today": {
    primaryAction: "Open Follow-Up",
    rank: 6,
    rankExplanation: "Ranked because a lead-derived follow-up is due today.",
    tone: "warning",
    visibleReason: "Follow-up due today",
  },
  "next-action-missing": {
    primaryAction: "Add Next Action",
    rank: 7,
    rankExplanation:
      "Ranked because this accepted handoff has no structured next action.",
    tone: "warning",
    visibleReason: "Next action missing",
  },
  "reassignment-pending": {
    primaryAction: "Review Assignment",
    rank: 8,
    rankExplanation:
      "Ranked because an authorized reassignment needs acknowledgment.",
    tone: "information",
    visibleReason: "Reassignment pending",
  },
};

const terminalStatuses = new Set<LeadListStatus>([
  "declined",
  "won",
  "lost",
  "closed_not_qualified",
  "withdrawn",
]);

const inProgressStatuses = new Set<LeadListStatus>([
  "accepted",
  "in_progress",
  "appointment_set",
]);

function compareDate(left?: string, right?: string, missingLast = true) {
  if (!left && !right) return 0;
  if (!left) return missingLast ? 1 : -1;
  if (!right) return missingLast ? -1 : 1;
  return Date.parse(left) - Date.parse(right);
}

function participantSearch(record: LeadListRecord) {
  return [
    record.companyName,
    record.id,
    record.sender.displayName,
    record.requestedRecipient.displayName,
    record.currentOwner.displayName,
  ]
    .join(" ")
    .toLocaleLowerCase();
}

export function includesRecordInView(
  record: LeadListRecord,
  currentUserId: string,
  view: LeadsView,
) {
  if (view === "action-required") {
    return (
      record.requiredActionOwnerId === currentUserId &&
      Boolean(record.actionReason) &&
      (!terminalStatuses.has(record.status) || record.hasException)
    );
  }
  if (view === "waiting") {
    return (
      record.sender.id === currentUserId &&
      record.requiredActionOwnerId !== currentUserId &&
      Boolean(record.requiredActionOwnerId) &&
      !terminalStatuses.has(record.status)
    );
  }
  if (view === "received") {
    return Boolean(
      record.sender.id !== currentUserId &&
      (record.requestedRecipient.id === currentUserId ||
        record.currentOwner.id === currentUserId ||
        record.reassignedAway),
    );
  }
  if (view === "sent") return record.sender.id === currentUserId;
  if (view === "in-progress") {
    return (
      record.currentOwner.id === currentUserId &&
      inProgressStatuses.has(record.status)
    );
  }
  return Boolean(
    terminalStatuses.has(record.status) &&
    (record.sender.id === currentUserId ||
      record.requestedRecipient.id === currentUserId ||
      record.currentOwner.id === currentUserId),
  );
}

export function filterLeadListRecords(
  records: LeadListRecord[],
  currentUserId: string,
  view: LeadsView,
  filters: LeadListFilters,
  search: string,
  now = new Date("2026-08-24T14:10:00.000Z"),
) {
  const normalizedSearch = search
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase();
  const periodDays =
    filters.period === "all" ? null : Number.parseInt(filters.period, 10);
  const periodStart = periodDays
    ? now.getTime() - periodDays * 24 * 60 * 60 * 1000
    : null;

  return records
    .filter((record) => includesRecordInView(record, currentUserId, view))
    .filter(
      (record) =>
        filters.department === "all" ||
        record.departmentCode === filters.department,
    )
    .filter(
      (record) =>
        filters.sourceDivision === "all" ||
        record.sourceDivisionCode === filters.sourceDivision,
    )
    .filter(
      (record) => filters.status === "all" || record.status === filters.status,
    )
    .filter(
      (record) =>
        filters.attention === "all" ||
        record.attentionState === filters.attention,
    )
    .filter((record) => !filters.exception || record.hasException)
    .filter((record) => {
      if (filters.direction === "all") return true;
      return filters.direction === "sent"
        ? record.sender.id === currentUserId
        : record.sender.id !== currentUserId;
    })
    .filter(
      (record) =>
        periodStart === null ||
        Date.parse(record.materialUpdatedAt) >= periodStart,
    )
    .filter(
      (record) =>
        !normalizedSearch ||
        participantSearch(record).includes(normalizedSearch),
    );
}

export function sortLeadListRecords(
  records: LeadListRecord[],
  view: LeadsView,
) {
  return records.slice().sort((left, right) => {
    if (view === "action-required") {
      const rankDifference =
        actionRule[left.actionReason!].rank -
        actionRule[right.actionReason!].rank;
      return (
        rankDifference ||
        compareDate(left.dueAt, right.dueAt) ||
        compareDate(left.requiredActionAt, right.requiredActionAt) ||
        compareDate(left.createdAt, right.createdAt) ||
        left.id.localeCompare(right.id)
      );
    }
    if (view === "waiting") {
      const attentionDifference =
        Number(right.attentionState === "needs_attention") -
        Number(left.attentionState === "needs_attention");
      return (
        attentionDifference ||
        compareDate(left.dueAt, right.dueAt) ||
        compareDate(left.requiredActionAt, right.requiredActionAt) ||
        left.id.localeCompare(right.id)
      );
    }
    if (view === "in-progress") {
      const category = (record: LeadListRecord) =>
        record.actionReason === "follow-up-overdue"
          ? 1
          : record.actionReason === "follow-up-due-today"
            ? 2
            : record.actionReason === "next-action-missing"
              ? 3
              : record.dueAt
                ? 4
                : 5;
      return (
        category(left) - category(right) ||
        compareDate(left.dueAt, right.dueAt) ||
        Date.parse(right.materialUpdatedAt) -
          Date.parse(left.materialUpdatedAt) ||
        left.id.localeCompare(right.id)
      );
    }
    if (view === "completed") {
      return (
        Date.parse(right.closedAt ?? right.materialUpdatedAt) -
          Date.parse(left.closedAt ?? left.materialUpdatedAt) ||
        left.id.localeCompare(right.id)
      );
    }
    return (
      Date.parse(right.materialUpdatedAt) -
        Date.parse(left.materialUpdatedAt) ||
      Date.parse(right.createdAt) - Date.parse(left.createdAt) ||
      left.id.localeCompare(right.id)
    );
  });
}

export function toLeadListCard(
  record: LeadListRecord,
  currentUserId: string,
  view: LeadsView,
): LeadListCard {
  const action = record.actionReason ? actionRule[record.actionReason] : null;
  const timingSource = record.dueAt ?? record.materialUpdatedAt;
  const exactTimeLabel = new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Chicago",
  }).format(new Date(timingSource));
  const directionLabel =
    record.sender.id === currentUserId
      ? `To ${
          record.currentOwner.id === currentUserId
            ? record.requestedRecipient.displayName
            : record.currentOwner.displayName
        } · ${record.departmentLabel}`
      : `From ${record.sender.displayName} · ${record.sender.department}`;

  return {
    ...record,
    directionLabel,
    exactTimeLabel,
    primaryAction:
      view === "action-required" && action ? action.primaryAction : "Open Lead",
    rankExplanation:
      view === "action-required" ? action?.rankExplanation : undefined,
    relativeTimeLabel: record.dueAt
      ? record.attentionState === "needs_attention"
        ? "Past due"
        : "Due soon"
      : "Recently updated",
    tone:
      view === "action-required" && action
        ? action.tone
        : record.attentionState === "needs_attention"
          ? "danger"
          : record.attentionState === "waiting"
            ? "warning"
            : terminalStatuses.has(record.status)
              ? "neutral"
              : "information",
    visibleReason:
      view === "action-required" && action
        ? action.visibleReason
        : record.reassignedAway
          ? "Reassigned"
          : record.attentionState === "needs_attention"
            ? "Needs Attention"
            : leadStatusLabels[record.status],
  };
}

export const defaultLeadListFilters: LeadListFilters = {
  attention: "all",
  department: "all",
  direction: "all",
  exception: false,
  period: "all",
  sourceDivision: "all",
  status: "all",
};

export function activeLeadFilterCount(filters: LeadListFilters) {
  return Object.entries(filters).filter(([key, value]) =>
    key === "exception" ? value === true : value !== "all",
  ).length;
}
