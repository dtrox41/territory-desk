import {
  getNextBusinessDay,
  normalizeCompanyForDuplicateCheck,
  validateCustomerDraft,
  validateOpportunityDraft,
  validateRouteDraft,
} from "./lead-creation";

describe("lead creation rules", () => {
  it("requires an exact service and five-digit ZIP", () => {
    expect(validateRouteDraft({ department: "", zip: "6310" })).toEqual({
      department: "Select a requested department or service.",
      zip: "Enter an exact five-digit customer ZIP code.",
    });
    expect(
      validateRouteDraft({ department: "facility-services", zip: "63101" }),
    ).toEqual({});
  });

  it("requires only the customer contacts declared available", () => {
    const base = {
      city: "St. Louis",
      companyName: "Demo Company",
      contactAvailability: "phone" as const,
      contactName: "",
      email: "",
      noContactReason: "",
      phone: "",
      state: "MO",
      streetAddress: "",
      zip: "63101",
    };
    expect(validateCustomerDraft(base)).toHaveProperty("phone");
    expect(validateCustomerDraft({ ...base, phone: "(555) 010-1010" })).toEqual(
      {},
    );
    expect(
      validateCustomerDraft({
        ...base,
        contactAvailability: "none",
        noContactReason: "Still confirming the right customer contact.",
      }),
    ).toEqual({});
  });

  it("requires actionable need text and an explanation for ASAP timing", () => {
    const errors = validateOpportunityDraft({
      additionalNotes: "",
      customerRequestedContactAt: "",
      customerTiming: "asap",
      customerTimingReason: "",
      needSummary: "short",
      opportunityContext: "",
    });
    expect(errors).toHaveProperty("needSummary");
    expect(errors).toHaveProperty("customerTimingReason");
  });

  it("normalizes duplicate comparison without changing displayed input", () => {
    expect(normalizeCompanyForDuplicateCheck("  Northstar   Packaging ")).toBe(
      "northstar packaging",
    );
  });

  it("skips weekends for the one-business-day response rule", () => {
    expect(
      getNextBusinessDay(new Date("2026-08-28T15:00:00Z")).toISOString(),
    ).toContain("2026-08-31");
    expect(
      getNextBusinessDay(new Date("2026-08-24T15:00:00Z")).toISOString(),
    ).toContain("2026-08-25");
  });
});
