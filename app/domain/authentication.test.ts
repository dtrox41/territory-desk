import {
  errorOutcomeMessage,
  sanitizeReturnDestination,
} from "./authentication";

describe("authentication domain", () => {
  it("accepts only allowlisted relative application destinations", () => {
    expect(sanitizeReturnDestination("/leads")).toBe("/leads");
    expect(sanitizeReturnDestination("/leads/LEAD-DEMO-102")).toBe(
      "/leads/LEAD-DEMO-102",
    );
    expect(sanitizeReturnDestination("/help/account-access")).toBe(
      "/help/account-access",
    );
  });

  it.each([
    "https://attacker.example",
    "//attacker.example",
    "javascript:alert(1)",
    "/%2e%2e/profile",
    "/leads?customer=private",
    "/help#private-text",
    "/unknown-route",
    "/leads/../../profile",
  ])("rejects unsafe return destination %s", (value) => {
    expect(sanitizeReturnDestination(value)).toBe("/");
  });

  it("distinguishes definite and unknown command outcomes", () => {
    expect(errorOutcomeMessage("failed")).toContain("definitely failed");
    expect(errorOutcomeMessage("succeeded")).toContain("definitely succeeded");
    expect(errorOutcomeMessage("unknown")).toContain("result is unknown");
  });
});
