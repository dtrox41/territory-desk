# Home Dashboard Specification

Status: Approved for Step 2.2

Route: `/`

## Dashboard objective

The home dashboard answers one question first:

> What cross-department lead action should I take next?

It then shows what the representative is waiting on, what changed recently, and whether collaboration is producing useful outcomes. It is not a general call list, visit planner, CRM summary, or leaderboard.

## Recommended information hierarchy

Mobile order:

1. Compact greeting and current date.
2. Primary quick actions.
3. Collaboration summary.
4. Action Required queue.
5. Waiting on Others.
6. Recent Feedback and Outcomes.
7. Cross-Department Insights.

New and unread handoffs plus lead-derived follow-ups are categories inside the unified Action Required queue. They remain available as filters and full lists, but they are not separate large dashboard cards. This keeps the mobile screen focused and prevents duplicated items.

## Global data rules

Prototype data source:

1. Typed fictional fixtures only.
2. Simulated current user, roles, notifications, and timestamps.
3. Simulated SMS delivery attempts.
4. No real Dynamics calls or employee-contact data in the interface bundle.

Future production source:

1. Territory Desk collaboration service for peer-handoff state and notification events.
2. Approved Dynamics 365 adapter for linked business records.
3. Authenticated current-user and role service.
4. Data-status service for territory version and known routing exceptions.

All dashboard timestamps use the authenticated user’s approved local timezone. Relative labels such as `2 hours ago` must also expose the exact date and time.

## Block 1 — Greeting and date

### Content

1. Time-appropriate greeting and the representative’s first name.
2. Current weekday and date.
3. One concise status sentence, such as `3 lead actions need your attention`.

### Rules

1. Do not use a large decorative greeting that pushes actions below the fold.
2. If the name is unavailable, display `Welcome back` rather than a blank or placeholder.
3. Do not display customer or opportunity details in the greeting area.

### States

- Loading: reserve the final text height to prevent layout shift.
- Error: use the generic greeting and continue rendering the dashboard.
- Empty: `You have no lead actions waiting right now.`

## Block 2 — Primary quick actions

Show two actions on mobile:

1. **Send Lead** — primary filled button; opens `/leads/new`.
2. **Find Territory** — secondary outlined button; opens `/territory`.

Laptop may add:

3. **Find Representative** — opens `/directory`.

Rules:

1. Buttons remain visible near the top without becoming a permanent floating obstruction.
2. Send Lead never bypasses required routing or form validation.
3. Quick actions do not display disabled future integrations.

## Block 3 — Collaboration summary

Show four compact summary items:

| Item | Meaning | Tap behavior |
| --- | --- | --- |
| New | Received and not yet viewed | Opens Leads filtered to `new` |
| Needs Attention | Response target missed or required action overdue | Opens Leads filtered to `needs-attention` |
| Waiting | Sent by the current user and awaiting another representative | Opens Leads filtered to `waiting` |
| Outcomes | Appointments or final outcomes updated during the selected period | Opens Leads filtered to `recent-outcomes` |

Rules:

1. Summary values count handoffs, not notification events.
2. Values never include inaccessible departments or records.
3. A zero is valid and must not look like a loading failure.
4. Use plain labels and numbers; do not use unexplained acronyms.
5. Outcomes do not imply compensation, ranking, or performance evaluation.

## Block 4 — Action Required queue

### Purpose

Combine every item that requires the current user to respond or complete a lead-derived next action.

### Included item types

1. New unread handoff.
2. Viewed handoff without `Accept`, `Need Information`, or `Decline`.
3. Handoff that passed the one-business-day response target.
4. Sender response to a `Need Information` request.
5. Lead-derived follow-up due or overdue.
6. Accepted lead with no next action.
7. Manager-authorized reassignment requiring acknowledgment.

### Excluded item types

1. General calls or visits.
2. Completed or closed leads.
3. Notification-only events with no required action.
4. Tasks owned exclusively by another representative.

### Maximum visible items

- Mobile: 4.
- Laptop: 8.
- Remaining items: accessible through **View All** with the total count.

### Recommended ranking

1. One-business-day response target missed.
2. Overdue lead-derived follow-up.
3. Sender supplied requested information.
4. New unread handoff.
5. Viewed handoff still awaiting a response.
6. Lead-derived follow-up due today.
7. Accepted lead missing a next action.
8. Reassignment acknowledgment.

Within the same category, follow the deterministic tie-breaking rules in `docs/action-ranking-spec.md`. Do not rank by customer value, department, sender seniority, or raw lead volume.

### Card content

1. Required-action label.
2. Fictional company or opportunity name.
3. Sending representative and department when relevant.
4. Current status.
5. Elapsed time and exact timestamp accessibly available.
6. Why the item is ranked.
7. One primary action and one secondary action at most.

Example primary actions:

- Review Lead.
- Respond.
- Provide Information.
- Complete Follow-Up.
- Add Next Action.

Secondary action: Open Details.

### States

- Empty: `You’re caught up. New lead actions will appear here.` Include **Find Territory** or **View Sent Leads**, not a decorative empty illustration alone.
- Loading: show up to three skeleton rows with final dimensions.
- Partial error: keep other dashboard blocks usable; show `Action items could not be refreshed` with Retry.
- Offline/stale: show the last successful refresh time and disable actions that require a server write.
- Success after action: remove or update the item immediately and announce the result without moving keyboard focus unexpectedly.

### Accessibility label example

`Needs response. Fictional ABC Company. Sent by Jordan Lee from Facility Services. Received 5 hours ago. Review lead.`

## Block 5 — Waiting on Others

### Purpose

Show handoffs sent by the current user that are waiting for another representative’s response or update.

### Maximum visible items

- Mobile: 3.
- Laptop: 6.

### Sort order

1. `Needs Attention` first.
2. `Need Information` where the recipient is waiting on the sender does not appear here; it belongs in Action Required.
3. Pending acceptance next, oldest first.
4. Accepted but stale progress next, oldest update first.

### Card content

1. Fictional company or opportunity.
2. Receiving representative and department.
3. Current state: not viewed, viewed, accepted, in progress, or appointment set.
4. Last activity and elapsed time.
5. A clear next expectation without encouraging duplicate texts or emails.

### Actions

- Primary: View Status.
- Secondary: Add Information, only when relevant and authorized.

### States

- Empty: `You are not waiting on any cross-department handoffs.`
- Error: localized Retry; do not hide Action Required.

## Block 6 — Recent Feedback and Outcomes

### Purpose

Close the loop by showing meaningful updates returned to the sender or recipient.

### Included events

1. Recipient accepted or declined a handoff.
2. Information was requested or supplied.
3. Appointment was set.
4. Status changed to won, lost, or closed-not-qualified.
5. Outcome note was added.

### Maximum visible items

- Mobile: 3.
- Laptop: 6.

### Sort order

Newest meaningful event first. Routine notification-delivery events are excluded.

### Actions

- Primary: Open Lead.
- Secondary: Acknowledge, only if acknowledgement is an approved workflow requirement later.

### States

- Empty: `Lead feedback and outcomes will appear here as teams respond.`
- Loading: skeleton timeline entries.
- Error: localized Retry.

## Block 7 — Cross-Department Insights

### Representative view

Show a compact personal collaboration pulse for the current period:

1. Leads accepted from other departments.
2. Appointments produced by peer handoffs.
3. Handoffs with a recorded outcome.
4. Items still missing a closed-loop update.

### Manager view

Show only actionable team signals:

1. Handoffs awaiting a first response.
2. Items marked `Needs Attention`.
3. Departments with unresolved routing gaps.
4. Handoffs lacking a next action.
5. Outcome completion rate, only after the definition and data quality are approved.

### Maximum visible items

- Mobile: 3 insights.
- Laptop: 5 insights plus **View Insights**.

### Guardrails

1. No raw-volume leaderboard.
2. No unsupported comparison of representatives.
3. No revenue or conversion claim without a verified Dynamics mapping.
4. Every displayed insight links to the records behind it.
5. Hide the block when the user lacks permission or when the evidence is insufficient.

### States

- Empty or insufficient evidence: `More closed-loop activity is needed before insights are available.`
- Error: hide individual faulty insight and offer Retry for the block.

## Loading strategy

1. Render the application shell and quick actions immediately.
2. Load Action Required before secondary blocks.
3. Use stable skeletons rather than a full-screen spinner.
4. A failure in one block does not blank the entire dashboard.
5. Refresh does not discard current filters or navigation state.

## Error and stale-data strategy

1. Global authentication failure redirects to the approved sign-in flow.
2. Permission failure omits inaccessible data and records a safe diagnostic event.
3. Territory-data staleness appears as a non-blocking Data Status notice.
4. Offline mode shows last refresh time and prevents unsafe writes.
5. Retry uses idempotent requests and never duplicates a lead action.
6. Error messages never display customer details, credentials, or raw Dynamics payloads.

## Responsive layout

### Mobile

1. Single-column flow in the specified priority order.
2. Action cards use full width.
3. Bottom navigation remains visible with safe-area spacing.
4. **View All** prevents long cards from creating an endless home screen.

### Laptop

1. Greeting, quick actions, and summary span the content width.
2. Action Required occupies the larger primary column.
3. Waiting on Others and insights use the secondary column.
4. Recent Feedback and Outcomes spans the available width below.
5. Reading and keyboard order follow the same logical sequence as mobile.

## Privacy rules

1. Dashboard cards show only the minimum context needed to choose an action.
2. Contact phone numbers and email addresses appear only in authorized detail views.
3. Notification previews and lock-screen SMS content remain privacy-safe.
4. No real record is cached into persistent browser storage on a personal phone.

## Analytics events for prototype evaluation

Use fictional identifiers only:

1. `dashboard_viewed`
2. `quick_action_selected`
3. `action_item_opened`
4. `action_item_completed`
5. `waiting_item_opened`
6. `outcome_item_opened`
7. `dashboard_block_error`

Do not record customer names, contact details, message bodies, or raw lead notes in analytics.

## Step 2.2 acceptance checklist

- [x] Dashboard answers the next-action question first.
- [x] Quick actions are Send Lead and Find Territory.
- [x] Summary counts have precise definitions.
- [x] Action Required combines new handoffs and lead-derived follow-ups without duplication.
- [x] Ranking is explainable and does not use unapproved customer value.
- [x] Waiting on Others does not encourage duplicate off-platform follow-up.
- [x] Feedback and Outcomes closes the sender-recipient loop.
- [x] Insights are actionable and not a raw-volume leaderboard.
- [x] Every block has item limits, sort, empty, loading, error, tap, and secondary-action behavior.
- [x] Mobile and laptop layouts preserve the same priority order.
- [x] Partial failures do not blank the dashboard.
- [x] Privacy and accessibility rules are testable.
