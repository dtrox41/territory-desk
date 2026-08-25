import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import { PageFrame } from "../../components/layout/PageFrame";
import {
  groupNotifications,
  notificationCategories,
  notificationEmptyState,
  notificationLinkedStateLabels,
  type NotificationCategory,
  type NotificationFilters,
  type NotificationRecord,
} from "../../domain/notifications";
import type {
  NotificationListResult,
  NotificationService,
} from "../../services/notification-service";
import styles from "./NotificationCenter.module.css";

type NotificationCenterProps = { notificationService: NotificationService };

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

function commandKey(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function publishUnreadCount(count?: number) {
  window.dispatchEvent(
    new CustomEvent("territory-desk:notifications-updated", {
      detail:
        typeof count === "number"
          ? { count, countAvailable: true }
          : { countAvailable: false },
    }),
  );
}

function MarkAllDialog({
  onClose,
  onConfirm,
  unreadCount,
}: {
  onClose: () => void;
  onConfirm: () => Promise<void>;
  unreadCount: number;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => dialog.current?.showModal(), []);

  async function confirm() {
    setPending(true);
    await onConfirm();
    setPending(false);
    dialog.current?.close();
  }

  return (
    <dialog
      aria-labelledby="mark-all-title"
      className={styles.dialog}
      onCancel={(event) => {
        event.preventDefault();
        dialog.current?.close();
      }}
      onClose={onClose}
      ref={dialog}
    >
      <div className={styles.dialogHeader}>
        <div>
          <p>Notification read state</p>
          <h2 id="mark-all-title">
            Mark {unreadCount}{" "}
            {unreadCount === 1 ? "notification" : "notifications"} read?
          </h2>
        </div>
        <button
          aria-label="Close Mark All Read confirmation"
          onClick={() => dialog.current?.close()}
          type="button"
        >
          ×
        </button>
      </div>
      <div className={styles.dialogBody}>
        <p>
          This clears notification unread indicators. It does not complete any
          lead actions.
        </p>
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
            disabled={pending}
            onClick={() => void confirm()}
            type="button"
          >
            {pending ? "Marking read…" : "Mark All Read"}
          </button>
        </div>
      </div>
    </dialog>
  );
}

function DestinationLink({
  notification,
  offline,
}: {
  notification: NotificationRecord;
  offline: boolean;
}) {
  if (
    offline ||
    !notification.destination ||
    notification.detailsState === "unavailable"
  ) {
    return null;
  }
  if (notification.destination.type === "lead") {
    return (
      <Link
        className={styles.primaryButton}
        state={{ notificationId: notification.id }}
        to={`/leads/${notification.destination.leadId}`}
      >
        {notification.actionLabel}
      </Link>
    );
  }
  return (
    <Link className={styles.primaryButton} to={notification.destination.href}>
      {notification.actionLabel}
    </Link>
  );
}

export function NotificationCenter({
  notificationService,
}: NotificationCenterProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const online = useOnline();
  const [filters, setFilters] = useState<NotificationFilters>({
    category: "all",
    unreadOnly: false,
  });
  const [list, setList] = useState<NotificationListResult | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState(false);
  const [countLoading, setCountLoading] = useState(true);
  const [countUnavailable, setCountUnavailable] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number | null>(null);
  const [markErrors, setMarkErrors] = useState<Record<string, string>>({});
  const [markPending, setMarkPending] = useState<string | null>(null);
  const [markAllOpen, setMarkAllOpen] = useState(false);
  const [markAllError, setMarkAllError] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [newAvailable, setNewAvailable] = useState(false);
  const [paginationError, setPaginationError] = useState(false);
  const [paginationPending, setPaginationPending] = useState(false);

  async function loadCount() {
    setCountLoading(true);
    const result = await notificationService.getUnreadCount();
    if (result.type === "available") {
      setUnreadCount(result.count);
      setCountUnavailable(false);
      publishUnreadCount(result.count);
    } else {
      setUnreadCount(null);
      setCountUnavailable(true);
      publishUnreadCount();
    }
    setCountLoading(false);
  }

  async function loadList(nextFilters = filters) {
    setListLoading(true);
    setListError(false);
    setPaginationError(false);
    try {
      const result = await notificationService.getNotifications({
        filters: nextFilters,
      });
      setList(result);
      setAnnouncement(
        `${result.resultTotal} ${result.resultTotal === 1 ? "notification" : "notifications"} shown.`,
      );
    } catch {
      setListError(true);
    } finally {
      setListLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(() => {
      void loadCount().catch(() => {
        setCountLoading(false);
        setCountUnavailable(true);
        publishUnreadCount();
      });
      void loadList();
    });
    const receiveNewNotification = () => setNewAvailable(true);
    window.addEventListener(
      "territory-desk:new-notification",
      receiveNewNotification,
    );
    return () =>
      window.removeEventListener(
        "territory-desk:new-notification",
        receiveNewNotification,
      );
    // The service is a route-level dependency and filters are changed explicitly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationService]);

  function chooseCategory(category: NotificationCategory) {
    const next = { ...filters, category };
    setFilters(next);
    void loadList(next);
  }

  function chooseUnreadOnly(unreadOnly: boolean) {
    const next = { ...filters, unreadOnly };
    setFilters(next);
    void loadList(next);
  }

  async function markRead(notificationId: string) {
    setMarkPending(notificationId);
    setMarkErrors((current) => ({ ...current, [notificationId]: "" }));
    try {
      const result = await notificationService.markRead({
        idempotencyKey: `mark-read-${notificationId}`,
        notificationId,
      });
      setUnreadCount(result.unreadCount);
      publishUnreadCount(result.unreadCount);
      setList((current) =>
        current
          ? {
              ...current,
              items: current.items
                .map((item) =>
                  item.id === notificationId ? { ...item, read: true } : item,
                )
                .filter((item) => !filters.unreadOnly || !item.read),
              resultTotal:
                filters.unreadOnly && result.changedCount
                  ? current.resultTotal - 1
                  : current.resultTotal,
            }
          : current,
      );
      setAnnouncement("Notification marked read. Lead status was not changed.");
    } catch {
      setMarkErrors((current) => ({
        ...current,
        [notificationId]:
          "Notification could not be marked read. It remains unread. Try again.",
      }));
    } finally {
      setMarkPending(null);
    }
  }

  async function markAllRead() {
    setMarkAllError("");
    try {
      const before = unreadCount ?? 0;
      const result = await notificationService.markAllRead({
        idempotencyKey: commandKey("mark-all-read"),
      });
      setUnreadCount(result.unreadCount);
      publishUnreadCount(result.unreadCount);
      if (result.changedCount < before) {
        await loadList(filters);
        setMarkAllError(
          `${result.changedCount} notifications were marked read; ${result.unreadCount} remain unread. Try again.`,
        );
      } else {
        setList((current) =>
          current
            ? {
                ...current,
                items: filters.unreadOnly
                  ? []
                  : current.items.map((item) => ({ ...item, read: true })),
                resultTotal: filters.unreadOnly ? 0 : current.resultTotal,
              }
            : current,
        );
        setAnnouncement(
          `${result.changedCount} notifications marked read. No lead actions were completed.`,
        );
      }
    } catch {
      setMarkAllError(
        "Notifications could not be marked read. They remain unchanged. Try again.",
      );
    }
  }

  async function loadEarlier() {
    if (!list?.nextCursor) return;
    setPaginationPending(true);
    setPaginationError(false);
    try {
      const next = await notificationService.getNotifications({
        cursor: list.nextCursor,
        filters,
      });
      setList({
        ...next,
        items: [...list.items, ...next.items],
        resultTotal: list.resultTotal,
      });
    } catch {
      setPaginationError(true);
    } finally {
      setPaginationPending(false);
    }
  }

  const groups = groupNotifications(list?.items ?? []);
  const empty = notificationEmptyState(filters);
  const readOnly = !online || list?.dataState === "stale";
  const currentCountUnavailable = countUnavailable || readOnly;

  return (
    <PageFrame
      description="Peer-lead alerts, feedback, outcomes, reminders, and useful system notices."
      eyebrow="Collaboration inbox"
      title="Notifications"
    >
      <button
        className={styles.backButton}
        onClick={() => {
          void (location.key === "default" ? navigate("/") : navigate(-1));
        }}
        type="button"
      >
        ← Back
      </button>
      <p aria-live="polite" className={styles.srAnnouncement}>
        {announcement}
      </p>

      {!online ? (
        <div className={styles.warningBanner} role="status">
          <strong>You’re offline</strong>
          <span>
            Loaded notifications remain readable. Mark Read and protected
            destination actions are disabled.
          </span>
        </div>
      ) : null}
      {list?.dataState === "stale" ? (
        <div className={styles.warningBanner} role="status">
          <strong>Showing a saved notification snapshot</strong>
          <span>
            Last refreshed {list.lastUpdatedLabel}. Refresh before changing read
            state.
          </span>
        </div>
      ) : null}
      {newAvailable ? (
        <div className={styles.newBanner} role="status">
          <div>
            <strong>New Notifications Available</strong>
            <span>Your current reading position has not moved.</span>
          </div>
          <button
            className={styles.secondaryButton}
            onClick={() => {
              setNewAvailable(false);
              void loadList();
              void loadCount();
            }}
            type="button"
          >
            Refresh Notifications
          </button>
        </div>
      ) : null}

      <section className={styles.summary} aria-labelledby="unread-summary">
        <div>
          <p>Personal in-app read state</p>
          <h2 id="unread-summary">
            {countLoading
              ? "Checking unread notifications…"
              : currentCountUnavailable
                ? "Notification count unavailable"
                : unreadCount === 0
                  ? "You’re caught up"
                  : `${unreadCount} unread ${unreadCount === 1 ? "notification" : "notifications"}`}
          </h2>
          <span>
            The bell count is separate from lead actions, responses, and SMS
            delivery.
          </span>
        </div>
        {!countLoading && !currentCountUnavailable && unreadCount ? (
          <button
            className={styles.secondaryButton}
            disabled={readOnly}
            onClick={() => setMarkAllOpen(true)}
            type="button"
          >
            Mark All Read
          </button>
        ) : null}
      </section>

      {markAllError ? (
        <div className={styles.errorBanner} role="alert">
          {markAllError}
        </div>
      ) : null}

      <div className={styles.controls}>
        <div aria-label="Notification categories" className={styles.categories}>
          {notificationCategories.map((category) => (
            <button
              aria-pressed={filters.category === category.value}
              key={category.value}
              onClick={() => chooseCategory(category.value)}
              type="button"
            >
              {category.label}
            </button>
          ))}
        </div>
        <label className={styles.unreadToggle}>
          <input
            checked={filters.unreadOnly}
            onChange={(event) => chooseUnreadOnly(event.target.checked)}
            type="checkbox"
          />
          <span>Unread Only</span>
        </label>
      </div>

      <section
        aria-busy={listLoading}
        aria-labelledby="notification-results-heading"
        className={styles.results}
      >
        <div className={styles.resultsHeader}>
          <div>
            <p>Newest first · not ranked by priority</p>
            <h2 id="notification-results-heading">
              {notificationCategories.find(
                (category) => category.value === filters.category,
              )?.label ?? "All"}
            </h2>
          </div>
          {list ? <span>{list.resultTotal} available</span> : null}
        </div>

        {listLoading ? (
          <div className={styles.loadingCards} role="status">
            <span>Loading notifications…</span>
            <div />
            <div />
            <div />
          </div>
        ) : listError ? (
          <div className={styles.stateCard} role="alert">
            <h3>Notifications could not be loaded</h3>
            <p>No read state was changed.</p>
            <div>
              <button
                className={styles.primaryButton}
                onClick={() => void loadList()}
                type="button"
              >
                Retry
              </button>
              <Link className={styles.secondaryButton} to="/leads">
                View Leads
              </Link>
            </div>
          </div>
        ) : !list?.items.length ? (
          <div className={styles.stateCard}>
            <h3>{empty.message}</h3>
            {filters.unreadOnly ? (
              <button
                className={styles.primaryButton}
                onClick={() => chooseUnreadOnly(false)}
                type="button"
              >
                {empty.actionLabel}
              </button>
            ) : (
              <Link className={styles.primaryButton} to={empty.actionHref}>
                {empty.actionLabel}
              </Link>
            )}
          </div>
        ) : (
          <div className={styles.groups}>
            {groups.map((group, groupIndex) => {
              const groupId = `notification-group-${groupIndex}`;
              return (
                <section aria-labelledby={groupId} key={group.label}>
                  <h3 id={groupId}>{group.label}</h3>
                  <ol className={styles.notificationList}>
                    {group.records.map((item) => (
                      <li
                        className={
                          item.read ? styles.readCard : styles.unreadCard
                        }
                        key={item.id}
                      >
                        <article aria-labelledby={`notification-${item.id}`}>
                          <div className={styles.cardTopline}>
                            <span className={styles.readState}>
                              <span
                                aria-hidden="true"
                                className={styles.readDot}
                              />
                              {item.read ? "Read" : "Unread"}
                            </span>
                            <span>{item.typeLabel}</span>
                            <time
                              dateTime={item.createdAt}
                              title={item.exactTimeLabel}
                            >
                              {item.createdLabel}
                            </time>
                          </div>
                          <h4 id={`notification-${item.id}`}>{item.message}</h4>
                          {item.actorName ? (
                            <p className={styles.actor}>
                              {item.actorName} · {item.actorDepartment}
                            </p>
                          ) : null}
                          <p className={styles.linkedState}>
                            {notificationLinkedStateLabels[item.linkedState]}
                          </p>
                          {item.detailsState === "partial" ? (
                            <p className={styles.partialNotice}>
                              Some notification details are unavailable.
                            </p>
                          ) : null}
                          {item.detailsState === "unavailable" ? (
                            <p className={styles.partialNotice}>
                              The linked record is unavailable. No record
                              details are disclosed.
                            </p>
                          ) : null}
                          {markErrors[item.id] ? (
                            <p className={styles.cardError} role="alert">
                              {markErrors[item.id]}
                            </p>
                          ) : null}
                          <div className={styles.cardActions}>
                            <DestinationLink
                              notification={item}
                              offline={readOnly}
                            />
                            {!item.read ? (
                              <button
                                className={styles.textButton}
                                disabled={readOnly || markPending === item.id}
                                onClick={() => void markRead(item.id)}
                                type="button"
                              >
                                {markPending === item.id
                                  ? "Marking read…"
                                  : "Mark Read"}
                              </button>
                            ) : null}
                          </div>
                        </article>
                      </li>
                    ))}
                  </ol>
                </section>
              );
            })}
          </div>
        )}

        {paginationError ? (
          <div className={styles.paginationError} role="alert">
            <span>Earlier notifications could not be loaded.</span>
            <button
              className={styles.textButton}
              onClick={() => void loadEarlier()}
              type="button"
            >
              Retry Loading Earlier
            </button>
          </div>
        ) : null}
        {list?.hasMore && !paginationError ? (
          <button
            className={styles.loadEarlier}
            disabled={paginationPending}
            onClick={() => void loadEarlier()}
            type="button"
          >
            {paginationPending
              ? "Loading earlier…"
              : "Load Earlier Notifications"}
          </button>
        ) : null}
      </section>

      {markAllOpen && unreadCount ? (
        <MarkAllDialog
          onClose={() => setMarkAllOpen(false)}
          onConfirm={markAllRead}
          unreadCount={unreadCount}
        />
      ) : null}
    </PageFrame>
  );
}
