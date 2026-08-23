# Activity History Specification

Status: Approved for Step 2.10

Lead-detail location: `/leads/:leadId#activity`

## Objective

Provide one trustworthy, readable collaboration timeline showing what happened to a peer handoff, who acted, when it occurred, when it was recorded, what changed, and what action follows—without allowing users to fabricate system events, erase history, or turn Territory Desk into a second full CRM.

## Core decisions

1. Activity history is append-only.
2. Every event belongs to one handoff.
3. System workflow events and user-reported sales activities are separate event families.
4. Consequential state changes are recorded automatically from the approved workflow command.
5. A general note never changes status, ownership, response completion, or follow-up completion by itself.
6. Corrections add a linked correction event and never delete the original.
7. All first-release user-added collaboration activities are shared with the sender, current owner, and authorized managers.
8. Private personal notes are excluded from Territory Desk; they belong in an approved system such as Dynamics.
9. Notification technical details are permission-controlled and summarized safely for ordinary users.
10. Prototype activities use fictional data only.

## Why there are no private collaboration notes

The product exists to close communication gaps between departments. A private-note feature would create hidden context, unclear expectations, and additional privacy rules. In the first release:

1. User-added activity is appropriate to share with the involved sender and recipient.
2. The interface states `This update is shared with the handoff participants.`
3. Sensitive or private sales notes should not be entered into Territory Desk.
4. Future Dynamics integration may link to permission-controlled CRM detail without copying it into this timeline.

## Event families

### 1. System workflow events

Created only by validated application commands or approved integration:

1. Handoff created.
2. Pending acceptance started.
3. Response target calculated.
4. Response target missed.
5. Information-review target calculated or missed.
6. Handoff viewed by the authenticated recipient.
7. Accepted.
8. Information requested.
9. Information supplied.
10. Declined.
11. Withdrawn.
12. Status changed.
13. Ownership transferred.
14. Manager reassigned.
15. Reassignment acknowledged or disputed.
16. Routing exception opened or resolved.
17. Record corrected or reopened.
18. Dynamics reconciliation created, completed, or conflicted in the future.

Users cannot manually add, edit, or backdate these event types.

### 2. Notification events

Created by the notification service:

1. In-app notification queued.
2. In-app notification available.
3. In-app notification read.
4. SMS simulated.
5. SMS queued, sent, delivered, failed, or unavailable in a future approved provider flow.
6. Reminder created or failed.

Ordinary timeline text remains safe, such as `SMS alert simulation recorded`. It does not show phone number, provider token, raw payload, carrier response, or secret provider identifiers.

Notification delivery does not mark the handoff viewed and does not complete its required action.

### 3. Follow-up events

Created from the approved follow-up workflow:

1. Follow-up created.
2. Follow-up rescheduled.
3. Follow-up completed with result.
4. Follow-up canceled with reason.
5. Next action missing created or resolved.
6. Privacy-safe calendar snapshot generated.

The activity history preserves every prior due timestamp and owner. Calendar export does not prove that a reminder was imported or acted upon.

### 4. User-reported progress activities

May be added by the current owner or another explicitly authorized participant:

1. Customer call.
2. Customer email.
3. Customer meeting or visit.
4. Discovery or qualification.
5. Proposal or quote activity.
6. Internal coordination.
7. Information gathered or shared.
8. General collaboration update.
9. Other approved progress, with explanation.

These describe work performed. They do not automatically complete the primary follow-up unless the user enters them through **Complete Follow-Up** or explicitly links the activity to that completion command.

### 5. Appointment and outcome events

Created from structured appointment or outcome workflows:

1. Appointment set.
2. Appointment rescheduled.
3. Appointment canceled or completed.
4. Won.
5. Lost.
6. Closed — Not Qualified.
7. Final outcome corrected or reopened.

Appointment is an intermediate milestone. Final outcomes require the approved structured source, reason, summary, and timestamp.

## Add Activity form

### Required fields

1. Activity type.
2. Occurred date and time.
3. Timezone.
4. Concise summary, 5–240 characters.
5. Structured result when the selected activity type requires one.

### Optional fields

1. Additional shared detail, up to 2,000 characters.
2. **Create Next Follow-Up**.
3. Link to the currently open follow-up completion flow.

### Excluded fields

1. Private note visibility.
2. Attachments.
3. Raw email or message bodies.
4. Call recordings or transcripts.
5. Customer-sensitive files.
6. Revenue or compensation claims.
7. Manual status, ownership, response, or notification controls.

## Activity-type results

Use structured result choices where they improve the next decision:

### Customer call

1. Reached customer.
2. Left message.
3. No answer.
4. Wrong number.
5. Follow-up requested.
6. Other.

### Customer email

1. Sent.
2. Reply received.
3. Invalid or bounced address.
4. Follow-up requested.
5. Other.

### Meeting or visit

1. Completed.
2. Rescheduled.
3. Customer canceled.
4. Customer did not attend.
5. Other.

### Proposal or quote

1. Preparing.
2. Sent.
3. Revision requested.
4. Customer reviewing.
5. Other.

These results are collaboration context, not official Dynamics stages until mapping is approved.

## Occurred versus recorded time

Store both:

1. `occurredAt` — when the user says the activity happened.
2. `recordedAt` — immutable server time when the event was saved.

Rules:

1. User-reported progress may use a past occurred time.
2. It cannot use a future occurred time; scheduled work belongs in a follow-up or appointment.
3. System workflow and notification events use authoritative system timestamps and cannot be backdated.
4. A late entry shows `Occurred [time] · recorded [later time]` when the distinction matters.
5. Correcting occurred time creates a linked correction event; `recordedAt` never changes.
6. All displays use the viewer's approved timezone while preserving the stored timestamp and source timezone.

## Add Activity workflow

1. Open lead detail.
2. Select **Add Activity**.
3. Choose the progress type.
4. Enter occurred time, result, and concise summary.
5. Optionally add shared detail.
6. Optionally choose **Create Next Follow-Up**.
7. Review `Shared with handoff participants`.
8. Select **Save Activity**.

Before saving, show whether the action will:

1. Add timeline context only.
2. Complete the current follow-up.
3. Create the next follow-up.
4. Trigger a structured status or appointment workflow.

The app must not infer one of these consequences from free text.

## Relationship to follow-up completion

1. **Complete Follow-Up** records both the follow-up transition and its linked progress activity atomically.
2. Adding a call or email activity from **Add Activity** does not silently complete an open call or email follow-up.
3. If a likely open follow-up matches, offer `Also complete the current follow-up?` with an explicit choice.
4. If selected, open the completion review with the activity fields prefilled.
5. Canceling that review saves neither consequence unless the user explicitly chose to save the activity alone.
6. One command correlation identifier links the completion event, progress event, status change, and next-action event.

## Relationship to status

1. A general collaboration update does not change status.
2. A material progress activity may propose moving `accepted` to `in_progress`, but the user must confirm the structured transition.
3. Appointment results use the appointment workflow and required fields.
4. Customer not interested prompts a structured final-outcome workflow; it does not close from activity text.
5. Won, Lost, and Closed — Not Qualified can be created only through the outcome workflow.
6. Status and activity events commit atomically when one command produces both.

## Timeline presentation

### Default view

1. Newest meaningful event first.
2. Group events under date headings.
3. Show event label, actor, department context when relevant, occurred time, and concise summary.
4. Display the current status and owner above the timeline rather than repeating them on every row.
5. Provide **Load Earlier Activity** instead of rendering the entire history at once.

### Filters

1. All.
2. Responses.
3. Progress.
4. Follow-Ups.
5. Ownership and Routing.
6. Notifications.
7. Appointments and Outcomes.

Filters change the view only. They do not remove events or alter counts elsewhere.

### Event expansion

Collapsed rows show the minimum useful summary. Expanding may show:

1. Exact occurred and recorded timestamps.
2. Previous and new approved values.
3. Reason and explanation.
4. Related follow-up or appointment.
5. Source label.
6. Correction relationship.

Never expose internal secrets, inaccessible record details, raw provider payloads, or another user's private data.

## Event grouping rules

Events from one atomic command may appear as one readable timeline group while remaining separate audit records.

Example group:

`Lead accepted by Jordan Lee`

Expanded details:

1. Status changed from Pending Acceptance to Accepted.
2. Ownership transferred to Jordan Lee.
3. Response completed on time.
4. Follow-up created for Tuesday at 2:00 PM.

Rules:

1. Group only events sharing the same command correlation identifier.
2. Never combine unrelated actions merely because timestamps are close.
3. Critical reasons and prior ownership remain accessible.
4. Notification attempts may be summarized under the triggering event but remain filterable.

## Corrections

### User-reported progress correction

The original creator may select **Correct Activity** for their user-reported progress event:

1. Enter corrected occurred time, result, summary, or detail.
2. Provide a correction reason.
3. Save a new event referencing `supersedesEventId`.
4. Display the corrected version as current while labeling the original `Corrected`.
5. Authorized users can expand the correction history.

The creator cannot change actor, handoff, original `recordedAt`, or source.

### Consequential correction

Status, ownership, response, routing, appointment, final-outcome, and system events cannot be edited through Correct Activity. They require the corresponding approved correction, manager, reopen, or reconciliation workflow with reason.

### Prohibited deletion

1. Ordinary users cannot delete events.
2. Managers cannot erase events; they add corrections.
3. Legal or privacy deletion requires a future approved administrative process and retention policy.
4. UI removal does not substitute for actual approved deletion.

## Visibility and permissions

### Sender

Can view:

1. Shared progress.
2. Responses and information exchange.
3. Permitted follow-up summaries.
4. Ownership changes.
5. Appointments and outcomes.
6. Safe notification state.

May add relevant information but cannot modify recipient-owned progress or system events.

### Requested recipient or current owner

Can view the same collaboration timeline and add authorized progress activities. The current owner controls recipient-owned follow-ups, appointments, and outcomes.

### Manager

Can view activity only within approved scope and access additional reason or audit context required for reassignment, corrections, and exceptions. Manager access does not reveal raw notification provider secrets or unrestricted customer records.

### Unauthorized user

Receives no existence confirmation or timeline metadata. A direct link shows the approved access message and safe return path.

## Sender feedback behavior

Automatically create sender-visible feedback for:

1. Accept.
2. Need Information.
3. Decline.
4. Information supplied or acknowledged.
5. Material progress activity.
6. Appointment set, rescheduled, canceled, or completed.
7. Won, Lost, or Closed — Not Qualified.
8. Manager reassignment when relevant.

Routine technical notification attempts do not appear in Recent Feedback unless they failed in a way requiring the sender's action.

## Notification behavior

1. Material collaboration updates create in-app notifications for permitted participants.
2. User-added progress does not send SMS by default.
3. New assignment and reassignment retain approved simulated-SMS behavior.
4. Several events created by one command produce one user-facing notification when possible.
5. Marking the notification read does not mark the timeline event complete.
6. Opening a notification rechecks authorization before revealing the handoff.

## Dynamics boundary and reconciliation

1. Territory Desk user activities are prototype collaboration records, not official Dynamics activities.
2. Future imported Dynamics events include source, external identifier, source-updated time, and synchronization time.
3. The app must not duplicate an imported event on every refresh.
4. Matching uses approved identifiers, not summary text alone.
5. A source conflict creates `Needs reconciliation` rather than choosing silently.
6. Correcting a Territory Desk collaboration event does not silently edit Dynamics.
7. Writing activities to Dynamics remains deferred until the exact app, entity, field, permission, and conflict rules are approved.

## Audit record fields

Every event stores:

1. Event identifier.
2. Handoff identifier.
3. Event family and type.
4. Actor identifier and role, or approved system actor.
5. Occurred timestamp.
6. Recorded server timestamp.
7. Source timezone when user reported.
8. Safe summary.
9. Approved structured metadata.
10. Source: user, Territory Desk system, manager, notification service, or future Dynamics.
11. Command correlation identifier.
12. Idempotency key or safe reference.
13. Rule and data-definition versions when material.
14. `supersedesEventId` for a correction.
15. Visibility scope derived from the handoff and event policy.

Free-text notes never contain credentials or raw integration payloads.

## Concurrency and idempotency

1. Add, correct, complete, reschedule, and outcome commands use idempotency keys.
2. Consequential commands include the handoff and related follow-up version reviewed by the user.
3. A stale command fails with the current state and a re-review prompt.
4. Double activation creates one event group.
5. A lost success response returns the already-created event group on retry.
6. Activity-only additions may coexist when genuinely separate, but identical idempotency keys cannot produce duplicates.
7. Atomic commands either save every required state and event or none of them.

## Connection and failure behavior

1. A connection failure before save shows `Activity not saved` and retains safe active-session input.
2. There is no offline production activity queue in the first release.
3. Timeline refresh failure keeps the last successful authorized events with a stale timestamp.
4. One event-rendering error does not blank the whole timeline; show a safe unavailable row and diagnostic reference.
5. Pagination retry does not duplicate previously loaded events.
6. Notification failure does not remove the underlying activity.
7. Future Dynamics sync failure preserves Territory Desk events and shows source status separately.

## Privacy and security

1. Every activity read and write requires authentication, handoff authorization, and server-side permission checks.
2. Real timeline data is never committed to GitHub or bundled into a public prototype.
3. Customer names, contacts, notes, and activity summaries are excluded from URLs, analytics, client error logs, SMS, and calendar exports.
4. Do not store real timeline data in persistent browser local storage on a personal phone.
5. Escape displayed content and validate length and structure server-side.
6. Raw provider payloads, tokens, credentials, and internal stack traces never appear in user-visible history.
7. Search within activity, if added later, must not leak inaccessible event text.
8. Retention, export, legal hold, and privacy deletion require approved production policies.

## Accessibility requirements

1. Timeline uses semantic headings and an ordered list or equivalent accessible structure.
2. Event type, actor, date, and summary are readable without relying on icons or color.
3. Expanded details announce state and remain keyboard operable.
4. Filters announce selected state and updated result count.
5. New activity does not unexpectedly move keyboard focus; success is announced.
6. Correction history clearly identifies current and superseded versions.
7. Exact timestamps and timezone context are available to screen readers.
8. Add Activity labels, results, errors, and consequences are programmatically associated.
9. Controls meet 44-by-44 CSS-pixel minimum targets.
10. Timeline and forms work at 200% text zoom.

## Performance requirements

1. Load current status, owner, and recent meaningful events before older history.
2. Paginate by stable cursor, not offset alone, to avoid duplicates when new events arrive.
3. Do not download raw provider metadata to ordinary clients.
4. Collapse one correlated command into a readable group without discarding audit records.
5. Cache only authorized session data under the approved privacy rules.
6. Filter and expansion state remain stable while new events load.

## Required fictional prototype scenarios

1. Handoff creation with notification group.
2. Viewed without response.
3. Accept with atomic ownership, response, and follow-up events.
4. Need Information and sender reply.
5. Decline and revised linked handoff.
6. User-added call, email, meeting, proposal, coordination, and general update.
7. Add Activity without completing a matching follow-up.
8. Explicit linked follow-up completion and next action.
9. Reschedule and cancellation histories.
10. Appointment and every final outcome family.
11. Manager reassignment and correction.
12. User text correction with visible original.
13. Blocked attempt to edit a system event.
14. Occurred time different from recorded time.
15. Same-command event grouping and unrelated close-timestamp separation.
16. Sender, owner, manager, and unauthorized visibility.
17. Stale command, double activation, lost response, and pagination retry.
18. Notification failure and future Dynamics reconciliation conflict.

## Step 2.10 acceptance checklist

- [x] Append-only shared collaboration timeline is approved.
- [x] System, notification, follow-up, progress, appointment, and outcome families are approved.
- [x] First-release private notes and attachments remain excluded.
- [x] Add Activity fields, types, structured results, and exclusions are approved.
- [x] Occurred and recorded timestamps remain separate.
- [x] Activity does not complete a follow-up or change status without an explicit structured command.
- [x] Timeline order, filters, expansion, event grouping, and pagination are approved.
- [x] Corrections supersede visibly and never delete original events.
- [x] Sender, owner, manager, and unauthorized visibility rules are approved.
- [x] Material progress closes the feedback loop without SMS notification fatigue.
- [x] Dynamics activities remain gated behind verified mapping and reconciliation.
- [x] Audit, idempotency, concurrency, connection, privacy, accessibility, and performance rules are approved.
- [x] Prototype scenarios cover event, correction, permission, integration, and failure boundaries.
