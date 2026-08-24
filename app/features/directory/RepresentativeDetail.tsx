import { useState, useSyncExternalStore } from "react";
import { Link } from "react-router";

import { PageFrame } from "../../components/layout/PageFrame";
import type {
  DirectoryContactMethod,
  DirectoryRepresentative,
} from "../../domain/representative-directory";
import styles from "./RepresentativeDetail.module.css";

type RepresentativeDetailProps = {
  representative: DirectoryRepresentative | null;
};

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

const contactLabels: Record<DirectoryContactMethod, string> = {
  call: "Call",
  email: "Email",
  text: "Text",
};

function ContactPanel({
  online,
  representative,
}: {
  online: boolean;
  representative: DirectoryRepresentative;
}) {
  const [utilityMessage, setUtilityMessage] = useState("");
  const contactMethods = Object.keys(contactLabels) as DirectoryContactMethod[];
  const directContactBlocked = representative.status !== "active" || !online;

  return (
    <section aria-labelledby="representative-contact" className={styles.panel}>
      <header className={styles.panelHeader}>
        <div>
          <p className={styles.eyebrow}>Authorized fictional profile</p>
          <h2 id="representative-contact">Contact utilities</h2>
        </div>
      </header>
      <p className={styles.guidance}>
        Call, Text, and Email are utilities only. They do not create a tracked
        lead, assign ownership, or satisfy a response target.
      </p>
      {directContactBlocked ? (
        <p className={styles.warning}>
          {online
            ? "Direct contact is disabled while this fictional identity needs review."
            : "Direct contact is disabled while the session is offline and cannot be revalidated."}
        </p>
      ) : null}
      <ul className={styles.contactList}>
        {contactMethods.map((method) => {
          const contact = representative.contact[method];
          const available =
            contact.availability === "available" && !directContactBlocked;

          return (
            <li key={method}>
              <div>
                <strong>{contactLabels[method]}</strong>
                <span>
                  {contact.value && contact.availability === "available"
                    ? contact.value
                    : contact.availability === "restricted"
                      ? "Needs review"
                      : "Unavailable"}
                </span>
              </div>
              <button
                disabled={!available}
                onClick={() =>
                  setUtilityMessage(
                    `${contactLabels[method]} selected for this fictional profile. No external contact was placed.`,
                  )
                }
                type="button"
              >
                {contactLabels[method]}
              </button>
            </li>
          );
        })}
      </ul>
      {utilityMessage ? (
        <p className={styles.utilityStatus} role="status">
          {utilityMessage}
        </p>
      ) : null}
    </section>
  );
}

function CoveragePanel({
  representative,
}: {
  representative: DirectoryRepresentative;
}) {
  return (
    <section aria-labelledby="territory-coverage" className={styles.panel}>
      <header className={styles.panelHeader}>
        <div>
          <p className={styles.eyebrow}>Routing context</p>
          <h2 id="territory-coverage">Territory coverage</h2>
        </div>
        <Link to="/territory">Verify a Customer ZIP</Link>
      </header>
      <p className={styles.guidance}>
        Coverage summarizes versioned fictional assignments. It is not inferred
        from this contact profile and does not replace Territory Lookup.
      </p>
      {representative.coverage.length > 0 ? (
        <details className={styles.coverageDetails}>
          <summary>View Territory Coverage</summary>
          <div className={styles.coverageGrid}>
            {representative.coverage.map((coverage) => (
              <article
                key={`${coverage.state}-${coverage.divisions.join("-")}`}
              >
                <h3>{coverage.state}</h3>
                <dl>
                  <div>
                    <dt>Known cities</dt>
                    <dd>{coverage.cities.join(", ")}</dd>
                  </div>
                  <div>
                    <dt>ZIP count</dt>
                    <dd>{coverage.zipCount}</dd>
                  </div>
                  <div>
                    <dt>Divisions</dt>
                    <dd>{coverage.divisions.join(", ")}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </details>
      ) : (
        <p className={styles.warning}>
          Current coverage is unavailable. Use Territory Lookup or request
          routing help.
        </p>
      )}
    </section>
  );
}

export function RepresentativeDetail({
  representative,
}: RepresentativeDetailProps) {
  const online = useSyncExternalStore(
    subscribeToOnlineStatus,
    getOnlineStatus,
    getServerOnlineStatus,
  );

  if (!representative) {
    return (
      <PageFrame
        description="This fictional representative record is unavailable or outside the current demo scope."
        eyebrow="Representative Directory"
        title="Representative not available"
      >
        <section className={styles.notFound}>
          <h2>Find a current representative</h2>
          <p>
            Territory Desk will not infer a person from an unknown identifier.
            Return to the directory or verify the customer&apos;s territory.
          </p>
          <div>
            <Link to="/directory">Return to Directory</Link>
            <Link to="/territory">Search Territory</Link>
          </div>
        </section>
      </PageFrame>
    );
  }

  const active = representative.status === "active";
  const canStartLead =
    online &&
    representative.status !== "inactive" &&
    representative.canReceiveHandoffs;

  return (
    <PageFrame
      description="Review approved fictional service and territory context before choosing a contact utility or starting a tracked handoff."
      eyebrow="Representative Directory"
      title={representative.displayName}
    >
      <div className={styles.detailLayout}>
        <section
          aria-labelledby="representative-overview"
          className={styles.profileCard}
        >
          <div className={styles.profileTopline}>
            <span
              className={`${styles.status} ${
                active ? styles.activeStatus : styles.reviewStatus
              }`}
            >
              {active
                ? "Active"
                : representative.status === "inactive"
                  ? "Inactive"
                  : "Needs Review"}
            </span>
            <span>Fictional stable profile</span>
          </div>
          <h2 id="representative-overview">Representative overview</h2>
          <dl className={styles.profileFacts}>
            <div>
              <dt>Department or service</dt>
              <dd>
                {representative.departments
                  .map((department) => department.label)
                  .join(", ")}
              </dd>
            </div>
            <div>
              <dt>Exact source divisions</dt>
              <dd>{representative.sourceDivisions.join(", ")}</dd>
            </div>
            <div>
              <dt>Locations</dt>
              <dd>
                {representative.locations
                  .map((location) => location.label)
                  .join(", ")}
              </dd>
            </div>
            <div>
              <dt>Territory summary</dt>
              <dd>
                {representative.coverage.length > 0
                  ? `${[
                      ...new Set(
                        representative.coverage.map(
                          (coverage) => coverage.state,
                        ),
                      ),
                    ].join(", ")} · ${representative.coverage.reduce(
                      (total, coverage) => total + coverage.zipCount,
                      0,
                    )} ZIPs`
                  : "Coverage unavailable"}
              </dd>
            </div>
          </dl>

          {!active ? (
            <p className={styles.warning}>
              {representative.status === "inactive"
                ? "This historical fictional representative cannot receive a new handoff."
                : "This fictional identity has conflicting information. Territory validation is still required before any tracked handoff."}
            </p>
          ) : null}

          <div className={styles.primaryActions}>
            {canStartLead ? (
              <Link
                className={styles.sendLead}
                to={`/leads/new?representative=${encodeURIComponent(
                  representative.id,
                )}&source=directory`}
              >
                Send Lead
              </Link>
            ) : representative.status === "inactive" ? (
              <Link className={styles.sendLead} to="/territory">
                Find Current Territory Owner
              </Link>
            ) : (
              <p className={styles.blockedAction}>
                Reconnect before starting a tracked handoff.
              </p>
            )}
            <Link className={styles.backLink} to="/directory">
              Return to Directory
            </Link>
          </div>
          <p className={styles.routingReminder}>
            Send Lead preselects this representative only. Requested service,
            customer ZIP, and current territory validation remain required.
          </p>
        </section>

        <ContactPanel online={online} representative={representative} />
        <CoveragePanel representative={representative} />

        <section aria-labelledby="profile-data-status" className={styles.panel}>
          <header className={styles.panelHeader}>
            <div>
              <p className={styles.eyebrow}>Data trust</p>
              <h2 id="profile-data-status">Source status</h2>
            </div>
            <Link to="/data-status?source=directory">View Data Status</Link>
          </header>
          <dl className={styles.sourceFacts}>
            <div>
              <dt>Source updated</dt>
              <dd>{representative.sourceUpdatedLabel}</dd>
            </div>
            {representative.lastVerifiedLabel ? (
              <div>
                <dt>Last verified</dt>
                <dd>{representative.lastVerifiedLabel}</dd>
              </div>
            ) : null}
          </dl>
          {!representative.lastVerifiedLabel ? (
            <p className={styles.guidance}>
              No separate human-verification date is available for this
              fictional profile.
            </p>
          ) : null}
          <Link
            className={styles.reportLink}
            to={`/data-status?source=directory&record=${encodeURIComponent(
              representative.id,
            )}#known-issues`}
          >
            Report Incorrect Information
          </Link>
        </section>
      </div>
    </PageFrame>
  );
}
