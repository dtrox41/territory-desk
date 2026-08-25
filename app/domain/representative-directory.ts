import type { TerritoryDepartmentCode } from "./territory-result";

export type DirectoryRepresentativeStatus =
  "active" | "inactive" | "needs-review";
export type DirectoryContactMethod = "call" | "email" | "text";
export type DirectoryContactAvailability =
  "available" | "restricted" | "unavailable";

export type DirectoryDepartment = {
  code: TerritoryDepartmentCode;
  label: string;
};

export type DirectoryContact = {
  availability: DirectoryContactAvailability;
  value?: string;
};

export type DirectoryLocation = {
  label: string;
  number: string;
  state: string;
};

export type DirectoryCoverageSummary = {
  cities: string[];
  divisions: string[];
  state: string;
  zipCount: number;
};

export type DirectoryRepresentative = {
  canReceiveHandoffs: boolean;
  contact: Record<DirectoryContactMethod, DirectoryContact>;
  coverage: DirectoryCoverageSummary[];
  departments: DirectoryDepartment[];
  displayName: string;
  id: string;
  lastVerifiedLabel?: string;
  locations: DirectoryLocation[];
  sourceDivisions: string[];
  sourceUpdatedLabel: string;
  status: DirectoryRepresentativeStatus;
};

export type DirectoryFilters = {
  contact: DirectoryContactMethod | "all";
  department: TerritoryDepartmentCode | "all";
  division: string;
  location: string;
  state: string;
  status: Exclude<DirectoryRepresentativeStatus, "inactive"> | "all";
};

export type DirectorySearchRequest = {
  filters: DirectoryFilters;
  limit: number;
  query: string;
};

export type DirectorySearchResponse = {
  dataState: "current" | "stale";
  representatives: DirectoryRepresentative[];
  sourceUpdatedLabel: string;
  suggestions: DirectoryRepresentative[];
  total: number;
  versionsMatch: boolean;
};

export const defaultDirectoryFilters: DirectoryFilters = {
  contact: "all",
  department: "all",
  division: "all",
  location: "all",
  state: "all",
  status: "all",
};

export const directoryDepartments: DirectoryDepartment[] = [
  { code: "uniform", label: "Uniform" },
  { code: "facility-services", label: "Facility Services" },
  { code: "first-aid-safety", label: "First Aid & Safety" },
  { code: "fire-protection", label: "Fire Protection" },
  { code: "strategic-specialty", label: "Strategic & Specialty" },
];

export function normalizeDirectoryText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("en-US");
}

export function normalizeDirectoryQuery(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function getMatchTier(
  representative: DirectoryRepresentative,
  normalizedQuery: string,
) {
  if (!normalizedQuery) return 5;

  const normalizedName = normalizeDirectoryText(representative.displayName);
  if (normalizedName === normalizedQuery) return 0;
  if (normalizedName.startsWith(normalizedQuery)) return 1;
  if (normalizedName.includes(normalizedQuery)) return 2;

  const searchableFields = [
    ...representative.departments.flatMap((department) => [
      department.label,
      department.code,
    ]),
    ...representative.sourceDivisions,
    ...representative.locations.flatMap((location) => [
      location.number,
      location.label,
      location.state,
    ]),
    ...representative.coverage.map((coverage) => coverage.state),
  ].map(normalizeDirectoryText);

  if (searchableFields.some((field) => field === normalizedQuery)) return 3;
  if (searchableFields.some((field) => field.startsWith(normalizedQuery))) {
    return 4;
  }

  return null;
}

function matchesFilters(
  representative: DirectoryRepresentative,
  filters: DirectoryFilters,
) {
  if (
    filters.department !== "all" &&
    !representative.departments.some(
      (department) => department.code === filters.department,
    )
  ) {
    return false;
  }

  if (
    filters.division !== "all" &&
    !representative.sourceDivisions.includes(filters.division)
  ) {
    return false;
  }

  if (
    filters.location !== "all" &&
    !representative.locations.some(
      (location) => location.number === filters.location,
    )
  ) {
    return false;
  }

  if (
    filters.state !== "all" &&
    !representative.coverage.some(
      (coverage) => coverage.state === filters.state,
    )
  ) {
    return false;
  }

  if (filters.status !== "all" && representative.status !== filters.status) {
    return false;
  }

  if (
    filters.contact !== "all" &&
    representative.contact[filters.contact].availability !== "available"
  ) {
    return false;
  }

  return true;
}

export function searchDirectoryRepresentatives(
  representatives: DirectoryRepresentative[],
  request: DirectorySearchRequest,
) {
  const normalizedQuery = normalizeDirectoryText(request.query);

  return representatives
    .filter((representative) => representative.status !== "inactive")
    .filter((representative) => matchesFilters(representative, request.filters))
    .map((representative) => ({
      matchTier: getMatchTier(representative, normalizedQuery),
      representative,
    }))
    .filter(
      (
        result,
      ): result is {
        matchTier: number;
        representative: DirectoryRepresentative;
      } => result.matchTier !== null,
    )
    .sort(
      (left, right) =>
        left.matchTier - right.matchTier ||
        left.representative.displayName.localeCompare(
          right.representative.displayName,
        ) ||
        left.representative.id.localeCompare(right.representative.id),
    )
    .map((result) => result.representative);
}

export function getDirectoryFilterCount(filters: DirectoryFilters) {
  return Object.values(filters).filter((value) => value !== "all").length;
}
