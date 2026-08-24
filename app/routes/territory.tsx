import { pageMeta } from "../components/layout/page-meta";
import { TerritoryLookup } from "../features/territory/TerritoryLookup";
import { fictionalTerritoryLookupService } from "../services/fictional/territory-lookup";

export function meta() {
  return pageMeta(
    "Find Territory",
    "Search fictional ZIP and city routing data without entering customer information.",
  );
}

export default function Territory() {
  return <TerritoryLookup lookupService={fictionalTerritoryLookupService} />;
}
