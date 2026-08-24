import {
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

import { Icon } from "../../components/foundation/Icon";
import { PageFrame } from "../../components/layout/PageFrame";
import {
  normalizeTerritorySearch,
  type NormalizedTerritorySearch,
} from "../../domain/territory-search";
import type {
  TerritoryCityMatch,
  TerritoryLookupService,
  TerritorySuggestion,
} from "../../services/territory-lookup-service";
import styles from "./TerritoryLookup.module.css";

type TerritoryLookupProps = {
  lookupService: TerritoryLookupService;
};

type LookupState =
  | { type: "idle" }
  | {
      matches: TerritoryCityMatch[];
      search: NormalizedTerritorySearch;
      type: "choose-state";
    }
  | { search: NormalizedTerritorySearch; type: "no-result" }
  | { search: NormalizedTerritorySearch; type: "ready" };

const departmentOptions = [
  { label: "All departments", value: "all" },
  { label: "Uniform", value: "uniform" },
  { label: "Facility Services", value: "facility-services" },
  { label: "First Aid & Safety", value: "first-aid-safety" },
  { label: "Fire Protection", value: "fire-protection" },
  { label: "Strategic & Specialty", value: "strategic-specialty" },
];

const exampleSearches = ["63101", "Columbia, MO", "Springfield"];

function getInitialQuery(searchParams: URLSearchParams) {
  const zip = searchParams.get("zip");
  if (zip) return zip;

  const city = searchParams.get("city");
  const state = searchParams.get("state");
  if (city) return state ? `${city}, ${state}` : city;

  return "";
}

export function TerritoryLookup({ lookupService }: TerritoryLookupProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fieldId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const helperId = `${fieldId}-helper`;
  const errorId = `${fieldId}-error`;
  const listboxId = `${fieldId}-suggestions`;
  const [query, setQuery] = useState(() => getInitialQuery(searchParams));
  const [department, setDepartment] = useState(
    () => searchParams.get("department") ?? "all",
  );
  const [stateFilter, setStateFilter] = useState(
    () => searchParams.get("filterState") ?? "all",
  );
  const [locationFilter, setLocationFilter] = useState(
    () => searchParams.get("location") ?? "all",
  );
  const [assignmentFilter, setAssignmentFilter] = useState(
    () => searchParams.get("assignment") ?? "all",
  );
  const [suggestions, setSuggestions] = useState<TerritorySuggestion[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [isSuggestionListOpen, setIsSuggestionListOpen] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [dismissedSuggestionValue, setDismissedSuggestionValue] = useState("");
  const [validationError, setValidationError] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [lookupState, setLookupState] = useState<LookupState>({ type: "idle" });
  const deferredQuery = useDeferredValue(query);
  const describedBy = useMemo(
    () => [helperId, validationError ? errorId : ""].filter(Boolean).join(" "),
    [errorId, helperId, validationError],
  );

  useEffect(() => {
    let isCurrent = true;
    const normalizedQuery = deferredQuery.trim();

    if (normalizedQuery.length < 2 || dismissedSuggestionValue) {
      return () => {
        isCurrent = false;
      };
    }

    void lookupService.getSuggestions(normalizedQuery).then((items) => {
      if (!isCurrent) return;

      setSuggestions(items);
      setActiveSuggestionIndex(-1);
      setIsSuggestionListOpen(items.length > 0);
      setIsLoadingSuggestions(false);
    });

    return () => {
      isCurrent = false;
    };
  }, [deferredQuery, dismissedSuggestionValue, lookupService]);

  const updateUrl = (search: NormalizedTerritorySearch) => {
    const nextParams = new URLSearchParams();

    if (search.kind === "zip") {
      nextParams.set("zip", search.zip);
    } else {
      nextParams.set("city", search.city);
      if (search.state) nextParams.set("state", search.state);
    }

    if (department !== "all") nextParams.set("department", department);
    if (stateFilter !== "all") nextParams.set("filterState", stateFilter);
    if (locationFilter !== "all") nextParams.set("location", locationFilter);
    if (assignmentFilter !== "all") {
      nextParams.set("assignment", assignmentFilter);
    }

    void navigate(`/territory?${nextParams.toString()}`);
  };

  const completeSearch = async (search: NormalizedTerritorySearch) => {
    updateUrl(search);
    setIsSuggestionListOpen(false);

    if (search.kind === "zip") {
      const isKnownZip = await lookupService.hasKnownZip(search.zip);

      if (!isKnownZip) {
        setLookupState({ search, type: "no-result" });
        setAnnouncement("No fictional territory location matched this ZIP.");
        return;
      }

      setLookupState({ search, type: "ready" });
      setAnnouncement(`Search criteria accepted for ZIP ${search.zip}.`);
      return;
    }

    const cityMatches = await lookupService.getCityMatches(search.city);
    const stateMatches = search.state
      ? cityMatches.filter((match) => match.state === search.state)
      : cityMatches;

    if (stateMatches.length === 0) {
      setLookupState({ search, type: "no-result" });
      setAnnouncement("No fictional territory location matched this city.");
      return;
    }

    if (!search.state && stateMatches.length > 1) {
      setLookupState({ matches: stateMatches, search, type: "choose-state" });
      setAnnouncement(
        `${stateMatches.length} states match ${search.city}. Choose a state.`,
      );
      return;
    }

    setLookupState({ search, type: "ready" });
    setAnnouncement(`Search criteria accepted for ${search.displayValue}.`);
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = normalizeTerritorySearch(query);

    if (!validation.ok) {
      setValidationError(validation.error);
      setLookupState({ type: "idle" });
      setAnnouncement(validation.error);
      inputRef.current?.focus();
      return;
    }

    setValidationError("");
    setDismissedSuggestionValue(validation.value.displayValue);
    setQuery(validation.value.displayValue);
    setIsSuggestionListOpen(false);
    setIsLoadingSuggestions(false);
    void completeSearch(validation.value);
  };

  const chooseSuggestion = (suggestion: TerritorySuggestion) => {
    setDismissedSuggestionValue(suggestion.searchValue);
    setQuery(suggestion.searchValue);
    setValidationError("");
    setIsSuggestionListOpen(false);
    setIsLoadingSuggestions(false);
    setActiveSuggestionIndex(-1);
    setAnnouncement(`${suggestion.label} selected.`);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isSuggestionListOpen || suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestionIndex((currentIndex) =>
        Math.min(currentIndex + 1, suggestions.length - 1),
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestionIndex((currentIndex) => Math.max(currentIndex - 1, 0));
    } else if (event.key === "Enter" && activeSuggestionIndex >= 0) {
      event.preventDefault();
      const activeSuggestion = suggestions[activeSuggestionIndex];
      if (activeSuggestion) chooseSuggestion(activeSuggestion);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setIsSuggestionListOpen(false);
      setActiveSuggestionIndex(-1);
    }
  };

  const chooseCityState = (match: TerritoryCityMatch) => {
    const search: NormalizedTerritorySearch = {
      city: match.city,
      displayValue: `${match.city}, ${match.state}`,
      kind: "city",
      state: match.state,
    };
    setDismissedSuggestionValue(search.displayValue);
    setQuery(search.displayValue);
    setIsSuggestionListOpen(false);
    setIsLoadingSuggestions(false);
    void completeSearch(search);
  };

  const clearSearch = () => {
    setQuery("");
    setDismissedSuggestionValue("");
    setSuggestions([]);
    setActiveSuggestionIndex(-1);
    setIsSuggestionListOpen(false);
    setIsLoadingSuggestions(false);
    setValidationError("");
    setLookupState({ type: "idle" });
    setAnnouncement("Search cleared.");
    void navigate("/territory");
  };

  return (
    <PageFrame
      description="Search a ZIP code or city to find the right department and representative."
      eyebrow="Fictional routing data"
      title="Find Territory"
    >
      <div className={styles.layout}>
        <section
          aria-labelledby="territory-search"
          className={styles.searchCard}
        >
          <div className={styles.searchHeading}>
            <span aria-hidden="true" className={styles.searchIcon}>
              <Icon name="territory" size="large" />
            </span>
            <div>
              <h2 id="territory-search">Search territory assignments</h2>
              <p>ZIP, ZIP+4, city, or city and state</p>
            </div>
          </div>

          <form noValidate onSubmit={submitSearch}>
            <div className={styles.primaryFields}>
              <div className={styles.comboboxField}>
                <label htmlFor={fieldId}>ZIP code or city</label>
                <div className={styles.inputWrap}>
                  <input
                    aria-activedescendant={
                      activeSuggestionIndex >= 0
                        ? `${listboxId}-option-${activeSuggestionIndex}`
                        : undefined
                    }
                    aria-autocomplete="list"
                    aria-controls={listboxId}
                    aria-describedby={describedBy}
                    aria-expanded={isSuggestionListOpen}
                    aria-invalid={validationError ? "true" : undefined}
                    autoComplete="off"
                    id={fieldId}
                    onChange={(event) => {
                      const nextQuery = event.target.value;
                      setQuery(nextQuery);
                      setDismissedSuggestionValue("");
                      setValidationError("");
                      setLookupState({ type: "idle" });
                      setActiveSuggestionIndex(-1);

                      if (nextQuery.trim().length < 2) {
                        setSuggestions([]);
                        setIsSuggestionListOpen(false);
                        setIsLoadingSuggestions(false);
                      } else {
                        setIsLoadingSuggestions(true);
                      }
                    }}
                    onFocus={() => {
                      if (
                        suggestions.length > 0 &&
                        query.trim() !== dismissedSuggestionValue
                      ) {
                        setIsSuggestionListOpen(true);
                      }
                    }}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Example: 63101 or Columbia, MO"
                    role="combobox"
                    ref={inputRef}
                    type="search"
                    value={query}
                  />
                  {query ? (
                    <button
                      aria-label="Clear ZIP code or city"
                      className={styles.clearButton}
                      onClick={clearSearch}
                      type="button"
                    >
                      ×
                    </button>
                  ) : null}
                </div>
                <p className={styles.helperText} id={helperId}>
                  Enter all five ZIP digits. Do not enter a customer name or
                  street address.
                </p>
                {validationError ? (
                  <p className={styles.fieldError} id={errorId} role="alert">
                    {validationError}
                  </p>
                ) : null}

                <div className={styles.suggestionLayer}>
                  {isLoadingSuggestions ? (
                    <p className={styles.suggestionStatus}>Finding matches…</p>
                  ) : null}
                  {isSuggestionListOpen && suggestions.length > 0 ? (
                    <ul
                      aria-label="Demo location suggestions"
                      className={styles.suggestionList}
                      id={listboxId}
                      role="listbox"
                    >
                      {suggestions.map((suggestion, index) => (
                        <li key={suggestion.id} role="presentation">
                          <button
                            aria-selected={activeSuggestionIndex === index}
                            className={styles.suggestionOption}
                            id={`${listboxId}-option-${index}`}
                            onClick={() => chooseSuggestion(suggestion)}
                            onMouseDown={(event) => event.preventDefault()}
                            role="option"
                            type="button"
                          >
                            <span>{suggestion.label}</span>
                            <small>{suggestion.description}</small>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>

              <div className={styles.departmentField}>
                <label htmlFor="department-filter">Department or service</label>
                <select
                  id="department-filter"
                  onChange={(event) => setDepartment(event.target.value)}
                  value={department}
                >
                  {departmentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <button className={styles.submitButton} type="submit">
                <Icon name="territory" size="large" />
                Find Territory
              </button>
            </div>

            <details className={styles.moreFilters}>
              <summary>More filters</summary>
              <div className={styles.filterGrid}>
                <label>
                  State
                  <select
                    onChange={(event) => setStateFilter(event.target.value)}
                    value={stateFilter}
                  >
                    <option value="all">All states</option>
                    <option value="GA">Georgia</option>
                    <option value="IL">Illinois</option>
                    <option value="MA">Massachusetts</option>
                    <option value="MO">Missouri</option>
                    <option value="NY">New York</option>
                  </select>
                </label>
                <label>
                  Location
                  <select
                    onChange={(event) => setLocationFilter(event.target.value)}
                    value={locationFilter}
                  >
                    <option value="all">All demo locations</option>
                    <option value="demo-101">Demo Location 101</option>
                    <option value="demo-202">Demo Location 202</option>
                    <option value="demo-303">Demo Location 303</option>
                  </select>
                </label>
                <label>
                  Assignment status
                  <select
                    onChange={(event) =>
                      setAssignmentFilter(event.target.value)
                    }
                    value={assignmentFilter}
                  >
                    <option value="all">All statuses</option>
                    <option value="assigned">Assigned</option>
                    <option value="open">Open</option>
                    <option value="needs-review">Needs Review</option>
                  </select>
                </label>
              </div>
            </details>
          </form>

          <div className={styles.exampleSearches}>
            <p>Try a fictional example</p>
            <div>
              {exampleSearches.map((example) => (
                <button
                  key={example}
                  onClick={() => {
                    setQuery(example);
                    setDismissedSuggestionValue("");
                    setValidationError("");
                    setLookupState({ type: "idle" });
                    setIsLoadingSuggestions(example.trim().length >= 2);
                  }}
                  type="button"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <p aria-live="polite" className={styles.visuallyHidden}>
            {announcement}
          </p>
        </section>

        <aside aria-labelledby="data-trust" className={styles.dataCard}>
          <div>
            <p className={styles.demoLabel}>Demo data</p>
            <h2 id="data-trust">Routing source status</h2>
          </div>
          <dl>
            <div>
              <dt>Source updated</dt>
              <dd>August 20, 2026</dd>
            </div>
          </dl>
          <p>
            Fictional fixtures only. No human verification timestamp is claimed,
            and a search never changes assignment ownership.
          </p>
          <Link to="/data-status">View Data Status</Link>
        </aside>

        {lookupState.type === "choose-state" ? (
          <section
            aria-labelledby="choose-state"
            className={`${styles.resultState} ${styles.warningState}`}
          >
            <p className={styles.stateLabel}>Location needs clarification</p>
            <h2 id="choose-state">
              Choose a state for {lookupState.search.displayValue}
            </h2>
            <p>
              This city name appears in more than one state. Territory Desk will
              not choose a routing result automatically.
            </p>
            <div className={styles.stateChoices}>
              {lookupState.matches.map((match) => (
                <button
                  key={match.state}
                  onClick={() => chooseCityState(match)}
                  type="button"
                >
                  {match.city}, {match.stateName}
                  <span>
                    {match.zipCodes.length} known ZIP
                    {match.zipCodes.length === 1 ? "" : "s"}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {lookupState.type === "ready" ? (
          <section
            aria-labelledby="criteria-ready"
            className={`${styles.resultState} ${styles.readyState}`}
          >
            <p className={styles.stateLabel}>Location recognized</p>
            <h2 id="criteria-ready">Search criteria accepted</h2>
            <p>
              Territory Desk is ready to check department assignments for
              <strong> {lookupState.search.displayValue}</strong>.
            </p>
            {lookupState.search.kind === "zip" &&
            lookupState.search.normalizationMessage ? (
              <p className={styles.normalizationNote}>
                {lookupState.search.normalizationMessage}
              </p>
            ) : null}
            <p className={styles.nextStateNote}>
              Matching fictional assignment cards will appear in this area after
              the Territory Results screen is completed.
            </p>
          </section>
        ) : null}

        {lookupState.type === "no-result" ? (
          <section
            aria-labelledby="no-territory-result"
            className={`${styles.resultState} ${styles.noResultState}`}
          >
            <p className={styles.stateLabel}>No match</p>
            <h2 id="no-territory-result">
              No territory assignment found for this search
            </h2>
            <p>
              Check the ZIP or spelling, clear filters, or try a city-and-state
              search. Territory Desk will not guess a neighboring assignment.
            </p>
            <div className={styles.resultActions}>
              <button onClick={clearSearch} type="button">
                Clear Search
              </button>
              <Link to="/directory">Open Directory</Link>
              <Link to="/data-status">Report missing territory data</Link>
            </div>
          </section>
        ) : null}
      </div>
    </PageFrame>
  );
}
