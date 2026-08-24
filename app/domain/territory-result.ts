import type { NormalizedTerritorySearch } from "./territory-search";

export type TerritoryDepartmentCode =
  | "facility-services"
  | "fire-protection"
  | "first-aid-safety"
  | "strategic-specialty"
  | "uniform";

export type TerritoryAssignmentStatus = "assigned" | "needs-review" | "open";

export type TerritoryContactAvailability =
  "available" | "restricted" | "unavailable";

export type TerritoryRepresentative = {
  canReceiveHandoffs: boolean;
  contact: {
    call: TerritoryContactAvailability;
    email: TerritoryContactAvailability;
    text: TerritoryContactAvailability;
  };
  displayName: string;
  id: string;
};

export type TerritoryAssignment = {
  departmentCode: TerritoryDepartmentCode;
  departmentLabel: string;
  id: string;
  locationLabelIncomplete?: boolean;
  locationNumber: string;
  representatives: TerritoryRepresentative[];
  sourceDivision: string;
  status: TerritoryAssignmentStatus;
  zipCodes: string[];
};

export type TerritoryResultDataState = "current" | "stale";

export type TerritorySearchResult = {
  assignments: TerritoryAssignment[];
  canonicalCity?: string;
  canonicalState?: string;
  dataState: TerritoryResultDataState;
  search: NormalizedTerritorySearch;
  sourceUpdatedLabel: string;
  zipCodes: string[];
};

export type TerritoryResultFilters = {
  assignmentStatus: TerritoryAssignmentStatus | "all";
  department: TerritoryDepartmentCode | "all";
  location: string;
  state: string;
};

const statusOrder: Record<TerritoryAssignmentStatus, number> = {
  "needs-review": 0,
  open: 1,
  assigned: 2,
};

export function filterAndSortTerritoryAssignments(
  result: TerritorySearchResult,
  filters: TerritoryResultFilters,
) {
  const stateMatches =
    filters.state === "all" || result.canonicalState === filters.state;

  if (!stateMatches) return [];

  return result.assignments
    .filter(
      (assignment) =>
        filters.department === "all" ||
        assignment.departmentCode === filters.department,
    )
    .filter(
      (assignment) =>
        filters.location === "all" ||
        assignment.locationNumber === filters.location,
    )
    .filter(
      (assignment) =>
        filters.assignmentStatus === "all" ||
        assignment.status === filters.assignmentStatus,
    )
    .slice()
    .sort(
      (left, right) =>
        statusOrder[left.status] - statusOrder[right.status] ||
        left.sourceDivision.localeCompare(right.sourceDivision),
    );
}

export function groupTerritoryAssignments(assignments: TerritoryAssignment[]) {
  const groups = new Map<
    TerritoryDepartmentCode,
    { assignments: TerritoryAssignment[]; label: string }
  >();

  for (const assignment of assignments) {
    const existing = groups.get(assignment.departmentCode);
    if (existing) {
      existing.assignments.push(assignment);
    } else {
      groups.set(assignment.departmentCode, {
        assignments: [assignment],
        label: assignment.departmentLabel,
      });
    }
  }

  return [...groups.entries()].map(([code, group]) => ({ code, ...group }));
}
