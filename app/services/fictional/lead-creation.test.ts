import type { LeadDraft } from "../../domain/lead-creation";
import { createFictionalLeadCreationService } from "./lead-creation";

const validDraft = (): LeadDraft => ({
  customer: {
    city: "St. Louis",
    companyName: "Fictional Packaging Group",
    contactAvailability: "phone",
    contactName: "Pat Demo",
    email: "",
    noContactReason: "",
    phone: "555-010-1040",
    state: "MO",
    streetAddress: "",
    zip: "63101",
  },
  duplicateOverrideReason: "",
  idempotencyKey: "idempotency-demo-1",
  opportunity: {
    additionalNotes: "",
    customerRequestedContactAt: "",
    customerTiming: "within-7-days",
    customerTimingReason: "",
    needSummary:
      "Customer requested a fictional facility-services walkthrough.",
    opportunityContext: "",
  },
  routing: { department: "facility-services", zip: "63101" },
});

describe("fictional lead creation service", () => {
  it("resolves confirmed, mismatched, ambiguous, open, stale, and missing routes", async () => {
    const service = createFictionalLeadCreationService();
    await expect(
      service.resolveRoute({ department: "facility-services", zip: "63101" }),
    ).resolves.toMatchObject({
      route: { representative: { id: "rep-jordan-lee" } },
      type: "confirmed",
    });
    await expect(
      service.resolveRoute({
        department: "facility-services",
        preferredRepresentativeId: "rep-alex-rivera",
        zip: "63101",
      }),
    ).resolves.toMatchObject({ type: "recipient-mismatch" });
    await expect(
      service.resolveRoute({ department: "first-aid-safety", zip: "63101" }),
    ).resolves.toMatchObject({ type: "needs-review" });
    await expect(
      service.resolveRoute({ department: "fire-protection", zip: "63101" }),
    ).resolves.toMatchObject({ type: "open" });
    await expect(
      service.resolveRoute({ department: "facility-services", zip: "02108" }),
    ).resolves.toEqual({ type: "stale" });
    await expect(
      service.resolveRoute({ department: "uniform", zip: "99999" }),
    ).resolves.toEqual({ type: "not-found" });
  });

  it("warns about an authorized fictional duplicate without exposing customer data", async () => {
    const service = createFictionalLeadCreationService();
    const resolved = await service.resolveRoute({
      department: "facility-services",
      zip: "63101",
    });
    if (resolved.type !== "confirmed") throw new Error("Fixture route missing");
    await expect(
      service.checkForDuplicate({
        customer: {
          ...validDraft().customer,
          companyName: "Northstar Packaging",
        },
        route: resolved.route,
      }),
    ).resolves.toMatchObject({ handoffId: "lead-demo-existing-1042" });
  });

  it("returns one saved handoff for repeated submission with the same key", async () => {
    const service = createFictionalLeadCreationService();
    const resolved = await service.resolveRoute(validDraft().routing);
    if (resolved.type !== "confirmed") throw new Error("Fixture route missing");
    const command = {
      confirmedRoute: resolved.route,
      draft: validDraft(),
      senderDepartment: "Uniform — Fictional Demo",
      senderId: "rep-demo-sender",
      senderName: "Demo Sender",
    };
    const first = await service.submit(command);
    const retry = await service.submit(command);
    expect(retry).toEqual(first);
    expect(first).toMatchObject({
      handoffId: "lead-demo-0001",
      inAppNotificationState: "queued",
      smsState: "simulated",
      status: "pending_acceptance",
    });
    expect(first.responseTargetLabel).toContain("August 25, 2026");
  });

  it("keeps the saved handoff when the fictional SMS attempt fails", async () => {
    const service = createFictionalLeadCreationService();
    const draft = validDraft();
    draft.customer.companyName = "Signal Test Labs";
    const resolved = await service.resolveRoute(draft.routing);
    if (resolved.type !== "confirmed") throw new Error("Fixture route missing");
    await expect(
      service.submit({
        confirmedRoute: resolved.route,
        draft,
        senderDepartment: "Uniform — Fictional Demo",
        senderId: "rep-demo-sender",
        senderName: "Demo Sender",
      }),
    ).resolves.toMatchObject({
      handoffId: "lead-demo-0001",
      smsState: "failed",
    });
  });
});
