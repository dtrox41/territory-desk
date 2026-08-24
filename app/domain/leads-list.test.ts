import {
  activeLeadFilterCount,
  defaultLeadListFilters,
  filterLeadListRecords,
  includesRecordInView,
  sortLeadListRecords,
  toLeadListCard,
  type LeadActionReason,
  type LeadListRecord,
} from "./leads-list";

const me = { department: "Uniform", displayName: "Taylor Morgan", id: "me" };
const peer = {
  department: "Facility Services",
  displayName: "Jordan Lee",
  id: "peer",
};

function lead(overrides: Partial<LeadListRecord> = {}): LeadListRecord {
  return {
    attentionState: "up_to_date",
    companyName: "Example Company",
    createdAt: "2026-08-20T14:00:00Z",
    currentOwner: me,
    departmentCode: "facility-services",
    departmentLabel: "Facility Services",
    exactSourceDivision: "Facility Services",
    hasException: false,
    id: "lead-1",
    latestFeedback: "Current fictional feedback.",
    materialUpdatedAt: "2026-08-23T14:00:00Z",
    requestedRecipient: me,
    sender: peer,
    sourceDivisionCode: "facility-services",
    status: "accepted",
    ...overrides,
  };
}

describe("lead-list domain", () => {
  it("keeps personal views distinct without granting manager-wide access", () => {
    const action = lead({
      actionReason: "new-lead",
      attentionState: "action_required",
      requiredActionOwnerId: me.id,
    });
    const waiting = lead({
      currentOwner: me,
      requestedRecipient: peer,
      requiredActionOwnerId: peer.id,
      sender: me,
      status: "pending_acceptance",
    });
    const terminal = lead({
      closedAt: "2026-08-24T14:00:00Z",
      status: "won",
    });
    const unrelated = lead({
      currentOwner: peer,
      id: "unrelated",
      requestedRecipient: peer,
      sender: { ...peer, id: "another-peer" },
    });

    expect(includesRecordInView(action, me.id, "action-required")).toBe(true);
    expect(includesRecordInView(waiting, me.id, "waiting")).toBe(true);
    expect(includesRecordInView(action, me.id, "received")).toBe(true);
    expect(includesRecordInView(waiting, me.id, "sent")).toBe(true);
    expect(includesRecordInView(action, me.id, "in-progress")).toBe(true);
    expect(includesRecordInView(terminal, me.id, "completed")).toBe(true);
    expect(includesRecordInView(unrelated, me.id, "received")).toBe(false);
  });

  it("applies the approved action hierarchy with deterministic tie breakers", () => {
    const reasons: LeadActionReason[] = [
      "reassignment-pending",
      "next-action-missing",
      "follow-up-due-today",
      "response-needed",
      "new-lead",
      "information-received",
      "follow-up-overdue",
      "response-target-missed",
    ];
    const records = reasons.map((actionReason, index) =>
      lead({
        actionReason,
        attentionState: "action_required",
        id: `lead-${index}`,
        requiredActionOwnerId: me.id,
      }),
    );

    expect(
      sortLeadListRecords(records, "action-required").map(
        (record) => record.actionReason,
      ),
    ).toEqual([...reasons].reverse());
  });

  it("searches only approved identifying fields and combines safe filters", () => {
    const records = [
      lead({ id: "TD-204", companyName: "Northstar Packaging" }),
      lead({
        companyName: "Another Company",
        departmentCode: "uniform",
        departmentLabel: "Uniform",
        id: "TD-205",
        latestFeedback: "Northstar Packaging is hidden in feedback.",
        sender: { ...peer, displayName: "Jamie Chen" },
        sourceDivisionCode: "uniform-rental",
      }),
    ];

    expect(
      filterLeadListRecords(
        records,
        me.id,
        "received",
        defaultLeadListFilters,
        "northstar",
      ).map((record) => record.id),
    ).toEqual(["TD-204"]);
    expect(
      filterLeadListRecords(
        records,
        me.id,
        "received",
        {
          ...defaultLeadListFilters,
          department: "uniform",
          sourceDivision: "uniform-rental",
        },
        "jamie",
      ).map((record) => record.id),
    ).toEqual(["TD-205"]);
  });

  it("maps safe card content and counts active filters", () => {
    const card = toLeadListCard(
      lead({
        actionReason: "response-target-missed",
        attentionState: "needs_attention",
        requiredActionOwnerId: me.id,
      }),
      me.id,
      "action-required",
    );

    expect(card.primaryAction).toBe("Respond Now");
    expect(card.rankExplanation).toMatch(/one-business-day response target/);
    expect(card.directionLabel).toBe("From Jordan Lee · Facility Services");
    expect(
      activeLeadFilterCount({
        ...defaultLeadListFilters,
        department: "uniform",
        exception: true,
        sourceDivision: "uniform-rental",
      }),
    ).toBe(3);
  });
});
