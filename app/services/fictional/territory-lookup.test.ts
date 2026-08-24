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
});
