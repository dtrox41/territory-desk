import type {
  TerritoryCityMatch,
  TerritoryLookupService,
  TerritorySuggestion,
} from "../territory-lookup-service";
import type {
  TerritoryAssignment,
  TerritoryRepresentative,
  TerritorySearchResult,
} from "../../domain/territory-result";
import type { NormalizedTerritorySearch } from "../../domain/territory-search";

const representative = (
  id: string,
  displayName: string,
  contact: TerritoryRepresentative["contact"] = {
    call: "available",
    email: "available",
    text: "available",
  },
): TerritoryRepresentative => ({
  canReceiveHandoffs: true,
  contact,
  displayName,
  id,
});

const assignments: TerritoryAssignment[] = [
  {
    departmentCode: "first-aid-safety",
    departmentLabel: "First Aid & Safety",
    id: "assignment-63101-fas-review",
    locationNumber: "demo-101",
    representatives: [
      representative("rep-morgan-ellis", "Morgan Ellis"),
      representative("rep-casey-nguyen", "Casey Nguyen"),
    ],
    sourceDivision: "First Aid & Safety",
    status: "needs-review",
    zipCodes: ["63101"],
  },
  {
    departmentCode: "fire-protection",
    departmentLabel: "Fire Protection",
    id: "assignment-63101-fire-open",
    locationNumber: "demo-101",
    representatives: [],
    sourceDivision: "Fire Protection",
    status: "open",
    zipCodes: ["63101"],
  },
  {
    departmentCode: "facility-services",
    departmentLabel: "Facility Services",
    id: "assignment-63101-facility",
    locationNumber: "demo-101",
    representatives: [
      representative("rep-jordan-lee", "Jordan Lee", {
        call: "available",
        email: "available",
        text: "unavailable",
      }),
    ],
    sourceDivision: "Facility Services",
    status: "assigned",
    zipCodes: ["63101"],
  },
  {
    departmentCode: "strategic-specialty",
    departmentLabel: "Strategic & Specialty",
    id: "assignment-63101-specialty",
    locationNumber: "demo-101",
    representatives: [representative("rep-devon-park", "Devon Park")],
    sourceDivision: "Product Specialist",
    status: "assigned",
    zipCodes: ["63101"],
  },
  {
    departmentCode: "uniform",
    departmentLabel: "Uniform",
    id: "assignment-63101-uniform",
    locationNumber: "demo-101",
    representatives: [representative("rep-avery-morgan", "Avery Morgan")],
    sourceDivision: "Uniform Rental",
    status: "assigned",
    zipCodes: ["63101"],
  },
  {
    departmentCode: "facility-services",
    departmentLabel: "Facility Services",
    id: "assignment-65201-facility",
    locationNumber: "demo-202",
    representatives: [representative("rep-alex-rivera", "Alex Rivera")],
    sourceDivision: "Facility Services",
    status: "assigned",
    zipCodes: ["65201"],
  },
  {
    departmentCode: "facility-services",
    departmentLabel: "Facility Services",
    id: "assignment-65203-facility",
    locationNumber: "demo-202",
    representatives: [representative("rep-sam-wilson", "Sam Wilson")],
    sourceDivision: "Facility Services",
    status: "assigned",
    zipCodes: ["65203"],
  },
  {
    departmentCode: "first-aid-safety",
    departmentLabel: "First Aid & Safety",
    id: "assignment-columbia-fas",
    locationNumber: "demo-202",
    representatives: [representative("rep-taylor-kim", "Taylor Kim")],
    sourceDivision: "FAS Account Executive",
    status: "assigned",
    zipCodes: ["65201", "65203"],
  },
  {
    departmentCode: "uniform",
    departmentLabel: "Uniform",
    id: "assignment-columbia-uniform",
    locationNumber: "demo-202",
    representatives: [representative("rep-riley-chen", "Riley Chen")],
    sourceDivision: "Uniform Rental",
    status: "assigned",
    zipCodes: ["65201", "65203"],
  },
  {
    departmentCode: "uniform",
    departmentLabel: "Uniform",
    id: "assignment-30303-uniform",
    locationNumber: "demo-303",
    representatives: [
      representative("rep-drew-bennett", "Drew Bennett", {
        call: "restricted",
        email: "available",
        text: "unavailable",
      }),
    ],
    sourceDivision: "SRIT Uniform Rental",
    status: "assigned",
    zipCodes: ["30303"],
  },
  {
    departmentCode: "facility-services",
    departmentLabel: "Facility Services",
    id: "assignment-02108-facility",
    locationNumber: "demo-404",
    representatives: [representative("rep-skyler-gray", "Skyler Gray")],
    sourceDivision: "Sanis Ambassador",
    status: "assigned",
    zipCodes: ["02108"],
  },
  {
    departmentCode: "uniform",
    departmentLabel: "Uniform",
    id: "assignment-10001-uniform",
    locationLabelIncomplete: true,
    locationNumber: "demo-505",
    representatives: [representative("rep-parker-shaw", "Parker Shaw")],
    sourceDivision: "Uniform Rental",
    status: "assigned",
    zipCodes: ["10001"],
  },
  {
    departmentCode: "uniform",
    departmentLabel: "Uniform",
    id: "assignment-62701-uniform",
    locationNumber: "demo-606",
    representatives: [representative("rep-emerson-fox", "Emerson Fox")],
    sourceDivision: "Uniform Rental",
    status: "assigned",
    zipCodes: ["62701"],
  },
  {
    departmentCode: "fire-protection",
    departmentLabel: "Fire Protection",
    id: "assignment-65806-fire-open",
    locationNumber: "demo-707",
    representatives: [],
    sourceDivision: "Fire Protection Specialist",
    status: "open",
    zipCodes: ["65806"],
  },
];

const cityMatches: TerritoryCityMatch[] = [
  {
    city: "Atlanta",
    state: "GA",
    stateName: "Georgia",
    zipCodes: ["30303"],
  },
  {
    city: "Boston",
    state: "MA",
    stateName: "Massachusetts",
    zipCodes: ["02108"],
  },
  {
    city: "Columbia",
    state: "MO",
    stateName: "Missouri",
    zipCodes: ["65201", "65203"],
  },
  {
    city: "New York",
    state: "NY",
    stateName: "New York",
    zipCodes: ["10001"],
  },
  {
    city: "Springfield",
    state: "IL",
    stateName: "Illinois",
    zipCodes: ["62701"],
  },
  {
    city: "Springfield",
    state: "MO",
    stateName: "Missouri",
    zipCodes: ["65806"],
  },
  {
    city: "St. Louis",
    state: "MO",
    stateName: "Missouri",
    zipCodes: ["63101"],
  },
];

const zipSuggestions: TerritorySuggestion[] = cityMatches.flatMap((match) =>
  match.zipCodes.map((zip) => ({
    description: `${match.city}, ${match.state}`,
    id: `zip-${zip}`,
    label: zip,
    searchValue: zip,
    type: "zip" as const,
  })),
);

const citySuggestions: TerritorySuggestion[] = cityMatches.map((match) => ({
  description: `${match.zipCodes.length} known ZIP${match.zipCodes.length === 1 ? "" : "s"}`,
  id: `city-${match.city.toLowerCase().replace(/[^a-z]+/g, "-")}-${match.state.toLowerCase()}`,
  label: `${match.city}, ${match.state}`,
  searchValue: `${match.city}, ${match.state}`,
  type: "city",
}));

const knownZipCodes = new Set(zipSuggestions.map((item) => item.searchValue));

function buildResult(
  search: NormalizedTerritorySearch,
): TerritorySearchResult | null {
  const location =
    search.kind === "zip"
      ? cityMatches.find((match) => match.zipCodes.includes(search.zip))
      : cityMatches.find(
          (match) =>
            match.city.toLowerCase() === search.city.toLowerCase() &&
            (!search.state || match.state === search.state),
        );

  if (!location) return null;

  const resultZipCodes =
    search.kind === "zip" ? [search.zip] : location.zipCodes;
  const resultAssignments = assignments.filter((assignment) =>
    assignment.zipCodes.some((zip) => resultZipCodes.includes(zip)),
  );

  return {
    assignments: resultAssignments,
    canonicalCity: location.city,
    canonicalState: location.state,
    dataState:
      search.kind === "zip" && search.zip === "02108" ? "stale" : "current",
    search,
    sourceUpdatedLabel: "August 20, 2026",
    zipCodes: resultZipCodes,
  };
}

export const fictionalTerritoryLookupService: TerritoryLookupService = {
  getCityMatches(city) {
    const normalizedCity = city.trim().toLowerCase();
    return Promise.resolve(
      cityMatches.filter(
        (match) => match.city.toLowerCase() === normalizedCity,
      ),
    );
  },
  getSuggestions(query) {
    const normalizedQuery = query.trim().replace(/\s+/g, " ").toLowerCase();

    if (normalizedQuery.length < 2) {
      return Promise.resolve([]);
    }

    const source = /^\d/.test(normalizedQuery)
      ? zipSuggestions.filter((suggestion) =>
          suggestion.searchValue.startsWith(normalizedQuery),
        )
      : citySuggestions.filter((suggestion) =>
          suggestion.label.toLowerCase().startsWith(normalizedQuery),
        );

    return Promise.resolve(source.slice(0, 8));
  },
  getResults(search) {
    return Promise.resolve(buildResult(search));
  },
  hasKnownZip(zip) {
    return Promise.resolve(knownZipCodes.has(zip));
  },
};
