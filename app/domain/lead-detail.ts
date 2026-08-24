import type {
  LeadActionReason,
  LeadAttentionState,
  LeadListParticipant,
  LeadListStatus,
} from "./leads-list";
import type { TerritoryDepartmentCode } from "./territory-result";

export type LeadDetailRole =
  "sender" | "requested_recipient" | "current_owner" | "manager";

export type LeadResponseTargetState =
  "pending" | "completed_on_time" | "completed_late" | "missed";

export type LeadViewState = "not_viewed" | "viewed";
export type LeadNotificationState =
  "queued" | "simulated" | "sent" | "delivered" | "failed" | "unavailable";

export type LeadDetailPrimaryAction =
  | "respond"
  | "review-information"
  | "provide-information"
  | "complete-follow-up"
  | "add-next-action"
  | "review-assignment"
  | "view-outcome";

export type LeadDetailAction = {
  dueAt?: string;
  explanation: string;
  label: string;
  primary: LeadDetailPrimaryAction;
  reason: LeadActionReason | "provide-information" | "view-outcome";
  timingLabel: string;
};

export type LeadDetailCapabilities = {
  addActivity: boolean;
  addInformation: boolean;
  correctDetails: boolean;
  createAnotherDepartment: boolean;
  createRevisedHandoff: boolean;
  manageFollowUp: boolean;
  managerControls: boolean;
  reportIncorrectInformation: boolean;
  respond: boolean;
  withdraw: boolean;
};

export type LeadDetailContact = {
  availabilityExplanation?: string;
  email?: string;
  name?: string;
  phone?: string;
};

export type LeadDetailFollowUp = {
  dueAt: string;
  dueLabel: string;
  id: string;
  owner: LeadListParticipant;
  reminderLabel: string;
  status: "open" | "completed" | "canceled";
  summary: string;
  timing: "upcoming" | "due_today" | "overdue";
  typeLabel: string;
  version: number;
};

export type LeadDetailFeedback = {
  actor: LeadListParticipant;
  id: string;
  occurredAt: string;
  summary: string;
  typeLabel: string;
};

export type LeadRelatedHandoff = {
  departmentLabel?: string;
  id?: string;
  relationshipLabel: string;
  safeLabel: string;
  statusLabel?: string;
  unavailable?: boolean;
};

export type LeadSourceStatus = {
  directoryVersion: string;
  dynamicsState: "not_connected" | "current" | "needs_reconciliation";
  lastRefreshLabel: string;
  leadSourceLabel: string;
  territoryVersion: string;
};

export type LeadDetailSupplementary = {
  feedback: LeadDetailFeedback[];
  followUp: LeadDetailFollowUp | null;
  related: LeadRelatedHandoff[];
  sourceStatus: LeadSourceStatus;
};

export type LeadDetailCore = {
  action: LeadDetailAction | null;
  additionalSharedInformation?: string;
  attentionState: LeadAttentionState;
  capabilities: LeadDetailCapabilities;
  companyName: string;
  contact: LeadDetailContact;
  currentOwner: LeadListParticipant;
  customerRequestedContactLabel?: string;
  customerTimingLabel: string;
  dataState: "current" | "stale" | "version_mismatch" | "dynamics_conflict";
  departmentCode: TerritoryDepartmentCode;
  departmentLabel: string;
  exactSourceDivision: string;
  firstResponse: {
    completedAtLabel?: string;
    resultLabel: string;
    state: LeadResponseTargetState;
    targetAt: string;
    targetLabel: string;
  };
  id: string;
  informationReview?: {
    resultLabel: string;
    state: LeadResponseTargetState;
    targetAt: string;
    targetLabel: string;
  };
  lastRefreshLabel: string;
  location: {
    city: string;
    label: string;
    number: string;
    state: string;
    streetAddress?: string;
    zip: string;
  };
  needSummary: string;
  notificationState: LeadNotificationState;
  opportunityContext?: string;
  outcome?: {
    actor: LeadListParticipant;
    occurredAtLabel: string;
    reasonLabel: string;
    sourceLabel: string;
    summary: string;
  };
  requestedRecipient: LeadListParticipant;
  requiredActionOwner?: LeadListParticipant;
  role: LeadDetailRole;
  sender: LeadListParticipant;
  sourceUpdatedLabel: string;
  status: LeadListStatus;
  statusLabel: string;
  version: number;
  viewState: LeadViewState;
};

export type LeadActivityFilter =
  | "all"
  | "responses"
  | "progress"
  | "follow-ups"
  | "ownership-routing"
  | "notifications"
  | "appointments-outcomes";

export type LeadActivityFamily =
  | "system"
  | "response"
  | "progress"
  | "follow-up"
  | "ownership-routing"
  | "notification"
  | "appointment-outcome";

export type LeadActivityEvent = {
  actorLabel: string;
  correlationId?: string;
  departmentLabel?: string;
  details: string[];
  family: LeadActivityFamily;
  id: string;
  occurredAt: string;
  occurredLabel: string;
  recordedLabel?: string;
  sourceLabel: string;
  summary: string;
  title: string;
};

export type LeadActivityResult = {
  events: LeadActivityEvent[];
  hasMore: boolean;
  nextCursor?: string;
  total: number;
};

export type LeadResponseDecision = "accept" | "need-information" | "decline";

export type LeadResponseDraft = {
  decision: LeadResponseDecision | "";
  declineExplanation: string;
  declineReason: string;
  followUpDueAt: string;
  followUpMode: "create" | "add-later";
  followUpSummary: string;
  followUpType: string;
  informationQuestion: string;
};

export type LeadResponseErrors = Partial<
  Record<keyof LeadResponseDraft, string>
>;

export const emptyLeadResponseDraft: LeadResponseDraft = {
  decision: "",
  declineExplanation: "",
  declineReason: "",
  followUpDueAt: "",
  followUpMode: "create",
  followUpSummary: "",
  followUpType: "call-customer",
  informationQuestion: "",
};

const declineReasons = new Set([
  "wrong-territory",
  "wrong-department",
  "insufficient-information",
  "duplicate-handoff",
  "service-not-offered",
  "other",
]);

export function validateLeadResponseDraft(
  draft: LeadResponseDraft,
  now = new Date("2026-08-24T15:00:00.000Z"),
): LeadResponseErrors {
  const errors: LeadResponseErrors = {};
  if (!draft.decision) {
    errors.decision = "Choose Accept, Need Information, or Decline.";
    return errors;
  }
  if (draft.decision === "need-information") {
    const length = draft.informationQuestion.trim().length;
    if (length < 5 || length > 500) {
      errors.informationQuestion =
        "Enter a specific question between 5 and 500 characters.";
    }
  }
  if (draft.decision === "decline") {
    if (!declineReasons.has(draft.declineReason)) {
      errors.declineReason = "Choose an approved decline reason.";
    }
    if (
      draft.declineReason === "other" &&
      (draft.declineExplanation.trim().length < 5 ||
        draft.declineExplanation.trim().length > 500)
    ) {
      errors.declineExplanation =
        "Explain the other reason using 5 to 500 characters.";
    }
  }
  if (draft.decision === "accept" && draft.followUpMode === "create") {
    const summaryLength = draft.followUpSummary.trim().length;
    if (summaryLength < 5 || summaryLength > 240) {
      errors.followUpSummary =
        "Enter a next-action summary between 5 and 240 characters.";
    }
    if (!draft.followUpType) {
      errors.followUpType = "Choose a next-action type.";
    }
    const dueAt = Date.parse(draft.followUpDueAt);
    if (!Number.isFinite(dueAt) || dueAt <= now.getTime()) {
      errors.followUpDueAt = "Choose a future due date and time.";
    }
  }
  return errors;
}

export type LeadActivityDraft = {
  detail: string;
  occurredAt: string;
  result: string;
  summary: string;
  type: string;
};

export const emptyLeadActivityDraft: LeadActivityDraft = {
  detail: "",
  occurredAt: "",
  result: "",
  summary: "",
  type: "customer-call",
};

export function validateLeadActivityDraft(
  draft: LeadActivityDraft,
  now = new Date("2026-08-24T15:00:00.000Z"),
) {
  const errors: Partial<Record<keyof LeadActivityDraft, string>> = {};
  if (!draft.type) errors.type = "Choose an activity type.";
  const summaryLength = draft.summary.trim().length;
  if (summaryLength < 5 || summaryLength > 240) {
    errors.summary = "Enter a shared summary between 5 and 240 characters.";
  }
  if (draft.detail.length > 2000) {
    errors.detail = "Shared detail must be 2,000 characters or fewer.";
  }
  const occurredAt = Date.parse(draft.occurredAt);
  if (!Number.isFinite(occurredAt)) {
    errors.occurredAt = "Choose when the activity occurred.";
  } else if (occurredAt > now.getTime()) {
    errors.occurredAt =
      "Activity time cannot be in the future. Schedule future work as a follow-up.";
  }
  if (!draft.result) errors.result = "Choose the structured activity result.";
  return errors;
}

export function activityMatchesFilter(
  event: LeadActivityEvent,
  filter: LeadActivityFilter,
) {
  if (filter === "all") return true;
  if (filter === "responses") return event.family === "response";
  if (filter === "progress") return event.family === "progress";
  if (filter === "follow-ups") return event.family === "follow-up";
  if (filter === "ownership-routing") {
    return event.family === "ownership-routing" || event.family === "system";
  }
  if (filter === "notifications") return event.family === "notification";
  return event.family === "appointment-outcome";
}

export function actionForLeadDetail(input: {
  actionReason?: LeadActionReason;
  dueAt?: string;
  role: LeadDetailRole;
  status: LeadListStatus;
}): LeadDetailAction | null {
  const timingLabel = input.dueAt
    ? "Review the exact due time below."
    : "Act now";
  if (input.actionReason === "response-target-missed") {
    return {
      dueAt: input.dueAt,
      explanation:
        "The one-business-day response target was missed. Viewing the lead did not complete the response.",
      label: "Respond Now",
      primary: "respond",
      reason: input.actionReason,
      timingLabel,
    };
  }
  if (input.actionReason === "information-received") {
    return {
      dueAt: input.dueAt,
      explanation:
        "The sender supplied the requested information. Review it before choosing a response.",
      label: "Review Information",
      primary: "review-information",
      reason: input.actionReason,
      timingLabel,
    };
  }
  if (
    input.actionReason === "new-lead" ||
    input.actionReason === "response-needed"
  ) {
    return {
      dueAt: input.dueAt,
      explanation:
        "You are the requested recipient and still owe Accept, Need Information, or Decline.",
      label: input.actionReason === "new-lead" ? "Review Lead" : "Respond",
      primary: "respond",
      reason: input.actionReason,
      timingLabel,
    };
  }
  if (input.actionReason === "follow-up-overdue") {
    return {
      dueAt: input.dueAt,
      explanation:
        "The recorded primary follow-up is overdue and remains the current commitment.",
      label: "Complete Follow-Up",
      primary: "complete-follow-up",
      reason: input.actionReason,
      timingLabel,
    };
  }
  if (input.actionReason === "follow-up-due-today") {
    return {
      dueAt: input.dueAt,
      explanation: "The current primary follow-up is due today.",
      label: "Complete Follow-Up",
      primary: "complete-follow-up",
      reason: input.actionReason,
      timingLabel,
    };
  }
  if (input.actionReason === "next-action-missing") {
    return {
      explanation:
        "This accepted handoff has no structured next action. The current owner must add one.",
      label: "Add Next Action",
      primary: "add-next-action",
      reason: input.actionReason,
      timingLabel,
    };
  }
  if (input.actionReason === "reassignment-pending") {
    return {
      explanation:
        "A manager-authorized reassignment transferred ownership and needs acknowledgment.",
      label: "Review Assignment",
      primary: "review-assignment",
      reason: input.actionReason,
      timingLabel,
    };
  }
  if (input.status === "needs_information" && input.role === "sender") {
    return {
      explanation:
        "The requested recipient asked a specific question before they can respond.",
      label: "Provide Information",
      primary: "provide-information",
      reason: "provide-information",
      timingLabel: "Sender response needed",
    };
  }
  if (
    ["won", "lost", "closed_not_qualified", "declined", "withdrawn"].includes(
      input.status,
    )
  ) {
    return {
      explanation:
        "This handoff is closed. Review the recorded outcome and append-only history.",
      label: "View Outcome",
      primary: "view-outcome",
      reason: "view-outcome",
      timingLabel: "Closed",
    };
  }
  return null;
}
