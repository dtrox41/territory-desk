# Notification Center Specification

Status: Approved for Step 2.11c

Route: `/notifications`

## Objective

Provide each authenticated user with a permission-safe history of meaningful peer-handoff alerts, feedback, reminders, and actionable system notices while keeping notification read state separate from lead view, business status, ownership, response, and Action Required completion.

The Notification Center answers `What changed or needs my attention?` The Leads screen remains the authoritative list of current required actions.

## Notification Center versus Action Required

### Notification Center

1. Event-oriented.
2. Usually newest first.
3. May retain a resolved alert as history.
4. Unread means the user has not read that in-app notification.
5. Opening or marking read changes only personal notification state.

### Action Required

1. Current-work oriented.
2. Canonically ranked by required action.
3. Removes or changes items when the workflow obligation changes.
4. Count means the current user owes an action.
5. Completing the underlying workflow changes the lead.

The notification bell count and Leads badge must never be derived from one another.

## User-facing notification categories

Use four filters:

1. **All** — default.
2. **Lead Alerts**.
3. **Feedback & Outcomes**.
4. **Reminders & System**.

Provide a separate **Unread Only** control. Do not add a free-text notification search in the first release; users search actual records in Leads.

## Lead Alert types

### New handoff assigned

Recipient message:

`New peer lead from [sender display name] · [sender department].`

May include the authorized fictional or in-app company name after authentication. Primary action: **Review Lead**.

### Information requested

Sender message:

`[recipient display name] needs information before responding.`

Primary action: **Provide Information**.

### Information supplied

Recipient message:

`Requested information was supplied by [sender display name].`

Primary action: **Review Information**.

### Reassignment

New owner or requested recipient message:

`A peer lead was reassigned to you by [manager display name].`

Primary action: **Review Assignment**.

Prior participant message:

`Your peer-lead assignment changed.`

Primary action: **Open Lead**.

### Routing help update

Authorized requester message:

`Routing help was updated for your peer lead.`

Primary action: **Review Routing**.

Do not expose a new recipient before the requester is authorized to view that identity.

## Feedback and outcome types

Create sender-visible in-app notifications for:

1. Lead accepted.
2. Lead declined with an authorized reason summary.
3. Material progress shared.
4. Appointment set.
5. Appointment rescheduled, canceled, or completed.
6. Won.
7. Lost.
8. Closed — Not Qualified.
9. Consequential correction or reopen.

Primary action is **Open Lead**, **View Progress**, **View Appointment**, or **View Outcome** as appropriate. No final outcome is executed from a notification card.

## Reminder and system types

### Follow-up reminder

Owner message:

`Follow-up reminder: [privacy-safe action type] is due [relative time].`

Primary action: **Open Follow-Up**.

### Missed target or overdue action

Create only when it adds useful awareness and does not duplicate repeated alerts:

1. First-response target missed.
2. Information-review target missed.
3. Follow-up became overdue.

Primary action opens the lead's canonical required action. Repeated refreshes cannot create repeated missed-target notifications.

### Routing or data exception

Authorized manager or requester message:

`A territory or directory issue requires review.`

Primary action: **Review Exception** or **View Data Status**.

### Notification-channel failure requiring user action

Show only when the user can do something useful, such as correcting an unavailable notification preference. Routine provider retry failures belong in operational logs and the lead's safe notification status—not the user's event inbox.

## Events excluded from the user-facing center

1. Every internal retry attempt.
2. Raw SMS provider response.
3. Token refresh or authentication diagnostics.
4. Routine API health events.
5. Analytics delivery events.
6. Background data refresh without a user-relevant change.
7. Notification generated for the same user merely confirming their own ordinary activity save.

This prevents technical noise and self-notification loops.

## Recipient rules

1. New assignment: requested recipient or reassigned owner.
2. Need Information: sender.
3. Information supplied: requested recipient.
4. Accept or Decline: sender.
5. Material progress, appointment, or outcome: sender and other explicitly involved authorized participants.
6. Follow-up reminder: follow-up owner only.
7. Routing exception: approved manager or requester scope only.
8. Manager action notice: affected authorized participants.

The server resolves recipients at creation time and rechecks authorization when notifications are read or opened.

## Deduplication and correlation

1. One atomic business command produces at most one user-facing notification per recipient and notification purpose.
2. Status, ownership, response, follow-up, and audit events from the same command are summarized into one readable notification.
3. Notification identity includes the source event or command correlation, recipient, and notification type.
4. Retry with the same idempotency key returns the existing notification.
5. A notification-delivery attempt is not another in-app notification.
6. A missed-target event is generated once for that target version.
7. A rescheduled follow-up may generate a later reminder for the new version while preserving prior reminder history.

## Bell unread count

The top-bar bell counts:

1. User-facing in-app notification records.
2. Addressed to the authenticated user.
3. Still authorized and not read.

It excludes:

1. SMS attempts.
2. Email or calendar-delivery events.
3. Resolved Action Required items that generated no unread in-app alert.
4. Technical logs.
5. Notifications the user can no longer access.

Rules:

1. Display `99+` above 99.
2. Zero hides the visual badge.
3. Count failure displays no false zero and exposes `Notification count unavailable` accessibly.
4. Count refresh never marks records read.
5. Sign Out clears the locally displayed count.

## Read-state rules

A notification becomes read when:

1. The user explicitly selects **Mark Read**.
2. The user opens its linked record and authentication, authorization, and core record load succeed.
3. The user confirms **Mark All Read** for all currently authorized unread notifications.

A notification does not become read when:

1. Notification Center opens.
2. It scrolls into view.
3. An SMS is sent or delivered.
4. A browser or link preview requests the URL.
5. The linked record fails to load.
6. Another participant opens the handoff.

Read state is personal. It does not mark the handoff viewed, satisfy a response target, complete a follow-up, acknowledge reassignment, or change the Leads badge.

The first release does not provide a permanent **Mark Unread** bookmark feature. Action tracking belongs in Leads rather than notification read state.

## Mark All Read

1. The control is explicit and never runs when the page opens.
2. Show the authorized unread count affected.
3. Confirmation text states `This clears notification unread indicators. It does not complete any lead actions.`
4. Apply to all currently authorized unread notification records, not only the visible page.
5. Use one idempotent command and server timestamp.
6. Partial failure reports how many changed and keeps the remainder unread.
7. Mark All Read does not create one activity-timeline event per notification; retain safe notification audit state separately.

## Mobile layout

Display in this order:

1. Compact header with Back and title `Notifications`.
2. Unread summary and **Mark All Read** when unread items exist.
3. Category filter.
4. **Unread Only** control.
5. Date-grouped notification cards.
6. **Load Earlier Notifications**.

Do not show the persistent bell as an actionable duplicate inside its own screen. The standard app shell may retain its location but uses the screen title and current count appropriately.

## Laptop layout

1. Use the same category and read definitions.
2. Category filters may appear in a left sub-navigation.
3. Notification rows may show more actor and department context.
4. Optional detail preview cannot mark read until its linked authorized core record loads.
5. Keyboard and browser-history behavior match mobile.

## Notification card

Show:

1. Unread indicator and text label.
2. Category and event type.
3. Privacy-minimized message.
4. Actor and department when relevant and authorized.
5. Created time with exact timestamp available.
6. Linked-action current state: `Action needed`, `Resolved`, `Waiting`, or `Unavailable` when determinable.
7. Primary navigation action.
8. Secondary **Mark Read** for unread items when opening is not desired.

Rules:

1. Card body may open the linked destination.
2. Accept, Decline, Withdraw, Reassign, Complete, and final-outcome commands never occur directly on the notification card.
3. Do not show customer phone, email, street address, full need summary, notes, or raw reasons beyond the approved safe summary.
4. Status and unread state use text, not color alone.
5. An unavailable linked record retains a generic safe notification only while policy allows.

## Ordering and grouping

1. Default newest notification first.
2. Group under Today, Yesterday, and exact earlier dates.
3. Stable tie-breaker is notification identifier.
4. New arrivals do not unexpectedly move cards while the user reads; show **New Notifications Available**.
5. Category and unread filters retain chronological order.
6. Action Needed label does not re-rank Notification Center; Leads owns work prioritization.
7. Correlated source events are summarized during notification creation, not visually grouped as several unread notification records.

## Pagination and retention display

1. Load 20 notifications initially.
2. Use stable cursor pagination.
3. **Load Earlier Notifications** is the accessible baseline.
4. The first release does not provide Delete, Clear, or Archive.
5. Prototype history is fictional and may be fully reset between builds.
6. Production retention and deletion require approved policy before real notifications are stored.
7. If older retained records are outside the current display window, state the available period without implying deletion.

## Empty states

### All

`Notifications about peer leads, feedback, and reminders will appear here.`

Action: **View Leads**.

### Lead Alerts

`No lead alerts are available.`

Action: **View Action Required**.

### Feedback & Outcomes

`Feedback and outcomes will appear as teammates update shared leads.`

Action: **View Sent Leads**.

### Reminders & System

`No reminders or system notices are available.`

Action: **View In Progress**.

### Unread Only

`You're caught up on notifications.`

Action: **Show All Notifications**.

## Loading states

1. Render shell, title, categories, and unread-summary space first.
2. Use stable card skeletons.
3. Do not display zero unread while count is loading.
4. Category changes localize loading to the list.
5. Loading earlier retains current cards.
6. Screen readers receive one concise loading announcement.

## Error and partial-failure states

### Initial-list failure

Show `Notifications could not be loaded` with **Retry** and **View Leads**.

### Count failure

Keep the list when available and label the count unavailable.

### Pagination failure

Keep loaded cards with **Retry Loading Earlier**.

### Mark-read failure

Keep the notification unread, show a localized error, and allow retry with the same idempotency key.

### Linked-record changed or resolved

Open the current authorized Lead Detail state and mark the notification read after core load. Do not replay the old action.

### Linked-record unauthorized or unavailable

Do not reveal record details. Keep or remove the generic notification according to policy, offer **Mark Read**, and provide a safe return.

### Partial card data

Show safe event type and timestamp with `Some notification details are unavailable`. Disable only the destination action that cannot be authorized.

## Stale and offline behavior

Territory Desk remains online-first:

1. Keep last successfully loaded authorized notifications with stale or offline label and exact refresh time.
2. Do not claim a current unread count when it cannot refresh.
3. Allow read-only review of loaded fictional prototype notification text during the active session.
4. Disable Mark Read, Mark All Read, and linked-record navigation requiring uncached authorization when offline.
5. Do not load uncached real notifications or linked detail offline.
6. Retry preserves category, unread filter, loaded range, scroll, and focus.
7. Never persist real notification messages or participant context in browser local storage on a personal phone.

## SMS and channel relationship

1. SMS is a separate delivery channel attempt linked to the same business event.
2. SMS state does not change in-app notification read state.
3. In-app notification state does not prove SMS delivery.
4. Recipient Notification Center does not expose the phone number or raw SMS payload.
5. New assignment and reassignment retain the approved simulated-SMS behavior.
6. Follow-up and progress SMS remain off by default.
7. Sender-facing confirmation may show a safe channel summary on Lead Detail, not one notification per delivery attempt.

## Permission behavior

1. Every notification list, count, card, and destination is filtered server-side for the authenticated user.
2. Managers see only their personal notifications and authorized team or exception notices addressed to them.
3. A manager role does not expose every team member's personal notification inbox.
4. Notification reassignment or role change triggers authorization re-evaluation.
5. Direct notification identifiers cannot reveal another user's record.
6. Unauthorized users receive no existence confirmation.

## Privacy and security

1. In-app messages contain the minimum authorized context.
2. Customer contact, address, notes, and opportunity details remain out of notification URLs, page metadata, analytics, client logs, SMS, and calendar exports.
3. Real notification data never enters GitHub or a public prototype bundle.
4. The client receives no provider secret, token, raw payload, or unrestricted delivery metadata.
5. Opening a notification always rechecks the destination permission.
6. Sign Out clears unread display, active-session notification cards, filters, and fictional caches.
7. Production notification retention, privacy deletion, and legal-hold behavior require approved policy.

## Analytics events

Use fictional or opaque identifiers only:

1. `notification_center_opened`.
2. `notification_filter_selected` with approved category.
3. `notification_opened` with type and safe entry source.
4. `notification_marked_read`.
5. `notifications_marked_all_read` with count only.
6. `notification_error_shown` with safe category.

Exclude message text, actor names, company names, customer data, phone, email, raw record identifiers, provider details, and notification payloads.

## Accessibility requirements

1. Bell announces exact meaning, such as `3 unread notifications`.
2. Category and Unread Only controls expose selected state and result count.
3. Cards use semantic headings or list structure and do not create nested interactive controls.
4. Unread, category, linked-action state, and time are conveyed in text.
5. Relative time exposes exact timestamp and timezone.
6. Mark All Read confirmation is keyboard accessible and returns focus.
7. New-arrival, count, read, error, stale, and loading changes are announced without excessive repetition.
8. Load Earlier is keyboard and screen-reader accessible.
9. Controls meet 44-by-44 CSS-pixel minimum targets.
10. The screen works at 200% text zoom and with mobile screen readers.

## Required fictional prototype scenarios

1. Every Lead Alert type.
2. Accept, decline, material progress, appointment, and every outcome notification.
3. Follow-up reminder and one-time missed-target notification.
4. Routing/data exception and actionable channel failure.
5. Excluded technical retry and self-notification behavior.
6. Correlated command creates one notification per recipient.
7. Duplicate retry creates no duplicate notification.
8. Individual Mark Read, successful linked open, failed linked open, and Mark All Read.
9. Read notification with unresolved lead action and unread notification with already resolved action.
10. All categories and Unread Only empty states.
11. New notifications while reading without list jump.
12. Initial, count, pagination, mark-read, linked-record, partial, stale, and offline failures.
13. Recipient loses access after notification creation.
14. Manager personal and addressed exception notifications without team-inbox leakage.
15. Distinct bell, Leads badge, handoff view, SMS, and response states.
16. Keyboard, screen-reader, touch-target, focus, and large-text behavior.

## Step 2.11c acceptance checklist

- [x] Notification Center remains event history while Leads remains the current-action authority.
- [x] All, Lead Alerts, Feedback & Outcomes, and Reminders & System categories are approved.
- [x] Notification types, recipients, primary navigation actions, and exclusions are approved.
- [x] Deduplication creates one user-facing notification per command purpose and recipient.
- [x] Bell count includes only authorized unread in-app notifications.
- [x] Read, linked-open, and Mark All Read behavior is approved and changes no business state.
- [x] Notification card content, ordering, pagination, and no-delete policy are approved.
- [x] Empty, loading, error, partial, stale, offline, unauthorized, resolved, and success states are approved.
- [x] SMS, notification, lead view, response, action count, and delivery states remain separate.
- [x] Manager and participant permission behavior is approved.
- [x] Privacy, analytics, accessibility, retention boundary, and prototype scenarios are approved.
