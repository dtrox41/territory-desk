import {
  emptyLeadActivityDraft,
  emptyLeadResponseDraft,
} from "../../domain/lead-detail";
import { createFictionalLeadDetailService } from "./lead-detail";

describe("fictional lead-detail service", () => {
  it("does not disclose whether an unknown record exists", async () => {
    const service = createFictionalLeadDetailService();
    await expect(service.getCore("unknown-record")).resolves.toEqual({
      type: "unavailable",
    });
  });

  it("records a view once without completing the response", async () => {
    const service = createFictionalLeadDetailService();
    await expect(
      service.recordAuthorizedView({
        handoffId: "demo-lead-1004",
        reviewedVersion: 1,
      }),
    ).resolves.toEqual({ recorded: true });
    await expect(
      service.recordAuthorizedView({
        handoffId: "demo-lead-1004",
        reviewedVersion: 1,
      }),
    ).resolves.toEqual({ recorded: false });
    const result = await service.getCore("demo-lead-1004");
    expect(result.type === "authorized" && result.core.status).toBe(
      "pending_acceptance",
    );
  });

  it("accepts atomically with ownership, follow-up, history, and idempotency", async () => {
    const service = createFictionalLeadDetailService();
    const command = {
      draft: {
        ...emptyLeadResponseDraft,
        decision: "accept" as const,
        followUpDueAt: "2026-08-25T16:00:00.000Z",
        followUpSummary: "Call customer to confirm the service requirements",
      },
      handoffId: "demo-lead-1001",
      idempotencyKey: "accept-1",
      reviewedVersion: 1,
    };
    const first = await service.respond(command);
    const repeated = await service.respond(command);
    expect(first.core).toMatchObject({
      action: null,
      attentionState: "up_to_date",
      status: "accepted",
      version: 2,
    });
    expect(repeated).toEqual(first);
    await expect(
      service.getSupplementary("demo-lead-1001"),
    ).resolves.toMatchObject({
      followUp: { summary: command.draft.followUpSummary },
    });
    const activity = await service.getActivity({
      filter: "responses",
      handoffId: "demo-lead-1001",
    });
    expect(activity.events[0]?.title).toBe("Lead accepted");
  });

  it("transfers the action to the sender when information is requested", async () => {
    const service = createFictionalLeadDetailService();
    const result = await service.respond({
      draft: {
        ...emptyLeadResponseDraft,
        decision: "need-information",
        informationQuestion: "Which location requested the combined service?",
      },
      handoffId: "demo-lead-1001",
      idempotencyKey: "info-1",
      reviewedVersion: 1,
    });
    expect(result.core).toMatchObject({
      attentionState: "waiting",
      currentOwner: { displayName: "Jamie Chen" },
      requiredActionOwner: { displayName: "Jamie Chen" },
      status: "needs_information",
    });
  });

  it("rejects stale commands and keeps notification failure separate", async () => {
    const service = createFictionalLeadDetailService({
      notificationFailure: true,
    });
    await expect(
      service.respond({
        draft: {
          ...emptyLeadResponseDraft,
          decision: "decline",
          declineReason: "wrong-department",
        },
        handoffId: "demo-lead-1001",
        idempotencyKey: "decline-stale",
        reviewedVersion: 99,
      }),
    ).rejects.toMatchObject({ code: "version-conflict" });
    const result = await service.respond({
      draft: {
        ...emptyLeadResponseDraft,
        decision: "decline",
        declineReason: "wrong-department",
      },
      handoffId: "demo-lead-1001",
      idempotencyKey: "decline-current",
      reviewedVersion: 1,
    });
    expect(result.core.status).toBe("declined");
    expect(result.notificationState).toBe("failed");
  });

  it("adds progress without silently changing workflow state", async () => {
    const service = createFictionalLeadDetailService();
    const result = await service.addActivity({
      draft: {
        ...emptyLeadActivityDraft,
        occurredAt: "2026-08-24T14:30:00.000Z",
        result: "connected",
        summary: "Coordinated the customer approach with the sending rep",
      },
      handoffId: "demo-lead-1002",
      idempotencyKey: "activity-1",
      reviewedVersion: 1,
    });
    expect(result.core.status).toBe("accepted");
    expect(result.core.action?.primary).toBe("complete-follow-up");
  });

  it("completes a follow-up and then requires a new structured action", async () => {
    const service = createFictionalLeadDetailService();
    const completed = await service.manageFollowUp({
      action: "complete",
      handoffId: "demo-lead-1002",
      idempotencyKey: "follow-up-complete-1",
      result: "connected-next-step",
      reviewedVersion: 1,
      summary: "Connected and confirmed that a proposal review is needed",
    });
    expect(completed.core.action?.primary).toBe("add-next-action");
    expect(completed.core.attentionState).toBe("action_required");

    const created = await service.manageFollowUp({
      action: "create",
      dueAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      handoffId: "demo-lead-1002",
      idempotencyKey: "follow-up-create-1",
      reviewedVersion: 2,
      summary: "Review the proposal with the customer contact",
      type: "call-customer",
    });
    expect(created.core.action).toBeNull();
    expect(created.core.attentionState).toBe("up_to_date");
  });

  it("keeps supplementary and activity failures independent", async () => {
    const service = createFictionalLeadDetailService({
      failActivity: true,
      failSupplementary: true,
    });
    await expect(service.getCore("demo-lead-1001")).resolves.toMatchObject({
      type: "authorized",
    });
    await expect(service.getSupplementary("demo-lead-1001")).rejects.toThrow(
      "supplementary-failure",
    );
    await expect(
      service.getActivity({
        filter: "all",
        handoffId: "demo-lead-1001",
      }),
    ).rejects.toThrow("activity-failure");
  });
});
