import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Link, useSearchParams } from "react-router";

import {
  activeLeadFilterCount,
  defaultLeadListFilters,
  leadSourceDivisionOptions,
  leadStatusLabels,
  leadsViews,
  type LeadAttentionState,
  type LeadListCard,
  type LeadListFilters,
  type LeadListStatus,
  type LeadsView,
} from "../../domain/leads-list";
import { leadDepartmentOptions } from "../../domain/lead-creation";
import type {
  LeadsListResult,
  LeadsListService,
  LeadViewCounts,
} from "../../services/leads-list-service";
import { PageFrame } from "../../components/layout/PageFrame";
import styles from "./LeadsList.module.css";

type LeadsListProps = {
  leadsService: LeadsListService;
};

const allowedViews = new Set(leadsViews.map((item) => item.value));
const statuses = Object.keys(leadStatusLabels) as LeadListStatus[];
const attentionOptions: Array<{
  label: string;
  value: LeadAttentionState;
}> = [
  { label: "Action Required", value: "action_required" },
  { label: "Waiting", value: "waiting" },
  { label: "Needs Attention", value: "needs_attention" },
  { label: "Up to Date", value: "up_to_date" },
  { label: "Closed", value: "closed" },
];

const leadListSessionState: {
  loadedCounts: Map<string, number>;
  originKey?: string;
  originLeadId?: string;
  scrollY: number;
  search: string;
} = {
  loadedCounts: new Map(),
  scrollY: 0,
  search: "",
};

export function resetLeadListSessionState() {
  leadListSessionState.loadedCounts.clear();
  leadListSessionState.originKey = undefined;
  leadListSessionState.originLeadId = undefined;
  leadListSessionState.scrollY = 0;
  leadListSessionState.search = "";
}

function parseView(value: string | null): LeadsView {
  return value && allowedViews.has(value as LeadsView)
    ? (value as LeadsView)
    : "action-required";
}

function parseFilters(params: URLSearchParams): LeadListFilters {
  const department = leadDepartmentOptions.some(
    (option) => option.value === params.get("department"),
  )
    ? (params.get("department") as LeadListFilters["department"])
    : "all";
  const status = statuses.includes(params.get("status") as LeadListStatus)
    ? (params.get("status") as LeadListStatus)
    : "all";
  const rawAttention = params.get("attention");
  const sourceDivision = leadSourceDivisionOptions.some(
    (option) => option.value === params.get("division"),
  )
    ? (params.get("division") as LeadListFilters["sourceDivision"])
    : "all";
  const attentionMap: Record<string, LeadAttentionState> = {
    "action-required": "action_required",
    "needs-attention": "needs_attention",
    "open-loops": "action_required",
    "response-target": "needs_attention",
    new: "action_required",
    waiting: "waiting",
    "up-to-date": "up_to_date",
    closed: "closed",
  };
  const direction = params.get("direction");
  const period = params.get("period");
  return {
    attention: rawAttention ? (attentionMap[rawAttention] ?? "all") : "all",
    department,
    direction:
      direction === "sent" || direction === "received" ? direction : "all",
    exception: params.get("exception") === "1",
    period:
      period === "7d" || period === "30d" || period === "90d" ? period : "all",
    sourceDivision,
    status,
  };
}

function subscribeToConnection(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function useOnline() {
  return useSyncExternalStore(
    subscribeToConnection,
    () => navigator.onLine,
    () => true,
  );
}

function viewLabel(view: LeadsView) {
  return (
    leadsViews.find((item) => item.value === view)?.label ?? "Action Required"
  );
}

function FilterDialog({
  filters,
  onApply,
  onClose,
  view,
}: {
  filters: LeadListFilters;
  onApply: (filters: LeadListFilters) => void;
  onClose: () => void;
  view: LeadsView;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState(filters);

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  function close() {
    dialog.current?.close();
  }

  return (
    <dialog
      aria-labelledby="lead-filters-title"
      className={styles.filterDialog}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClose={onClose}
      ref={dialog}
    >
      <form method="dialog" onSubmit={(event) => event.preventDefault()}>
        <header>
          <div>
            <p>My Work</p>
            <h2 id="lead-filters-title">Filter {viewLabel(view)}</h2>
          </div>
          <button aria-label="Close filters" onClick={close} type="button">
            ×
          </button>
        </header>
        <div className={styles.filterFields}>
          <label>
            <span>Department or service</span>
            <select
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  department: event.target
                    .value as LeadListFilters["department"],
                }))
              }
              value={draft.department}
            >
              <option value="all">All departments</option>
              {leadDepartmentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Handoff status</span>
            <select
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  status: event.target.value as LeadListFilters["status"],
                }))
              }
              value={draft.status}
            >
              <option value="all">All statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {leadStatusLabels[status]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Attention state</span>
            <select
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  attention: event.target.value as LeadListFilters["attention"],
                }))
              }
              value={draft.attention}
            >
              <option value="all">All attention states</option>
              {attentionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Exact source division</span>
            <select
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  sourceDivision: event.target
                    .value as LeadListFilters["sourceDivision"],
                }))
              }
              value={draft.sourceDivision}
            >
              <option value="all">All source divisions</option>
              {leadSourceDivisionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {view === "received" || view === "sent" || view === "completed" ? (
            <label>
              <span>Direction</span>
              <select
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    direction: event.target
                      .value as LeadListFilters["direction"],
                  }))
                }
                value={draft.direction}
              >
                <option value="all">Sent and received</option>
                <option value="received">Received</option>
                <option value="sent">Sent</option>
              </select>
            </label>
          ) : null}
          <label>
            <span>Updated period</span>
            <select
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  period: event.target.value as LeadListFilters["period"],
                }))
              }
              value={draft.period}
            >
              <option value="all">Any time</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </label>
          <label className={styles.checkboxField}>
            <input
              checked={draft.exception}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  exception: event.target.checked,
                }))
              }
              type="checkbox"
            />
            <span>Has routing or data exception</span>
          </label>
        </div>
        <footer>
          <button
            className={styles.clearButton}
            onClick={() => setDraft(defaultLeadListFilters)}
            type="button"
          >
            Clear All
          </button>
          <button className={styles.cancelButton} onClick={close} type="button">
            Cancel
          </button>
          <button
            className={styles.applyButton}
            onClick={() => {
              onApply(draft);
              close();
            }}
            type="button"
          >
            Apply Filters
          </button>
        </footer>
      </form>
    </dialog>
  );
}

function LeadCard({
  item,
  onOpen,
  view,
}: {
  item: LeadListCard;
  onOpen: (leadId: string) => void;
  view: LeadsView;
}) {
  return (
    <article className={`${styles.leadCard} ${styles[item.tone]}`}>
      <div className={styles.cardTopline}>
        <span>{item.visibleReason}</span>
        <span>{leadStatusLabels[item.status]}</span>
      </div>
      <h2>
        <Link
          data-lead-origin={item.id}
          onClick={() => onOpen(item.id)}
          to={`/leads/${item.id}`}
        >
          {item.companyName}
        </Link>
      </h2>
      <p className={styles.participant}>{item.directionLabel}</p>
      <dl>
        <div>
          <dt>Requested service</dt>
          <dd>
            {item.departmentLabel} · {item.exactSourceDivision}
          </dd>
        </div>
        <div>
          <dt>{item.dueAt ? "Timing" : "Last update"}</dt>
          <dd>
            <span>{item.relativeTimeLabel}</span>
            <time
              dateTime={item.dueAt ?? item.materialUpdatedAt}
              title={item.exactTimeLabel}
            >
              {item.exactTimeLabel}
            </time>
          </dd>
        </div>
      </dl>
      {item.primaryFollowUp ? (
        <p className={styles.followUp}>
          <strong>Primary follow-up:</strong> {item.primaryFollowUp}
        </p>
      ) : null}
      <p className={styles.feedback}>{item.latestFeedback}</p>
      {item.partialData ? (
        <p className={styles.partialWarning} role="status">
          Some lead details are unavailable. Open the lead to review the current
          safe record.
        </p>
      ) : null}
      {item.rankExplanation ? (
        <details className={styles.explanation}>
          <summary>Why this is ranked here</summary>
          <p>{item.rankExplanation}</p>
        </details>
      ) : null}
      <div className={styles.cardActions}>
        <Link
          className={styles.primaryAction}
          onClick={() => onOpen(item.id)}
          to={`/leads/${item.id}`}
        >
          {item.primaryAction}
        </Link>
        {view === "action-required" ? (
          <Link
            className={styles.secondaryAction}
            onClick={() => onOpen(item.id)}
            to={`/leads/${item.id}#overview`}
          >
            Open Lead
          </Link>
        ) : null}
      </div>
    </article>
  );
}

const emptyContent: Record<
  LeadsView,
  { actions: Array<{ href: string; label: string }>; message: string }
> = {
  "action-required": {
    actions: [
      { href: "/territory", label: "Find Territory" },
      { href: "/leads?view=waiting", label: "View Waiting on Others" },
    ],
    message: "You're caught up. New lead actions will appear here.",
  },
  waiting: {
    actions: [
      { href: "/leads/new", label: "Send Lead" },
      { href: "/leads?view=sent", label: "View Sent" },
    ],
    message: "No sent handoffs are waiting on another representative.",
  },
  received: {
    actions: [{ href: "/directory", label: "Open Directory" }],
    message: "No peer handoffs have been received yet.",
  },
  sent: {
    actions: [
      { href: "/territory", label: "Find Territory" },
      { href: "/leads/new", label: "Send Lead" },
    ],
    message: "You have not sent a peer handoff yet.",
  },
  "in-progress": {
    actions: [{ href: "/leads?view=received", label: "View Received" }],
    message: "You do not own an active accepted handoff.",
  },
  completed: {
    actions: [{ href: "/leads?view=in-progress", label: "View In Progress" }],
    message: "Completed peer-handoff outcomes will appear here.",
  },
};

function serializeFilters(
  view: LeadsView,
  filters: LeadListFilters,
  setSearchParams: ReturnType<typeof useSearchParams>[1],
) {
  const params = new URLSearchParams();
  if (view !== "action-required") params.set("view", view);
  if (filters.department !== "all")
    params.set("department", filters.department);
  if (filters.status !== "all") params.set("status", filters.status);
  if (filters.direction !== "all") params.set("direction", filters.direction);
  if (filters.period !== "all") params.set("period", filters.period);
  if (filters.sourceDivision !== "all") {
    params.set("division", filters.sourceDivision);
  }
  if (filters.exception) params.set("exception", "1");
  if (filters.attention !== "all") {
    params.set("attention", filters.attention.replaceAll("_", "-"));
  }
  setSearchParams(params, { replace: true });
}

function appliedFilterItems(filters: LeadListFilters) {
  const items: Array<{
    key: keyof LeadListFilters;
    label: string;
  }> = [];
  if (filters.department !== "all") {
    items.push({
      key: "department",
      label: `Department: ${
        leadDepartmentOptions.find(
          (option) => option.value === filters.department,
        )?.label ?? filters.department
      }`,
    });
  }
  if (filters.sourceDivision !== "all") {
    items.push({
      key: "sourceDivision",
      label: `Division: ${
        leadSourceDivisionOptions.find(
          (option) => option.value === filters.sourceDivision,
        )?.label ?? filters.sourceDivision
      }`,
    });
  }
  if (filters.status !== "all") {
    items.push({
      key: "status",
      label: `Status: ${leadStatusLabels[filters.status]}`,
    });
  }
  if (filters.attention !== "all") {
    items.push({
      key: "attention",
      label: `Attention: ${
        attentionOptions.find((option) => option.value === filters.attention)
          ?.label ?? filters.attention
      }`,
    });
  }
  if (filters.direction !== "all") {
    items.push({
      key: "direction",
      label: `Direction: ${filters.direction === "sent" ? "Sent" : "Received"}`,
    });
  }
  if (filters.period !== "all") {
    items.push({
      key: "period",
      label: `Updated: Last ${filters.period.replace("d", " days")}`,
    });
  }
  if (filters.exception) {
    items.push({ key: "exception", label: "Has routing or data exception" });
  }
  return items;
}

function removeFilter(filters: LeadListFilters, key: keyof LeadListFilters) {
  return {
    ...filters,
    [key]: key === "exception" ? false : "all",
  };
}

export function LeadsList({ leadsService }: LeadsListProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = parseView(searchParams.get("view"));
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const [search, setSearch] = useState(() => leadListSessionState.search);
  const [result, setResult] = useState<LeadsListResult | null>(null);
  const [counts, setCounts] = useState<LeadViewCounts | null>(null);
  const [countError, setCountError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [updatesAvailable, setUpdatesAvailable] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const online = useOnline();
  const listKey = useMemo(
    () => `${view}:${JSON.stringify(filters)}:${search.trim()}`,
    [filters, search, view],
  );

  useEffect(() => {
    let active = true;
    leadsService
      .getCounts()
      .then((nextCounts) => {
        if (!active) return;
        setCounts(nextCounts);
        setCountError(false);
      })
      .catch(() => {
        if (active) setCountError(true);
      });
    return () => {
      active = false;
    };
  }, [leadsService, refreshKey]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setListError(false);
      const load = async () => {
        try {
          let nextResult = await leadsService.getLeads({
            filters,
            search,
            view,
          });
          const rememberedCount =
            leadListSessionState.loadedCounts.get(listKey);
          while (
            active &&
            rememberedCount &&
            nextResult.items.length < rememberedCount &&
            nextResult.nextCursor
          ) {
            const nextPage = await leadsService.getLeads({
              cursor: nextResult.nextCursor,
              filters,
              search,
              view,
            });
            nextResult = {
              ...nextPage,
              items: [...nextResult.items, ...nextPage.items],
            };
          }
          if (!active) return;
          setResult(nextResult);
          setLoading(false);
          setUpdatesAvailable(false);
        } catch {
          if (!active) return;
          setListError(true);
          setLoading(false);
        }
      };
      void load();
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [filters, leadsService, listKey, refreshKey, search, view]);

  useEffect(() => {
    if (
      loading ||
      !result ||
      !leadListSessionState.originLeadId ||
      leadListSessionState.originKey !== listKey
    ) {
      return;
    }
    const originLeadId = leadListSessionState.originLeadId;
    const scrollY = leadListSessionState.scrollY;
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: scrollY });
      document
        .querySelector<HTMLElement>(`[data-lead-origin="${originLeadId}"]`)
        ?.focus();
      leadListSessionState.originLeadId = undefined;
      leadListSessionState.originKey = undefined;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [listKey, loading, result]);

  useEffect(() => {
    const showUpdates = () => setUpdatesAvailable(true);
    window.addEventListener("territory-desk:leads-updated", showUpdates);
    return () =>
      window.removeEventListener("territory-desk:leads-updated", showUpdates);
  }, []);

  async function loadMore() {
    if (!result?.nextCursor || loadingMore || !online) return;
    setLoadingMore(true);
    setLoadMoreError(false);
    try {
      const next = await leadsService.getLeads({
        cursor: result.nextCursor,
        filters,
        search,
        view,
      });
      const items = [...result.items, ...next.items];
      leadListSessionState.loadedCounts.set(listKey, items.length);
      setResult({ ...next, items });
    } catch {
      setLoadMoreError(true);
    } finally {
      setLoadingMore(false);
    }
  }

  const activeFilters = activeLeadFilterCount(filters);
  const filterItems = appliedFilterItems(filters);
  const selectedViewCount = counts?.[view];
  const filtered = Boolean(search.trim() || activeFilters);

  function rememberOrigin(leadId: string) {
    leadListSessionState.originKey = listKey;
    leadListSessionState.originLeadId = leadId;
    leadListSessionState.scrollY = window.scrollY;
  }

  function updateSearch(value: string) {
    leadListSessionState.search = value;
    setSearch(value);
  }

  return (
    <PageFrame
      description="Find the peer handoffs you owe, are waiting on, received, sent, own, or completed. Team-wide oversight remains in Manager Insights."
      eyebrow="My Work · Fictional prototype"
      title="Leads"
    >
      {!online || result?.dataState === "stale" ? (
        <div className={styles.staleBanner} role="status">
          <strong>
            {online ? "List may be out of date." : "You are offline."}
          </strong>
          <span>
            Loaded fictional cards remain visible. Actions requiring current
            validation are disabled until refresh.
          </span>
        </div>
      ) : null}

      <section aria-label="Lead list controls" className={styles.controls}>
        <div className={styles.viewControl}>
          <label htmlFor="leads-view">View</label>
          <select
            aria-describedby="view-count"
            id="leads-view"
            onChange={(event) =>
              serializeFilters(
                event.target.value as LeadsView,
                defaultLeadListFilters,
                setSearchParams,
              )
            }
            value={view}
          >
            {leadsViews.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
                {counts ? ` (${counts[item.value]})` : ""}
              </option>
            ))}
          </select>
          <p id="view-count">
            {countError
              ? "Count unavailable"
              : selectedViewCount === undefined
                ? "Loading count…"
                : `${selectedViewCount} in ${viewLabel(view)}`}
          </p>
        </div>
        <div className={styles.searchControl}>
          <label htmlFor="lead-search">Search this view</label>
          <input
            autoComplete="off"
            id="lead-search"
            onChange={(event) => updateSearch(event.target.value)}
            placeholder="Company, reference, sender, or recipient"
            type="search"
            value={search}
          />
          <p>Search text stays in this active session and out of the URL.</p>
        </div>
        <button
          aria-haspopup="dialog"
          className={styles.filterButton}
          onClick={() => setFilterOpen(true)}
          type="button"
        >
          Filters{activeFilters ? ` (${activeFilters})` : ""}
        </button>
      </section>

      {filterOpen ? (
        <FilterDialog
          filters={filters}
          onApply={(nextFilters) =>
            serializeFilters(view, nextFilters, setSearchParams)
          }
          onClose={() => setFilterOpen(false)}
          view={view}
        />
      ) : null}

      {activeFilters ? (
        <div aria-label="Applied filters" className={styles.filterChips}>
          <strong>Applied filters</strong>
          {filterItems.map((item) => (
            <button
              aria-label={`Remove ${item.label} filter`}
              key={item.key}
              onClick={() =>
                serializeFilters(
                  view,
                  removeFilter(filters, item.key),
                  setSearchParams,
                )
              }
              type="button"
            >
              {item.label} ×
            </button>
          ))}
          <button
            onClick={() =>
              serializeFilters(view, defaultLeadListFilters, setSearchParams)
            }
            type="button"
          >
            Clear all {activeFilters}
          </button>
        </div>
      ) : null}

      {updatesAvailable ? (
        <div className={styles.updateBanner} role="status">
          <span>
            New updates available. Your current reading position has not moved.
          </span>
          <button
            onClick={() => setRefreshKey((value) => value + 1)}
            type="button"
          >
            Refresh List
          </button>
        </div>
      ) : null}

      <section aria-labelledby="leads-view-title" className={styles.results}>
        <header className={styles.resultHeader}>
          <div>
            <h2 id="leads-view-title">{viewLabel(view)}</h2>
            <p aria-live="polite">
              {loading
                ? "Loading fictional leads…"
                : result
                  ? filtered
                    ? `${result.resultTotal} matching ${result.viewTotal} total in this view`
                    : `${result.viewTotal} leads`
                  : "Lead count unavailable"}
            </p>
          </div>
          <div>
            <strong>
              {view === "action-required"
                ? "Ranked by required action"
                : view === "waiting"
                  ? "Needs attention first"
                  : view === "completed"
                    ? "Newest completion first"
                    : "Newest update first"}
            </strong>
            {result ? <span>Updated {result.lastUpdatedLabel}</span> : null}
          </div>
        </header>

        {loading && !result ? (
          <div
            aria-label="Loading leads"
            className={styles.skeletonList}
            role="status"
          >
            <span>Loading leads…</span>
            {[1, 2, 3].map((item) => (
              <div aria-hidden="true" key={item} />
            ))}
          </div>
        ) : null}

        {listError ? (
          <div className={styles.errorState} role="alert">
            <h3>Leads could not be loaded</h3>
            <p>
              No list action was completed. Retry with the current view and
              filters.
            </p>
            <div>
              <button
                onClick={() => setRefreshKey((value) => value + 1)}
                type="button"
              >
                Retry
              </button>
              <Link to="/">Return Home</Link>
            </div>
          </div>
        ) : null}

        {!loading && !listError && result?.items.length === 0 ? (
          <div className={styles.emptyState}>
            <h3>
              {filtered
                ? "No leads match the current search and filters."
                : emptyContent[view].message}
            </h3>
            <div>
              {filtered ? (
                <>
                  <button onClick={() => updateSearch("")} type="button">
                    Clear Search
                  </button>
                  <button
                    onClick={() =>
                      serializeFilters(
                        view,
                        defaultLeadListFilters,
                        setSearchParams,
                      )
                    }
                    type="button"
                  >
                    Clear Filters
                  </button>
                </>
              ) : (
                emptyContent[view].actions.map((action) => (
                  <Link key={action.href} to={action.href}>
                    {action.label}
                  </Link>
                ))
              )}
            </div>
          </div>
        ) : null}

        {result?.items.length ? (
          <div className={styles.cardList}>
            {result.items.map((item) => (
              <LeadCard
                item={item}
                key={item.id}
                onOpen={rememberOrigin}
                view={view}
              />
            ))}
          </div>
        ) : null}

        {result?.hasMore ? (
          <div className={styles.loadMore}>
            <button
              disabled={loadingMore || !online}
              onClick={() => void loadMore()}
              type="button"
            >
              {loadingMore ? "Loading More…" : "Load More"}
            </button>
            {loadMoreError ? (
              <p role="alert">
                Earlier leads could not be loaded. Try Load More again.
              </p>
            ) : null}
          </div>
        ) : result?.items.length ? (
          <p className={styles.endMessage}>
            End of authorized fictional results.
          </p>
        ) : null}
      </section>
    </PageFrame>
  );
}
