import {
  actionForLeadDetail,
  activityMatchesFilter,
  emptyLeadActivityDraft,
  emptyLeadResponseDraft,
  validateLeadActivityDraft,
  validateLeadResponseDraft,
  type LeadActivityEvent,
} from "./lead-detail";

const now = new Date("2026-08-24T15:00:00.000Z");

describe("lead-detail domain", () => {
  it("requires an explicit response decision and branch-specific evidence", () => {
    expect(validateLeadResponseDraft(emptyLeadResponseDraft, now)).toEqual({
      decision: "Choose Accept, Need Information, or Decline.",
    });

    expect(
      validateLeadResponseDraft(
        {
          ...emptyLeadResponseDraft,
          decision: "need-information",
          informationQuestion: "Which location needs service?",
        },
        now,
      ),
    ).toEqual({});

    expect(
      validateLeadResponseDraft(
        {
          ...emptyLeadResponseDraft,
          decision: "decline",
          declineReason: "wrong-territory",
        },
        now,
      ),
    ).toEqual({});
  });

  it("requires a future structured next action when accepting now", () => {
    const errors = validateLeadResponseDraft(
      { ...emptyLeadResponseDraft, decision: "accept" },
      now,
    );
    expect(errors.followUpSummary).toBeDefined();
    expect(errors.followUpDueAt).toBeDefined();

    expect(
      validateLeadResponseDraft(
        {
          ...emptyLeadResponseDraft,
          decision: "accept",
          followUpDueAt: "2026-08-25T16:00:00.000Z",
          followUpSummary: "Call customer to confirm service requirements",
        },
        now,
      ),
    ).toEqual({});
  });

  it("prevents future work from being logged as completed activity", () => {
    expect(
      validateLeadActivityDraft(
        {
          ...emptyLeadActivityDraft,
          occurredAt: "2026-08-25T15:00:00.000Z",
          result: "connected",
          summary: "Spoke with the customer contact",
        },
        now,
      ).occurredAt,
    ).toMatch(/cannot be in the future/);
  });

  it("derives one action and filters activity by family", () => {
    expect(
      actionForLeadDetail({
        actionReason: "response-target-missed",
        role: "requested_recipient",
        status: "pending_acceptance",
      })?.primary,
    ).toBe("respond");
    const event = { family: "notification" } as LeadActivityEvent;
    expect(activityMatchesFilter(event, "notifications")).toBe(true);
    expect(activityMatchesFilter(event, "responses")).toBe(false);
  });
});
