import { defaultDirectoryFilters } from "../../domain/representative-directory";
import { fictionalRepresentativeDirectoryService } from "./representative-directory";

describe("fictional representative directory service", () => {
  it("limits the first page and suggestions independently from total matches", async () => {
    const response = await fictionalRepresentativeDirectoryService.search({
      filters: defaultDirectoryFilters,
      limit: 6,
      query: "",
    });

    expect(response.representatives).toHaveLength(6);
    expect(response.total).toBeGreaterThan(6);
    expect(response.suggestions).toHaveLength(0);
    expect(response.representatives).not.toContainEqual(
      expect.objectContaining({ status: "inactive" }),
    );
  });

  it("returns no more than eight suggestions after two characters", async () => {
    const response = await fictionalRepresentativeDirectoryService.search({
      filters: defaultDirectoryFilters,
      limit: 20,
      query: "ca",
    });

    expect(response.suggestions.length).toBeLessThanOrEqual(8);
    expect(
      response.suggestions.some(
        (representative) => representative.displayName === "Cameron Brooks",
      ),
    ).toBe(true);
  });

  it("preserves inactive profiles for authorized historical detail routes", async () => {
    const representative =
      await fictionalRepresentativeDirectoryService.getRepresentative(
        "rep-jamie-cole-inactive",
      );

    expect(representative).toEqual(
      expect.objectContaining({
        canReceiveHandoffs: false,
        status: "inactive",
      }),
    );
  });

  it("marks the fictional Massachusetts dataset state stale", async () => {
    const response = await fictionalRepresentativeDirectoryService.search({
      filters: { ...defaultDirectoryFilters, state: "MA" },
      limit: 6,
      query: "",
    });

    expect(response.dataState).toBe("stale");
  });
});
