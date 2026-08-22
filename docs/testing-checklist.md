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
- [ ] Reassignment is restricted to authorized users.
- [ ] Insights balance volume with quality and outcomes.
- [ ] General calls and visits do not displace collaboration actions.

## Acceptance

- [ ] At least 90% of test users complete the core handoff without assistance.
- [ ] Sender and recipient can state the current owner, status, and next action.
- [ ] No disconnected duplicate of an existing Dynamics record is created.
