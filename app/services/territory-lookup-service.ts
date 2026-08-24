export type TerritorySuggestion = {
  description: string;
  id: string;
  label: string;
  searchValue: string;
  type: "city" | "zip";
};

export type TerritoryCityMatch = {
  city: string;
  state: string;
  stateName: string;
  zipCodes: string[];
};

export interface TerritoryLookupService {
  getCityMatches(city: string): Promise<TerritoryCityMatch[]>;
  getResults(
    search: NormalizedTerritorySearch,
  ): Promise<TerritorySearchResult | null>;
  getSuggestions(query: string): Promise<TerritorySuggestion[]>;
  hasKnownZip(zip: string): Promise<boolean>;
}
import type { TerritorySearchResult } from "../domain/territory-result";
import type { NormalizedTerritorySearch } from "../domain/territory-search";
