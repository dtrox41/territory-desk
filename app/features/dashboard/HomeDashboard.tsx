import { Link } from "react-router";

import type {
  DashboardActionItem,
  DashboardFeedbackItem,
  DashboardInsightItem,
  DashboardTone,
  DashboardWaitingItem,
  HomeDashboardData,
} from "../../domain/home-dashboard";
import { Icon, type IconName } from "../../components/foundation/Icon";
import { PageFrame } from "../../components/layout/PageFrame";
import styles from "./HomeDashboard.module.css";

type HomeDashboardProps = {
  dashboard: HomeDashboardData;
};

type SectionHeaderProps = {
  count?: number;
  icon: IconName;
  id: string;
  title: string;
  viewAllHref?: string;
};

function SectionHeader({
  count,
  icon,
  id,
  title,
  viewAllHref,
}: SectionHeaderProps) {
  return (
    <header className={styles.sectionHeader}>
      <div className={styles.sectionTitleGroup}>
        <span aria-hidden="true" className={styles.sectionIcon}>
          <Icon name={icon} size="large" />
        </span>
        <h2 id={id}>{title}</h2>
        {typeof count === "number" ? (
          <span aria-label={`${count} total`} className={styles.sectionCount}>
            {count}
          </span>
        ) : null}
      </div>
      {viewAllHref ? (
        <Link
          aria-label={`View All ${title}`}
          className={styles.viewAllLink}
          to={viewAllHref}
        >
          View All
        </Link>
      ) : null}
    </header>
  );
}

function StatusBadge({
  tone,
  children,
}: {
  tone: DashboardTone;
  children: string;
}) {
  return (
    <span className={`${styles.statusBadge} ${styles[tone]}`}>{children}</span>
  );
}

function ExactTime({
  exactTime,
  relativeTime,
}: {
  exactTime: string;
  relativeTime: string;
}) {
  return (
    <span aria-label={`${relativeTime}. Exact time: ${exactTime}`}>
      {relativeTime}
    </span>
  );
}

function ActionCard({ item }: { item: DashboardActionItem }) {
  const detailHref = `/leads/${item.handoffId}`;

  return (
    <article className={styles.actionCard}>
      <div className={styles.cardTopLine}>
        <StatusBadge tone={item.tone}>{item.visibleReason}</StatusBadge>
        <ExactTime
          exactTime={item.exactTime}
          relativeTime={item.relativeTime}
        />
      </div>
      <h3>{item.company}</h3>
      <p className={styles.participantLine}>
        Sent by {item.sender} · {item.department}
      </p>
      <p className={styles.statusLine}>
        <span>Status</span> {item.status}
      </p>
      <p className={styles.rankReason}>{item.rankReason}</p>
      <div className={styles.cardActions}>
        <Link className={styles.primaryCardAction} to={detailHref}>
          {item.primaryAction}
        </Link>
        <Link
          className={styles.secondaryCardAction}
          to={`${detailHref}#overview`}
        >
          Open Details
        </Link>
      </div>
    </article>
  );
}

function WaitingCard({ item }: { item: DashboardWaitingItem }) {
  return (
    <article className={styles.compactCard}>
      <div className={styles.cardTopLine}>
        <StatusBadge tone={item.tone}>{item.status}</StatusBadge>
        <ExactTime
          exactTime={item.exactTime}
          relativeTime={item.relativeTime}
        />
      </div>
      <h3>{item.company}</h3>
      <p className={styles.participantLine}>
        With {item.recipient} · {item.department}
      </p>
      <p className={styles.compactDetail}>{item.lastActivity}</p>
      <Link
        className={styles.compactLink}
        to={`/leads/${item.handoffId}#overview`}
      >
        View Status
      </Link>
    </article>
  );
}

function FeedbackItem({ item }: { item: DashboardFeedbackItem }) {
  return (
    <article className={styles.feedbackItem}>
      <span
        aria-hidden="true"
        className={`${styles.timelineMarker} ${styles[item.tone]}`}
      />
      <div>
        <div className={styles.feedbackHeader}>
          <h3>{item.company}</h3>
          <ExactTime
            exactTime={item.exactTime}
            relativeTime={item.relativeTime}
          />
        </div>
        <p>{item.event}</p>
        <p className={styles.participantLine}>
          {item.actor} · {item.department}
        </p>
        <Link
          className={styles.compactLink}
          to={`/leads/${item.handoffId}#activity`}
        >
          Open Lead
        </Link>
      </div>
    </article>
  );
}

function InsightCard({ item }: { item: DashboardInsightItem }) {
  return (
    <Link className={styles.insightCard} to={item.href}>
      <span className={styles.insightLabel}>{item.label}</span>
      <strong>{item.value}</strong>
      <span className={styles.insightDetail}>{item.detail}</span>
      <span className={styles.insightAction}>View supporting leads</span>
    </Link>
  );
}

export function HomeDashboard({ dashboard }: HomeDashboardProps) {
  return (
    <PageFrame
      description={dashboard.statusMessage}
      eyebrow={`${dashboard.dateLabel} · Fictional demo representative`}
      title={dashboard.greeting}
    >
      <div className={styles.dashboard}>
        <nav aria-label="Quick actions" className={styles.quickActions}>
          <Link className={styles.primaryAction} to="/leads/new">
            <Icon name="send" size="large" />
            Send Lead
          </Link>
          <Link className={styles.secondaryAction} to="/territory">
            <Icon name="territory" size="large" />
            Find Territory
          </Link>
          <Link
            className={`${styles.secondaryAction} ${styles.laptopOnlyAction}`}
            to="/directory"
          >
            <Icon name="directory" size="large" />
            Find Representative
          </Link>
        </nav>

        <section aria-labelledby="collaboration-summary">
          <div className={styles.summaryHeading}>
            <h2 id="collaboration-summary">Collaboration Summary</h2>
            <p>Peer handoffs in your current demo scope</p>
          </div>
          <ul className={styles.summaryGrid}>
            {dashboard.summary.map((item) => (
              <li key={item.label}>
                <Link
                  aria-label={`${item.count} ${item.label}. ${item.description}`}
                  className={styles.summaryCard}
                  to={item.href}
                >
                  <span
                    aria-hidden="true"
                    className={`${styles.summaryAccent} ${styles[item.tone]}`}
                  />
                  <strong>{item.count}</strong>
                  <span className={styles.summaryLabel}>{item.label}</span>
                  <span className={styles.summaryDescription}>
                    {item.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className={styles.dashboardFlow}>
          <section
            aria-labelledby="action-required"
            className={styles.dashboardSection}
          >
            <SectionHeader
              count={dashboard.actionRequired.total}
              icon="leads"
              id="action-required"
              title="Action Required"
              viewAllHref="/leads?view=action-required"
            />
            <p className={styles.sectionDescription}>
              Ranked by response commitments and lead-derived follow-ups—not
              lead value or employee performance.
            </p>
            <ol className={styles.cardList}>
              {dashboard.actionRequired.items.map((item) => (
                <li key={item.handoffId}>
                  <ActionCard item={item} />
                </li>
              ))}
            </ol>
          </section>

          <section
            aria-labelledby="waiting-on-others"
            className={styles.dashboardSection}
          >
            <SectionHeader
              count={dashboard.waiting.total}
              icon="briefcase"
              id="waiting-on-others"
              title="Waiting on Others"
              viewAllHref="/leads?view=waiting"
            />
            <p className={styles.sectionDescription}>
              Handoffs you sent that are waiting for a teammate’s response or
              next update.
            </p>
            <ul className={styles.cardList}>
              {dashboard.waiting.items.map((item) => (
                <li key={item.handoffId}>
                  <WaitingCard item={item} />
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby="recent-feedback"
            className={styles.dashboardSection}
          >
            <SectionHeader
              count={dashboard.feedback.total}
              icon="bell"
              id="recent-feedback"
              title="Recent Feedback and Outcomes"
              viewAllHref="/notifications?category=feedback-outcomes"
            />
            <p className={styles.sectionDescription}>
              Meaningful updates from teammates; message-delivery events are
              excluded.
            </p>
            <ol className={styles.feedbackList}>
              {dashboard.feedback.items.map((item) => (
                <li key={item.handoffId}>
                  <FeedbackItem item={item} />
                </li>
              ))}
            </ol>
          </section>

          <section
            aria-labelledby="cross-department-insights"
            className={styles.dashboardSection}
          >
            <SectionHeader
              icon="chart"
              id="cross-department-insights"
              title="Cross-Department Insights"
            />
            <p className={styles.sectionDescription}>
              Personal workflow signals for this fictional period—not a
              leaderboard or sales-performance score.
            </p>
            <p className={styles.dataFreshness}>
              <span>Demo data</span> {dashboard.lastUpdatedLabel}
            </p>
            <ul className={styles.insightGrid}>
              {dashboard.insights.map((item) => (
                <li key={item.label}>
                  <InsightCard item={item} />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </PageFrame>
  );
}
