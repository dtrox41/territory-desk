# Lead Follow-Up and Reminder Specification

Status: Approved for Step 2.9

## Objective

Ensure every accepted peer handoff has one clear next action, one accountable owner, an explicit due time, and a visible result—without turning Territory Desk into a second full CRM or creating untracked reminder systems.

Territory Desk is the first-release source of truth for peer-handoff follow-up state. Outlook or another device calendar may receive an optional privacy-safe snapshot, but calendar import does not replace or complete the Territory Desk action.

## Core decisions

1. Every follow-up is related to exactly one Territory Desk handoff.
2. Every open follow-up has exactly one owner.
3. The first release allows one active primary follow-up per handoff.
4. A handoff may have unlimited completed, canceled, and rescheduled history.
5. The sender cannot assign a follow-up directly to the recipient.
6. The current handoff owner manages the next action after acceptance.
7. Managers may reassign within approved scope with a reason.
8. Due-today and overdue are derived timing states, not editable statuses.
9. Snoozing without changing the recorded due time is not allowed.
10. No direct Microsoft Graph or Azure/Entra calendar integration is used in the first release.

## Why one active primary follow-up

Territory Desk coordinates the next cross-department commitment; it does not replace the complete Dynamics activity plan. Allowing many concurrent tasks would create duplicate Action Required cards, unclear priority, and competing owners.

The active primary follow-up answers:

> What is the next promised action on this peer handoff, who owns it, and when is it due?

Additional detailed activity planning remains in Dynamics after integration is approved. Completing the primary follow-up may create its next primary follow-up.

## Creation points

A follow-up may be created:

1. During **Accept Lead**.
2. From an accepted or in-progress lead detail.
3. When completing the current follow-up and selecting a next action.
4. After recording an appointment, for the post-appointment action.
5. By an authorized manager during reassignment or exception resolution.

The system may create a `Next action missing` requirement, but it may not invent a follow-up type, date, time, owner, or customer promise.

## Follow-up fields

### Required

1. Related handoff identifier.
2. Owner identifier.
3. Action type.
4. Due date.
5. Timezone.
6. Short action summary.

### Conditionally required

1. Due time, when the customer or owner committed to a specific time.
2. Appointment details for appointment action type.
3. Reschedule reason when changing a due date or time.
4. Cancellation reason when canceling.
5. Completion result when completing.
6. Other-action explanation when action type is `Other`.

### Optional

1. Reminder lead time.
2. Internal preparation note.
3. Privacy-safe calendar export.

## Action types

Use a small shared vocabulary:

1. Call customer.
2. Email customer.
3. Customer appointment.
4. Prepare or send proposal/quote.
5. Research or qualify.
6. Internal coordination.
7. Request or provide information.
8. Review outcome.
9. Other, with explanation.

Action type describes the commitment and does not automatically prove that the corresponding activity occurred.

## Due-date and time rules

1. Store a full timezone identifier, not only a numeric UTC offset.
2. Display date and time in the current owner's approved local timezone with the timezone available on demand.
3. A date-only follow-up is due at 5:00 PM in the owner's local timezone.
4. A specific due time overrides the 5:00 PM default.
5. A new follow-up cannot intentionally begin overdue; past dates and times are rejected.
6. Follow-ups may be scheduled on weekends or holidays because customer commitments may occur then.
7. Warn before saving a weekend or recognized company-holiday date; do not silently move it.
8. Daylight-saving changes use the stored timezone rules applicable to the due date.
9. Due time history remains immutable after rescheduling.

The one-business-day first-response rule and follow-up due dates are separate. Follow-up dates do not automatically inherit the response calendar.

## Timing states

Persist only lifecycle status; derive timing from the due timestamp:

### Lifecycle status

1. `open`.
2. `completed`.
3. `canceled`.

### Derived timing

1. `upcoming` — due after today.
2. `due_today` — due during the current local date and not past due time.
3. `overdue` — current time is after the stored due time.

Rescheduled is an activity event and version change, not a status that hides the new open follow-up.

## Dashboard and Leads behavior

1. Overdue follow-ups appear in Action Required at approved rank 2.
2. Due-today follow-ups appear at approved rank 6.
3. The same handoff and user still receive at most one current Action Required card.
4. Accepted leads with no active follow-up produce `Next action missing` at approved rank 7.
5. Future follow-ups remain visible on lead detail and under a `Upcoming` Leads filter without crowding Home.
6. Senders see progress and outcomes shared with them but do not receive duplicate personal chase tasks for recipient-owned work.
7. Waiting on Others shows who owns the next action and its permitted timing context.

## Create follow-up workflow

### Step 1 — Choose action

Select an approved action type and enter a concise summary, 5–240 characters.

### Step 2 — Choose timing

Select due date, optional exact time, and timezone. Offer useful shortcuts:

1. Tomorrow.
2. Next business day.
3. One week.
4. Choose date.

Shortcuts calculate and display the exact resulting date before saving. They do not submit immediately.

### Step 3 — Reminder and review

Select an optional in-app reminder lead time, review owner and related lead, and save.

Actions:

1. Primary: **Save Follow-Up**.
2. Secondary: **Back to Edit**.
3. Cancel: returns without changing the existing next action.

## Reminder behavior

### In-app reminder

Supported lead-time choices:

1. At due time.
2. 15 minutes before.
3. One hour before.
4. One day before.
5. No extra reminder.

For a date-only 5:00 PM follow-up, the recommended default is one day before. The reminder event appears in Notifications and links to the lead. The underlying Action Required timing remains based on the due timestamp, not when the reminder is opened.

The first-release web prototype does not promise operating-system push delivery while the app is closed. It records server-side or fictional reminder events and shows them on the next authenticated refresh. Background push requires a separately approved deployment, browser-notification policy, and service implementation.

### SMS

Follow-up reminders do not send SMS by default. New assignment and reassignment retain the approved in-app plus SMS behavior. Adding SMS for every follow-up would create alert fatigue and carrier cost; it may become an approved per-user preference later.

## Optional Outlook or device-calendar export

### First-release recommendation

After a follow-up is saved, offer:

**Add Privacy-Safe Calendar Reminder (.ics)**

This generates a standard iCalendar file that the user may open or import into an available calendar application. It requires no Microsoft Graph call and no Azure or Entra application setup.

### Exported content

Include only:

1. Title: `Territory Desk follow-up`.
2. Start and end time.
3. Reminder alarm when selected and supported.
4. Opaque follow-up UID.
5. Description: requested department and `Open Territory Desk to review details`.
6. Authenticated app link using an opaque record identifier.

Exclude:

1. Customer or company name.
2. Customer contact information.
3. Street address.
4. Opportunity summary or notes.
5. Employee phone or email.
6. Credentials or access tokens.

The user confirms they are adding the reminder to an approved company calendar. The export is optional and off by default on a personal phone.

### Limitation

An imported `.ics` file is a snapshot. Territory Desk cannot confirm that it was imported, completed, deleted, or changed. Rescheduling in Territory Desk does not automatically update the imported event.

After a reschedule, show:

`Your calendar copy may be outdated. Download an updated reminder if needed.`

Use the same iCalendar UID and an increased sequence value for updated exports, but do not claim that every calendar client will update rather than duplicate the event.

### Deferred direct Outlook sync

Automatic event creation or updates through Microsoft Graph is excluded from the first release. It would require authenticated calendar-write permission, company approval, token handling, revocation behavior, and synchronization conflict rules. It is not necessary for the fictional prototype.

An online iCalendar subscription is also deferred because it would require a securely authenticated calendar feed and may refresh slowly. A secret public calendar URL is not an acceptable substitute for authorization.

## Complete follow-up

Completion requires one result:

1. Customer reached.
2. Message left.
3. Email sent.
4. Appointment scheduled.
5. Proposal or quote advanced.
6. Information gathered or supplied.
7. Internal coordination completed.
8. No response.
9. Customer not interested.
10. Other, with explanation.

Rules:

1. Record completion timestamp and authenticated actor.
2. The completion result is a structured activity, not merely a checkmark.
3. Completing the first material action may move `accepted` to `in_progress` under the approved status rules.
4. Appointment scheduled requires appointment details and may move the handoff to `appointment_set`.
5. `Customer not interested` prompts the owner to record the appropriate final outcome; it does not silently close the handoff.
6. If the handoff remains open, ask for the next primary follow-up.
7. Choosing **Add Later** creates `Next action missing` rather than inventing a date.
8. Completion clears the old Action Required item and creates the correct next one, if any.

## Reschedule

Rescheduling requires:

1. New due date.
2. New due time or confirmed date-only behavior.
3. Reason: customer request, scheduling conflict, waiting on information, ownership change, weather/travel, or other.
4. Optional explanation for approved reasons; required for Other.

Rules:

1. Preserve original and every intermediate due timestamp.
2. Record authenticated actor and server timestamp.
3. Do not mark the old commitment completed.
4. Recalculate due-today and overdue from the new timestamp.
5. Repeated rescheduling remains visible in the activity history and collaboration diagnostics.
6. Rescheduling does not improve closed-loop completion by itself.
7. If already overdue, the overdue history remains measurable even after rescheduling.

## Why there is no Snooze

A hidden snooze changes what the user sees without changing the commitment that teammates rely on. Therefore:

1. **Remind Me Later** may adjust only an extra notification when the due time remains visible.
2. Hiding an Action Required card requires completing, canceling, or formally rescheduling the follow-up.
3. No user can dismiss an overdue follow-up merely to clear the dashboard.

## Cancel follow-up

Cancellation requires a reason:

1. Handoff closed.
2. Replaced by another approved action.
3. Created by mistake.
4. Ownership or routing changed.
5. Other, with explanation.

If the handoff remains open and the canceled follow-up was the primary next action, the replacement follow-up must be created in the same flow or the app creates `Next action missing`.

Cancellation preserves the record and cannot be used to erase overdue history.

## Ownership and reassignment

1. The active primary follow-up owner normally matches `currentOwnerId` after acceptance.
2. A sender cannot place a task on the recipient's calendar or queue.
3. A manager-authorized post-acceptance reassignment transfers the open primary follow-up to the new handoff owner.
4. Preserve the original owner, due history, and time overdue before reassignment.
5. Pre-reassignment lateness is not attributed to the new owner.
6. The manager reviews the due date during reassignment and may reschedule only with a recorded reason.
7. Reassignment creates the approved new-owner acknowledgment action and notifications.
8. An inactive owner triggers a manager-visible exception; the system does not choose a replacement.

## Connection and failure behavior

1. Save, complete, reschedule, and cancel commands use idempotency keys.
2. Commands include the follow-up and handoff record versions the user reviewed.
3. A stale command is rejected with the current state and a re-review prompt.
4. A connection failure before save displays `Not saved` and retains safe active-session input.
5. A lost success response is retried with the same idempotency key and returns the existing result.
6. Reminder-delivery failure does not change the follow-up due state.
7. Calendar-export failure does not change or duplicate the saved follow-up.
8. There is no offline production action queue in the first release.
9. Last successful refresh and timezone remain visible on stale data.

## Privacy and security

1. Follow-up details require authentication and handoff authorization.
2. Customer information never appears in calendar exports, SMS reminders, URLs, analytics, or client error logs.
3. Real follow-up drafts are not stored in persistent browser local storage on a personal phone.
4. Calendar export uses opaque identifiers and still requires sign-in when its app link is opened.
5. Copying an export or app link does not grant access to the handoff.
6. Notification and calendar status do not expose a user's personal calendar contents.
7. Do not request calendar account credentials.
8. Do not claim calendar synchronization without successful approved integration.

## Accessibility requirements

1. Action type, dates, times, timezone, and reminders use persistent labels.
2. Date shortcuts announce the exact calculated date.
3. Error summaries link to invalid fields and preserve entered values.
4. Due state uses text and icon, not color alone.
5. Exact due time and timezone are available to screen readers.
6. Completion and reschedule confirmations use programmatic announcements.
7. Controls meet 44-by-44 CSS-pixel minimum targets.
8. The workflow supports keyboard use, mobile screen readers, and 200% text zoom.
9. Calendar-export limitations are visible before download.
10. Focus returns to the originating lead action after canceling a modal or sheet.

## Required fictional prototype scenarios

1. Follow-up created during acceptance.
2. Add Later creates Next action missing.
3. Date-only and exact-time follow-ups.
4. Weekend warning and daylight-saving boundary.
5. Upcoming, due-today, and overdue transitions.
6. Each action type and completion result family.
7. Completion with next action and Add Later.
8. Appointment created from follow-up completion.
9. Reschedule before and after overdue.
10. Repeated rescheduling remains visible.
11. Cancellation with replacement and without replacement.
12. Reassignment with preserved attribution and reviewed due time.
13. Stale simultaneous complete and reschedule commands.
14. Double activation and lost-response retry.
15. In-app reminder, reminder failure, and app-closed limitation.
16. Privacy-safe `.ics` export and updated export warning.
17. Offline, stale, unauthorized, and inactive-owner states.

## Official implementation references

1. Microsoft Support: [Import or subscribe to a calendar in Outlook.com or Outlook on the web](https://support.microsoft.com/en-US/Outlook/import-or-subscribe-to-a-calendar-in-outlook-com-or-outlook-on-the-web)
2. Microsoft Learn: [Create event with Microsoft Graph](https://learn.microsoft.com/en-us/graph/api/calendar-post-events?view=graph-rest-1.0)

## Step 2.9 acceptance checklist

- [x] One active primary follow-up per handoff is approved for the initial release.
- [x] Follow-up fields, action types, timing, and timezone rules are approved.
- [x] Open, completed, and canceled lifecycle statuses remain separate from derived due state.
- [x] Dashboard ranking and Next action missing behavior remain consistent.
- [x] In-app reminder choices and web-push limitation are approved.
- [x] Follow-up SMS is excluded by default to avoid cost and notification fatigue.
- [x] Optional privacy-safe `.ics` export is approved as a snapshot, not synchronization.
- [x] Microsoft Graph and online calendar subscription remain deferred.
- [x] Complete, reschedule, cancel, and no-snooze rules are approved.
- [x] Sender, owner, and manager permissions are approved.
- [x] Reassignment preserves due history and fair attribution.
- [x] Connection, idempotency, concurrency, privacy, and accessibility rules are approved.
- [x] Prototype scenarios cover timing, state, integration, and failure boundaries.
