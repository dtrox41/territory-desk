# Testing Checklist

## Repository safety

- [ ] Original repository remains unchanged.
- [ ] New repository has no original remote or history.
- [ ] Secrets and environment files are ignored.
- [ ] Only fictional business data is present.

## Territory lookup

- [ ] Responsible representative can be found in under 15 seconds.
- [ ] At least 95% of tested searches return a result or clear exception.
- [ ] ZIP and city inputs normalize safely.
- [ ] Missing and duplicate assignments show actionable exceptions.
- [ ] Multi-representative routing groups never select an owner silently.
- [ ] ZIP city aliases resolve without creating duplicate territory records.
- [ ] Representative contact conflicts require data-owner resolution.

## Lead handoff

- [ ] Complete handoff can be submitted in under 60 seconds.
- [ ] Sender, departments, recipient, owner, and status are always visible.
- [ ] Invalid status transitions are rejected.
- [ ] Decline requires a reason.
- [ ] Weak-connection retry does not duplicate a handoff.
- [ ] Sender sees every recipient response and progress update.

## Notifications

- [ ] New handoff creates an unread in-app notification.
- [ ] Simulated SMS attempt is recorded.
- [ ] SMS preview contains no sensitive customer details.
- [ ] Delivery does not count as authenticated viewing.
- [ ] Opening the handoff records `viewed` once.
- [ ] Failure and retry states are visible and safe.

## Response target

- [ ] One-business-day target measures the first meaningful response.
- [ ] Missed target displays `Needs Attention`.
- [ ] Missed target does not auto-decline, penalize, or reassign.
- [ ] Target remains configurable.

## Mobile and accessibility

- [ ] No mobile screen scrolls horizontally.
- [ ] Touch targets are usable on a smartphone.
- [ ] Text remains readable outdoors and at supported zoom levels.
- [ ] Core workflows work with keyboard navigation.
- [ ] Controls have accessible names and visible focus.
- [ ] Status does not rely on color alone.

## Global navigation

- [ ] Mobile top bar and five-destination bottom navigation remain usable while scrolling.
- [ ] Home, Territory, Send Lead, Leads, and Directory use visible labels.
- [ ] General Visits and Calls do not appear as global destinations.
- [ ] Nested routes preserve the correct active destination.
- [ ] Notification count and action-required lead count have distinct meanings.
- [ ] Back navigation restores list filters and scroll position.
- [ ] Direct links have a safe fallback destination.
- [ ] Changed lead forms cannot be abandoned without an explicit choice.
- [ ] Real lead drafts are not persisted in browser local storage.
- [ ] Desktop navigation preserves mobile wording, order, and permissions.
- [ ] Unauthorized destinations are omitted and direct unauthorized routes fail safely.

## Home dashboard

- [ ] Dashboard identifies the next required cross-department action first.
- [ ] Send Lead and Find Territory appear near the top.
- [ ] Summary counts match their documented definitions.
- [ ] Action Required contains no duplicate handoffs.
- [ ] Ranking reason is visible and explainable.
- [ ] One-business-day breaches rank ahead of lower-priority items.
- [ ] General calls and visits do not appear.
- [ ] Waiting on Others excludes actions currently owed by the sender.
- [ ] Recent Feedback excludes routine delivery-only events.
- [ ] Insights link to supporting records and avoid volume-only rankings.
- [ ] Mobile item limits prevent an endless home screen.
- [ ] Loading skeletons do not cause layout shift.
- [ ] A block-level error does not blank other dashboard blocks.
- [ ] Offline or stale state shows the last successful refresh time.
- [ ] Dashboard analytics contain fictional IDs only and no lead details.

## Action Required ranking

- [ ] One handoff produces at most one current action item per user.
- [ ] Missed first-response target ranks first.
- [ ] Overdue lead-derived follow-up ranks second.
- [ ] Information supplied, unread, viewed-without-response, due-today, missing-next-action, and reassignment items follow the approved order.
- [ ] Same-category ties use due time, required-action time, creation time, and stable ID.
- [ ] Queue order remains stable across refreshes.
- [ ] A Monday daytime handoff is due Tuesday at 5:00 PM local time.
- [ ] A Friday daytime handoff is due Monday at 5:00 PM local time.
- [ ] A Friday after-hours handoff is due Tuesday at 5:00 PM local time.
- [ ] Viewed does not satisfy the first-response target.
- [ ] Need Information satisfies the recipient target and creates a sender action.
- [ ] Missed target does not auto-penalize, decline, or reassign.
- [ ] Customer value, department, sender seniority, and raw volume do not affect rank.
- [ ] Ambiguous ownership creates an exception rather than a guessed assignment.

## Manager visibility

- [ ] Managers can identify stalled handoffs.

## Cross-department insights

- [ ] First-response target completion uses only meaningful responses and the approved business-day target.
- [ ] Closed-loop update completion requires structured completed progress, not a view, note, or reschedule alone.
- [ ] Qualified progression remains hidden in production until Dynamics mapping and attribution are validated.
- [ ] Every rate shows its eligible denominator, exclusions, definition, and last refresh time.
- [ ] Every actionable insight links to records the current user is authorized to access.
- [ ] Representatives see only their approved personal sent and received scope.
- [ ] Managers see only their approved team scope.
- [ ] Groups below the comparison threshold show insufficient volume rather than a rank.
- [ ] Declined handoffs count as responded but do not count as qualified progression.
- [ ] Routing exceptions are not attributed to recipient performance.
- [ ] Stale, missing, and conflicting data produce explicit states.
- [ ] No raw-volume or individual leaderboard appears.

## Territory lookup

- [ ] Five-digit ZIP, ZIP+4, city, city-state, and full-state-name inputs follow the approved rules.
- [ ] One-to-four-digit ZIP input produces suggestions or validation, never a padded lookup.
- [ ] Exact city matches precede prefix and contains suggestions.
- [ ] A city in multiple states requires a state selection.
- [ ] Different representatives across a city's ZIP codes require the customer's exact ZIP.
- [ ] Multiple representatives in one ZIP-and-division group create Needs Review and cannot be auto-selected.
- [ ] Open territory displays no fabricated representative and requests routing help.
- [ ] Send Lead carries exact routing identifiers into an unsubmitted form.
- [ ] Direct call, email, and text actions state that they are not tracked handoffs.
- [ ] Source updated and Last verified labels cannot be substituted for one another.
- [ ] Report Incorrect Information creates an auditable item without editing source data immediately.
- [ ] Stale and offline results retain their timestamp and disable unsafe writes.
- [ ] A slow prior search cannot overwrite a later result.
- [ ] Direct result links recheck authentication, permission, and data version.
- [ ] Search suggestions and results meet keyboard, screen-reader, touch-target, zoom, and contrast requirements.
- [ ] Public prototype assets contain only fictional people and assignments.

## Representative directory

- [ ] Representatives are joined and opened by stable ID, never display name alone.
- [ ] Two people with the same display name remain separate and visibly distinguishable.
- [ ] Conflicting contact records produce Needs Review instead of selecting the first value.
- [ ] Exact, prefix, contains, department, division, location, and state matches follow the approved order.
- [ ] Equal-tier results sort alphabetically and never by performance or raw lead volume.
- [ ] Department, division, location, state, status, and contact-availability filters preserve state through Back.
- [ ] Representative cards expose minimal context and do not crowd every contact action onto mobile.
- [ ] Direct profile links recheck authentication and authorization.
- [ ] Send Lead from Directory requires department, ZIP, and territory validation.
- [ ] A recipient mismatch is explained and never silently replaced.
- [ ] Ambiguous, open, inactive, and missing-data states follow approved routing rules.
- [ ] Call, Text, and Email do not create a handoff or appear in collaboration KPIs.
- [ ] Managers see approved routing scope but no directory leaderboard or unrestricted contacts.
- [ ] Data-version mismatch disables new handoff routing.
- [ ] Reports create auditable issues without immediately mutating source data.
- [ ] Offline and stale states do not leak uncached profiles or persist contacts locally.
- [ ] Keyboard, screen-reader, touch-target, focus-return, zoom, and contrast behavior passes.
- [ ] Public prototype assets contain fictional identities and contacts only.

## Lead creation

- [ ] Territory, Directory, global action, and copy-to-another-department entry paths prefill only approved fields.
- [ ] One handoff has one requested department and one recipient.
- [ ] Changing ZIP or service clears stale recipient confirmation.
- [ ] Recipient identity, assignment, permissions, and data versions are revalidated at submission.
- [ ] Route, Customer, Opportunity, and Review & Send steps preserve entered values when moving backward.
- [ ] Required fields and conditional contact requirements match the approved specification.
- [ ] Missing contact information requires an explanation and never encourages invented data.
- [ ] ASAP timing requires context but cannot change Action Required ranking.
- [ ] Customer-requested contact time does not replace the system response target.
- [ ] Review shows recipient, routing, customer, need, timing, sender, response, and notification context.
- [ ] Enter in an earlier field cannot bypass Review & Send.
- [ ] Duplicate warnings do not expose unauthorized records or auto-merge leads.
- [ ] Double activation, retry, and lost response return one handoff through the idempotency key.
- [ ] Handoff and audit events commit before notification attempts.
- [ ] SMS content contains no customer or opportunity details.
- [ ] Notification failure preserves the saved handoff and does not encourage resubmission.
- [ ] Routing changes require explicit user action and are never silently accepted.
- [ ] Offline or pre-save failure displays Not sent and preserves only safe active-session data.
- [ ] Real drafts never enter persistent browser local storage, URLs, analytics, or public assets.
- [ ] Another-department action creates a separately validated and reviewed handoff.
- [ ] Field labels, errors, step announcements, focus, keyboard types, touch targets, zoom, and screen readers pass.
- [ ] Prototype companies, contacts, needs, and outcomes are fictional.

## Lead status and ownership

- [ ] Handoff status, current owner, required-action owner, attention, response, view, notification, and outcome-source states change independently.
- [ ] Creation leaves the sender as current owner and makes the requested recipient the response-action owner.
- [ ] Accept transfers ownership atomically and records on-time or late response.
- [ ] Need Information requires a specific question, returns action to the sender, and satisfies first response.
- [ ] Supplied information creates a separate recipient review target without resetting the first-response result.
- [ ] Decline requires an approved reason, clears the required action, and never counts as qualified progression.
- [ ] Withdrawal is allowed before acceptance, blocked afterward, and preserves history.
- [ ] Add Later after acceptance creates Next action missing.
- [ ] General notes alone do not change accepted to in progress.
- [ ] Appointment set requires structured appointment details and remains non-terminal.
- [ ] Won, lost, and closed-not-qualified require structured outcome details and source labels.
- [ ] Unlisted transitions are rejected server-side.
- [ ] Revised declined handoff creates a linked new record rather than rewriting the decline.
- [ ] Reassignment before acceptance creates a recipient-specific target without measuring pre-assignment time.
- [ ] Reassignment after acceptance immediately transfers ownership, preserves status, and creates acknowledgment.
- [ ] Reassignment preserves due-date history and never attributes pre-assignment lateness to the new owner.
- [ ] Role permissions are enforced server-side and manager scope is limited.
- [ ] Attention state is derived and can differ by viewing user.
- [ ] New assignments use in-app and simulated SMS; later feedback defaults to in-app.
- [ ] Stale concurrent commands produce a reviewable conflict, never a silent overwrite.
- [ ] Transition retries are idempotent and audit events are append-only.
- [ ] Final outcome correction or reopening adds history instead of replacing it.
- [ ] Future Dynamics conflict displays Needs reconciliation and does not choose silently.

## Follow-ups and reminders

- [ ] An accepted handoff has at most one active primary follow-up.
- [ ] Sender cannot assign a recipient-owned follow-up directly.
- [ ] Action type, owner, summary, due date, timezone, and conditional fields validate correctly.
- [ ] Date-only follow-up is due at 5:00 PM owner-local time.
- [ ] Weekend or holiday dates warn and are never silently moved.
- [ ] Daylight-saving boundaries use the stored timezone rules.
- [ ] Upcoming, due-today, and overdue are derived from an open follow-up rather than manually selected.
- [ ] Overdue and due-today appear at approved queue ranks without duplicating the handoff.
- [ ] Completing requires a structured result and may create the next follow-up or Next action missing.
- [ ] Customer not interested prompts an outcome and does not silently close the handoff.
- [ ] Reschedule preserves every prior due timestamp and requires a reason.
- [ ] Repeated rescheduling does not count as completed progress.
- [ ] Cancel preserves history and requires replacement or creates Next action missing when the handoff stays open.
- [ ] No control can hide an overdue item through an unrecorded snooze.
- [ ] In-app reminder does not change due state or claim closed-app push delivery.
- [ ] Follow-up SMS is off by default.
- [ ] Calendar export contains no customer, contact, address, opportunity, employee-contact, credential, or token data.
- [ ] Calendar import is labeled a snapshot and reschedule offers an updated-export warning.
- [ ] No Graph or calendar credential request exists in the first release.
- [ ] Reassignment preserves prior owner, due history, and pre-assignment lateness attribution.
- [ ] Complete, reschedule, cancel, and reminder commands are concurrent-safe and idempotent.
- [ ] Offline, stale, unauthorized, inactive-owner, and export-failure states fail safely.
- [ ] Labels, errors, shortcut announcements, due state, timezone, touch targets, focus, keyboard, zoom, and screen readers pass.

## Activity history

- [ ] Timeline is append-only and every event belongs to one authorized handoff.
- [ ] System, notification, follow-up, progress, appointment, and outcome families remain distinct.
- [ ] Users cannot manually create or backdate system, notification, ownership, response, or outcome events.
- [ ] First-release user activities are shared with handoff participants; no private-note mode appears.
- [ ] Add Activity supports approved types, occurred time, timezone, result, summary, detail, and next-action option.
- [ ] Future occurred times are rejected and late entries preserve recorded server time.
- [ ] General notes and user activities do not silently change status or complete follow-ups.
- [ ] Explicit follow-up completion atomically records result, progress, status, and next-action effects.
- [ ] Timeline defaults newest meaningful event first and paginates older history by stable cursor.
- [ ] Filters change visibility only and never remove events.
- [ ] Only same-correlation command events group together.
- [ ] User progress corrections require a reason, preserve original, and show the superseding version.
- [ ] Consequential system events require their approved correction or manager workflow.
- [ ] Sender, owner, manager, and unauthorized visibility rules are enforced server-side.
- [ ] Technical notification data never exposes contact details, payloads, provider secrets, or tokens.
- [ ] Material progress creates sender feedback; routine delivery events do not create feedback noise.
- [ ] Future Dynamics records deduplicate by approved identifier and conflicts show Needs reconciliation.
- [ ] Add, correct, complete, reschedule, and outcome commands are idempotent and concurrency safe.
- [ ] Failed save, stale view, pagination retry, notification failure, and sync failure preserve trustworthy state.
- [ ] Timeline, filters, expansion, correction, forms, announcements, focus, keyboard, touch, zoom, and screen readers pass.
- [ ] Prototype activity names, summaries, contacts, and outcomes are fictional.

## Leads list

- [ ] `/leads` remains My Work for representatives and managers; Team Insights is separate.
- [ ] Action Required, Waiting, Received, Sent, In Progress, and Completed inclusion definitions match the specification.
- [ ] A handoff appears at most once within a view and counts use the same inclusion logic.
- [ ] Leads navigation badge equals Action Required count and never unread-notification count.
- [ ] Action Required sort and explanation use the canonical ranking.
- [ ] Waiting, Received, Sent, In Progress, and Completed follow their approved deterministic sorts.
- [ ] Search is permission scoped and raw company or participant text stays out of URLs, analytics, and logs.
- [ ] Filters never broaden access and preserve approved Back state.
- [ ] List cards exclude contact details, street address, full notes, and raw notification errors.
- [ ] Consequential actions occur through explicit detail or review flows, not one-tap list controls.
- [ ] No bulk accept, decline, complete, reassign, or destructive swipe action appears.
- [ ] Back restores view, filters, active-session search, loaded range, scroll, and focus.
- [ ] Stable cursor pagination and New updates available prevent duplicate or jumping cards.
- [ ] Empty and filtered-empty states show the approved context-specific actions.
- [ ] Initial, count, pagination, changed-record, unauthorized, and partial-data errors fail safely.
- [ ] Stale and offline state disables unsafe writes and never loads unauthorized uncached records.
- [ ] Counts, search, URLs, analytics, metadata, cache, and sign-out behavior preserve privacy.
- [ ] View selector, cards, actions, states, times, refresh, pagination, focus, keyboard, touch, zoom, and screen readers pass.
- [ ] Prototype lead cards use fictional companies, participants, and outcomes only.

## Lead detail

- [ ] Required-action or waiting banner appears before general details and uses the canonical highest action.
- [ ] Status, current owner, required-action owner, requested recipient, sender, response, follow-up, and outcome source remain distinct.
- [ ] Overview and Activity selection supports fragment links, browser Back, and focus restoration.
- [ ] Mobile and laptop section order preserves the same reading and action priority.
- [ ] Customer, contact, routing, participants, next action, feedback, related handoffs, and source sections expose only authorized minimum detail.
- [ ] Role-and-state matrix produces one correct primary action and no unauthorized command.
- [ ] Accept, Need Information, Decline, Withdraw, Reassign, correct, reopen, appointment, and outcome use explicit review and confirmation.
- [ ] External contact utilities do not auto-log, complete, respond, or change status.
- [ ] Customer Text remains absent until consent and device policy are approved.
- [ ] Non-routing detail correction requires a reason, preserves prior values, and does not reset timing.
- [ ] ZIP, service, recipient, ownership, and routing changes cannot use ordinary field correction.
- [ ] First view records only after authentication, authorization, and successful core load.
- [ ] Notification read, SMS delivery, refresh, and failed loads do not create false view or response events.
- [ ] Core and independent block loading preserve stable layout and action access.
- [ ] Empty sections use approved messages or remain omitted without fake content.
- [ ] Core, block, changed-record, unauthorized, not-found, data-version, and Dynamics-conflict errors fail safely.
- [ ] Successful commands use committed results, append correlated history, preserve focus, and separate notification failure.
- [ ] Stale and offline detail disables every unsafe write and never loads uncached real contacts.
- [ ] Unsaved subflows preserve active input without persistent browser storage.
- [ ] Direct links, URLs, metadata, analytics, caches, sign-out, and client bundles preserve privacy.
- [ ] Headings, action order, panels, dialogs, timestamps, announcements, contact labels, touch targets, keyboard, zoom, and screen readers pass.
- [ ] All prototype customer, participant, activity, routing, and outcome content is fictional.

## Notification Center

- [ ] Notification Center remains event history and never replaces the Leads Action Required queue.
- [ ] All, Lead Alerts, Feedback & Outcomes, Reminders & System, and Unread Only follow approved inclusion rules.
- [ ] New assignment, information, reassignment, routing, feedback, outcome, reminder, overdue, and actionable-system notifications use approved recipients and messages.
- [ ] Internal retries, raw provider responses, diagnostics, analytics, routine refresh, and ordinary self-confirmations never create user-facing noise.
- [ ] One correlated command creates at most one notification per recipient and purpose.
- [ ] Idempotent retries and missed-target versions create no duplicate alerts.
- [ ] Bell counts only current user's authorized unread in-app notification records.
- [ ] SMS attempts, technical logs, and Action Required items never change the bell count directly.
- [ ] Opening the center, scrolling, SMS, previews, failed loads, and another user's actions never mark a notification read.
- [ ] Explicit Mark Read, successful authorized linked open, and confirmed Mark All Read follow approved rules.
- [ ] Read state never marks a lead viewed, responds, completes, acknowledges, or changes the Leads badge.
- [ ] Cards expose minimum safe context and no consequential one-tap workflow commands.
- [ ] Chronological ordering, date groups, stable cursor pagination, and New Notifications Available prevent list jumps and duplicates.
- [ ] Delete, Clear, Archive, and permanent Mark Unread are absent from the first release.
- [ ] Empty, loading, count, pagination, read, linked-record, partial, stale, offline, unauthorized, and unavailable states fail safely.
- [ ] Managers receive only personal and addressed scope notifications, never another user's inbox.
- [ ] Notification URLs, metadata, analytics, logs, SMS, calendar exports, caches, and client bundles preserve privacy.
- [ ] Bell, filters, cards, unread text, times, confirmation, announcements, pagination, focus, touch, keyboard, zoom, and screen readers pass.
- [ ] Prototype notification messages, actors, companies, and outcomes are fictional.
- [ ] Reassignment is restricted to authorized users.
- [ ] Insights balance volume with quality and outcomes.
- [ ] General calls and visits do not displace collaboration actions.

## Manager Insights screen

- [ ] `/insights` is server-authorized Team Insights and remains separate from a manager's personal My Work.
- [ ] Effective scope is limited to authorized locations, departments, and representatives; filters only narrow it.
- [ ] Representative direct-route access, manager-with-no-scope, and mid-session scope-removal states expose no team data.
- [ ] Overview and Exceptions preserve the same information and permissions on smartphone and laptop.
- [ ] Period, sending department, receiving department, direction, and workflow status filters update every compatible result.
- [ ] The first-response and closed-loop cards reconcile to their approved numerator, denominator, exclusions, period, and definition.
- [ ] Needs Attention uses a unique handoff count and does not sum duplicate exception-category membership.
- [ ] Missed response, overdue update, missing next action, and routing exceptions open the exact authorized records.
- [ ] Diagnostic drivers, guardrails, and department-pair results retain their approved definitions and context.
- [ ] Fewer than 10 eligible handoffs suppresses comparative rates and ranks but preserves safe action counts.
- [ ] No individual comparison, raw-volume leaderboard, unsupported target, or percentage-only judgment renders.
- [ ] Dynamics-dependent outcomes remain hidden or unmistakably fictional and demo-only until source approval.
- [ ] Every metric and count has a permission-safe drill-down that re-runs authorization and explains later changes.
- [ ] No consequential or bulk lead action occurs directly from an insight card, row, or chart.
- [ ] Data freshness, source version, completeness, exclusions, and definition changes are visible where relevant.
- [ ] Initial load, refresh, new-update, no-action, no-data, partial, stale, offline, unavailable, mismatch, and error states do not guess values.
- [ ] Incompatible scope, filter, definition, or source versions never render together.
- [ ] URLs, metadata, analytics, logs, caches, errors, and sign-out preserve customer and employee privacy.
- [ ] Headings, rates, tables, filters, charts, focus, announcements, keyboard, touch targets, contrast, zoom, and large text pass.
- [ ] Every prototype company, representative, activity, department-to-person mapping, and outcome is fictional.

## Acceptance

- [ ] At least 90% of test users complete the core handoff without assistance.
- [ ] Sender and recipient can state the current owner, status, and next action.
- [ ] No disconnected duplicate of an existing Dynamics record is created.
