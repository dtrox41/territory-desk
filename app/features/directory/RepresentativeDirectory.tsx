import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
} from "react";
import { Link, useSearchParams } from "react-router";

import { PageFrame } from "../../components/layout/PageFrame";
import {
  directoryDepartments,
  getDirectoryFilterCount,
  normalizeDirectoryQuery,
  type DirectoryContactMethod,
  type DirectoryFilters,
  type DirectoryRepresentative,
  type DirectoryRepresentativeStatus,
  type DirectorySearchResponse,
} from "../../domain/representative-directory";
import type { TerritoryDepartmentCode } from "../../domain/territory-result";
import type { RepresentativeDirectoryService } from "../../services/representative-directory-service";
import styles from "./RepresentativeDirectory.module.css";

type RepresentativeDirectoryProps = {
  directoryService: RepresentativeDirectoryService;
};

const pageSize = 6;

const divisionOptions = [
  "Education Specialist",
  "Facility Services",
  "FAS Account Executive",
  "Fire Protection Specialist",
  "First Aid & Safety",
  "Healthcare Specialist",
  "Product Specialist",
  "Sanis Ambassador",
  "SRIT Uniform Rental",
  "Uniform Rental",
];

const locationOptions = [
  ["demo-101", "Demo Location 101"],
  ["demo-202", "Demo Location 202"],
  ["demo-303", "Demo Location 303"],
  ["demo-404", "Demo Location 404"],
  ["demo-606", "Demo Location 606"],
] as const;

const stateOptions = [
  ["GA", "Georgia"],
  ["IL", "Illinois"],
  ["MA", "Massachusetts"],
  ["MO", "Missouri"],
] as const;

const statusLabels: Record<DirectoryRepresentativeStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  "needs-review": "Needs Review",
};

const contactLabels: Record<DirectoryContactMethod, string> = {
  call: "Call",
  email: "Email",
  text: "Text",
};

function isDepartment(value: string): value is TerritoryDepartmentCode {
  return directoryDepartments.some((department) => department.code === value);
}

function getFilters(searchParams: URLSearchParams): DirectoryFilters {
  const department = searchParams.get("department") ?? "all";
  const contact = searchParams.get("contact") ?? "all";
  const status = searchParams.get("status") ?? "all";

  return {
    contact: ["call", "email", "text"].includes(contact)
      ? (contact as DirectoryContactMethod)
      : "all",
    department: isDepartment(department) ? department : "all",
    division: searchParams.get("division") ?? "all",
    location: searchParams.get("location") ?? "all",
    state: searchParams.get("state") ?? "all",
    status: status === "active" || status === "needs-review" ? status : "all",
  };
}

function subscribeToOnlineStatus(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);

  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getOnlineStatus() {
  return navigator.onLine;
}

function getServerOnlineStatus() {
  return true;
}

function ContactAvailability({
  representative,
}: {
  representative: DirectoryRepresentative;
}) {
  const availableMethods = (
    Object.keys(contactLabels) as DirectoryContactMethod[]
  ).filter(
    (method) => representative.contact[method].availability === "available",
  );

  return (
    <p className={styles.contactAvailability}>
      <strong>Direct contact:</strong>{" "}
      {availableMethods.length > 0
        ? availableMethods.map((method) => contactLabels[method]).join(", ")
        : "Unavailable"}
    </p>
  );
}

function RepresentativeCard({
  dataState,
  online,
  representative,
  versionsMatch,
}: {
  dataState: DirectorySearchResponse["dataState"];
  online: boolean;
  representative: DirectoryRepresentative;
  versionsMatch: boolean;
}) {
  const primaryLocation = representative.locations[0];
  const coverageStates = [
    ...new Set(representative.coverage.map((coverage) => coverage.state)),
  ];
  const visibleDivisions = representative.sourceDivisions.slice(0, 3);
  const additionalDivisionCount = representative.sourceDivisions.length - 3;
  const canStartLead =
    representative.canReceiveHandoffs &&
    representative.status !== "inactive" &&
    dataState === "current" &&
    versionsMatch &&
    online;
  const accessibleContext = `${representative.departments
    .map((department) => department.label)
    .join(", ")}, ${primaryLocation?.label ?? "location unavailable"}`;

  return (
    <article
      className={`${styles.representativeCard} ${
        representative.status === "needs-review" ? styles.reviewCard : ""
      }`}
    >
      <div className={styles.cardTopline}>
        <span
          className={`${styles.status} ${
            representative.status === "needs-review"
              ? styles.reviewStatus
              : styles.activeStatus
          }`}
        >
          {statusLabels[representative.status]}
        </span>
        <span>{primaryLocation?.label ?? "Location unavailable"}</span>
      </div>
      <h2>{representative.displayName}</h2>
      <p className={styles.departmentSummary}>
        {representative.departments
          .map((department) => department.label)
          .join(" · ")}
      </p>
      <ul aria-label="Exact source divisions" className={styles.divisionList}>
        {visibleDivisions.map((division) => (
          <li key={division}>{division}</li>
        ))}
        {additionalDivisionCount > 0 ? (
          <li>+{additionalDivisionCount} more</li>
        ) : null}
      </ul>
      <dl className={styles.cardFacts}>
        <div>
          <dt>Territory summary</dt>
          <dd>
            {coverageStates.length > 0
              ? `${coverageStates.join(", ")} · ${representative.coverage.reduce(
                  (total, coverage) => total + coverage.zipCount,
                  0,
                )} ZIPs`
              : "Coverage unavailable"}
          </dd>
        </div>
      </dl>
      <ContactAvailability representative={representative} />
      {representative.status === "needs-review" ? (
        <p className={styles.warningMessage}>
          Contact information has a fictional identity exception. Direct contact
          is disabled until reviewed.
        </p>
      ) : null}
      <div className={styles.cardActions}>
        <Link
          aria-label={`View ${representative.displayName}, ${accessibleContext}`}
          className={styles.primaryAction}
          to={`/directory/${representative.id}`}
        >
          View Representative
        </Link>
        {canStartLead ? (
          <Link
            aria-label={`Send Lead to ${representative.displayName}, ${accessibleContext}`}
            className={styles.secondaryAction}
            state={{
              leadEntryContext: {
                representativeId: representative.id,
                source: "directory",
              },
            }}
            to="/leads/new"
          >
            Send Lead
          </Link>
        ) : (
          <p className={styles.blockedAction}>
            {!online
              ? "Reconnect before starting a tracked handoff."
              : versionsMatch
                ? "Send Lead is unavailable until directory data is current."
                : "Send Lead is unavailable because data versions do not match."}
          </p>
        )}
      </div>
      <Link
        className={styles.reportLink}
        to={`/data-status?source=directory&record=${encodeURIComponent(
          representative.id,
        )}#known-issues`}
      >
        Report Incorrect Information
      </Link>
      <p className={styles.sourceDate}>
        Source updated {representative.sourceUpdatedLabel}
      </p>
    </article>
  );
}

export function RepresentativeDirectory({
  directoryService,
}: RepresentativeDirectoryProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = getFilters(searchParams);
  const urlQuery = searchParams.get("query") ?? "";
  const [searchInput, setSearchInput] = useState(urlQuery);
  const [limit, setLimit] = useState(pageSize);
  const [response, setResponse] = useState<DirectorySearchResponse>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const online = useSyncExternalStore(
    subscribeToOnlineStatus,
    getOnlineStatus,
    getServerOnlineStatus,
  );
  const normalizedInput = normalizeDirectoryQuery(searchInput);
  const meaningfulQuery = normalizedInput.length >= 2 ? normalizedInput : "";

  useEffect(() => {
    const updateUrlTimer = window.setTimeout(() => {
      const nextParams = new URLSearchParams(searchParams);

      if (normalizedInput) nextParams.set("query", normalizedInput);
      else nextParams.delete("query");

      if (nextParams.toString() !== searchParams.toString()) {
        setSearchParams(nextParams, { replace: true });
      }
    }, 250);

    return () => window.clearTimeout(updateUrlTimer);
  }, [normalizedInput, searchParams, setSearchParams]);

  useEffect(() => {
    if (!online) return;

    const controller = new AbortController();
    const searchTimer = window.setTimeout(
      () => {
        setLoading(true);
        setError(false);

        void directoryService
          .search(
            {
              filters: {
                contact: filters.contact,
                department: filters.department,
                division: filters.division,
                location: filters.location,
                state: filters.state,
                status: filters.status,
              },
              limit,
              query: urlQuery.length >= 2 ? urlQuery : "",
            },
            controller.signal,
          )
          .then((nextResponse) => setResponse(nextResponse))
          .catch((searchError: unknown) => {
            if (
              !(searchError instanceof DOMException) ||
              searchError.name !== "AbortError"
            ) {
              setError(true);
            }
          })
          .finally(() => {
            if (!controller.signal.aborted) setLoading(false);
          });
      },
      urlQuery ? 250 : 0,
    );

    return () => {
      controller.abort();
      window.clearTimeout(searchTimer);
    };
  }, [
    directoryService,
    filters.contact,
    filters.department,
    filters.division,
    filters.location,
    filters.state,
    filters.status,
    limit,
    online,
    retryKey,
    urlQuery,
  ]);

  const updateFilter = (
    event: ChangeEvent<HTMLSelectElement>,
    key: keyof DirectoryFilters,
  ) => {
    const nextParams = new URLSearchParams(searchParams);
    const value = event.target.value;

    if (value === "all") nextParams.delete(key);
    else nextParams.set(key, value);

    setLimit(pageSize);
    setSearchParams(nextParams);
  };

  const clearFilters = () => {
    setSearchInput("");
    setLimit(pageSize);
    setSearchParams({});
  };

  const activeFilterCount = getDirectoryFilterCount(filters);
  const hasMore = Boolean(
    response && response.representatives.length < response.total,
  );
  const statusMessage = loading
    ? "Searching fictional representatives…"
    : response
      ? `Showing ${response.representatives.length} of ${response.total} representatives.`
      : "Directory results unavailable.";

  return (
    <PageFrame
      description="Find a teammate by name, department, or location."
      eyebrow="Fictional people-discovery prototype"
      title="Representative Directory"
    >
      <div className={styles.directoryLayout}>
        <section
          aria-labelledby="directory-search"
          className={styles.searchPanel}
        >
          <h2 id="directory-search">Find a representative</h2>
          {!online ? (
            <div className={styles.offlineBanner} role="status">
              <strong>You are offline.</strong>
              <span>
                Previously loaded fictional results remain visible. Reconnect
                before searching or starting a handoff.
              </span>
            </div>
          ) : null}
          <div className={styles.primaryFilters}>
            <div className={styles.field}>
              <label htmlFor="directory-search-input">
                Search representatives
              </label>
              <input
                autoComplete="off"
                disabled={!online}
                id="directory-search-input"
                list="representative-suggestions"
                onChange={(event) => {
                  setSearchInput(event.target.value);
                  setLimit(pageSize);
                }}
                placeholder="Name, department, division, location, or state"
                type="search"
                value={searchInput}
              />
              <datalist id="representative-suggestions">
                {response?.suggestions.map((representative) => (
                  <option
                    key={representative.id}
                    value={representative.displayName}
                  >
                    {representative.departments[0]?.label} ·{" "}
                    {representative.locations[0]?.label}
                  </option>
                ))}
              </datalist>
              {normalizedInput.length === 1 ? (
                <p className={styles.fieldHint}>
                  Enter one more character to search.
                </p>
              ) : (
                <p className={styles.fieldHint}>
                  Suggestions begin after two characters. Do not enter customer
                  information.
                </p>
              )}
            </div>
            <div className={styles.field}>
              <label htmlFor="directory-department-filter">
                Department or service
              </label>
              <select
                disabled={!online}
                id="directory-department-filter"
                onChange={(event) => updateFilter(event, "department")}
                value={filters.department}
              >
                <option value="all">All departments</option>
                {directoryDepartments.map((department) => (
                  <option key={department.code} value={department.code}>
                    {department.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <details className={styles.moreFilters}>
            <summary>
              More filters
              {activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ""}
            </summary>
            <div className={styles.filterGrid}>
              <div className={styles.field}>
                <label htmlFor="directory-division-filter">
                  Exact source division
                </label>
                <select
                  disabled={!online}
                  id="directory-division-filter"
                  onChange={(event) => updateFilter(event, "division")}
                  value={filters.division}
                >
                  <option value="all">All source divisions</option>
                  {divisionOptions.map((division) => (
                    <option key={division}>{division}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor="directory-location-filter">Location</label>
                <select
                  disabled={!online}
                  id="directory-location-filter"
                  onChange={(event) => updateFilter(event, "location")}
                  value={filters.location}
                >
                  <option value="all">All locations</option>
                  {locationOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor="directory-state-filter">State</label>
                <select
                  disabled={!online}
                  id="directory-state-filter"
                  onChange={(event) => updateFilter(event, "state")}
                  value={filters.state}
                >
                  <option value="all">All states</option>
                  {stateOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor="directory-status-filter">
                  Assignment status
                </label>
                <select
                  disabled={!online}
                  id="directory-status-filter"
                  onChange={(event) => updateFilter(event, "status")}
                  value={filters.status}
                >
                  <option value="all">All active statuses</option>
                  <option value="active">Active</option>
                  <option value="needs-review">Needs Review</option>
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor="directory-contact-filter">
                  Contact availability
                </label>
                <select
                  disabled={!online}
                  id="directory-contact-filter"
                  onChange={(event) => updateFilter(event, "contact")}
                  value={filters.contact}
                >
                  <option value="all">Any availability</option>
                  <option value="call">Call available</option>
                  <option value="email">Email available</option>
                  <option value="text">Text available</option>
                </select>
              </div>
            </div>
          </details>
        </section>

        <section
          aria-labelledby="directory-results"
          className={styles.resultsPanel}
        >
          <header className={styles.resultsHeader}>
            <div>
              <h2 id="directory-results">Representatives</h2>
              <p aria-live="polite">{statusMessage}</p>
            </div>
            {meaningfulQuery || activeFilterCount > 0 ? (
              <button onClick={clearFilters} type="button">
                Clear search and filters
              </button>
            ) : null}
          </header>

          <div className={styles.activeSummary}>
            <strong>Active criteria</strong>
            <span>
              {meaningfulQuery
                ? `Search: “${meaningfulQuery}”`
                : "Short alphabetical first page"}
              {activeFilterCount > 0
                ? ` · ${activeFilterCount} additional filter${activeFilterCount === 1 ? "" : "s"}`
                : ""}
            </span>
          </div>

          {response?.dataState === "stale" ? (
            <div className={styles.staleBanner} role="status">
              <strong>Directory data refresh needed.</strong>
              <span>
                Results remain visible, but Send Lead is disabled until routing
                can be revalidated.
              </span>
            </div>
          ) : null}

          {response && !response.versionsMatch ? (
            <div className={styles.errorBanner} role="alert">
              <strong>Data versions do not match.</strong>
              <span>
                Directory and territory routing must be refreshed before a new
                handoff begins.
              </span>
            </div>
          ) : null}

          {error ? (
            <div className={styles.errorBanner} role="alert">
              <strong>Representative search could not be completed.</strong>
              <span>Your search and filters have been preserved.</span>
              <button
                onClick={() => setRetryKey((value) => value + 1)}
                type="button"
              >
                Try Again
              </button>
            </div>
          ) : null}

          {loading && !response ? (
            <div className={styles.loadingState} role="status">
              Loading fictional representatives…
            </div>
          ) : response && response.representatives.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>No representatives match this search.</h3>
              <p>
                Clear filters or verify the customer&apos;s service area through
                Territory Lookup. Territory Desk will not suggest an unverified
                recipient.
              </p>
              <div>
                <button onClick={clearFilters} type="button">
                  Clear filters
                </button>
                <Link to="/territory">Search Territory</Link>
                <Link to="/data-status?source=directory&issue=missing-representative#known-issues">
                  Report a Missing Representative
                </Link>
              </div>
            </div>
          ) : response ? (
            <>
              <div className={styles.cardGrid}>
                {response.representatives.map((representative) => (
                  <RepresentativeCard
                    dataState={response.dataState}
                    key={representative.id}
                    online={online}
                    representative={representative}
                    versionsMatch={response.versionsMatch}
                  />
                ))}
              </div>
              {hasMore ? (
                <button
                  className={styles.showMore}
                  disabled={!online || loading}
                  onClick={() => setLimit((value) => value + pageSize)}
                  type="button"
                >
                  Show More Representatives
                </button>
              ) : null}
            </>
          ) : null}

          <footer className={styles.dataFooter}>
            <span>
              Source updated {response?.sourceUpdatedLabel ?? "not loaded"}
            </span>
            <span>No human verification date is assumed.</span>
            <Link to="/data-status?source=directory">View Data Status</Link>
          </footer>
        </section>
      </div>
    </PageFrame>
  );
}
