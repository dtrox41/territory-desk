import { Link } from "react-router";

import {
  filterAndSortTerritoryAssignments,
  groupTerritoryAssignments,
  type TerritoryAssignment,
  type TerritoryContactAvailability,
  type TerritoryResultFilters,
  type TerritorySearchResult,
} from "../../domain/territory-result";
import styles from "./TerritoryResults.module.css";

type TerritoryResultsProps = {
  filters: TerritoryResultFilters;
  onChooseZip: (zip: string) => void;
  onDemoContact: (channel: string, representativeName: string) => void;
  result: TerritorySearchResult;
};

const statusLabel = {
  assigned: "Assigned",
  "needs-review": "Needs Review",
  open: "Open Territory",
};

const contactLabel: Record<TerritoryContactAvailability, string> = {
  available: "Available",
  restricted: "Restricted",
  unavailable: "Unavailable",
};

const departmentLabel = {
  all: "All departments",
  "facility-services": "Facility Services",
  "fire-protection": "Fire Protection",
  "first-aid-safety": "First Aid & Safety",
  "strategic-specialty": "Strategic & Specialty",
  uniform: "Uniform",
};

function displayLocationNumber(locationNumber: string) {
  return locationNumber.replace(/^demo-/i, "Demo Location ");
}

function ResultContactOptions({
  assignment,
  onDemoContact,
}: {
  assignment: TerritoryAssignment;
  onDemoContact: TerritoryResultsProps["onDemoContact"];
}) {
  const representative = assignment.representatives[0];
  if (!representative) return null;

  const channels = [
    ["Call", representative.contact.call],
    ["Email", representative.contact.email],
    ["Text", representative.contact.text],
  ] as const;

  return (
    <details className={styles.contactOptions}>
      <summary>Contact options</summary>
      <div>
        <p>
          Demo utilities only. Direct contact is not a tracked lead handoff.
        </p>
        <ul>
          {channels.map(([channel, availability]) => (
            <li key={channel}>
              {availability === "available" ? (
                <button
                  onClick={() =>
                    onDemoContact(channel, representative.displayName)
                  }
                  type="button"
                >
                  {channel} — fictional demo
                </button>
              ) : (
                <span>
                  {channel} — {contactLabel[availability]}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

function ReportInformationLink({
  assignment,
}: {
  assignment: TerritoryAssignment;
}) {
  return (
    <Link
      className={styles.reportLink}
      state={{
        territoryReportContext: {
          assignmentId: assignment.id,
          sourceVersion: "fictional-2026-08-20",
        },
      }}
      to="/data-status?source=territory#known-issues"
    >
      Report Incorrect Information
    </Link>
  );
}

function AssignedCard({
  assignment,
  onDemoContact,
  result,
}: {
  assignment: TerritoryAssignment;
  onDemoContact: TerritoryResultsProps["onDemoContact"];
  result: TerritorySearchResult;
}) {
  const representative = assignment.representatives[0];
  if (!representative) return null;

  const hasExactZip = result.search.kind === "zip";
  const canSendLead =
    hasExactZip &&
    result.dataState === "current" &&
    representative.canReceiveHandoffs &&
    !assignment.locationLabelIncomplete;
  const exactZip = result.search.kind === "zip" ? result.search.zip : undefined;

  const routingSnapshot = canSendLead
    ? {
        assignmentId: assignment.id,
        city: result.canonicalCity,
        department: assignment.departmentCode,
        division: assignment.sourceDivision,
        location: assignment.locationNumber,
        representativeId: representative.id,
        sourceVersion: "fictional-2026-08-20",
        state: result.canonicalState,
        zip: exactZip,
      }
    : undefined;

  return (
    <article className={`${styles.assignmentCard} ${styles.assignedCard}`}>
      <div className={styles.cardTopline}>
        <span className={`${styles.status} ${styles.assignedStatus}`}>
          Assigned
        </span>
        <span>{assignment.sourceDivision}</span>
      </div>
      <h4>{representative.displayName}</h4>
      <dl className={styles.assignmentFacts}>
        <div>
          <dt>Location</dt>
          <dd>{displayLocationNumber(assignment.locationNumber)}</dd>
        </div>
        <div>
          <dt>ZIP coverage</dt>
          <dd>{assignment.zipCodes.join(", ")}</dd>
        </div>
      </dl>

      {assignment.locationLabelIncomplete ? (
        <p className={styles.warningMessage}>
          <strong>Location label incomplete.</strong> Request routing help
          before using this assignment.
        </p>
      ) : null}

      <ul aria-label="Contact availability" className={styles.contactSummary}>
        <li>Call: {contactLabel[representative.contact.call]}</li>
        <li>Email: {contactLabel[representative.contact.email]}</li>
        <li>Text: {contactLabel[representative.contact.text]}</li>
      </ul>

      <div className={styles.primaryActions}>
        {canSendLead ? (
          <Link
            className={styles.sendLead}
            state={{ routingSnapshot }}
            to="/leads/new"
          >
            Send Lead
          </Link>
        ) : (
          <p className={styles.blockedActionReason}>
            {result.search.kind === "city"
              ? "Select the customer's exact ZIP above before sending a lead."
              : result.dataState === "stale"
                ? "Send Lead is unavailable until routing data is refreshed."
                : "Send Lead is unavailable while this routing label is incomplete."}
          </p>
        )}
        <Link
          className={styles.secondaryAction}
          to={`/directory/${representative.id}`}
        >
          View Representative
        </Link>
      </div>

      <ResultContactOptions
        assignment={assignment}
        onDemoContact={onDemoContact}
      />
      <ReportInformationLink assignment={assignment} />
      <p className={styles.sourceDate}>
        Source updated {result.sourceUpdatedLabel}
      </p>
    </article>
  );
}

function ExceptionCard({
  assignment,
  result,
}: {
  assignment: TerritoryAssignment;
  result: TerritorySearchResult;
}) {
  const isConflict = assignment.status === "needs-review";
  const issue = isConflict ? "assignment-conflict" : "open-territory";

  return (
    <article
      className={`${styles.assignmentCard} ${
        isConflict ? styles.reviewCard : styles.openCard
      }`}
    >
      <div className={styles.cardTopline}>
        <span
          className={`${styles.status} ${
            isConflict ? styles.reviewStatus : styles.openStatus
          }`}
        >
          {statusLabel[assignment.status]}
        </span>
        <span>{assignment.sourceDivision}</span>
      </div>
      <h4>{isConflict ? "Routing assignment conflict" : "Open Territory"}</h4>
      <p className={styles.exceptionMessage}>
        {isConflict
          ? "More than one representative is assigned. Territory Desk will not choose automatically."
          : "No approved representative is assigned. Territory Desk will not fabricate a recipient."}
      </p>
      <dl className={styles.assignmentFacts}>
        <div>
          <dt>Location</dt>
          <dd>{displayLocationNumber(assignment.locationNumber)}</dd>
        </div>
        <div>
          <dt>ZIP coverage</dt>
          <dd>{assignment.zipCodes.join(", ")}</dd>
        </div>
      </dl>

      {isConflict ? (
        <ul
          aria-label="Conflicting fictional representatives"
          className={styles.conflictList}
        >
          {assignment.representatives.map((representative) => (
            <li key={representative.id}>
              <span>{representative.displayName}</span>
              <Link to={`/directory/${representative.id}`}>
                View Representative
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <div className={styles.primaryActions}>
        <Link
          className={styles.sendLead}
          state={{
            territoryHelpContext: {
              assignmentId: assignment.id,
              sourceVersion: "fictional-2026-08-20",
            },
          }}
          to={`/data-status?source=territory&issue=${issue}#known-issues`}
        >
          Request Routing Help
        </Link>
      </div>
      <ReportInformationLink assignment={assignment} />
      <p className={styles.sourceDate}>
        Source updated {result.sourceUpdatedLabel}
      </p>
    </article>
  );
}

export function TerritoryResults({
  filters,
  onChooseZip,
  onDemoContact,
  result,
}: TerritoryResultsProps) {
  const assignments = filterAndSortTerritoryAssignments(result, filters);
  const groups = groupTerritoryAssignments(assignments);
  const exceptionCount = assignments.filter(
    (assignment) => assignment.status !== "assigned",
  ).length;
  const exactZipRequired = result.search.kind === "city";
  const filterLabels = [departmentLabel[filters.department]];

  if (filters.state !== "all") filterLabels.push(`State: ${filters.state}`);
  if (filters.location !== "all") {
    filterLabels.push(displayLocationNumber(filters.location));
  }
  if (filters.assignmentStatus !== "all") {
    filterLabels.push(`Status: ${statusLabel[filters.assignmentStatus]}`);
  }

  return (
    <section aria-labelledby="territory-results" className={styles.results}>
      <header className={styles.resultHeader}>
        <div>
          <p className={styles.eyebrow}>Fictional territory results</p>
          <h2 id="territory-results">
            {result.canonicalCity && result.canonicalState
              ? `${result.canonicalCity}, ${result.canonicalState}`
              : result.search.displayValue}
          </h2>
          <p>
            {assignments.length} matching service assignment
            {assignments.length === 1 ? "" : "s"}
            {exceptionCount > 0
              ? ` · ${exceptionCount} routing exception${exceptionCount === 1 ? "" : "s"}`
              : ""}
          </p>
        </div>
        <dl>
          <div>
            <dt>ZIP{result.zipCodes.length === 1 ? "" : "s"}</dt>
            <dd>{result.zipCodes.join(", ")}</dd>
          </div>
          <div>
            <dt>Source updated</dt>
            <dd>{result.sourceUpdatedLabel}</dd>
          </div>
        </dl>
      </header>

      <div aria-label="Active result filters" className={styles.filterSummary}>
        <span>Filters</span>
        <ul>
          {filterLabels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      </div>

      {result.search.kind === "zip" && result.search.normalizationMessage ? (
        <p className={styles.informationBanner}>
          {result.search.normalizationMessage}
        </p>
      ) : null}

      {result.dataState === "stale" ? (
        <div className={styles.staleBanner} role="status">
          <strong>Routing data refresh needed.</strong>
          <span>
            Results remain visible, but Send Lead is unavailable until the
            source is refreshed.
          </span>
        </div>
      ) : null}

      {exactZipRequired ? (
        <div className={styles.zipChoice}>
          <div>
            <h3>Select the customer&apos;s exact ZIP</h3>
            <p>
              City results may route to different representatives. An exact ZIP
              is required before starting a tracked handoff.
            </p>
          </div>
          <div aria-label="Known ZIP choices">
            {result.zipCodes.map((zip) => (
              <button key={zip} onClick={() => onChooseZip(zip)} type="button">
                Use {zip}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {groups.length === 0 ? (
        <div className={styles.filteredEmpty}>
          <h3>No assignments match these filters</h3>
          <p>
            Change or clear a filter. Territory Desk will not broaden it
            silently.
          </p>
        </div>
      ) : (
        <div className={styles.groupList}>
          {groups.map((group) => {
            const groupExceptions = group.assignments.filter(
              (assignment) => assignment.status !== "assigned",
            ).length;

            return (
              <section
                aria-labelledby={`territory-group-${group.code}`}
                className={styles.resultGroup}
                key={group.code}
              >
                <header>
                  <div>
                    <h3 id={`territory-group-${group.code}`}>{group.label}</h3>
                    <p>
                      {group.assignments.length} assignment
                      {group.assignments.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  {groupExceptions > 0 ? (
                    <span className={styles.exceptionCount}>
                      {groupExceptions} needs attention
                    </span>
                  ) : null}
                </header>
                <div className={styles.cardGrid}>
                  {group.assignments.map((assignment) =>
                    assignment.status === "assigned" ? (
                      <AssignedCard
                        assignment={assignment}
                        key={assignment.id}
                        onDemoContact={onDemoContact}
                        result={result}
                      />
                    ) : (
                      <ExceptionCard
                        assignment={assignment}
                        key={assignment.id}
                        result={result}
                      />
                    ),
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}
