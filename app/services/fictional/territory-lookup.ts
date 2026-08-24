import type {
  TerritoryCityMatch,
  TerritoryLookupService,
  TerritorySuggestion,
} from "../territory-lookup-service";

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
  hasKnownZip(zip) {
    return Promise.resolve(knownZipCodes.has(zip));
  },
};
