import {
  defaultDirectoryFilters,
  normalizeDirectoryQuery,
  normalizeDirectoryText,
  searchDirectoryRepresentatives,
  type DirectoryRepresentative,
} from "./representative-directory";
import { fictionalDirectoryRepresentatives } from "../services/fictional/representative-directory";

describe("representative directory search", () => {
  it("normalizes spacing, case, and accents without changing display values", () => {
    expect(normalizeDirectoryQuery("  Cameron   Brooks  ")).toBe(
      "Cameron Brooks",
    );
    expect(normalizeDirectoryText("  JOSÉ   Álvarez ")).toBe("jose alvarez");
  });

  it("ranks exact names before prefixes, contains, and department matches", () => {
    const exact = fictionalDirectoryRepresentatives.find(
      (representative) => representative.id === "rep-jordan-lee",
    );
    expect(exact).toBeDefined();

    const fixtures: DirectoryRepresentative[] = [
      ...fictionalDirectoryRepresentatives,
      {
        ...(exact as DirectoryRepresentative),
        displayName: "Taylor Jordan",
        id: "rep-taylor-jordan-test",
      },
    ];
    const results = searchDirectoryRepresentatives(fixtures, {
      filters: defaultDirectoryFilters,
      limit: 20,
      query: "Jordan Lee",
    });

    expect(results[0]?.id).toBe("rep-jordan-lee");
  });

  it("keeps duplicate display names as separate stable records", () => {
    const results = searchDirectoryRepresentatives(
      fictionalDirectoryRepresentatives,
      {
        filters: defaultDirectoryFilters,
        limit: 20,
        query: "Cameron Brooks",
      },
    );

    expect(results.map((representative) => representative.id)).toEqual([
      "rep-cameron-brooks-first-aid",
      "rep-cameron-brooks-uniform",
    ]);
  });

  it("excludes inactive records and filters only approved directory fields", () => {
    const results = searchDirectoryRepresentatives(
      fictionalDirectoryRepresentatives,
      {
        filters: {
          ...defaultDirectoryFilters,
          department: "uniform",
          location: "demo-101",
        },
        limit: 20,
        query: "",
      },
    );

    expect(
      results.every(
        (representative) =>
          representative.status !== "inactive" &&
          representative.departments.some(
            (department) => department.code === "uniform",
          ) &&
          representative.locations.some(
            (location) => location.number === "demo-101",
          ),
      ),
    ).toBe(true);
    expect(
      results.some(
        (representative) => representative.id === "rep-jamie-cole-inactive",
      ),
    ).toBe(false);
  });
});
