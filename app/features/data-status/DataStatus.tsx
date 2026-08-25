import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";

import { Icon } from "../../components/foundation/Icon";
import { PageFrame } from "../../components/layout/PageFrame";
import {
  actionStateLabels,
  dataSourceStateLabels,
  reportCategoryLabels,
  type DataReportCategory,
  type DataSourceKey,
  type DataStatusIssue,
  type DataStatusSnapshot,
} from "../../domain/data-status";
import type { DataStatusService } from "../../services/data-status-service";
import styles from "./DataStatus.module.css";

const allowedSourceFilters = new Set([
  "territory",
  "directory",
  "workflow",
  "notifications",
  "dynamics",
]);

function commandKey() {
  return `data-report-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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

function SourceActions({ source }: { source: DataSourceKey }) {
  if (source === "workflow")
    return (
      <Link className={styles.secondaryButton} to="/leads">
        Open My Work
      </Link>
    );
  if (source === "notifications")
    return (
      <Link className={styles.secondaryButton} to="/notifications">
        Open Notifications
      </Link>
    );
  if (source === "dynamics") return null;
  return (
    <Link
      className={styles.secondaryButton}
      to={`/data-status?source=${source}#known-issues`}
    >
      View affected records
    </Link>
  );
}

function ReportDialog({
  initialContext,
  initialSource,
  offline,
  onClose,
  onSubmit,
}: {
  initialContext: string;
  initialSource: DataSourceKey;
  offline: boolean;
  onClose: () => void;
  onSubmit: (input: {
    category: DataReportCategory;
    context: string;
    description: string;
    idempotencyKey: string;
    sourceVersion: string;
  }) => Promise<void>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [category, setCategory] = useState<DataReportCategory>(
    initialSource === "directory"
      ? "representative-outdated"
      : "wrong-representative",
  );
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const key = useRef(commandKey());

  useEffect(() => dialog.current?.showModal(), []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (description.trim().length < 10) {
      setError("Add at least 10 characters describing what appears incorrect.");
      return;
    }
    setPending(true);
    setError("");
    try {
      await onSubmit({
        category,
        context: initialContext,
        description: description.trim(),
        idempotencyKey: key.current,
        sourceVersion: "displayed-demo-snapshot-v1",
      });
      dialog.current?.close();
    } catch {
      setError(
        "Report was not submitted. Your description is still here; retry when ready.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <dialog
      aria-labelledby="report-title"
      className={styles.dialog}
      onCancel={(event) => {
        event.preventDefault();
        dialog.current?.close();
      }}
      onClose={onClose}
      ref={dialog}
    >
      <form onSubmit={(event) => void submit(event)}>
        <div className={styles.dialogHeader}>
          <div>
            <p>Fictional data report</p>
            <h2 id="report-title">Report incorrect information</h2>
          </div>
          <button
            aria-label="Close data report"
            onClick={() => dialog.current?.close()}
            type="button"
          >
            ×
          </button>
        </div>
        <div className={styles.dialogBody}>
          <p className={styles.context}>Context: {initialContext}</p>
          <label htmlFor="report-category">
            What appears incorrect?
            <select
              id="report-category"
              onChange={(event) =>
                setCategory(event.target.value as DataReportCategory)
              }
              value={category}
            >
              {Object.entries(reportCategoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="report-description">
            Short factual description
            <textarea
              aria-describedby="report-help report-error"
              aria-invalid={Boolean(error)}
              id="report-description"
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              value={description}
            />
          </label>
          <p id="report-help">
            Do not include customer information. Submitting a report does not
            immediately change routing.
          </p>
          {error ? (
            <p className={styles.formError} id="report-error" role="alert">
              {error}
            </p>
          ) : null}
          {offline ? (
            <p className={styles.formError} role="status">
              Reconnect to submit. This in-memory draft remains open.
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
              disabled={pending || offline}
              type="submit"
            >
              {pending ? "Submitting report…" : "Submit Report"}
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}

function IssueCard({
  issue,
  onReport,
}: {
  issue: DataStatusIssue;
  onReport: (source: DataSourceKey, context: string) => void;
}) {
  return (
    <li className={styles.issueCard}>
      <div className={styles.issueHeading}>
        <div>
          <p>{issue.affectedCapability}</p>
          <h3>{issue.category}</h3>
        </div>
        <span className={styles.status_attention}>{issue.status}</span>
      </div>
      <dl className={styles.metaList}>
        <div>
          <dt>Affected context</dt>
          <dd>{issue.context}</dd>
        </div>
        <div>
          <dt>First detected</dt>
          <dd>{issue.detectedAt}</dd>
        </div>
        <div>
          <dt>Most recently confirmed</dt>
          <dd>{issue.confirmedAt}</dd>
        </div>
      </dl>
      <p className={styles.workaround}>
        <strong>Safe next step:</strong> {issue.workaround}
      </p>
      <button
        className={styles.textButton}
        onClick={() => onReport(issue.source, issue.context)}
        type="button"
      >
        Report related problem
      </button>
    </li>
  );
}

export function DataStatus({ service }: { service: DataStatusService }) {
  const [searchParams] = useSearchParams();
  const online = useOnline();
  const [snapshot, setSnapshot] = useState<DataStatusSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [expanded, setExpanded] = useState<Set<DataSourceKey>>(new Set());
  const [reportContext, setReportContext] = useState<{
    context: string;
    source: DataSourceKey;
  } | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [definitionsOpen, setDefinitionsOpen] = useState(false);

  const requestedSource = useMemo(() => {
    const value = searchParams.get("source")?.toLowerCase();
    if (value === "sms" || value === "in-app") return "notifications";
    return value && allowedSourceFilters.has(value)
      ? (value as DataSourceKey)
      : null;
  }, [searchParams]);
  const displayedIssues = useMemo(() => {
    if (!snapshot || !requestedSource) return snapshot?.issues ?? [];
    return snapshot.issues.filter((issue) => issue.source === requestedSource);
  }, [requestedSource, snapshot]);

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      const access = await service.getAccess();
      if (access.type === "unauthorized") {
        setUnauthorized(true);
        setSnapshot(null);
        return;
      }
      const result = await service.getSnapshot();
      setSnapshot(result);
      if (requestedSource) setExpanded(new Set([requestedSource]));
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [requestedSource, service]);

  useEffect(() => {
    // Data loading is the external synchronization owned by this route.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  if (unauthorized)
    return (
      <PageFrame
        description="Source names, issue counts, and operational details remain protected."
        eyebrow="Access controlled"
        title="Data Status access required"
      >
        <section className={styles.stateCard}>
          <h2>No status information was loaded</h2>
          <p>
            Return to Home or sign in with an authorized Territory Desk profile.
          </p>
          <Link className={styles.primaryButton} to="/">
            Return to Home
          </Link>
        </section>
      </PageFrame>
    );

  return (
    <PageFrame
      description="See which fictional routing and collaboration actions are safe before you use them."
      eyebrow="Prototype — simulated services · Demo data"
      title="Data Status"
    >
      {!online ? (
        <section className={styles.offlineBanner} role="status">
          <strong>Offline demo status</strong>
          <span>
            The last in-memory snapshot is readable. Refresh, sends, updates,
            and report submission require a connection.
          </span>
        </section>
      ) : null}

      {loadError && !snapshot ? (
        <section className={styles.errorCard} role="alert">
          <h2>Data status could not be loaded</h2>
          <p>
            No overall Available state is shown because the evidence is
            incomplete.
          </p>
          <button
            className={styles.primaryButton}
            onClick={() => void load()}
            type="button"
          >
            Retry Status Check
          </button>
        </section>
      ) : loading ? (
        <section aria-busy="true" className={styles.loadingCard}>
          <h2>Checking action safety…</h2>
          <p>No availability result is assumed until validation finishes.</p>
        </section>
      ) : snapshot ? (
        <>
          <section
            className={`${styles.summary} ${styles[`summary_${snapshot.overallState}`]}`}
          >
            <div>
              <p>Current action safety</p>
              <h2>{snapshot.overallTitle}</h2>
              <span>{snapshot.overallDetail}</span>
              <small>Status checked {snapshot.checkedAt}</small>
            </div>
            <button
              className={styles.summaryButton}
              disabled={!online || refreshing}
              onClick={() => {
                setRefreshing(true);
                void load();
              }}
              type="button"
            >
              {refreshing ? "Checking…" : "Refresh Status"}
            </button>
          </section>

          <section
            aria-labelledby="action-safety-title"
            className={styles.section}
          >
            <div className={styles.sectionHeader}>
              <div>
                <p>Decision guide</p>
                <h2 id="action-safety-title">What can I safely do now?</h2>
              </div>
              <span>{snapshot.scopeLabel}</span>
            </div>
            <ul className={styles.actionGrid}>
              {snapshot.actions.map((action) => (
                <li key={action.label}>
                  <div>
                    <h3>{action.label}</h3>
                    <span className={styles[`status_${action.state}`]}>
                      {actionStateLabels[action.state]}
                    </span>
                  </div>
                  <p>{action.detail}</p>
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby="sources-title"
            className={styles.section}
            id="sources"
          >
            <div className={styles.sectionHeader}>
              <div>
                <p>Source evidence</p>
                <h2 id="sources-title">Data sources</h2>
              </div>
              <span>Permission-filtered demo scope</span>
            </div>
            <div className={styles.sourceGrid}>
              {snapshot.sources.map((source) => {
                const isOpen = expanded.has(source.key);
                return (
                  <article
                    className={
                      requestedSource === source.key
                        ? styles.highlightedSource
                        : styles.sourceCard
                    }
                    key={source.key}
                  >
                    <button
                      aria-expanded={isOpen}
                      className={styles.sourceToggle}
                      onClick={() =>
                        setExpanded((current) => {
                          const next = new Set(current);
                          if (next.has(source.key)) next.delete(source.key);
                          else next.add(source.key);
                          return next;
                        })
                      }
                      type="button"
                    >
                      <span className={styles.sourceIcon}>
                        <Icon name="database" />
                      </span>
                      <span>
                        <strong>{source.name}</strong>
                        <small>{source.actionImpact}</small>
                      </span>
                      <span className={styles[`status_${source.state}`]}>
                        {dataSourceStateLabels[source.state]}
                      </span>
                      <span aria-hidden="true" className={styles.chevron}>
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                    {isOpen ? (
                      <div className={styles.sourceDetails}>
                        {source.version ? (
                          <p>
                            <strong>Source version:</strong> {source.version}
                          </p>
                        ) : null}
                        <p>
                          <strong>Freshness:</strong> {source.freshness}
                        </p>
                        <ul>
                          {source.details.map((detail) => (
                            <li key={detail}>{detail}</li>
                          ))}
                        </ul>
                        <dl className={styles.metaList}>
                          {source.timestamps.map((timestamp) => (
                            <div key={timestamp.label}>
                              <dt>{timestamp.label}</dt>
                              <dd>{timestamp.value}</dd>
                            </div>
                          ))}
                        </dl>
                        <div className={styles.cardActions}>
                          <SourceActions source={source.key} />
                          {source.key !== "dynamics" ? (
                            <button
                              className={styles.textButton}
                              onClick={() =>
                                setReportContext({
                                  context: `${snapshot.scopeLabel} · ${source.name}`,
                                  source: source.key,
                                })
                              }
                              type="button"
                            >
                              Report a problem
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>

          <section
            aria-labelledby="issues-title"
            className={styles.section}
            id="known-issues"
          >
            <div className={styles.sectionHeader}>
              <div>
                <p>Highest impact first</p>
                <h2 id="issues-title">Known issues</h2>
              </div>
              <span>{displayedIssues.length} within this demo scope</span>
            </div>
            {displayedIssues.length ? (
              <ul className={styles.issueList}>
                {displayedIssues.map((issue) => (
                  <IssueCard
                    issue={issue}
                    key={issue.id}
                    onReport={(source, context) =>
                      setReportContext({ context, source })
                    }
                  />
                ))}
              </ul>
            ) : (
              <div className={styles.emptyState}>
                <h3>No known data issues affect your available actions</h3>
                <p>This does not claim the data is universally perfect.</p>
              </div>
            )}
          </section>

          <section
            aria-labelledby="reports-title"
            className={styles.section}
            id="my-reports"
          >
            <div className={styles.sectionHeader}>
              <div>
                <p>Reporter-visible updates only</p>
                <h2 id="reports-title">My submitted reports</h2>
              </div>
              <span>{snapshot.reports.length} fictional reports</span>
            </div>
            {confirmation ? (
              <div className={styles.confirmation} role="status">
                <strong>Report submitted</strong>
                <span>
                  Tracking reference {confirmation}. Routing data was not
                  changed.
                </span>
              </div>
            ) : null}
            <ul className={styles.reportList}>
              {snapshot.reports.map((report) => (
                <li key={report.id}>
                  <div>
                    <span className={styles.status_available}>
                      {report.status}
                    </span>
                    <small>{report.id}</small>
                  </div>
                  <h3>{reportCategoryLabels[report.category]}</h3>
                  <p>{report.context}</p>
                  <dl className={styles.metaList}>
                    <div>
                      <dt>Submitted</dt>
                      <dd>{report.submittedAt}</dd>
                    </div>
                    <div>
                      <dt>Last update</dt>
                      <dd>{report.lastUpdate}</dd>
                    </div>
                  </dl>
                  {report.resolution ? (
                    <p className={styles.resolution}>{report.resolution}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.definitions}>
            <button
              aria-expanded={definitionsOpen}
              className={styles.textButton}
              onClick={() => setDefinitionsOpen((value) => !value)}
              type="button"
            >
              What do these labels mean?
            </button>
            {definitionsOpen ? (
              <dl className={styles.definitionGrid}>
                <div>
                  <dt>Source updated</dt>
                  <dd>Time supplied by the owning source.</dd>
                </div>
                <div>
                  <dt>Imported</dt>
                  <dd>When Territory Desk loaded that version.</dd>
                </div>
                <div>
                  <dt>Validated</dt>
                  <dd>When approved checks completed for that version.</dd>
                </div>
                <div>
                  <dt>Last verified</dt>
                  <dd>
                    When a person or authoritative process explicitly confirmed
                    it.
                  </dd>
                </div>
                <div>
                  <dt>Last refreshed</dt>
                  <dd>When this application view last obtained data.</dd>
                </div>
                <div>
                  <dt>Status checked</dt>
                  <dd>When the displayed health checks were evaluated.</dd>
                </div>
              </dl>
            ) : null}
            <Link className={styles.helpLink} to="/help/data-status">
              Get help with Data Status
            </Link>
          </section>
        </>
      ) : null}

      {reportContext ? (
        <ReportDialog
          initialContext={reportContext.context}
          initialSource={reportContext.source}
          offline={!online}
          onClose={() => setReportContext(null)}
          onSubmit={async (command) => {
            const result = await service.submitReport(command);
            setSnapshot(result.snapshot);
            setConfirmation(result.reportId);
          }}
        />
      ) : null}
    </PageFrame>
  );
}
