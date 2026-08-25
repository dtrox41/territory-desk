# Step 5.3.7 — Fictional Lead Detail

Status: Accepted by the user on 2026-08-24

Date: 2026-08-24

## Outcome

The canonical `/leads/:leadId` route is now a mobile-first collaboration
workspace for one authorized fictional peer handoff. It makes the current
required action, status, ownership, response accountability, customer need,
routing, follow-up, and append-only activity visible without connecting real
customer data, employee data, Dynamics, SMS, email, Outlook, a database, or the
original application.

## Action, status, and ownership

- Exactly one primary action appears first. The fictional scenarios cover a
  missed response target, response required, information ready for review,
  overdue follow-up, missing next action, waiting, up-to-date, and closed
  records.
- Handoff status, current owner, required-action owner, and requested recipient
  remain separate fields. A view event never counts as Accept, Need
  Information, or Decline.
- Authorized first view is recorded once after core access succeeds. Unknown,
  malformed, and unauthorized-shaped identifiers use one generic
  non-disclosing unavailable state.
- Stale, version-mismatched, Dynamics-conflict, and offline records remain
  readable but block writes.

## Meaningful response workflow

The requested recipient can explicitly choose Accept, Need Information, or
Decline. Each path validates only its required evidence and then uses a review
screen before confirmation.

- Accept transfers ownership and either records a structured next action in
  the same command or keeps the accepted record in Action Required until that
  action is added.
- Need Information requires one specific question and transfers the required
  action to the sending representative without marking the handoff accepted.
- Decline requires an allowlisted reason and closes the handoff with a
  permanent history entry.
- Every command checks the version and idempotency key. A notification failure
  remains separate from a successfully committed business change.

## Follow-up and activity workflow

- An overdue follow-up can be completed with a structured result and shared
  summary. Completion immediately requires the current owner to add the next
  action rather than falsely presenting the lead as finished.
- A new action requires a type, future due date/time, and shared summary.
- Add Activity records customer or representative work in append-only history.
  It does not silently change status, ownership, or follow-up.
- Activity has explicit filters for responses, progress, follow-ups, routing,
  notifications, and appointments/outcomes. Earlier events load in bounded
  pages.

## Failure and security behavior

- Core, supplementary, and activity loads fail independently. A follow-up or
  history outage does not erase an authorized core lead.
- Version conflict text requires the user to reload and review current state;
  it never claims an ambiguous command succeeded.
- Customer text is not placed in the URL. Routes use opaque fictional IDs and
  `#overview` or `#activity` only.
- The local adapter is replaceable through a typed service boundary. No real
  credential or production integration is present.

## Responsive and accessibility behavior

- At 390 pixels, action, ownership, tabs, cards, and modal workflows use one
  readable column, 44-pixel controls, and the established bottom navigation.
- At 1440 pixels, the same data and commands use the persistent laptop rail,
  four-part status row, and two-column Overview composition.
- Native dialog, form, radio, select, input, textarea, link, button, definition
  list, tab, tabpanel, timeline, status, and alert semantics are used.
- Browser QA found no horizontal overflow at either tested size and no console
  errors. The response dialog remains fully bounded inside the phone viewport.

## Verification

- Formatting, linting, strict TypeScript, route integration, and production
  build pass.
- All 26 environment, accessibility-token, and PWA checks pass.
- All 96 domain, service, route, and component tests pass across 24 test files.
- Eighteen focused Lead Detail tests cover validation, action derivation,
  generic unavailability, first-view idempotency, response commands,
  concurrency, notification separation, follow-up continuity, activity
  isolation, partial failures, fragments, and offline write blocking.
- The production build transforms 160 client modules and generates the GitHub
  Pages `404.html` fallback. Local preview emitted non-fatal file-watcher limit
  warnings but completed successfully.

## Deliberately deferred

- Sender-side Provide Information and correction/withdraw workflows.
- Manager-only reassignment, intervention reason, and audit controls.
- Appointment and final Won/Lost/Not Qualified command workflows.
- Related-handoff navigation authorization and detailed feedback entry.
- Persistent protected database, authentication/authorization enforcement,
  retention/deletion, Dynamics reconciliation, live email/SMS, and Outlook
  calendar integration.
- Physical-device and company-browser acceptance in a deployed protected
  environment.

## Step 5.3.7 acceptance checklist

- [x] One role-aware primary action precedes supporting detail.
- [x] Status, current owner, requested recipient, and action owner stay separate.
- [x] View tracking remains separate from meaningful response.
- [x] Accept, Need Information, and Decline use validation and review.
- [x] Version, idempotency, and notification-partial-failure handling.
- [x] Structured follow-up completion and next-action continuity.
- [x] Append-only activity history with bounded filters and loading.
- [x] Independent core, supplementary, and activity failure paths.
- [x] Generic non-disclosing unavailable behavior.
- [x] Offline and stale read-only behavior.
- [x] Safe fragment navigation and mobile/laptop responsive composition.
- [x] Original application and GitHub remain unchanged.

## Next decision

Step 5.3.7 is accepted. Step 5.3.8 implements the fictional Notification Center
in `docs/notification-center-implementation.md`.
