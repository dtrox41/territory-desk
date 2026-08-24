# Step 5.3.5 — Fictional Lead Creation and Territory Revalidation

Status: Implementation complete locally; awaiting user approval

Date: 2026-08-24

## Outcome

The `/leads/new` route now creates one fictional, structured cross-department
handoff through the approved four-step workflow. It reuses the current
fictional Territory service as routing authority, preserves Directory as people
discovery, and never connects to Dynamics, real employee records, customer
records, carrier SMS, email, a calendar provider, or production storage.

## Four-step workflow

1. **Route** requires one service and an exact five-digit ZIP, resolves the
   current assignment, shows exact division, location, source date, and
   recipient, and blocks open, ambiguous, stale, missing, changed, or
   self-directed routing.
2. **Customer** requires company, routing-validated city/state/ZIP, and an
   explicit phone, email, both, or not-yet-available choice. The form requires
   only the declared contact methods and never asks the sender to invent data.
3. **Opportunity** requires an actionable need summary and customer timing.
   ASAP requires context but does not alter Action Required ranking. Optional
   requested contact time, context, and bounded notes remain separate.
4. **Review & Send** presents real text for recipient, routing, customer,
   contact availability, need, timing, sender, response expectation, and
   channel expectation before the only final Send Lead command becomes
   available.

## Entry paths and routing authority

- Global Send Lead begins without a selected recipient.
- Territory transfers a versioned routing snapshot through protected navigation
  state; the user confirms it and submission checks it again.
- Directory transfers only the opaque representative identifier through
  protected navigation state. Service and ZIP remain required. A mismatch
  shows the current assignment and requires explicit selection or routing help.
- Create Another Department Handoff copies approved customer fields in active
  navigation state, excludes the prior department, and requires a new route,
  recipient, review, identifier, and send command.
- Recipient, customer, contact, note, and opportunity values never enter URL
  parameters.

## Save and notification boundary

The fictional adapter repeats route and field validation, checks sender versus
recipient, reuses one active-session idempotency key, creates one
`pending_acceptance` handoff, calculates the next-business-day response target,
and only then reports the in-app alert as queued and SMS as simulated or failed.
A failed SMS attempt leaves the saved handoff intact and explicitly warns the
sender not to submit again.

## Failure and recovery states

- Inline field messages and a focused validation summary retain entered values.
- Changing service or ZIP clears the prior confirmed route.
- Open and ambiguous assignments route to Data Status help instead of arbitrary
  recipient selection.
- Stale and missing assignments route back to Territory Lookup.
- A route changed at final send returns the user to Route with `Nothing was
  sent` language.
- Offline mode preserves the active fictional form but disables lookup and
  sending; no offline mutation queue exists.
- Duplicate detection shows only an authorized safe record link and requires a
  reason before a separate handoff can be sent.
- Repeat submission with the same key returns the existing fictional handoff.

## Privacy and prototype controls

- Drafts use React component memory only; no localStorage, sessionStorage,
  analytics, or persistent service-worker record cache is added.
- All committed example records, contacts, companies, identifiers, timestamps,
  and notification states are fictional.
- The simulated SMS contains no customer payload and no external message is
  transmitted.
- Direct device utilities remain separate from tracked handoffs.
- The original repository, GitHub, Dynamics, Outlook, SMS providers, and real
  employee/customer sources remain untouched.

## Verification

- Domain tests cover field limits, conditional contacts, ASAP context,
  duplicate normalization, and weekend response-target calculation.
- Service tests cover confirmed, mismatched, ambiguous, open, stale, missing,
  duplicate, idempotent, and SMS-failure scenarios.
- Component tests cover non-skippable routing, explicit Directory mismatch
  resolution, routing exceptions, the complete four-step path, duplicate
  override, offline blocking, success confirmation, and notification
  partial-failure truthfulness.
- Formatting, linting, React Router route generation, and strict TypeScript
  checks pass.
- All 26 environment, accessibility-token, and PWA foundation checks pass.
- All 61 domain, service, route, and component tests pass across 18 test files.
- The Preview production build passes with 152 client modules transformed and
  a GitHub Pages 404 fallback generated for the `/territory-desk/` base path.
- Browser QA passes at 390-pixel iPhone, 412-pixel Android, and 1440-pixel
  laptop widths with no horizontal overflow and no console warnings or errors.
- The complete mobile Route → Customer → Opportunity → Review & Send path
  saves one fictional handoff and renders its exact response target, queued
  in-app alert, and simulated SMS state.
- Android Directory entry arrives at a clean `/leads/new` URL with no recipient,
  customer, service, or ZIP parameter. It still requires service and ZIP.
- Laptop uses the same labels, rules, and commands in a wider form plus safety
  sidebar; it receives no broader authority.
- The Playwright/Axe workflow now covers Territory entry, all four form steps,
  saved-handoff navigation, and the success state. External browser-binary
  execution remains part of the later deployment gate.

## Deliberately deferred

- Persistent Lead Detail workspace and activity timeline — later approved
  screen checkpoint.
- Leads List, recipient Accept/Need Information/Decline, progress, appointments,
  outcomes, follow-ups, and manager reassignment — later checkpoints.
- Production authentication, authorization, API/database, retention, deletion,
  audit persistence, real notification delivery, and Dynamics reconciliation.
- Physical Apple/Android install and company-browser acceptance on a deployed
  protected environment.

## Step 5.3.5 acceptance checklist

- [x] One recipient and one requested department per fictional handoff.
- [x] Global, Territory, Directory, and Create Another entry contracts.
- [x] Exact ZIP/service validation and current-assignment evidence.
- [x] Directory choice cannot override routing authority.
- [x] Open, ambiguous, stale, missing, changed, and self routes fail closed.
- [x] Required and optional customer/contact rules without fabricated data.
- [x] Customer timing remains separate from work ranking and response target.
- [x] Review & Send cannot be skipped.
- [x] Duplicate warning and reasoned override.
- [x] Idempotent one-record retry behavior.
- [x] Handoff save precedes in-app and simulated-SMS attempts.
- [x] Notification partial failure cannot delete or duplicate the handoff.
- [x] Active-session-only draft and privacy-safe URLs.
- [x] Mobile/laptop labels, commands, and authorization assumptions remain the
  same.
- [x] Original application and GitHub remain unchanged.

## Next decision

Approve Step 5.3.5 before implementation proceeds to the next approved product
screen checkpoint.
