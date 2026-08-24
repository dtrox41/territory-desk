import { fictionalTerritoryLookupService } from "./territory-lookup";

describe("fictionalTerritoryLookupService", () => {
  it("returns ZIP-prefix and city-prefix suggestions without guessing", async () => {
    await expect(
      fictionalTerritoryLookupService.getSuggestions("63"),
    ).resolves.toEqual([
      expect.objectContaining({ label: "63101", searchValue: "63101" }),
    ]);
    await expect(
      fictionalTerritoryLookupService.getSuggestions("Spring"),
    ).resolves.toHaveLength(2);
    await expect(
      fictionalTerritoryLookupService.getSuggestions("Sprngfield"),
    ).resolves.toEqual([]);
  });

  it("exposes ambiguous city states and exact known ZIP membership", async () => {
    await expect(
      fictionalTerritoryLookupService.getCityMatches("Springfield"),
    ).resolves.toHaveLength(2);
    await expect(
      fictionalTerritoryLookupService.hasKnownZip("63101"),
    ).resolves.toBe(true);
    await expect(
      fictionalTerritoryLookupService.hasKnownZip("99999"),
    ).resolves.toBe(false);
  });

  it("returns assigned, open, and conflicting fictional ZIP results", async () => {
    const result = await fictionalTerritoryLookupService.getResults({
      displayValue: "63101",
      kind: "zip",
      zip: "63101",
    });

    expect(result?.assignments).toHaveLength(5);
    expect(result?.assignments.map((assignment) => assignment.status)).toEqual(
      expect.arrayContaining(["assigned", "open", "needs-review"]),
    );
  });

  it("returns every known city ZIP and marks the stale demo result", async () => {
    const cityResult = await fictionalTerritoryLookupService.getResults({
      city: "Columbia",
      displayValue: "Columbia, MO",
      kind: "city",
      state: "MO",
    });
    const staleResult = await fictionalTerritoryLookupService.getResults({
      displayValue: "02108",
      kind: "zip",
      zip: "02108",
    });

    expect(cityResult?.zipCodes).toEqual(["65201", "65203"]);
    expect(cityResult?.assignments).toHaveLength(4);
    expect(staleResult?.dataState).toBe("stale");
  });
});
