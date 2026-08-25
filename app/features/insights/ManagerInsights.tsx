import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";

import { Icon } from "../../components/foundation/Icon";
import { PageFrame } from "../../components/layout/PageFrame";
import {
  defaultManagerInsightFilters,
  exceptionTypesForRecord,
  formatInsightRate,
  insightDepartmentLabels,
  managerInsightPeriods,
  type InsightExceptionType,
  type ManagerInsightFilters,
  type ManagerInsightRecord,
} from "../../domain/manager-insights";
import type {
  ManagerInsightAccess,
  ManagerInsightRecordPage,
  ManagerInsightSnapshot,
  ManagerInsightsService,
} from "../../services/manager-insights-service";
import styles from "./ManagerInsights.module.css";

type ManagerInsightsProps = {
  service: ManagerInsightsService;
};

const exceptionLabels: Record<InsightExceptionType, string> = {
  all: "All exceptions",
  "closed-loop-support": "Closed-loop supporting records",
  "incomplete-measurement": "Incomplete measurement fields",
  "missing-next-action": "Missing next action",
  "missed-first-response": "Missed first response",
  "overdue-update": "Overdue update",
  "response-support": "First-response supporting records",
  "routing-exception": "Routing exception",
};

const statusLabels: Record<ManagerInsightRecord["status"], string> = {
  accepted: "Accepted",
  completed: "Completed",
  in_progress: "In Progress",
  pending: "Pending Response",
};

function isDepartment(
  value: string | null,
): value is ManagerInsightFilters["sendingDepartment"] {
  return ["all", "uniform", "facility-services", "first-aid-safety"].includes(
    value ?? "",
  );
}

function readFilters(searchParams: URLSearchParams): ManagerInsightFilters {
  const period = Number(searchParams.get("period"));
  const sending = searchParams.get("sending");
  const receiving = searchParams.get("receiving");
  const direction = searchParams.get("direction");
  const status = searchParams.get("status");
  return {
    direction: ["both", "sent", "received"].includes(direction ?? "")
      ? (direction as ManagerInsightFilters["direction"])
      : "both",
    period: managerInsightPeriods.includes(
      period as ManagerInsightFilters["period"],
    )
      ? (period as ManagerInsightFilters["period"])
      : 30,
    receivingDepartment: isDepartment(receiving) ? receiving : "all",
    sendingDepartment: isDepartment(sending) ? sending : "all",
    status: ["all", "pending", "accepted", "in_progress", "completed"].includes(
      status ?? "",
    )
      ? (status as ManagerInsightFilters["status"])
      : "all",
  };
}

function readDrilldown(searchParams: URLSearchParams): InsightExceptionType {
  const value = searchParams.get("records") as InsightExceptionType | null;
  return value && value in exceptionLabels ? value : "all";
}

function writeFilters(filters: ManagerInsightFilters) {
  const params = new URLSearchParams();
  params.set("period", String(filters.period));
  if (filters.sendingDepartment !== "all")
    params.set("sending", filters.sendingDepartment);
  if (filters.receivingDepartment !== "all")
    params.set("receiving", filters.receivingDepartment);
  if (filters.direction !== "both") params.set("direction", filters.direction);
  if (filters.status !== "all") params.set("status", filters.status);
  return params;
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

function AccessState({
  type,
}: {
  type: "error" | "no-scope" | "unauthorized";
}) {
  const unauthorized = type === "unauthorized";
  return (
    <PageFrame
      description={
        unauthorized
          ? "The current profile does not include permission to view team information."
          : type === "no-scope"
            ? "Manager access is active, but no team scope is assigned."
            : "Manager permission could not be verified safely."
      }
      eyebrow="Access controlled"
      title={
        unauthorized
          ? "Manager access required"
          : type === "no-scope"
            ? "No team scope is assigned"
            : "Team Insights unavailable"
      }
    >
      <section
        className={styles.stateCard}
        role={type === "error" ? "alert" : undefined}
      >
        <h2>
          {unauthorized
            ? "Team data remains protected"
            : type === "no-scope"
              ? "Ask the approved administrator to assign a scope"
              : "We couldn’t confirm manager access"}
        </h2>
        <p>
          {unauthorized
            ? "No team counts, employee names, or customer records were loaded."
            : type === "no-scope"
              ? "An empty dashboard would look like zero performance, so no metrics are shown."
              : "No prior manager results are retained when authorization cannot be confirmed."}
        </p>
        <div className={styles.stateActions}>
          <Link className={styles.primaryButton} to="/">
            Return to Home
          </Link>
          <Link className={styles.secondaryButton} to="/leads">
            Open My Work
          </Link>
        </div>
      </section>
    </PageFrame>
  );
}

function FilterFields({
  filters,
  idPrefix,
  onChange,
}: {
  filters: ManagerInsightFilters;
  idPrefix: string;
  onChange: (filters: ManagerInsightFilters) => void;
}) {
  const update = <K extends keyof ManagerInsightFilters>(
    key: K,
    value: ManagerInsightFilters[K],
  ) => onChange({ ...filters, [key]: value });
  return (
    <div className={styles.filterGrid}>
      <label htmlFor={`${idPrefix}-period`}>
        Period
        <select
          id={`${idPrefix}-period`}
          onChange={(event) =>
            update(
              "period",
              Number(event.target.value) as ManagerInsightFilters["period"],
            )
          }
          value={filters.period}
        >
          {managerInsightPeriods.map((period) => (
            <option key={period} value={period}>
              {period} days
            </option>
          ))}
        </select>
      </label>
      <label htmlFor={`${idPrefix}-sending`}>
        Sending department
        <select
          id={`${idPrefix}-sending`}
          onChange={(event) =>
            update(
              "sendingDepartment",
              event.target.value as ManagerInsightFilters["sendingDepartment"],
            )
          }
          value={filters.sendingDepartment}
        >
          {Object.entries(insightDepartmentLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor={`${idPrefix}-receiving`}>
        Receiving department
        <select
          id={`${idPrefix}-receiving`}
          onChange={(event) =>
            update(
              "receivingDepartment",
              event.target
                .value as ManagerInsightFilters["receivingDepartment"],
            )
          }
          value={filters.receivingDepartment}
        >
          {Object.entries(insightDepartmentLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor={`${idPrefix}-direction`}>
        Direction
        <select
          id={`${idPrefix}-direction`}
          onChange={(event) =>
            update(
              "direction",
              event.target.value as ManagerInsightFilters["direction"],
            )
          }
          value={filters.direction}
        >
          <option value="both">Both</option>
          <option value="sent">Sent</option>
          <option value="received">Received</option>
        </select>
      </label>
      <label htmlFor={`${idPrefix}-status`}>
        Workflow status
        <select
          id={`${idPrefix}-status`}
          onChange={(event) =>
            update(
              "status",
              event.target.value as ManagerInsightFilters["status"],
            )
          }
          value={filters.status}
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending Response</option>
          <option value="accepted">Accepted</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </label>
    </div>
  );
}

function MetricCard({
  label,
  metric,
  period,
  onAbout,
  onRecords,
}: {
  label: string;
  metric: ManagerInsightSnapshot["result"]["firstResponse"];
  period: number;
  onAbout: () => void;
  onRecords: () => void;
}) {
  return (
    <article className={styles.metricCard}>
      <p className={styles.metricLabel}>{label}</p>
      <strong className={styles.metricValue}>
        {formatInsightRate(metric.rate)}
      </strong>
      <p>
        {metric.numerator} of {metric.denominator} eligible handoffs · {period}{" "}
        days
      </p>
      <p className={styles.muted}>
        {metric.excluded} excluded · Demo snapshot 9:10 AM CT
      </p>
      <div className={styles.cardActions}>
        <button className={styles.textButton} onClick={onAbout} type="button">
          About this metric
        </button>
        <button
          className={styles.secondaryButton}
          disabled={metric.rate === null}
          onClick={onRecords}
          type="button"
        >
          View supporting records
        </button>
      </div>
    </article>
  );
}

function reasonText(record: ManagerInsightRecord, now: string) {
  const types = exceptionTypesForRecord(record, now);
  if (!types.length) return "Included as supporting evidence for this metric.";
  return types.map((type) => exceptionLabels[type]).join(" · ");
}

function RecordAction({
  record,
  origin,
}: {
  record: ManagerInsightRecord;
  origin: string;
}) {
  if (record.routingStatus !== "unique") {
    return (
      <Link
        className={styles.secondaryButton}
        to="/data-status?source=territory#known-issues"
      >
        Review routing
      </Link>
    );
  }
  return (
    <Link
      className={styles.primaryButton}
      state={{ insightsOrigin: origin }}
      to={`/leads/${record.id}`}
    >
      Open lead
    </Link>
  );
}

export function ManagerInsights({ service }: ManagerInsightsProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const online = useOnline();
  const filterQuery = searchParams.toString();
  const filters = useMemo(
    () => readFilters(new URLSearchParams(filterQuery)),
    [filterQuery],
  );
  const drilldown = readDrilldown(searchParams);
  const view = location.hash === "#exceptions" ? "exceptions" : "overview";
  const [access, setAccess] = useState<
    ManagerInsightAccess | "error" | "loading"
  >("loading");
  const [snapshot, setSnapshot] = useState<ManagerInsightSnapshot | null>(null);
  const [loadingSnapshot, setLoadingSnapshot] = useState(false);
  const [snapshotError, setSnapshotError] = useState<
    "mismatch" | "none" | "unavailable"
  >("none");
  const [records, setRecords] = useState<ManagerInsightRecordPage | null>(null);
  const [recordsError, setRecordsError] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [draftFilters, setDraftFilters] = useState(filters);
  const [newUpdates, setNewUpdates] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [metricDefinition, setMetricDefinition] = useState<
    "closed-loop" | "first-response" | null
  >(null);
  const filterDialogRef = useRef<HTMLDialogElement>(null);
  const metricDialogRef = useRef<HTMLDialogElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Browser Back and Forward restore the URL-owned applied filters.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraftFilters(filters);
  }, [filters]);

  const loadAccess = useCallback(async () => {
    setSnapshot(null);
    setRecords(null);
    try {
      setAccess(await service.getAccess());
    } catch {
      setAccess("error");
    }
  }, [service]);

  useEffect(() => {
    // The route has no server loader in this fictional static prototype.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAccess();
  }, [loadAccess]);

  const loadSnapshot = useCallback(async () => {
    if (typeof access === "string" || access.type !== "authorized") return;
    setLoadingSnapshot(true);
    setSnapshotError("none");
    try {
      const next = await service.getSnapshot(filters);
      setSnapshot(next);
      setNewUpdates(false);
      setAnnouncement(
        "Team Insights refreshed with one compatible result version.",
      );
    } catch (error) {
      if ((error as Error).message === "not-authorized") {
        setSnapshot(null);
        setRecords(null);
        setAccess({ type: "unauthorized" });
      } else
        setSnapshotError(
          (error as Error).message === "result-mismatch"
            ? "mismatch"
            : "unavailable",
        );
    } finally {
      setLoadingSnapshot(false);
    }
  }, [access, filters, service]);

  useEffect(() => {
    // Loading follows the verified access result and active URL filters.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSnapshot();
  }, [loadSnapshot]);

  const loadRecords = useCallback(async () => {
    if (
      view !== "exceptions" ||
      typeof access === "string" ||
      access.type !== "authorized"
    )
      return;
    setRecords(null);
    setRecordsError(false);
    try {
      setRecords(
        await service.getSupportingRecords({ filters, type: drilldown }),
      );
    } catch (error) {
      if ((error as Error).message === "not-authorized") {
        setSnapshot(null);
        setAccess({ type: "unauthorized" });
      } else setRecordsError(true);
    }
  }, [access, drilldown, filters, service, view]);

  useEffect(() => {
    // Supporting records reauthorize whenever the drill-down context changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRecords();
  }, [loadRecords]);

  useEffect(() => {
    const receiveNewUpdate = () => setNewUpdates(true);
    const receiveScopeChange = () => {
      setAnnouncement("Your access changed. Team Insights has been refreshed.");
      void loadAccess();
    };
    window.addEventListener(
      "territory-desk:insights-updated",
      receiveNewUpdate,
    );
    window.addEventListener(
      "territory-desk:manager-scope-changed",
      receiveScopeChange,
    );
    return () => {
      window.removeEventListener(
        "territory-desk:insights-updated",
        receiveNewUpdate,
      );
      window.removeEventListener(
        "territory-desk:manager-scope-changed",
        receiveScopeChange,
      );
    };
  }, [loadAccess]);

  const applyFilters = (
    next: ManagerInsightFilters,
    hash = location.hash || "#overview",
  ) => {
    const params = writeFilters(next);
    void navigate({ hash, search: `?${params.toString()}` });
    setDraftFilters(next);
  };

  const openRecords = (type: InsightExceptionType) => {
    const params = writeFilters(filters);
    params.set("records", type);
    void navigate({ hash: "#exceptions", search: `?${params.toString()}` });
  };

  const openDepartmentPair = (
    sendingDepartment: ManagerInsightFilters["sendingDepartment"],
    receivingDepartment: ManagerInsightFilters["receivingDepartment"],
  ) => {
    const next = { ...filters, receivingDepartment, sendingDepartment };
    setDraftFilters(next);
    const params = writeFilters(next);
    params.set("records", "all");
    void navigate({
      hash: "#exceptions",
      search: `?${params.toString()}`,
    });
  };

  const refreshVisibleResult = async () => {
    await loadSnapshot();
    if (view === "exceptions") await loadRecords();
  };

  const loadMoreRecords = async () => {
    if (!records) return;
    setLoadingMore(true);
    try {
      const page = await service.getSupportingRecords({
        cursor: records.nextCursor,
        filters,
        type: drilldown,
      });
      setRecords({
        ...page,
        items: [...records.items, ...page.items],
        total: records.total,
      });
    } catch {
      setRecordsError(true);
    } finally {
      setLoadingMore(false);
    }
  };

  const openMetricDefinition = (metric: "closed-loop" | "first-response") => {
    setMetricDefinition(metric);
    requestAnimationFrame(() => metricDialogRef.current?.showModal());
  };

  if (access === "loading")
    return (
      <PageFrame
        description="Checking manager permission and scope."
        eyebrow="Access controlled"
        title="Team Insights"
      >
        <section aria-busy="true" className={styles.stateCard}>
          <h2>Loading Team Insights…</h2>
          <p>Verifying access before any team result is requested.</p>
        </section>
      </PageFrame>
    );
  if (access === "error") return <AccessState type="error" />;
  if (access.type === "unauthorized")
    return <AccessState type="unauthorized" />;
  if (access.type === "no-scope") return <AccessState type="no-scope" />;

  const filterSummary = `${filters.period} days · ${insightDepartmentLabels[filters.sendingDepartment]} → ${insightDepartmentLabels[filters.receivingDepartment]} · ${filters.direction}`;
  const origin = `${location.pathname}${location.search}${location.hash}`;

  return (
    <PageFrame
      description="Find cross-department handoffs that need manager intervention without ranking employees."
      eyebrow="Authorized manager workspace · Demo data"
      title="Team Insights"
    >
      <p aria-live="polite" className={styles.srOnly}>
        {announcement}
      </p>
      <div className={styles.topContext}>
        <div>
          <span className={styles.demoBadge}>Demo data</span>
          <p className={styles.scope}>{access.scopeLabel}</p>
          <p className={styles.freshness}>
            Last updated {snapshot?.lastUpdatedLabel ?? "not available"}
          </p>
        </div>
        <Link
          className={styles.secondaryButton}
          to="/data-status?context=manager-insights#sources"
        >
          Data details
        </Link>
      </div>

      <nav aria-label="Team Insights views" className={styles.viewTabs}>
        <button
          aria-current={view === "overview" ? "page" : undefined}
          className={view === "overview" ? styles.activeTab : ""}
          onClick={() =>
            void navigate({ hash: "#overview", search: location.search })
          }
          type="button"
        >
          Overview
        </button>
        <button
          aria-current={view === "exceptions" ? "page" : undefined}
          className={view === "exceptions" ? styles.activeTab : ""}
          onClick={() => openRecords("all")}
          type="button"
        >
          Exceptions
        </button>
      </nav>

      <section
        aria-label="Current Team Insights filters"
        className={styles.mobileFilterSummary}
      >
        <div>
          <strong>Current filters</strong>
          <span>{filterSummary}</span>
        </div>
        <button
          className={styles.secondaryButton}
          onClick={() => {
            setDraftFilters(filters);
            filterDialogRef.current?.showModal();
          }}
          ref={filterButtonRef}
          type="button"
        >
          Change filters
        </button>
      </section>

      <form
        className={styles.desktopFilters}
        onSubmit={(event) => {
          event.preventDefault();
          applyFilters(draftFilters);
        }}
      >
        <div className={styles.filterHeader}>
          <h2>Filter authorized scope</h2>
          <p>
            Filters narrow your server-authorized scope; they cannot broaden it.
          </p>
        </div>
        <FilterFields
          filters={draftFilters}
          idPrefix="desktop"
          onChange={setDraftFilters}
        />
        <div className={styles.filterActions}>
          <button
            className={styles.textButton}
            onClick={() => {
              setDraftFilters(defaultManagerInsightFilters);
              applyFilters(defaultManagerInsightFilters);
            }}
            type="button"
          >
            Reset filters
          </button>
          <button className={styles.primaryButton} type="submit">
            Apply filters
          </button>
        </div>
      </form>

      {!online ? (
        <div className={styles.warningBanner} role="status">
          <strong>Offline demo data</strong>
          <span>
            The last in-memory result remains visible. Refresh and manager
            actions require a connection.
          </span>
        </div>
      ) : null}
      {snapshot?.dataState === "stale" ? (
        <div className={styles.warningBanner} role="alert">
          <strong>Stale — last updated {snapshot.lastUpdatedLabel}</strong>
          <span>
            The workflow source is stale. Values remain visible only as the last
            compatible demo result.
          </span>
        </div>
      ) : null}
      {newUpdates ? (
        <div className={styles.updateBanner} role="status">
          <span>
            <strong>New updates available</strong> · Current counts have not
            moved while you are reading.
          </span>
          <button
            className={styles.secondaryButton}
            disabled={!online}
            onClick={() => void refreshVisibleResult()}
            type="button"
          >
            Refresh now
          </button>
        </div>
      ) : null}

      {snapshotError !== "none" && !snapshot ? (
        <section className={styles.stateCard} role="alert">
          <h2>
            {snapshotError === "mismatch"
              ? "Insights could not be reconciled"
              : "Team Insights could not be loaded"}
          </h2>
          <p>
            {snapshotError === "mismatch"
              ? "The returned sections did not share one scope, filter, definition, and source version. Conflicting rates are hidden."
              : "No guessed or mixed-version values are shown."}
          </p>
          <button
            className={styles.primaryButton}
            onClick={() => void loadSnapshot()}
            type="button"
          >
            Try again
          </button>
        </section>
      ) : null}
      {loadingSnapshot && !snapshot ? (
        <section aria-busy="true" className={styles.stateCard}>
          <h2>Loading Team Insights…</h2>
          <p>Building one compatible result for this scope and filter set.</p>
        </section>
      ) : null}

      {snapshot && !snapshot.result.records.length ? (
        <section className={styles.stateCard}>
          <h2>No eligible handoffs for this period and scope</h2>
          <p>
            The selected filters produced no records eligible for this view. A
            zero percentage would be misleading.
          </p>
          <button
            className={styles.primaryButton}
            onClick={() => applyFilters(defaultManagerInsightFilters)}
            type="button"
          >
            Reset filters
          </button>
        </section>
      ) : null}

      {snapshot && snapshot.result.records.length && view === "overview" ? (
        <div className={styles.overview}>
          <section aria-labelledby="data-trust" className={styles.trustBanner}>
            <div>
              <h2 id="data-trust">
                Data checks{" "}
                {snapshot.dataState === "current"
                  ? "passed for this view"
                  : "need review"}
              </h2>
              <p>
                {snapshot.sourceVersion} · Definition{" "}
                {snapshot.definitionVersion}
              </p>
            </div>
            <dl>
              <div>
                <dt>Completeness</dt>
                <dd>
                  {Math.round(
                    snapshot.result.measurement.completenessRate * 100,
                  )}
                  %
                </dd>
              </div>
              <div>
                <dt>Eligible records</dt>
                <dd>{snapshot.result.measurement.complete}</dd>
              </div>
              <div>
                <dt>Excluded</dt>
                <dd>{snapshot.result.measurement.excluded}</dd>
              </div>
            </dl>
          </section>

          <div className={styles.operatingGrid}>
            <section
              aria-labelledby="needs-attention"
              className={styles.sectionCard}
            >
              <header className={styles.sectionHeading}>
                <div>
                  <p className={styles.kicker}>Act first</p>
                  <h2 id="needs-attention">Needs Attention</h2>
                  <p>
                    {snapshot.result.needsAttentionCount} unique authorized
                    handoffs need review.
                  </p>
                </div>
                <span
                  aria-label={`${snapshot.result.needsAttentionCount} unique handoffs`}
                  className={styles.headlineCount}
                >
                  {snapshot.result.needsAttentionCount}
                </span>
              </header>
              {snapshot.result.needsAttentionCount ? (
                <ul className={styles.attentionList}>
                  {snapshot.result.attentionGroups.map((group) => (
                    <li key={group.type}>
                      <div>
                        <strong>{exceptionLabels[group.type]}</strong>
                        <span>{group.description}</span>
                        <small>{group.oldestLabel}</small>
                      </div>
                      <div className={styles.attentionAction}>
                        <span
                          aria-label={`${group.count} records`}
                          className={styles.groupCount}
                        >
                          {group.count}
                        </span>
                        <button
                          className={styles.textButton}
                          onClick={() => openRecords(group.type)}
                          type="button"
                        >
                          Review records
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.calmState}>
                  <strong>
                    No team handoffs need manager attention for this view
                  </strong>
                  <span>
                    Validated workflow context remains available below.
                  </span>
                </div>
              )}
            </section>

            <section aria-labelledby="workflow-kpis">
              <div className={styles.sectionHeading}>
                <div>
                  <p className={styles.kicker}>Workflow health</p>
                  <h2 id="workflow-kpis">Primary KPIs</h2>
                  <p>Deadlines and completed loops, not employee grades.</p>
                </div>
              </div>
              {snapshot.partialSection === "primary-metrics" ? (
                <div className={styles.unavailableBlock}>
                  <strong>Metric unavailable</strong>
                  <span>
                    The primary metric block did not return a compatible result.
                    Other validated sections remain visible.
                  </span>
                  <button
                    className={styles.textButton}
                    onClick={() => void loadSnapshot()}
                    type="button"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <div className={styles.metricGrid}>
                  <MetricCard
                    label="First-response target completion"
                    metric={snapshot.result.firstResponse}
                    onAbout={() => openMetricDefinition("first-response")}
                    onRecords={() => openRecords("response-support")}
                    period={filters.period}
                  />
                  <MetricCard
                    label="Closed-loop update completion"
                    metric={snapshot.result.closedLoop}
                    onAbout={() => openMetricDefinition("closed-loop")}
                    onRecords={() => openRecords("closed-loop-support")}
                    period={filters.period}
                  />
                </div>
              )}
            </section>
          </div>

          <section aria-labelledby="drivers" className={styles.sectionCard}>
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.kicker}>Find the cause</p>
                <h2 id="drivers">Diagnostic drivers</h2>
              </div>
            </div>
            <div className={styles.driverGrid}>
              <article>
                <span>Median first response</span>
                <strong>
                  {snapshot.result.medianResponseHours === null
                    ? "Unavailable"
                    : `${snapshot.result.medianResponseHours.toFixed(1)} hours`}
                </strong>
                <small>
                  75th percentile{" "}
                  {snapshot.result.responseP75Hours?.toFixed(1) ?? "—"} hours
                </small>
              </article>
              <article>
                <span>Next-action coverage</span>
                <strong>
                  {formatInsightRate(snapshot.result.nextActionCoverage.rate)}
                </strong>
                <small>
                  {snapshot.result.nextActionCoverage.numerator} of{" "}
                  {snapshot.result.nextActionCoverage.denominator} open accepted
                  handoffs
                </small>
              </article>
            </div>
            <h3>Open-loop aging</h3>
            <dl className={styles.agingList}>
              <div>
                <dt>Within target</dt>
                <dd>{snapshot.result.openLoopAging.withinTarget}</dd>
              </div>
              <div>
                <dt>Missed by less than 1 business day</dt>
                <dd>{snapshot.result.openLoopAging.missedLessThanDay}</dd>
              </div>
              <div>
                <dt>Missed by 1–3 business days</dt>
                <dd>{snapshot.result.openLoopAging.missedOneToThreeDays}</dd>
              </div>
              <div>
                <dt>Missed by more than 3 business days</dt>
                <dd>{snapshot.result.openLoopAging.missedOverThreeDays}</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="guardrails" className={styles.sectionCard}>
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.kicker}>Interpret carefully</p>
                <h2 id="guardrails">Routing and measurement guardrails</h2>
                <p>Counts locate process friction; they do not grade people.</p>
              </div>
            </div>
            <div className={styles.guardrailGrid}>
              <article>
                <span>Routing exception rate</span>
                <strong>
                  {formatInsightRate(snapshot.result.routing.rate)}
                </strong>
                <small>
                  {snapshot.result.routing.numerator} of{" "}
                  {snapshot.result.routing.denominator} attempted handoffs
                </small>
              </article>
              <article>
                <span>Measurement completeness</span>
                <strong>
                  {Math.round(
                    snapshot.result.measurement.completenessRate * 100,
                  )}
                  %
                </strong>
                <small>
                  {snapshot.result.measurement.complete} complete ·{" "}
                  {snapshot.result.measurement.excluded} excluded
                </small>
              </article>
            </div>
            <h3>Response disposition mix</h3>
            <dl className={styles.dispositionList}>
              <div>
                <dt>Accept</dt>
                <dd>{snapshot.result.disposition.accept}</dd>
              </div>
              <div>
                <dt>Need Information</dt>
                <dd>{snapshot.result.disposition.needInformation}</dd>
              </div>
              <div>
                <dt>Decline</dt>
                <dd>{snapshot.result.disposition.decline}</dd>
              </div>
            </dl>
            <p className={styles.guardrailNote}>
              A higher acceptance rate is not labeled good, and a higher decline
              rate is not labeled bad. Reasons and routing context determine
              what needs attention.
            </p>
          </section>

          <section
            aria-labelledby="department-pairs"
            className={styles.sectionCard}
          >
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.kicker}>Workflow path</p>
                <h2 id="department-pairs">Department-pair diagnostics</h2>
                <p>
                  Ordered by actionable exception count, not performance rank.
                </p>
              </div>
            </div>
            {snapshot.partialSection === "department-pairs" ? (
              <div className={styles.unavailableBlock}>
                <strong>Metric unavailable</strong>
                <span>
                  Department comparisons did not return a compatible result.
                </span>
                <button
                  className={styles.textButton}
                  onClick={() => void loadSnapshot()}
                  type="button"
                >
                  Try again
                </button>
              </div>
            ) : (
              <>
                <ul
                  aria-label="Authorized department-pair workflow diagnostics"
                  className={styles.pairCards}
                >
                  {snapshot.result.departmentPairs.map((pair) => (
                    <li
                      key={`${pair.sendingDepartment}-${pair.receivingDepartment}`}
                    >
                      <h3>
                        {insightDepartmentLabels[pair.sendingDepartment]} →{" "}
                        {insightDepartmentLabels[pair.receivingDepartment]}
                      </h3>
                      {pair.warning ? (
                        <p className={styles.pairWarning}>{pair.warning}</p>
                      ) : null}
                      <dl>
                        <div>
                          <dt>Eligible denominator</dt>
                          <dd>{pair.eligibleDenominator}</dd>
                        </div>
                        <div>
                          <dt>First response</dt>
                          <dd>
                            {pair.comparisonEligible
                              ? formatInsightRate(pair.firstResponse.rate)
                              : "Suppressed"}
                          </dd>
                        </div>
                        <div>
                          <dt>Closed loop</dt>
                          <dd>
                            {pair.comparisonEligible
                              ? formatInsightRate(pair.closedLoop.rate)
                              : "Suppressed"}
                          </dd>
                        </div>
                        <div>
                          <dt>Open exceptions</dt>
                          <dd>{pair.exceptionCount}</dd>
                        </div>
                      </dl>
                      <button
                        className={styles.secondaryButton}
                        onClick={() =>
                          openDepartmentPair(
                            pair.sendingDepartment,
                            pair.receivingDepartment,
                          )
                        }
                        type="button"
                      >
                        View records
                      </button>
                    </li>
                  ))}
                </ul>
                <div className={styles.tableScroller}>
                  <table>
                    <caption>
                      Authorized department-pair workflow diagnostics
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Sending → Receiving</th>
                        <th scope="col">Eligible</th>
                        <th scope="col">First response</th>
                        <th scope="col">Closed loop</th>
                        <th scope="col">Exceptions</th>
                        <th scope="col">Records</th>
                      </tr>
                    </thead>
                    <tbody>
                      {snapshot.result.departmentPairs.map((pair) => (
                        <tr
                          key={`${pair.sendingDepartment}-${pair.receivingDepartment}`}
                        >
                          <th scope="row">
                            <strong>
                              {insightDepartmentLabels[pair.sendingDepartment]}
                            </strong>
                            <span>
                              to{" "}
                              {
                                insightDepartmentLabels[
                                  pair.receivingDepartment
                                ]
                              }
                            </span>
                            {pair.warning ? (
                              <small>{pair.warning}</small>
                            ) : null}
                          </th>
                          <td>{pair.eligibleDenominator}</td>
                          <td>
                            {pair.comparisonEligible
                              ? formatInsightRate(pair.firstResponse.rate)
                              : "Suppressed"}
                          </td>
                          <td>
                            {pair.comparisonEligible
                              ? formatInsightRate(pair.closedLoop.rate)
                              : "Suppressed"}
                          </td>
                          <td>{pair.exceptionCount}</td>
                          <td>
                            <button
                              className={styles.textButton}
                              onClick={() => {
                                openDepartmentPair(
                                  pair.sendingDepartment,
                                  pair.receivingDepartment,
                                );
                              }}
                              type="button"
                            >
                              View records
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>

          <aside className={styles.dynamicsGate}>
            <Icon name="database" />
            <div>
              <strong>Qualified progression is not enabled</strong>
              <p>
                Verified revenue, conversion, and official opportunity outcomes
                remain hidden until Dynamics 365 mapping and reconciliation are
                approved.
              </p>
            </div>
          </aside>
        </div>
      ) : null}

      {view === "exceptions" ? (
        <section
          aria-labelledby="supporting-records"
          className={styles.recordsSection}
        >
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.kicker}>Authorized record drill-down</p>
              <h2 id="supporting-records">{exceptionLabels[drilldown]}</h2>
              <p>
                {filters.period}-day period · {filterSummary}
              </p>
            </div>
            {drilldown !== "all" ? (
              <button
                className={styles.textButton}
                onClick={() => openRecords("all")}
                type="button"
              >
                Show all exceptions
              </button>
            ) : null}
          </div>
          {recordsError ? (
            <div className={styles.unavailableBlock} role="alert">
              <strong>Supporting records unavailable</strong>
              <span>No lead data was disclosed and no count was guessed.</span>
              <button
                className={styles.textButton}
                onClick={() => void loadRecords()}
                type="button"
              >
                Try again
              </button>
            </div>
          ) : null}
          {!records && !recordsError ? (
            <div aria-busy="true" className={styles.stateCard}>
              <h3>Loading supporting records…</h3>
              <p>Rechecking authorization for this exact drill-down.</p>
            </div>
          ) : null}
          {records && !records.items.length ? (
            <div className={styles.calmState}>
              <strong>
                No team handoffs need manager attention for this view
              </strong>
              <span>Try another authorized filter or return to Overview.</span>
            </div>
          ) : null}
          {records?.items.length ? (
            <>
              <p className={styles.resultCount}>
                {records.total} authorized{" "}
                {records.total === 1 ? "record" : "records"}
              </p>
              <div className={styles.recordCards}>
                {records.items.map((record) => (
                  <article className={styles.recordCard} key={record.id}>
                    <div className={styles.recordTop}>
                      <span className={styles.statusBadge}>
                        {statusLabels[record.status]}
                      </span>
                      <span>
                        {insightDepartmentLabels[record.sendingDepartment]} →{" "}
                        {insightDepartmentLabels[record.receivingDepartment]}
                      </span>
                    </div>
                    <h3>{record.companyName}</h3>
                    <dl>
                      <div>
                        <dt>Current owner</dt>
                        <dd>{record.currentOwnerName}</dd>
                      </div>
                      <div>
                        <dt>Required-action owner</dt>
                        <dd>
                          {record.requiredActionOwnerName ??
                            "No current action owner"}
                        </dd>
                      </div>
                      <div>
                        <dt>Reason</dt>
                        <dd>
                          {reasonText(
                            record,
                            snapshot?.result.generatedAt ??
                              "2026-08-24T14:10:00Z",
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt>Exact workflow time</dt>
                        <dd>
                          <time
                            dateTime={
                              record.updateDueAt ?? record.responseTargetAt
                            }
                          >
                            {new Date(
                              record.updateDueAt ?? record.responseTargetAt,
                            ).toLocaleString("en-US", {
                              dateStyle: "medium",
                              timeStyle: "short",
                              timeZone: "America/Chicago",
                            })}{" "}
                            CT
                          </time>
                        </dd>
                      </div>
                    </dl>
                    <RecordAction origin={origin} record={record} />
                  </article>
                ))}
              </div>
              {records.hasMore ? (
                <button
                  className={styles.secondaryButton}
                  disabled={loadingMore}
                  onClick={() => void loadMoreRecords()}
                  type="button"
                >
                  {loadingMore ? "Loading…" : "Load more records"}
                </button>
              ) : null}
            </>
          ) : null}
        </section>
      ) : null}

      <dialog
        aria-labelledby="filter-dialog-title"
        className={styles.filterDialog}
        onClose={() => filterButtonRef.current?.focus()}
        ref={filterDialogRef}
      >
        <form
          method="dialog"
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            applyFilters(draftFilters);
            filterDialogRef.current?.close();
          }}
        >
          <header>
            <div>
              <p className={styles.kicker}>Authorized scope only</p>
              <h2 id="filter-dialog-title">Change filters</h2>
            </div>
            <button
              aria-label="Close filters"
              className={styles.iconButton}
              onClick={() => {
                setDraftFilters(filters);
                filterDialogRef.current?.close();
              }}
              type="button"
            >
              <Icon name="close" />
            </button>
          </header>
          <FilterFields
            filters={draftFilters}
            idPrefix="mobile"
            onChange={setDraftFilters}
          />
          <footer>
            <button
              className={styles.textButton}
              onClick={() => setDraftFilters(defaultManagerInsightFilters)}
              type="button"
            >
              Reset
            </button>
            <button
              className={styles.secondaryButton}
              onClick={() => {
                setDraftFilters(filters);
                filterDialogRef.current?.close();
              }}
              type="button"
            >
              Cancel
            </button>
            <button className={styles.primaryButton} type="submit">
              Apply
            </button>
          </footer>
        </form>
      </dialog>

      <dialog
        aria-labelledby="metric-dialog-title"
        className={styles.metricDialog}
        onClose={() => setMetricDefinition(null)}
        ref={metricDialogRef}
      >
        <div>
          <p className={styles.kicker}>
            Definition version manager-insights-v1
          </p>
          <h2 id="metric-dialog-title">
            {metricDefinition === "closed-loop"
              ? "Closed-loop update completion"
              : "First-response target completion"}
          </h2>
          <p>
            {metricDefinition === "closed-loop"
              ? "Accepted handoffs with a qualifying structured update completed by its due time, divided by accepted handoffs whose required-update due time elapsed or was completed."
              : "Valid peer handoffs with Accept, Need Information, or Decline on or before the one-business-day target, divided by eligible handoffs whose target elapsed or was satisfied."}
          </p>
          <p className={styles.muted}>
            Views, notification reads, delivery events, general notes,
            rescheduling alone, unresolved routing, and incomplete records do
            not create a favorable result.
          </p>
          <button
            className={styles.primaryButton}
            onClick={() => metricDialogRef.current?.close()}
            type="button"
          >
            Close definition
          </button>
        </div>
      </dialog>
    </PageFrame>
  );
}
