import {
  filterAndSortTerritoryAssignments,
  groupTerritoryAssignments,
  type TerritorySearchResult,
} from "./territory-result";

const result: TerritorySearchResult = {
  assignments: [
    {
      departmentCode: "uniform",
      departmentLabel: "Uniform",
      id: "assigned",
      locationNumber: "demo-101",
      representatives: [],
      sourceDivision: "Uniform Rental",
      status: "assigned",
      zipCodes: ["63101"],
    },
    {
      departmentCode: "facility-services",
      departmentLabel: "Facility Services",
      id: "open",
      locationNumber: "demo-101",
      representatives: [],
      sourceDivision: "Facility Services",
      status: "open",
      zipCodes: ["63101"],
    },
    {
      departmentCode: "uniform",
      departmentLabel: "Uniform",
      id: "review",
      locationNumber: "demo-101",
      representatives: [],
      sourceDivision: "SRIT Uniform Rental",
      status: "needs-review",
      zipCodes: ["63101"],
    },
  ],
  canonicalCity: "St. Louis",
  canonicalState: "MO",
  dataState: "current",
  search: { displayValue: "63101", kind: "zip", zip: "63101" },
  sourceUpdatedLabel: "August 20, 2026",
  zipCodes: ["63101"],
};

describe("territory result filtering", () => {
  it("orders needs-review, open, and assigned without performance ranking", () => {
    const assignments = filterAndSortTerritoryAssignments(result, {
      assignmentStatus: "all",
      department: "all",
      location: "all",
      state: "all",
    });

    expect(assignments.map((assignment) => assignment.status)).toEqual([
      "needs-review",
      "open",
      "assigned",
    ]);
  });

  it("filters by approved fields and groups only visible assignments", () => {
    const assignments = filterAndSortTerritoryAssignments(result, {
      assignmentStatus: "all",
      department: "uniform",
      location: "demo-101",
      state: "MO",
    });
    const groups = groupTerritoryAssignments(assignments);

    expect(assignments).toHaveLength(2);
    expect(groups).toEqual([
      expect.objectContaining({ code: "uniform", label: "Uniform" }),
    ]);
  });
});
