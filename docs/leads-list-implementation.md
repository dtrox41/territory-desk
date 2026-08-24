# Step 5.3.6 — Fictional Personal Leads List

Status: Implementation complete locally; awaiting user approval

Date: 2026-08-24

## Outcome

The `/leads` route now provides a mobile-first personal work queue for one
fictional representative. It consolidates cross-department peer handoffs into
six clear views without turning the screen into a team leaderboard, a CRM
pipeline, or a manager surveillance table. It does not connect to GitHub,
Dynamics, a database, SMS, Outlook, email, or real employee/customer data.

## Personal work views

1. **Action Required** is the default and shows exactly one highest-priority
   current action for each handoff owned by the signed-in fictional user.
2. **Waiting on Others** shows handoffs sent by that user where a teammate owns
   the next meaningful response or follow-up.
3. **Received** retains authorized peer handoffs received by the user,
   including safe reassignment context.
4. **Sent** retains the user's outbound handoff history.
5. **In Progress** shows active accepted handoffs currently owned by the user.
6. **Completed** shows authorized terminal outcomes newest first.

Managers retain these same personal-list semantics. Team-wide operational
oversight remains isolated to the separately authorized `/insights` route.

## Ranking and card safety

Action Required follows the approved deterministic hierarchy: missed response
target, overdue follow-up, information received, new lead, response needed,
follow-up due today, missing next action, and pending reassignment
acknowledgment. Ties use due time, required-action time, creation time, and the
stable opaque identifier. No value, revenue, urgency claim, raw volume, or
representative performance changes the order.

Each card shows only company, sender or recipient context, requested service
and source division, status, safe timing,
primary follow-up when present, concise latest feedback, partial-data warning,
and an optional ranking explanation. Customer contacts, street address, full
notes, raw notification-provider errors, and team performance data remain off
the list. Every primary action opens Lead Detail; no Accept, Need Information,
Decline, Complete, Reassign, or other consequential mutation occurs in the
list.

## Search, filters, and pagination

- Search is limited to company, opaque reference, sender, requested recipient,
  and current owner within the current authorized view.
- Search text remains in active React memory and never enters the URL.
- Allowlisted non-sensitive department, status, attention, direction, period,
  and exception filters can enter the URL for safe restoration.
- Filters use an explicit Apply, Cancel, Clear All dialog rather than changing
  the list while choices are still being considered.
- Sent history returns 20 records initially and requires explicit Load More;
  the fictional fixture expands to 24 without duplication.
- New-update events announce that refresh is available without moving the
  user's current reading position.

## Failure and connection behavior

- View counts load independently; `Count unavailable` does not erase a valid
  lead list.
- Initial list failure preserves the controls and offers Retry and Return Home.
- Load More failure preserves the already loaded records and retries only that
  page.
- Empty, filtered-empty, loading, partial-data, stale, and offline states use
  explicit text and recovery actions.
- Offline or stale mode keeps already loaded authorized fictional cards visible.
  This screen contains no consequential inline mutation queue.

## Responsive and accessibility behavior

- A 390-pixel iPhone layout uses a single-column queue, large controls, bottom
  navigation, readable action hierarchy, and no horizontal overflow.
- A 412-pixel Android layout uses the same logic and a bottom-sheet filter
  dialog with native labeled controls.
- A 1440-pixel laptop layout keeps the persistent navigation rail and uses a
  three-card grid without changing data authority, labels, or commands.
- Native select, search, button, link, details, time, dialog, heading, region,
  status, and alert semantics support keyboard and assistive-technology use.
- All interactive controls retain the approved 44-pixel target minimum and
  shared focus treatment.

## Verification

- Formatting, linting, React Router route generation, and strict TypeScript
  checks pass.
- All 26 environment, accessibility-token, and PWA foundation checks pass.
- All 77 domain, service, route, and component tests pass across 21 test files.
- The production build passes with 156 client modules transformed and a GitHub
  Pages 404 fallback generated.
- Browser QA passes at 390-pixel iPhone, 412-pixel Android, and 1440-pixel
  laptop widths with no horizontal overflow and no console warnings or errors.
- Browser QA confirms the five-item ranked Action Required queue, two-item
  Waiting view, active-session search with no search text in the URL, Android
  filter dialog, and Sent expansion from 20 to 24 authorized fictional cards.
- Playwright/Axe coverage now includes the personal queue, view transition,
  URL-safe search, and automated accessibility scan.

## Deliberately deferred

- Persistent Lead Detail actions, status transition validation, comments,
  activity history, follow-ups, appointments, outcomes, and reassignment.
- Notification Center read-state behavior and SMS delivery reconciliation.
- Authorized Manager Insights exception queues and team metrics.
- Production authentication, authorization, API, database, retention,
  deletion, audit persistence, Dynamics reconciliation, and live alerts.
- Physical-device and company-browser acceptance in a deployed protected
  environment.

## Step 5.3.6 acceptance checklist

- [x] Six personal work views with one default Action Required queue.
- [x] Home-aligned five action items and two waiting items.
- [x] Approved eight-level deterministic action hierarchy.
- [x] Exactly one visible required action per handoff.
- [x] Detail-first actions with no consequential card mutations.
- [x] Safe card fields and partial-data warning.
- [x] Active-session-only identifying-field search.
- [x] Allowlisted non-sensitive URL filters with Apply and Cancel.
- [x] Independent counts, loading, errors, empty states, and recovery.
- [x] Explicit 20-record pagination without duplicates.
- [x] Stale/offline authorized-card preservation.
- [x] Same mobile/laptop logic and access assumptions.
- [x] Manager team oversight remains separate in Manager Insights.
- [x] Original application and GitHub remain unchanged.

## Next decision

Approve Step 5.3.6 before implementation proceeds to Step 5.3.7 Lead Detail.
