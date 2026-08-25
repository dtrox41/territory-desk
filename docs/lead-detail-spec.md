# Lead Detail Composition Specification

Status: Approved for Step 2.11b

Route: `/leads/:leadId`

Activity panel anchor: `/leads/:leadId#activity`

## Objective

Create one role-aware workspace where an authorized participant can understand the peer handoff, see who owns it, complete the exact required action, coordinate the next commitment, review feedback, and verify history without searching across disconnected screens.

The page prioritizes action and accountability. It is not a dense CRM record, unrestricted customer profile, or collection of equally prominent buttons.

## Composition principles

1. Show the current user's required action before general details.
2. Keep handoff status, current owner, required-action owner, attention, response, view, notification, and outcome source visually distinct.
3. Display one primary action at a time using the approved ranking when several conditions exist.
4. Consequential commands use explicit review flows; opening or scrolling never changes business state.
5. Keep the most useful customer and routing context visible while minimizing sensitive data.
6. Preserve the complete append-only history through the Activity panel.
7. Use the same language and action meanings on smartphone and laptop.
8. A block failure does not blank unrelated authorized content.

## Mobile page hierarchy

Display in this order:

1. Compact detail header with Back, page title, notification bell, and overflow menu.
2. Action or waiting banner.
3. Status and ownership summary.
4. `Overview` and `Activity` panel selector.
5. Overview content sections.
6. Related-record and data-source context.
7. Persistent app bottom navigation with safe-area spacing.

The page does not add another permanent bottom action bar above the five-item navigation. The required-action banner stays near the top, and a compact `Return to Required Action` link may appear after the user scrolls past it without covering content.

## Laptop page hierarchy

Use the same logical order in a wider layout:

1. Header and action banner span the content area.
2. Main column: customer need, next action, feedback, and activity.
3. Secondary column: status, ownership, routing, participants, source, and related records.
4. Activity may remain visible beside Overview when space allows, but the canonical `#activity` anchor and keyboard reading order remain correct.
5. Manager controls appear in a clearly labeled permission-controlled section, not mixed with representative actions.

## Detail header

Show:

1. Back control.
2. `Lead Detail` as the stable screen title.
3. Fictional or authorized company name as a secondary heading.
4. Handoff reference in copyable, non-sensitive form.
5. Notification bell with unread-notification count.
6. Overflow menu for low-frequency authorized actions.

Overflow may contain:

1. Report Incorrect Information.
2. Correct Lead Details, when authorized.
3. Withdraw, only before acceptance for the sender.
4. Create Revised Handoff when eligible.
5. Create Another Department Handoff.
6. Manager Reassign, Correct, or Reopen when authorized.

Do not place Decline, Withdraw, Reassign, or final outcomes as unlabeled icons.

## Action or waiting banner

### Action Required state

Show:

1. Visible reason label.
2. Why the action is required or ranked.
3. Due or elapsed timing and exact timestamp.
4. One primary action.
5. At most one contextually useful secondary action.

Examples:

1. `Response target missed` — **Respond Now**.
2. `Information received` — **Review Information**.
3. `Sender response needed` — **Provide Information**.
4. `Follow-up overdue` — **Complete Follow-Up**.
5. `Next action missing` — **Add Next Action**.
6. `Reassignment pending` — **Review Assignment**.

### Waiting state

Show:

1. Who owes the next action.
2. Approved due or timing context.
3. Latest meaningful update.
4. No artificial action button merely to fill space.

Examples:

- `Waiting for Casey to respond by Tuesday at 5:00 PM.`
- `Waiting for the sender to provide requested information.`

### Up-to-date state

Show:

`This lead is up to date. Next action: [summary] due [exact date and time].`

### Closed state

Show terminal status, closing actor, timestamp, approved reason or source summary, and any outstanding authorized correction action.

## Status and ownership summary

Display separate labeled rows:

1. Handoff status.
2. Current owner.
3. Required action owner, when one exists.
4. Requested recipient.
5. Original sender.
6. First-response result and exact target.
7. Information-review result and target when applicable.
8. Current primary follow-up.
9. Outcome source and last synchronization when applicable.

Rules:

1. Do not describe a requested recipient as owner before acceptance.
2. Do not describe notification delivery as view or response.
3. Reassignment displays prior and current ownership through Activity.
4. Closed records may retain a current owner for accountability while having no ordinary required-action owner.
5. Relative timing always exposes exact date, time, and timezone.

## Panel selector

Use two panels:

1. **Overview** — default for ordinary list navigation.
2. **Activity** — append-only collaboration timeline.

Rules:

1. The required-action banner remains available above both panels.
2. `#activity` opens Activity directly after authorization and data load.
3. Panel selection may use a non-sensitive URL fragment and supports browser Back.
4. Selecting a panel does not mark any action complete.
5. Returning from an Activity correction restores the relevant event and focus.

## Overview section order

### 1. Customer need

Show:

1. Company or organization name.
2. What the customer needs.
3. Customer timing.
4. Customer-requested contact time when present.
5. Opportunity context.
6. Additional shared information.

Do not display a vague priority score, unverified revenue rank, or AI-generated summary.

### 2. Customer location and contact

Show only authorized fields:

1. Street address when available and permitted.
2. City, state, and ZIP.
3. Contact name.
4. Available phone and email.
5. Explicit missing-contact explanation when applicable.

Direct customer-contact utilities are policy controlled. In the fictional prototype they may be demonstrated. Before real deployment, company device and privacy policy must approve opening phone or email applications from a personal reimbursed smartphone.

If a Call or Email utility is enabled:

1. Opening the external app does not log an activity automatically.
2. Returning may offer **Log Activity**.
3. The app never claims the call connected or email sent without an explicit user result.
4. Customer Text is excluded until customer-consent and device policy are approved.

### 3. Routing and participants

Show:

1. Requested department or service display group.
2. Exact source division.
3. Location number.
4. Territory ZIP.
5. Assignment status.
6. Original sender and department.
7. Requested recipient and department.
8. Current owner when different.
9. Source update date.
10. Last verified date only when separately available.

Actions:

1. **View Territory**.
2. **View Representative** for each authorized participant.
3. **Report Incorrect Information**.
4. **Request Routing Help** when an exception exists.

Changing routing never occurs through ordinary field editing.

### 4. Next action and follow-up

Show:

1. Current primary follow-up or `Next action missing`.
2. Owner.
3. Action type and summary.
4. Due date, exact time, and timezone.
5. Reminder state.
6. Latest completion or reschedule context.

Authorized current-owner actions:

1. **Complete Follow-Up**.
2. **Reschedule** with reason.
3. **Cancel** with reason and replacement handling.
4. **Add Next Action** when missing.
5. **Add Privacy-Safe Calendar Reminder** after save.

Senders may view permitted progress but cannot manage recipient-owned follow-ups.

### 5. Recent feedback

Show at most three latest meaningful sender/recipient collaboration updates:

1. Response.
2. Information exchange.
3. Material progress.
4. Appointment update.
5. Outcome.
6. Relevant reassignment.

Routine notification-delivery attempts are excluded. **View All Activity** opens `#activity`.

### 6. Related handoffs

Show linked records when authorized:

1. Revised handoff created after decline.
2. Another-department handoff copied from the same opportunity.
3. Duplicate candidate confirmed through the approved process.

Rules:

1. Each handoff retains its own department, recipient, owner, target, status, and history.
2. Linking never merges accountability or KPI denominators.
3. Inaccessible linked records reveal no company, participant, or status details.

### 7. Data and source status

Show:

1. Territory data version.
2. Directory data version.
3. Lead or outcome source.
4. Last successful refresh or sync.
5. Stale, mismatch, or reconciliation state.
6. **View Data Status**.

Do not show raw Dynamics payloads, provider responses, tokens, or technical stack traces.

## Role-and-state primary-action matrix

| User context | Lead state | Primary action | Secondary action |
| --- | --- | --- | --- |
| Requested recipient | Pending Acceptance | Respond | Open Activity |
| Requested recipient | Information supplied | Review Information | Open Activity |
| Sender | Needs Information | Provide Information | Withdraw Lead |
| Sender | Pending response | None; waiting message | Add Information |
| Current owner | Accepted, no next action | Add Next Action | Add Activity |
| Current owner | Follow-up due or overdue | Complete Follow-Up | Reschedule |
| Current owner | Future follow-up | Add Activity | Manage Follow-Up |
| Current owner | Appointment Set | Complete current next action | Update Appointment |
| New reassigned owner | Acknowledgment pending | Review Assignment | Open Activity |
| Sender | Declined | Create Revised Handoff | Create Another Department Handoff |
| Authorized participant | Terminal outcome | View Outcome | Create Another Department Handoff |
| Authorized manager | Routing exception | Resolve Routing | Reassign with Reason |
| Authorized manager | Stalled or incorrect ownership | Reassign with Reason | Open Audit Context |

When the canonical Action Required ranking identifies a higher action than this general matrix, the canonical action wins and its reason is displayed.

## Respond workflow

Selecting **Respond** or **Review Information** opens an explicit review surface containing:

1. Sender and department.
2. Customer need and minimum necessary contact context.
3. Routing evidence.
4. Exact response target and result state.
5. Accept.
6. Need Information.
7. Decline.

Rules:

1. Accept requests a next action and due date, with approved Add Later behavior.
2. Need Information requires a specific question.
3. Decline requires an approved reason.
4. The selected decision receives a final confirmation describing ownership and notification consequences.
5. Back to Lead makes no change.
6. Double activation is idempotent.
7. A stale record requires re-review.

## Add or correct lead information

### Add Information

Participants may add shared factual context through the approved Activity workflow. This does not overwrite the original submitted snapshot.

### Correct Lead Details

Authorized participants may propose or apply a versioned correction to approved non-routing fields:

1. Company display information.
2. Customer location label when the routing ZIP remains unchanged.
3. Contact name, phone, email, or availability explanation.
4. Customer need or timing clarification.

Rules:

1. Correction reason is required.
2. Original values remain in authorized correction history.
3. Material corrections notify the other handoff participant in-app.
4. Correction does not reset first-response history or follow-up timing.
5. Changing ZIP, requested service, division, location, recipient, or ownership uses the routing or reassignment workflow.
6. Future Dynamics-authoritative fields use reconciliation rather than silent local overwrite.

## Manager controls

Manager controls appear only within approved scope and in a separate labeled section or overflow group:

1. Reassign with reason.
2. Resolve routing exception.
3. Correct or reopen a consequential state with reason.
4. Review audit context.

Rules:

1. Manager actions never erase history.
2. Reassignment preserves status, response history, due history, and attribution.
3. The manager cannot edit source territory or identity records from Lead Detail without a separately approved data-owner role.
4. Manager access does not reveal organization-wide records or raw provider data.
5. Every manager action has an explicit confirmation and immutable event.

## Activity panel

Use `docs/activity-history-spec.md` as the canonical behavior.

Display:

1. Add Activity when authorized.
2. Timeline filters.
3. Newest meaningful events first.
4. Stable cursor pagination through **Load Earlier Activity**.
5. Correlated command grouping.
6. Correction and source details.

The panel does not duplicate a separate global activity screen.

## Read and view behavior

Opening Lead Detail records the first authenticated view only after:

1. Authentication succeeds.
2. Authorization succeeds.
3. Core lead data loads successfully.
4. The intended handoff matches the authorized route.

Rules:

1. Failed, unauthorized, or not-found loads do not record view.
2. Opening the related notification may mark that notification read.
3. SMS delivery or link preview never records view.
4. Refreshing does not create repeated first-view events.
5. View does not satisfy any response or follow-up requirement.

## Loading strategy

1. Render authenticated app shell and detail header first.
2. Load core status, ownership, action, company, and routing context as one required block.
3. Load follow-up, feedback, related handoffs, source status, and activity as independent blocks.
4. Use stable skeleton dimensions.
5. Do not show placeholder zero counts or fake owner names.
6. Activity pagination never blocks the action banner.

## Empty and unavailable sections

1. No follow-up: show `Next action missing` only when the status requires one; otherwise `No follow-up is currently required`.
2. No recent feedback: `Responses and progress updates will appear here.`
3. No related handoffs: hide the section rather than displaying decorative empty space.
4. No contact method: show the approved explanation and do not fabricate contact utilities.
5. No additional opportunity context: omit the empty field.
6. No activity beyond creation: show the creation event and guidance for the authorized next action.

## Error and partial-failure behavior

### Core-load failure

Show `Lead details could not be loaded` with **Retry** and a safe return to the originating list. Do not record view.

### Partial block failure

Keep the action and other validated sections available. Show a localized unavailable message and Retry for the failed block.

### Record changed

Show the current status, owner, and version with `This lead changed while you were reviewing it.` Require re-review before a consequential command.

### Unauthorized

Reveal no customer, participant, status, or existence details. Show the approved access message and safe return path.

### Not found

Show `This lead is unavailable` without distinguishing deleted, mistyped, expired, or inaccessible records to unauthorized users.

### Data-version mismatch

Keep read-only authorized context, label the mismatch, disable routing or ownership writes, and provide **View Data Status**.

### Dynamics conflict

Show `Needs reconciliation`, the source labels and permitted summaries, and no automatically chosen outcome.

## Success behavior

After a successful command:

1. Update status, ownership, required action, and timing only from the committed server result.
2. Add the correlated timeline group.
3. Announce the result programmatically.
4. Keep focus on a stable confirmation heading or the next valid action.
5. Do not navigate away automatically unless the flow explicitly promises it.
6. If the handoff leaves the originating Leads view, Back restores that view with the card removed and focus near its former position.
7. Notification failure appears separately and never changes the successful business command.

## Stale and offline behavior

Territory Desk remains online-first:

1. Keep the last successfully loaded authorized detail visible with stale or offline label and exact refresh time.
2. Disable Accept, Need Information, Decline, Withdraw, Reassign, correct, follow-up, activity, appointment, and outcome writes while current state cannot be validated.
3. Allow read-only navigation among already loaded fictional prototype sections during the active session.
4. Do not load uncached real detail or contact data offline.
5. Retry preserves selected panel and safe active-session draft input.
6. No offline production command queue is created.

## Unsaved subflow behavior

Respond, Provide Information, Add Activity, Correct Details, follow-up, appointment, outcome, and manager flows follow the approved unsaved-change protection:

1. Stay and Continue.
2. Save Draft only when the authenticated server-side draft behavior is approved.
3. Discard Draft with confirmation.

Real subflow data is never persisted in browser local storage on a personal phone.

## Privacy and security

1. Every section and action uses server-side handoff authorization.
2. Direct links and fragments never bypass access checks.
3. Customer names, contact data, need summaries, notes, and activity content remain out of URLs, page metadata, analytics, SMS, calendar exports, and client error logs.
4. Real detail records are never committed to GitHub or bundled into a public prototype.
5. The client contains no provider, Dynamics, database, or authentication secrets.
6. Contact details are retrieved only after authorization and are not persisted locally.
7. Corrections, manager actions, and consequential commands require server validation and audit events.
8. Sign Out clears active-session detail data and unsaved fictional inputs.

## Analytics events

Use fictional or opaque identifiers only:

1. `lead_detail_opened` with safe entry-source category.
2. `lead_panel_selected` with overview or activity.
3. `lead_primary_action_selected` with approved action type.
4. `lead_section_error` with safe section and error category.
5. `lead_command_completed` with command type and fictional or opaque identifier.

Exclude company, customer, contact, participant, note, summary, routing detail, search text, status reason text, and raw record identifiers.

## Accessibility requirements

1. Detail header, action banner, status summary, panels, and sections use semantic headings.
2. Status, ownership, attention, timing, source, and error state never rely on color alone.
3. Action explanations precede buttons in reading order.
4. Panel controls use correct selected-state semantics and support keyboard navigation.
5. Review dialogs or sheets have names, focus traps, Escape or Cancel behavior, and focus return.
6. Exact timestamps and timezone context are available to screen readers.
7. Success, error, stale, changed-record, and notification-result messages are programmatically announced.
8. Contact links have clear purpose and never use icon-only labels.
9. Controls meet 44-by-44 CSS-pixel minimum targets.
10. The complete page works at 200% text zoom and with mobile screen readers.

## Required fictional prototype scenarios

1. Pending recipient with on-time and missed response target.
2. Pending sender waiting within and beyond target.
3. Need Information from sender and recipient perspectives.
4. Information supplied with review target.
5. Accept with next action and Add Later.
6. Accepted owner with missing, future, due-today, and overdue follow-up.
7. Appointment set and updated.
8. Declined sender with revised-handoff action.
9. Withdrawn and every final outcome.
10. Reassigned-away prior recipient and new-owner acknowledgment.
11. Manager routing exception and reassignment controls.
12. Customer contact available, partially available, and unavailable.
13. Correct Lead Details with immutable prior value.
14. Multiple related department handoffs with separate accountability.
15. Overview and direct Activity-panel links.
16. Core loading, partial loading, core error, block error, stale, offline, changed record, unauthorized, not found, version mismatch, and Dynamics conflict.
17. Successful response with SMS failure kept separate.
18. Back restoration to each originating Leads view, Notification, and Manager Insights.
19. Keyboard, screen-reader, focus, touch-target, and large-text behavior.

## Step 2.11b acceptance checklist

- [x] Mobile and laptop page hierarchy is approved.
- [x] Action, waiting, up-to-date, and closed banners are approved.
- [x] Status and ownership dimensions remain separate in the summary.
- [x] Overview and Activity panel behavior is approved.
- [x] Customer, routing, follow-up, feedback, related-record, and source sections are approved.
- [x] Role-and-state primary-action matrix is approved.
- [x] Respond and manager commands use explicit review flows.
- [x] Direct customer contact utilities remain policy controlled and do not auto-log activity.
- [x] Add Information and versioned non-routing correction behavior is approved.
- [x] Authenticated view recording remains separate from notification delivery and response.
- [x] Loading, empty, partial, error, changed, unauthorized, not-found, mismatch, conflict, success, stale, offline, and unsaved states are approved.
- [x] Back, panel, focus, privacy, analytics, accessibility, and prototype scenarios are approved.
