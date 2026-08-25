import { useLoaderData, useLocation } from "react-router";

import { pageMeta } from "../components/layout/page-meta";
import { normalizeTerritorySearch } from "../domain/territory-search";
import {
  TerritoryLookup,
  type TerritoryLookupState,
} from "../features/territory/TerritoryLookup";
import { fictionalTerritoryLookupService } from "../services/fictional/territory-lookup";
import type { Route } from "./+types/territory";

export function meta() {
  return pageMeta(
    "Find Territory",
    "Search fictional ZIP and city routing data without entering customer information.",
  );
}

function getSearchValue(searchParams: URLSearchParams) {
  const zip = searchParams.get("zip");
  if (zip) return zip;

  const city = searchParams.get("city");
  const state = searchParams.get("state");
  if (city) return state ? `${city}, ${state}` : city;

  return null;
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const searchValue = getSearchValue(new URL(request.url).searchParams);
  if (!searchValue) return null;

  const validation = normalizeTerritorySearch(searchValue);
  if (!validation.ok) return null;

  const search = validation.value;

  if (search.kind === "city") {
    const cityMatches = await fictionalTerritoryLookupService.getCityMatches(
      search.city,
    );
    const stateMatches = search.state
      ? cityMatches.filter((match) => match.state === search.state)
      : cityMatches;

    if (!search.state && stateMatches.length > 1) {
      return {
        matches: stateMatches,
        search,
        type: "choose-state",
      } satisfies TerritoryLookupState;
    }

    if (stateMatches.length === 0) {
      return { search, type: "no-result" } satisfies TerritoryLookupState;
    }
  }

  const result = await fictionalTerritoryLookupService.getResults(search);
  return result
    ? ({ result, search, type: "ready" } satisfies TerritoryLookupState)
    : ({ search, type: "no-result" } satisfies TerritoryLookupState);
}

clientLoader.hydrate = true as const;

export default function Territory() {
  const initialState = useLoaderData<typeof clientLoader>();
  const location = useLocation();

  return (
    <TerritoryLookup
      initialState={initialState ?? undefined}
      key={location.search}
      lookupService={fictionalTerritoryLookupService}
    />
  );
}
