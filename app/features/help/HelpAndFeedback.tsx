import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";

import { Icon } from "../../components/foundation/Icon";
import { PageFrame } from "../../components/layout/PageFrame";
import {
  applicationCategoryLabels,
  applicationImpactLabels,
  containsProhibitedHelpContent,
  helpTopicGroups,
  searchHelpTopics,
  suggestionAreaLabels,
  suggestionFrequencyLabels,
  suggestionImpactLabels,
  type HelpRequestType,
  type HelpSnapshot,
  type SafeDiagnostic,
} from "../../domain/help";
import type { HelpService } from "../../services/help-service";
import styles from "./HelpAndFeedback.module.css";

type FormKind = HelpRequestType | null;

function requestKey(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formText(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
}

function useOnline() {
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}

function RoutingChoice({
  description,
  icon,
  label,
  onClick,
  to,
}: {
  description: string;
  icon: "database" | "help" | "profile" | "send";
  label: string;
  onClick?: () => void;
  to?: string;
}) {
  const content = (
    <>
      <span className={styles.routeIcon}>
        <Icon name={icon} size="large" />
      </span>
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <span aria-hidden="true" className={styles.arrow}>
        →
      </span>
    </>
  );
  return to ? (
    <Link className={styles.routeChoice} to={to}>
      {content}
    </Link>
  ) : (
    <button className={styles.routeChoice} onClick={onClick} type="button">
      {content}
    </button>
  );
}

function Diagnostics({ diagnostics }: { diagnostics: SafeDiagnostic[] }) {
  return (
    <fieldset className={styles.diagnostics}>
      <legend>Review safe diagnostic context</legend>
      <p>
        No full URL, page contents, customer information, credentials, logs, or
        device fingerprint is attached.
      </p>
      {diagnostics.map((item) => (
        <label key={item.label}>
          <input
            defaultChecked
            disabled={!item.optional}
            name="diagnostics"
            type="checkbox"
            value={item.label}
          />
          <span>
            <strong>{item.label}</strong>: {item.value}
            {!item.optional ? " · Required ownership context" : ""}
          </span>
        </label>
      ))}
    </fieldset>
  );
}

function HelpRequestDialog({
  diagnostics,
  kind,
  offline,
  onClose,
  onSaved,
  service,
}: {
  diagnostics: SafeDiagnostic[];
  kind: Exclude<FormKind, null>;
  offline: boolean;
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
  service: HelpService;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const key = useRef(requestKey(kind));
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => dialog.current?.showModal(), []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const isProblem = kind === "application-problem";
    const primary = formText(form, isProblem ? "summary" : "problem").trim();
    const secondary = formText(
      form,
      isProblem ? "details" : "suggestion",
    ).trim();
    const action = formText(form, "action").trim();
    if (primary.length < 10) {
      setError(
        isProblem
          ? "Add a summary between 10 and 160 characters."
          : "Describe the problem to solve in at least 10 characters.",
      );
      return;
    }
    if (containsProhibitedHelpContent(primary, secondary, action)) {
      setError(
        "Remove credentials, links, or customer contact information. The entered value was not logged.",
      );
      return;
    }
    setPending(true);
    setError("");
    try {
      const result = isProblem
        ? await service.submitApplicationProblem({
            action,
            category: formText(form, "category"),
            contactAllowed: form.get("contact") === "yes",
            details: secondary,
            diagnosticLabels: form
              .getAll("diagnostics")
              .filter((value): value is string => typeof value === "string"),
            idempotencyKey: key.current,
            impact: formText(form, "impact"),
            screen: formText(form, "screen"),
            summary: primary,
          })
        : await service.submitSuggestion({
            area: formText(form, "area"),
            contactAllowed: form.get("contact") === "yes",
            frequency: formText(form, "frequency"),
            idempotencyKey: key.current,
            impact: formText(form, "idea-impact"),
            problem: primary,
            suggestion: secondary,
          });
      if (result.type === "unknown") {
        setError(
          "The save result is unknown. Check My Requests before trying again.",
        );
        return;
      }
      dialog.current?.close();
      await onSaved(
        result.request.routingState === "Routing delayed"
          ? "Request saved; support routing is delayed. Do not submit again."
          : isProblem
            ? `Fictional request submitted · ${result.request.id}`
            : `Suggestion received · ${result.request.id}`,
      );
    } catch {
      setError(
        "Request was not submitted. Your in-memory entry is still here; retry when ready.",
      );
    } finally {
      setPending(false);
    }
  }

  const title =
    kind === "application-problem"
      ? "Report an application problem"
      : "Suggest an improvement";

  return (
    <dialog
      aria-labelledby="help-request-title"
      className={styles.dialog}
      onCancel={(event) => {
        event.preventDefault();
        dialog.current?.close();
      }}
      onClose={onClose}
      ref={dialog}
    >
      <form onSubmit={(event) => void submit(event)}>
        <header className={styles.dialogHeader}>
          <div>
            <p>Fictional submission</p>
            <h2 id="help-request-title">{title}</h2>
          </div>
          <button
            aria-label={`Close ${title}`}
            onClick={() => dialog.current?.close()}
            type="button"
          >
            ×
          </button>
        </header>
        <div className={styles.dialogBody}>
          <div className={styles.privacyNotice} role="note">
            Do not include customer or employee contact information,
            credentials, confidential details, links, screenshots, or files.
          </div>
          {kind === "application-problem" ? (
            <>
              <label>
                Category
                <select defaultValue="action" name="category">
                  {Object.entries(applicationCategoryLabels).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </label>
              <label>
                Impact
                <select defaultValue="limited" name="impact">
                  {Object.entries(applicationImpactLabels).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </label>
              <label>
                Screen or workflow
                <select defaultValue="Leads" name="screen">
                  {[
                    "Home",
                    "Territory Lookup",
                    "Send Lead",
                    "Leads",
                    "Lead Detail",
                    "Directory",
                    "Notifications",
                    "Manager Insights",
                    "Data Status",
                    "Profile",
                    "Help",
                  ].map((screen) => (
                    <option key={screen}>{screen}</option>
                  ))}
                </select>
              </label>
              <label>
                Action you were trying to complete
                <input maxLength={160} name="action" required />
              </label>
              <label>
                Short summary
                <input
                  aria-describedby="help-form-error"
                  maxLength={160}
                  minLength={10}
                  name="summary"
                  required
                />
                <small>10–160 characters</small>
              </label>
              <label>
                Reproduction details (optional)
                <textarea maxLength={1000} name="details" rows={5} />
                <small>Maximum 1,000 characters</small>
              </label>
              <Diagnostics diagnostics={diagnostics} />
            </>
          ) : (
            <>
              <label>
                Area
                <select defaultValue="leads" name="area">
                  {Object.entries(suggestionAreaLabels).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </label>
              <label>
                Problem to solve
                <textarea
                  aria-describedby="help-form-error"
                  maxLength={500}
                  minLength={10}
                  name="problem"
                  required
                  rows={4}
                />
                <small>10–500 characters</small>
              </label>
              <label>
                Suggested improvement (optional)
                <textarea maxLength={1000} name="suggestion" rows={5} />
                <small>Maximum 1,000 characters</small>
              </label>
              <label>
                How often does this happen?
                <select defaultValue="sometimes" name="frequency">
                  {Object.entries(suggestionFrequencyLabels).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </label>
              <label>
                Primary impact
                <select defaultValue="collaboration" name="idea-impact">
                  {Object.entries(suggestionImpactLabels).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </label>
            </>
          )}
          <label className={styles.checkboxLabel}>
            <input name="contact" type="checkbox" value="yes" />
            <span>
              {kind === "application-problem"
                ? "Support may contact me about this request"
                : "Product team may contact me about this idea"}
            </span>
          </label>
          {error ? (
            <p className={styles.formError} id="help-form-error" role="alert">
              {error}
            </p>
          ) : null}
          {offline ? (
            <p className={styles.formError} role="status">
              Reconnect to review and submit. This draft remains in memory only.
            </p>
          ) : null}
          <div className={styles.dialogActions}>
            <button
              className={styles.secondaryButton}
              disabled={pending}
              onClick={() => dialog.current?.close()}
              type="button"
            >
              Cancel
            </button>
            <button
              className={styles.primaryButton}
              disabled={offline || pending}
              type="submit"
            >
              {pending
                ? "Submitting…"
                : kind === "application-problem"
                  ? "Submit Fictional Request"
                  : "Submit Fictional Suggestion"}
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}

export function HelpAndFeedback({ service }: { service: HelpService }) {
  const online = useOnline();
  const [snapshot, setSnapshot] = useState<HelpSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [formKind, setFormKind] = useState<FormKind>(null);
  const [confirmation, setConfirmation] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      const access = await service.getAccess();
      if (access.type === "unauthorized") {
        setUnauthorized(true);
        setSnapshot(null);
        return;
      }
      setSnapshot(await service.getSnapshot());
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    // This route owns the help-content and reporter-request synchronization.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const results = useMemo(
    () => searchHelpTopics(snapshot?.topics ?? [], query),
    [query, snapshot],
  );
  const meaningfulSearch = query.trim().replace(/\s+/g, " ").length >= 2;
  const visibleResults = showAll ? results : results.slice(0, 8);

  if (unauthorized)
    return (
      <PageFrame
        description="Help history and authenticated guidance remain protected."
        eyebrow="Access controlled"
        title="Help access required"
      >
        <section className={styles.stateCard}>
          <h2>No help-request information was loaded</h2>
          <p>Return Home or use the separate sign-in recovery process.</p>
          <Link className={styles.primaryButton} to="/">
            Return Home
          </Link>
        </section>
      </PageFrame>
    );

  return (
    <PageFrame
      description="Find approved task guidance, route a correction, or submit simulated app feedback."
      eyebrow="Demo support · Fictional content"
      title="Help and Feedback"
    >
      {!online ? (
        <div className={styles.offlineBanner} role="status">
          <strong>Offline help</strong>
          <span>
            Bundled topics and search remain available. Requests and submissions
            require reconnection.
          </span>
        </div>
      ) : null}
      {confirmation ? (
        <div className={styles.confirmation} role="status">
          {confirmation}
        </div>
      ) : null}
      {loadError ? (
        <section className={styles.errorCard} role="alert">
          <h2>Help content could not be refreshed</h2>
          <p>
            No request history was loaded. Retry; no form was submitted by this
            action.
          </p>
          <button className={styles.primaryButton} onClick={() => void load()}>
            Retry Help
          </button>
        </section>
      ) : null}
      {loading ? (
        <section className={styles.stateCard} aria-live="polite">
          <h2>Loading approved help</h2>
          <p>Preparing bundled topics and reporter-visible requests…</p>
        </section>
      ) : null}
      {snapshot ? (
        <>
          <section
            aria-labelledby="help-search-title"
            className={styles.searchPanel}
          >
            <div className={styles.sectionHeader}>
              <p>Start here</p>
              <h2 id="help-search-title">What do you need help with?</h2>
            </div>
            <div className={styles.searchBody}>
              <label htmlFor="help-search">Search Territory Desk help</label>
              <input
                autoComplete="off"
                id="help-search"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setShowAll(false);
                }}
                placeholder="Try: send a lead"
                ref={searchRef}
                type="search"
                value={query}
              />
              <p aria-live="polite" className={styles.resultCount}>
                {meaningfulSearch
                  ? `${results.length} matching ${results.length === 1 ? "topic" : "topics"}`
                  : "Showing recommended topics"}
              </p>
              {meaningfulSearch && results.length === 0 ? (
                <div className={styles.noResults}>
                  <strong>No help topic matched</strong>
                  <span>Choose the correct request path below.</span>
                </div>
              ) : (
                <ul className={styles.topicResults}>
                  {visibleResults.map((topic) => (
                    <li key={topic.slug}>
                      <Link to={`/help/${topic.slug}`}>
                        <span>
                          <strong>{topic.title}</strong>
                          <small>{topic.summary}</small>
                        </span>
                        <em>{topic.audience}</em>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {!showAll && results.length > 8 ? (
                <button
                  className={styles.textButton}
                  onClick={() => setShowAll(true)}
                  type="button"
                >
                  View all matching topics
                </button>
              ) : null}
            </div>
          </section>

          <section aria-labelledby="routing-title" className={styles.panel}>
            <div className={styles.sectionHeader}>
              <p>Choose the right path</p>
              <h2 id="routing-title">
                Instructions, correction, access, or feedback
              </h2>
            </div>
            <div className={styles.safetyNotice} role="note">
              <strong>Not an emergency or urgent escalation channel</strong>
              <span>
                For urgent company, customer, safety, compliance, or security
                concerns, follow the approved Cintas process. Company escalation
                contact not configured in this prototype.
              </span>
            </div>
            <div className={styles.routeGrid}>
              <RoutingChoice
                description="Search approved, versioned task instructions."
                icon="help"
                label="Learn how Territory Desk works"
                onClick={() => searchRef.current?.focus()}
              />
              <RoutingChoice
                description="Use the source-aware Data Status reporting flow."
                icon="database"
                label="Report incorrect territory or employee information"
                to="/data-status#my-reports"
              />
              <RoutingChoice
                description="Keep sign-in recovery separate from role or scope help."
                icon="profile"
                label="Get sign-in or access help"
                to="/help/account-access"
              />
              <RoutingChoice
                description="Report an app control, save, display, or accessibility problem."
                icon="help"
                label="Report an application problem"
                onClick={() => setFormKind("application-problem")}
              />
              <RoutingChoice
                description="Describe the workflow problem without implying a feature commitment."
                icon="send"
                label="Suggest an improvement"
                onClick={() => setFormKind("product-suggestion")}
              />
            </div>
          </section>

          <section aria-labelledby="browse-title" className={styles.panel}>
            <div className={styles.sectionHeader}>
              <p>Approved topic library</p>
              <h2 id="browse-title">Browse by task</h2>
            </div>
            <div className={styles.accordions}>
              {helpTopicGroups.map((group, index) => {
                const groupTopics = snapshot.topics.filter(
                  (topic) => topic.group === group,
                );
                if (!groupTopics.length) return null;
                return (
                  <details key={group} open={index === 0}>
                    <summary>
                      <span>{group}</span>
                      <small>{groupTopics.length} topics</small>
                    </summary>
                    <ul>
                      {groupTopics.map((topic) => (
                        <li key={topic.slug}>
                          <Link to={`/help/${topic.slug}`}>{topic.title}</Link>
                          <span>{topic.audience}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                );
              })}
            </div>
          </section>

          <section
            aria-labelledby="my-requests-title"
            className={styles.panel}
            id="my-requests"
          >
            <div className={styles.sectionHeader}>
              <p>Reporter-visible only</p>
              <h2 id="my-requests-title">My Requests</h2>
            </div>
            {!online ? (
              <p className={styles.panelMessage}>
                Reconnect to load your request history. Data-quality reports
                remain in Data Status.
              </p>
            ) : snapshot.requests.length ? (
              <ul className={styles.requestList}>
                {snapshot.requests.map((request) => (
                  <li key={request.id}>
                    <div>
                      <p>
                        {request.type === "application-problem"
                          ? "Application problem"
                          : "Product suggestion"}
                      </p>
                      <h3>{request.summary}</h3>
                      <span>
                        {request.category} · Submitted {request.submittedAt}
                      </span>
                    </div>
                    <div className={styles.requestStatus}>
                      <strong>{request.status}</strong>
                      {request.routingState === "Routing delayed" ? (
                        <span>Routing delayed</span>
                      ) : null}
                    </div>
                    <Link
                      aria-label={`View request: ${request.summary}`}
                      className={styles.secondaryButton}
                      to={`/help/requests/${request.id}`}
                    >
                      View Request
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.panelMessage}>
                You have not submitted an application problem or suggestion.
              </p>
            )}
          </section>

          <section className={styles.footerPanel}>
            <div>
              <h2>Privacy and company contact guidance</h2>
              <p>
                Do not submit customer data, employee contact details,
                credentials, confidential company information, screenshots, or
                attachments. No response time is promised for Help or Feedback.
              </p>
            </div>
            <dl>
              <div>
                <dt>App version</dt>
                <dd>{snapshot.appVersion}</dd>
              </div>
              <div>
                <dt>Environment</dt>
                <dd>{snapshot.environment}</dd>
              </div>
              <div>
                <dt>Safe diagnostic reference</dt>
                <dd>TD-DEMO-HELP</dd>
              </div>
            </dl>
          </section>
        </>
      ) : null}
      {formKind && snapshot ? (
        <HelpRequestDialog
          diagnostics={snapshot.safeDiagnostics}
          kind={formKind}
          offline={!online}
          onClose={() => setFormKind(null)}
          onSaved={async (message) => {
            setConfirmation(message);
            await load();
          }}
          service={service}
        />
      ) : null}
    </PageFrame>
  );
}
