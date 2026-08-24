import {
  actionForLeadDetail,
  activityMatchesFilter,
  validateLeadActivityDraft,
  validateLeadResponseDraft,
  type LeadActivityEvent,
  type LeadDetailCore,
  type LeadDetailRole,
  type LeadDetailSupplementary,
  type LeadResponseDecision,
} from "../../domain/lead-detail";
import {
  includesRecordInView,
  leadStatusLabels,
  type LeadListRecord,
} from "../../domain/leads-list";
import type {
  AddLeadActivityCommand,
  LeadCommandResult,
  LeadDetailService,
  ManageLeadFollowUpCommand,
  LeadResponseCommand,
} from "../lead-detail-service";
import { fictionalCurrentUserId, fictionalLeadListRecords } from "./leads-list";

type FictionalLeadDetailOptions = {
  dynamicsConflict?: boolean;
  failActivity?: boolean;
  failCore?: boolean;
  failSupplementary?: boolean;
  notificationFailure?: boolean;
  stale?: boolean;
  syncSharedState?: boolean;
  versionMismatch?: boolean;
};

const currentUser = {
  department: "Uniform",
  displayName: "Taylor Morgan",
  id: fictionalCurrentUserId,
};

function roleFor(record: LeadListRecord): LeadDetailRole {
  if (record.requestedRecipient.id === fictionalCurrentUserId) {
    return record.currentOwner.id === fictionalCurrentUserId
      ? "current_owner"
      : "requested_recipient";
  }
  return record.sender.id === fictionalCurrentUserId ? "sender" : "manager";
}

function capabilities(record: LeadListRecord, role: LeadDetailRole) {
  const terminal = [
    "declined",
    "won",
    "lost",
    "closed_not_qualified",
    "withdrawn",
  ].includes(record.status);
  const isRecipient =
    role === "requested_recipient" || role === "current_owner";
  return {
    addActivity: !terminal && (isRecipient || role === "sender"),
    addInformation: record.status === "needs_information" && role === "sender",
    correctDetails: role === "sender" && !terminal,
    createAnotherDepartment: !terminal,
    createRevisedHandoff: terminal,
    manageFollowUp:
      !terminal && record.currentOwner.id === fictionalCurrentUserId,
    managerControls: role === "manager",
    reportIncorrectInformation: true,
    respond:
      isRecipient &&
      (record.status === "pending_acceptance" ||
        record.status === "needs_information"),
    withdraw: role === "sender" && record.status === "pending_acceptance",
  };
}

function toCore(
  record: LeadListRecord,
  options: FictionalLeadDetailOptions,
): LeadDetailCore {
  const role = roleFor(record);
  const terminal = [
    "declined",
    "won",
    "lost",
    "closed_not_qualified",
    "withdrawn",
  ].includes(record.status);
  const firstResponseCompleted = record.status !== "pending_acceptance";
  const firstResponseState = firstResponseCompleted
    ? "completed_on_time"
    : record.actionReason === "response-target-missed"
      ? "missed"
      : "pending";
  return {
    action: actionForLeadDetail({
      actionReason: record.actionReason,
      dueAt: record.dueAt,
      role,
      status: record.status,
    }),
    additionalSharedInformation:
      "The customer is evaluating service options across multiple departments. Coordinate before making overlapping commitments.",
    attentionState: record.attentionState,
    capabilities: capabilities(record, role),
    companyName: record.companyName,
    contact: {
      availabilityExplanation:
        "Use only for this fictional prototype; no real customer is connected.",
      email: "operations@example.test",
      name: "Avery Parker",
      phone: "(555) 010-0142",
    },
    currentOwner: record.currentOwner,
    customerRequestedContactLabel: "Weekdays after 2:00 PM",
    customerTimingLabel: "Customer indicated interest within 30 days",
    dataState: options.dynamicsConflict
      ? "dynamics_conflict"
      : options.versionMismatch
        ? "version_mismatch"
        : options.stale
          ? "stale"
          : "current",
    departmentCode: record.departmentCode,
    departmentLabel: record.departmentLabel,
    exactSourceDivision: record.exactSourceDivision,
    firstResponse: {
      completedAtLabel: firstResponseCompleted
        ? "August 21, 2026 at 10:20 AM CT"
        : undefined,
      resultLabel: firstResponseCompleted
        ? "Meaningful response recorded"
        : firstResponseState === "missed"
          ? "Target missed — response still required"
          : "Awaiting response",
      state: firstResponseState,
      targetAt: record.dueAt ?? "2026-08-25T22:00:00Z",
      targetLabel: record.dueAt
        ? "One-business-day target shown in local time"
        : "Due August 25, 2026 at 5:00 PM CT",
    },
    id: record.id,
    informationReview:
      record.actionReason === "information-received"
        ? {
            resultLabel: "New information is ready for review",
            state: "pending",
            targetAt: "2026-08-25T22:00:00Z",
            targetLabel: "Review by August 25, 2026 at 5:00 PM CT",
          }
        : undefined,
    lastRefreshLabel: "August 24, 2026 at 9:10 AM CT",
    location: {
      city: "Minneapolis",
      label: "Fictional service location",
      number: "102",
      state: "MN",
      streetAddress: "1250 Example Avenue",
      zip: "55401",
    },
    needSummary:
      "Explore a coordinated facility-services introduction and confirm whether uniform service should be included in the first conversation.",
    notificationState: options.notificationFailure ? "failed" : "simulated",
    opportunityContext:
      "The sending representative identified this opportunity during an existing local conversation and requested a coordinated follow-up.",
    outcome: terminal
      ? {
          actor: record.currentOwner,
          occurredAtLabel: record.closedAt
            ? "August 23, 2026 at 12:00 PM CT"
            : "Recorded in fictional history",
          reasonLabel: record.closureSummary ?? "Approved fictional outcome",
          sourceLabel: "Territory Desk prototype",
          summary: record.latestFeedback,
        }
      : undefined,
    requestedRecipient: record.requestedRecipient,
    requiredActionOwner: record.requiredActionOwnerId
      ? record.requiredActionOwnerId === currentUser.id
        ? currentUser
        : record.requestedRecipient
      : undefined,
    role,
    sender: record.sender,
    sourceUpdatedLabel: "Source routing refreshed August 24, 2026",
    status: record.status,
    statusLabel: leadStatusLabels[record.status],
    version: 1,
    viewState: record.actionReason === "new-lead" ? "not_viewed" : "viewed",
  };
}

function baseActivity(record: LeadListRecord): LeadActivityEvent[] {
  const events: LeadActivityEvent[] = [
    {
      actorLabel: "Territory Desk",
      correlationId: `route-${record.id}`,
      departmentLabel: record.departmentLabel,
      details: [
        `${record.sender.displayName} → ${record.requestedRecipient.displayName}`,
        `Routed to ${record.exactSourceDivision}`,
      ],
      family: "ownership-routing",
      id: `${record.id}-created`,
      occurredAt: record.createdAt,
      occurredLabel: "August 20, 2026 at 11:15 AM CT",
      sourceLabel: "Territory Desk prototype",
      summary: "Cross-department handoff created and routed.",
      title: "Lead sent",
    },
    {
      actorLabel: record.requestedRecipient.displayName,
      details: ["Opening the record did not complete the required response."],
      family: "system",
      id: `${record.id}-viewed`,
      occurredAt: "2026-08-20T17:05:00Z",
      occurredLabel: "August 20, 2026 at 12:05 PM CT",
      sourceLabel: "Territory Desk prototype",
      summary: "Authorized recipient viewed the handoff.",
      title: "Lead viewed",
    },
    {
      actorLabel: "Territory Desk",
      details: ["Email and text delivery are simulated in this prototype."],
      family: "notification",
      id: `${record.id}-notification`,
      occurredAt: "2026-08-20T16:16:00Z",
      occurredLabel: "August 20, 2026 at 11:16 AM CT",
      sourceLabel: "Notification simulator",
      summary: "Recipient alert queued for fictional delivery.",
      title: "Alert prepared",
    },
  ];
  if (record.primaryFollowUp) {
    events.unshift({
      actorLabel: record.currentOwner.displayName,
      details: [record.primaryFollowUp],
      family: "follow-up",
      id: `${record.id}-follow-up`,
      occurredAt: "2026-08-23T15:00:00Z",
      occurredLabel: "August 23, 2026 at 10:00 AM CT",
      sourceLabel: "Territory Desk prototype",
      summary: "A structured next action was scheduled.",
      title: "Follow-up created",
    });
  }
  return events.sort(
    (a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt),
  );
}

function supplementaryFor(record: LeadListRecord): LeadDetailSupplementary {
  return {
    feedback:
      record.status === "pending_acceptance"
        ? []
        : [
            {
              actor: record.currentOwner,
              id: `${record.id}-feedback`,
              occurredAt: "2026-08-23T15:30:00Z",
              summary: record.latestFeedback,
              typeLabel: "Progress update",
            },
          ],
    followUp: record.primaryFollowUp
      ? {
          dueAt: record.dueAt ?? "2026-08-27T15:00:00Z",
          dueLabel: record.dueAt
            ? "Due August 24, 2026 at 8:00 AM CT"
            : "Due August 27, 2026 at 10:00 AM CT",
          id: `${record.id}-follow-up`,
          owner: record.currentOwner,
          reminderLabel: "Reminder: 30 minutes before",
          status: "open",
          summary: record.primaryFollowUp,
          timing:
            record.actionReason === "follow-up-overdue"
              ? "overdue"
              : "upcoming",
          typeLabel: "Customer follow-up",
          version: 1,
        }
      : null,
    related: [
      {
        departmentLabel: "Uniform",
        id: "demo-lead-related-1",
        relationshipLabel: "Same fictional customer",
        safeLabel: "Related department handoff",
        statusLabel: "In Progress",
      },
    ],
    sourceStatus: {
      directoryVersion: "Demo directory v3",
      dynamicsState: "not_connected",
      lastRefreshLabel: "August 24, 2026 at 9:10 AM CT",
      leadSourceLabel: "Territory Desk fictional data",
      territoryVersion: "Demo territory v4",
    },
  };
}

function commandError(code: string) {
  return Object.assign(new Error(code), { code });
}

function applySharedUpdate(core: LeadDetailCore, message: string) {
  const record = fictionalLeadListRecords.find((item) => item.id === core.id);
  if (!record) return;
  record.status = core.status;
  record.attentionState = core.attentionState;
  record.currentOwner = core.currentOwner;
  record.requiredActionOwnerId = core.requiredActionOwner?.id;
  record.actionReason = core.action?.reason as LeadListRecord["actionReason"];
  record.latestFeedback = message;
  record.materialUpdatedAt = new Date().toISOString();
  if (typeof window !== "undefined") {
    const actionCount = fictionalLeadListRecords.filter((item) =>
      includesRecordInView(item, fictionalCurrentUserId, "action-required"),
    ).length;
    window.dispatchEvent(
      new CustomEvent("territory-desk:leads-updated", {
        detail: { actionCount },
      }),
    );
  }
}

export function createFictionalLeadDetailService(
  options: FictionalLeadDetailOptions = {},
): LeadDetailService {
  const cores = new Map(
    fictionalLeadListRecords.map((record) => [
      record.id,
      toCore(record, options),
    ]),
  );
  const supplementary = new Map(
    fictionalLeadListRecords.map((record) => [
      record.id,
      supplementaryFor(record),
    ]),
  );
  const activity = new Map(
    fictionalLeadListRecords.map((record) => [record.id, baseActivity(record)]),
  );
  const commandResults = new Map<string, LeadCommandResult>();
  const recordedViews = new Set<string>();

  function requireCore(handoffId: string) {
    const core = cores.get(handoffId);
    if (!core) throw commandError("unavailable");
    return core;
  }

  function append(handoffId: string, event: LeadActivityEvent) {
    const events = activity.get(handoffId) ?? [];
    activity.set(
      handoffId,
      [event, ...events].sort(
        (a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt),
      ),
    );
  }

  function result(
    core: LeadDetailCore,
    resultHeading: string,
    resultMessage: string,
  ): LeadCommandResult {
    return {
      core: structuredClone(core),
      notificationState: options.notificationFailure ? "failed" : "available",
      resultHeading,
      resultMessage,
    };
  }

  return {
    async addActivity(command: AddLeadActivityCommand) {
      await Promise.resolve();
      const prior = commandResults.get(command.idempotencyKey);
      if (prior) return structuredClone(prior);
      const core = requireCore(command.handoffId);
      if (!core.capabilities.addActivity) throw commandError("not-authorized");
      if (command.reviewedVersion !== core.version)
        throw commandError("version-conflict");
      if (Object.keys(validateLeadActivityDraft(command.draft)).length)
        throw commandError("validation");
      core.version += 1;
      append(command.handoffId, {
        actorLabel: currentUser.displayName,
        details: [command.draft.detail || `Result: ${command.draft.result}`],
        family: "progress",
        id: `${command.handoffId}-activity-${core.version}`,
        occurredAt: command.draft.occurredAt,
        occurredLabel: "Recorded activity time",
        recordedLabel: "Recorded just now",
        sourceLabel: "Territory Desk prototype",
        summary: command.draft.summary.trim(),
        title: "Progress update added",
      });
      const next = result(
        core,
        "Activity recorded",
        "The shared progress update is now in the append-only history. Status and follow-up were not changed.",
      );
      commandResults.set(command.idempotencyKey, next);
      return structuredClone(next);
    },
    async getActivity({ cursor, filter, handoffId }) {
      await Promise.resolve();
      if (options.failActivity) throw new Error("activity-failure");
      requireCore(handoffId);
      const all = (activity.get(handoffId) ?? []).filter((event) =>
        activityMatchesFilter(event, filter),
      );
      const offset = Number.parseInt(cursor ?? "0", 10) || 0;
      const page = all.slice(offset, offset + 6);
      const next = offset + page.length;
      return {
        events: structuredClone(page),
        hasMore: next < all.length,
        nextCursor: next < all.length ? String(next) : undefined,
        total: all.length,
      };
    },
    async getCore(handoffId) {
      await Promise.resolve();
      if (options.failCore) throw new Error("core-failure");
      const core = cores.get(handoffId);
      return core
        ? { core: structuredClone(core), type: "authorized" as const }
        : { type: "unavailable" as const };
    },
    async getSupplementary(handoffId) {
      await Promise.resolve();
      if (options.failSupplementary) throw new Error("supplementary-failure");
      requireCore(handoffId);
      return structuredClone(supplementary.get(handoffId)!);
    },
    async manageFollowUp(command: ManageLeadFollowUpCommand) {
      await Promise.resolve();
      const prior = commandResults.get(command.idempotencyKey);
      if (prior) return structuredClone(prior);
      const core = requireCore(command.handoffId);
      if (!core.capabilities.manageFollowUp)
        throw commandError("not-authorized");
      if (command.reviewedVersion !== core.version)
        throw commandError("version-conflict");
      const data = supplementary.get(command.handoffId)!;
      if (command.action === "complete") {
        if (!data.followUp || data.followUp.status !== "open")
          throw commandError("follow-up-unavailable");
        if (
          !command.result ||
          command.result.trim().length < 3 ||
          command.summary.trim().length < 5
        )
          throw commandError("validation");
        data.followUp = { ...data.followUp, status: "completed" };
        core.action = actionForLeadDetail({
          actionReason: "next-action-missing",
          role: "current_owner",
          status: core.status,
        });
        core.attentionState = "action_required";
        core.requiredActionOwner = currentUser;
      } else {
        if (
          command.summary.trim().length < 5 ||
          !command.type ||
          !command.dueAt ||
          Date.parse(command.dueAt) <= Date.now()
        )
          throw commandError("validation");
        data.followUp = {
          dueAt: command.dueAt,
          dueLabel: "Due at the selected local date and time",
          id: `${command.handoffId}-follow-up-${core.version + 1}`,
          owner: currentUser,
          reminderLabel: "Reminder: 30 minutes before",
          status: "open",
          summary: command.summary.trim(),
          timing: "upcoming",
          typeLabel: command.type,
          version: 1,
        };
        core.action = null;
        core.attentionState = "up_to_date";
        core.requiredActionOwner = undefined;
      }
      core.version += 1;
      const title =
        command.action === "complete"
          ? "Follow-up completed"
          : "Next action created";
      const message =
        command.action === "complete"
          ? "The result was recorded. Add the next structured action to keep the handoff moving."
          : "The new commitment is now visible to the sending representative.";
      append(command.handoffId, {
        actorLabel: currentUser.displayName,
        details: [
          command.summary.trim(),
          command.action === "complete"
            ? `Result: ${command.result}`
            : `Type: ${command.type}`,
        ],
        family: "follow-up",
        id: `${command.handoffId}-follow-up-event-${core.version}`,
        occurredAt: new Date().toISOString(),
        occurredLabel: "Just now",
        sourceLabel: "Territory Desk prototype",
        summary: message,
        title,
      });
      if (options.syncSharedState) applySharedUpdate(core, message);
      const next = result(core, title, message);
      commandResults.set(command.idempotencyKey, next);
      return structuredClone(next);
    },
    async recordAuthorizedView({ handoffId }) {
      await Promise.resolve();
      const core = requireCore(handoffId);
      const key = `${handoffId}:${currentUser.id}`;
      if (recordedViews.has(key) || core.viewState === "viewed") {
        return { recorded: false };
      }
      recordedViews.add(key);
      core.viewState = "viewed";
      append(handoffId, {
        actorLabel: currentUser.displayName,
        details: ["Viewing does not satisfy the required response."],
        family: "system",
        id: `${handoffId}-view-${Date.now()}`,
        occurredAt: new Date().toISOString(),
        occurredLabel: "Just now",
        sourceLabel: "Territory Desk prototype",
        summary: "Authorized recipient viewed the handoff.",
        title: "Lead viewed",
      });
      return { recorded: true };
    },
    async respond(command: LeadResponseCommand) {
      await Promise.resolve();
      const prior = commandResults.get(command.idempotencyKey);
      if (prior) return structuredClone(prior);
      const core = requireCore(command.handoffId);
      if (!core.capabilities.respond) throw commandError("not-authorized");
      if (command.reviewedVersion !== core.version)
        throw commandError("version-conflict");
      if (Object.keys(validateLeadResponseDraft(command.draft)).length)
        throw commandError("validation");

      const decision = command.draft.decision as LeadResponseDecision;
      core.version += 1;
      core.viewState = "viewed";
      core.firstResponse = {
        ...core.firstResponse,
        completedAtLabel: "August 24, 2026 at 10:00 AM CT",
        resultLabel:
          decision === "accept"
            ? "Accepted"
            : decision === "need-information"
              ? "Information requested"
              : "Declined with approved reason",
        state:
          core.firstResponse.state === "missed"
            ? "completed_late"
            : "completed_on_time",
      };

      let heading = "Response recorded";
      let message = "The sender can now see your response and its time.";
      if (decision === "accept") {
        core.status = "accepted";
        core.statusLabel = leadStatusLabels.accepted;
        core.currentOwner = currentUser;
        core.requiredActionOwner =
          command.draft.followUpMode === "add-later" ? currentUser : undefined;
        core.attentionState =
          command.draft.followUpMode === "add-later"
            ? "action_required"
            : "up_to_date";
        core.action =
          command.draft.followUpMode === "add-later"
            ? actionForLeadDetail({
                actionReason: "next-action-missing",
                role: "current_owner",
                status: "accepted",
              })
            : null;
        if (command.draft.followUpMode === "create") {
          supplementary.set(command.handoffId, {
            ...supplementary.get(command.handoffId)!,
            followUp: {
              dueAt: command.draft.followUpDueAt,
              dueLabel: "Due at the selected local date and time",
              id: `${command.handoffId}-follow-up-${core.version}`,
              owner: currentUser,
              reminderLabel: "Reminder: 30 minutes before",
              status: "open",
              summary: command.draft.followUpSummary.trim(),
              timing: "upcoming",
              typeLabel: command.draft.followUpType,
              version: 1,
            },
          });
        }
        heading = "Lead accepted";
        message =
          command.draft.followUpMode === "create"
            ? "Ownership and the next action were recorded together."
            : "Ownership was recorded. Add a structured next action next.";
      } else if (decision === "need-information") {
        core.status = "needs_information";
        core.statusLabel = leadStatusLabels.needs_information;
        core.currentOwner = core.sender;
        core.requiredActionOwner = core.sender;
        core.attentionState = "waiting";
        core.action = null;
        heading = "Information requested";
        message = "The sender now owns the specific information request.";
      } else {
        core.status = "declined";
        core.statusLabel = leadStatusLabels.declined;
        core.currentOwner = core.sender;
        core.requiredActionOwner = undefined;
        core.attentionState = "closed";
        core.action = actionForLeadDetail({
          role: core.role,
          status: "declined",
        });
        core.capabilities = {
          ...core.capabilities,
          addActivity: false,
          manageFollowUp: false,
          respond: false,
        };
        heading = "Lead declined";
        message = "The approved reason is visible to the sender in history.";
      }

      append(command.handoffId, {
        actorLabel: currentUser.displayName,
        details: [
          decision === "need-information"
            ? command.draft.informationQuestion.trim()
            : decision === "decline"
              ? `Reason: ${command.draft.declineReason}`
              : command.draft.followUpMode === "create"
                ? `Next action: ${command.draft.followUpSummary.trim()}`
                : "Next action will be added separately.",
        ],
        family: "response",
        id: `${command.handoffId}-response-${core.version}`,
        occurredAt: new Date().toISOString(),
        occurredLabel: "Just now",
        sourceLabel: "Territory Desk prototype",
        summary: message,
        title:
          decision === "accept"
            ? "Lead accepted"
            : decision === "need-information"
              ? "Information requested"
              : "Lead declined",
      });
      if (options.syncSharedState) applySharedUpdate(core, message);
      const next = result(core, heading, message);
      commandResults.set(command.idempotencyKey, next);
      return structuredClone(next);
    },
  };
}

export const fictionalLeadDetailService = createFictionalLeadDetailService({
  syncSharedState: true,
});
