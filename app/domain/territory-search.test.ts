import { normalizeTerritorySearch } from "./territory-search";

describe("normalizeTerritorySearch", () => {
  it("preserves complete ZIP codes and explicitly normalizes ZIP+4", () => {
    expect(normalizeTerritorySearch("02108")).toEqual({
      ok: true,
      value: { displayValue: "02108", kind: "zip", zip: "02108" },
    });
    expect(normalizeTerritorySearch("63101-2040")).toEqual({
      ok: true,
      value: {
        displayValue: "63101",
        kind: "zip",
        normalizationMessage:
          "Using five-digit ZIP 63101 from ZIP+4 63101-2040.",
        zip: "63101",
      },
    });
  });

  it("rejects partial or malformed ZIP input without padding", () => {
    expect(normalizeTerritorySearch("631")).toEqual({
      error: "Enter all five ZIP-code digits before searching.",
      ok: false,
    });
    expect(normalizeTerritorySearch("631011").ok).toBe(false);
  });

  it("normalizes repeated city spaces and supported state names", () => {
    expect(normalizeTerritorySearch("  columbia,   missouri ")).toEqual({
      ok: true,
      value: {
        city: "Columbia",
        displayValue: "Columbia, MO",
        kind: "city",
        state: "MO",
      },
    });
  });
});
