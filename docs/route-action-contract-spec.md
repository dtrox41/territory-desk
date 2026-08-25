# Route and Cross-Screen Action Contract

Status: Approved for Step 2.12

## Purpose

Provide one canonical contract for every first-release route, fragment, filtered view, in-place workflow, cross-screen action, direct link, Back behavior, focus restoration, privacy boundary, and safe fallback.

This document consolidates already approved screens. It does not add a new feature family or change the business workflow.

## Route classes

Every destination belongs to exactly one class:

1. **Primary route** — global navigation destination.
2. **Detail route** — one authorized record or person.
3. **Secondary route** — profile-menu, notification, manager, data, or help destination.
4. **System route** — authentication, outage, access, version, or error state.
5. **Filtered view** — an approved route plus enumerated non-sensitive filters.
6. **Fragment view** — a stable panel within the current route.
7. **In-place workflow** — dialog, sheet, disclosure, or form state that does not need a shareable route.

Implementation must not turn every dialog or filter into another page, and it must not hide a real detail page inside unaddressable browser state.

## Canonical route registry

### Authenticated application routes

| Route | Class | Screen | Active navigation | Direct-link fallback |
| --- | --- | --- | --- | --- |
| `/` | Primary | Home dashboard | Home | Sign In when unauthenticated |
| `/territory` | Primary | Territory Lookup | Territory | Territory without unsafe parameters |
| `/leads/new` | Primary | Send Lead | Send Lead | Blank authorized form or Territory |
| `/leads` | Primary | My Work Leads List | Leads | Default Action Required view |
| `/leads/:leadId` | Detail | Lead Detail | Leads | Leads when no prior safe history exists |
| `/directory` | Primary | Representative Directory | Directory | Directory without unsafe search text |
| `/directory/:representativeId` | Detail | Representative Detail | Directory | Directory when no prior safe history exists |
| `/notifications` | Secondary | Notification Center | Notification bell context | Home |
| `/insights` | Secondary | Manager Insights | Manager Insights | Home or My Work |
| `/data-status` | Secondary | Data Status | Data Status | Home |
| `/profile` | Secondary | My Profile | Profile | Home |
| `/help` | Secondary | Help and Feedback | Help | Home |
| `/help/:topicSlug` | Detail | Approved Help Topic | Help | Help home |
| `/help/requests/:requestId` | Detail | Reporter-visible Help Request | Help | Help My Requests |

### Authentication and system routes

| Route | Class | Purpose | Safe next action |
| --- | --- | --- | --- |
| `/sign-in` | System | Begin company authentication or fictional demo | Continue sign-in or get help |
| `/auth/return` | System | Complete approved authentication response | Approved safe return or Home |
| `/sign-in/help` | System | Privacy-minimized sign-in recovery | Sign In or approved support path |
| `/session-expired` | System | Reauthenticate after protected session ends | Sign In Again |
| `/access-required` | System | Valid identity lacks Territory Desk profile | Get access help or Sign Out |
| `/access-denied` | System | Current identity lacks destination permission | Home or My Work |
| `/account-unavailable` | System | Mapped account cannot currently use the app | Get sign-in help or Sign Out |
| `/signed-out` | System | Confirm current session ended | Sign In Again |
| `/offline` | System | Full-page connection state when in-place banner is insufficient | Try Again |
| `/maintenance` | System | Server-controlled service interruption | Try Again or Sign Out |
| `/update-required` | System | Client and server cannot safely interoperate | Refresh Now |
| `/not-found` | System | Unknown or intentionally undisclosed destination | Home or My Work |
| `/error` | System | Global non-sensitive failure recovery | Retry, Home, or My Work |

The router may render Offline and Error in place when safe. Their canonical routes exist for startup and full-screen failure states.

## Route precedence and reserved paths

1. Register exact static paths before dynamic identifiers.
2. `/leads/new` must resolve before `/leads/:leadId`; `new` is never accepted as a lead identifier.
3. `/help/requests/:requestId` must resolve before `/help/:topicSlug`; `requests` is a reserved topic slug.
4. Authentication and system path names are reserved and cannot become record identifiers or topic slugs.
5. Dynamic path identifiers use strict approved formats and bounded length.
6. An invalid identifier uses non-disclosing Not Found behavior and is never passed to a downstream query unchanged.

## Canonical fragments

Fragments identify a safe panel, not a business record:

| Route and fragment | Meaning |
| --- | --- |
| `/leads/:leadId#overview` | Lead Overview panel |
| `/leads/:leadId#activity` | Lead Activity panel |
| `/directory/:representativeId#territory` | Searchable territory-coverage panel |
| `/insights#overview` | Manager Insights Overview |
| `/insights#exceptions` | Manager Insights Exceptions |
| `/data-status#sources` | Data source cards |
| `/data-status#known-issues` | Known Issues section |
| `/data-status#my-reports` | Current user's submitted data reports |
| `/help#my-requests` | Current user's support and suggestion list |

Rules:

1. Unknown fragments fall back to the route's default panel.
2. A fragment never grants access or bypasses record authorization.
3. Opening a panel does not mark a notification read, respond, update ownership, or complete work.
4. Browser Back restores the prior panel and focus when that state exists in history.

## Approved URL parameters

Only enumerated, non-sensitive parameters may appear in URLs.

### Territory

Allowed:

1. `zip` — normalized five-digit ZIP.
2. `city` — normalized approved city search value only when privacy review retains it as non-sensitive.
3. `state` — approved state code.
4. `department` — approved department or service code.
5. `division` — approved exact source-division code.
6. `status` — assigned, open, or needs-review enum.

Do not place street address, customer name, contact information, representative contact, or free text in the URL.

Approved example: `/territory?zip=63101&department=facility-services`.

### Leads

Allowed:

1. `view` — `action-required`, `waiting`, `received`, `sent`, `in-progress`, or `completed`.
2. `status` — approved workflow-status enum.
3. `department` — approved department code.
4. `direction` — sent or received enum.
5. `attention` — approved action or waiting category.

Not allowed:

1. Customer or company name.
2. Employee or participant name.
3. Search text.
4. Notes, contact data, or opportunity details.
5. Raw internal record identifiers other than the opaque path identifier for an authorized detail route.

### Directory

Allowed:

1. Department or service code.
2. Exact division code.
3. Location code.
4. State or approved region code.
5. Active or needs-review status.
6. Contact-availability enum.

Representative-name, email, phone, and arbitrary search text remain active-session state only.

### Notifications

Allowed:

1. `category` — `all`, `lead-alerts`, `feedback-outcomes`, or `reminders-system`.
2. `unread` — `1` when Unread Only is selected.

Notification messages, actor names, handoff names, and record identifiers do not appear in filter URLs.

### Manager Insights

Allowed:

1. `period` — `7d`, `30d`, or `90d`.
2. Sending-department code.
3. Receiving-department code.
4. `direction` — sent, received, or both.
5. Approved workflow-status code.
6. Approved exception category.

Manager scope is never accepted from the URL. The server derives it from current authorization.

### Data Status

Allowed:

1. `source` — territory, directory, workflow, in-app, SMS, or Dynamics category.
2. `issue` — approved issue-category code.
3. `capability` — approved action-capability code.

Source payloads, version internals, contact conflicts, reporter narratives, and employee identifiers remain out of the URL.

### Help

Topic slug and opaque reporter-authorized request path identifiers are allowed. Search text, request narrative, diagnostics, employee information, and internal ticket identifiers are not.

## Universal URL and history rules

1. No password, token, session identifier, authorization code, customer data, employee contact, free text, notes, or provider payload appears in a URL.
2. Query parameters are allowlisted; unknown parameters are ignored or rejected safely.
3. A URL filter narrows the current user's authorized result and cannot broaden scope.
4. Shared links re-run authentication, authorization, record access, source version, and current-state checks.
5. Page titles, previews, metadata, referrers, analytics, and logs use route templates and safe categories, not protected values.
6. Browser history never stores unsaved form contents.
7. An unsafe return destination is discarded and replaced with Home.

## Cross-screen action contract

### Home quick actions

| Origin action | Destination | Context transfer |
| --- | --- | --- |
| Send Lead | `/leads/new` | None unless opened from an approved source record |
| Find Territory | `/territory` | None |
| Find Representative | `/directory` | None |

### Home Action Required

| Action | Destination | Rule |
| --- | --- | --- |
| View All | `/leads?view=action-required` | Uses canonical action ranking and current-user scope |
| Review Lead / Respond / Provide Information / Complete Follow-Up / Add Next Action | `/leads/:leadId` | Opens the required-action banner and approved primary action; no command executes from Home |
| Open Details | `/leads/:leadId#overview` | Read-only navigation until the user chooses an explicit command |
| View Sent Leads from empty state | `/leads?view=sent` | Current user's sent handoffs only |

### Home Waiting on Others

| Action | Destination | Rule |
| --- | --- | --- |
| View All | `/leads?view=waiting` | Current user's waiting scope only |
| View Status | `/leads/:leadId#overview` | Opens status and waiting explanation |
| Add Information | `/leads/:leadId#overview` | Opens the authorized Add Information review flow; it does not submit automatically |

### Home Feedback and Outcomes

| Action | Destination | Rule |
| --- | --- | --- |
| View All | `/notifications?category=feedback-outcomes` | Event history, not a work queue |
| Open Lead | `/leads/:leadId#activity` | Opens the related authorized event in context when possible |
| Acknowledge | Omitted in first release | No acknowledgement business command has been approved |

### Home Insights

1. A representative's Response Target, Open Loops, or Recent Progress card opens the exact personal authorized Leads filtered view supporting that card.
2. A manager's compact Team Insights card opens `/insights#overview` or `/insights#exceptions` with approved non-sensitive filters.
3. **View Insights** appears only for an authorized manager and opens `/insights#overview`.
4. Representatives receive no broken or unauthorized manager-insights link.

### Territory and Directory

| Origin action | Destination | Context transfer |
| --- | --- | --- |
| Territory Send Lead | `/leads/new` | Verified routing snapshot passed through protected in-memory navigation state, then revalidated |
| Directory Send Lead | `/leads/new` | Opaque representative identifier passed through protected in-memory state; ZIP and service still required |
| View Representative | `/directory/:representativeId` | Opaque identifier only |
| View Territory Coverage | `/directory/:representativeId#territory` | Current authorized representative only |
| Report Incorrect Information | In-place approved data-report flow | Opaque source identifiers and displayed source version only |
| Call / Email / Text | Approved device utility | Does not create, view, accept, or update a handoff |

If in-memory prefill context is lost during sign-in, refresh, or device change, Send Lead opens safely and requires the user to repeat routing selection. The URL never carries customer or contact details.

### Leads and Lead Detail

1. Selecting a lead card opens `/leads/:leadId`.
2. Notification-linked activity may open `/leads/:leadId#activity` only after the core lead authorizes and loads.
3. Consequential actions remain in the approved Lead Detail review flows and never execute through URL parameters.
4. Back returns to the active-session Leads view, filters, loaded range, scroll, and focus; a direct link falls back to `/leads`.

### Notification Center

| Notification destination type | Destination |
| --- | --- |
| Lead, response, progress, appointment, or outcome | `/leads/:leadId` with Overview or Activity fragment as approved |
| Follow-up reminder | `/leads/:leadId#overview` required-action banner |
| Routing or data exception | `/data-status#known-issues` with safe source or issue code |
| Actionable channel issue | `/profile` notification-delivery section or `/data-status#sources` according to cause |

A successful authorized linked-record open may mark only that in-app notification read. Failed, unavailable, or unauthorized navigation does not.

### Manager Insights

1. Needs Attention **Review records** opens `/insights#exceptions` with the selected approved exception category.
2. KPI and driver **View supporting records** opens `/insights#exceptions` with metric definition, period, and safe filters retained in route or active-session state.
3. Exception **Open lead** opens `/leads/:leadId`.
4. Exception **Review routing** opens `/data-status#known-issues` or the exact authorized Territory exception flow.
5. Back returns to the prior Insight view, filters, loaded range, scroll, and focus.

### Data Status

| Source or issue action | Destination | Rule |
| --- | --- | --- |
| Territory View affected records | `/data-status?source=territory#known-issues` | Shows scope-safe issues; exact affected territory may open `/territory` with allowed filters |
| Directory View affected records | `/data-status?source=directory#known-issues` | Exact authorized identity may open Representative Detail |
| Workflow Open My Work | `/leads` | Current user's scope and the safest applicable view |
| Workflow Open Team Insights | `/insights#exceptions` | Authorized managers only |
| In-app notification condition | `/notifications` | Current user's notification history only |
| SMS channel condition | `/data-status?source=sms#sources` | No raw delivery-attempt list or phone exposure |
| Dynamics condition | `/data-status?source=dynamics#sources` | No affected-record action until integration and reconciliation are approved |
| Report a problem | In-place data-quality report | Source, issue category, and opaque record context passed in memory |
| My report card | `/data-status#my-reports` and in-place reporter detail | Current reporter only; no separate public route required in first release |

Canonical serialization always places the query before the fragment.

### My Profile

| Action | Destination |
| --- | --- |
| View my Directory profile | `/directory/:currentRepresentativeId` after current identity resolution |
| View my Territory Coverage | `/directory/:currentRepresentativeId#territory` |
| View Data Status | `/data-status` |
| Open Team Insights | `/insights#overview`, authorized managers only |
| Open Notification Center | `/notifications` |
| Report incorrect profile information or number | In-place Data Status report flow using directory/contact category |
| Report access problem | `/help/account-access` approved help topic for authenticated users |
| Get sign-in help | `/sign-in/help` for authentication recovery |
| Sign Out | Approved session invalidation command, then `/signed-out` |

`account-access` is a stable Help topic slug, not an access-change command. Role or scope still changes only through the approved identity or access owner.

### Help and Feedback

| Action | Destination or workflow |
| --- | --- |
| Learn how Territory Desk works | `/help` topic search and browse sections |
| Open topic | `/help/:topicSlug` |
| Report incorrect territory or employee information | Data Status report flow with no customer context in URL |
| Get sign-in help | `/sign-in/help` |
| Get authenticated role or scope help | `/help/account-access` |
| Report application problem | In-place privacy-safe support form |
| Suggest an improvement | In-place privacy-safe product-feedback form |
| Open My Requests | `/help#my-requests` |
| Open one request | `/help/requests/:requestId` with reporter authorization |

Direct request links fall back to `/help#my-requests` when the request is missing or no longer reporter visible. Unauthorized users receive no confirmation that it exists.

## In-place workflows that do not receive routes

Keep these as accessible dialogs, sheets, disclosures, or forms inside their owning screen:

1. Mobile filters before Apply.
2. Lead response, decline, withdrawal, reassignment, correction, appointment, and outcome review flows.
3. Follow-up create, complete, reschedule, cancel, and calendar-export review.
4. Notification Mark All Read confirmation.
5. Data-quality report creation and reporter-visible inline detail.
6. Profile preference editing and save conflict.
7. Help application-problem and suggestion forms.
8. Unsaved-change, discard, and sign-out confirmations.

Reasons:

1. They depend on current authorized parent context.
2. They are not safe or useful as independent shareable destinations.
3. A URL must never execute a consequential command.

## Authentication and authorization contract

1. Unauthenticated access to protected application routes preserves only a safe allowlisted relative return destination.
2. After sign-in, the server resolves identity, role, scope, and record permission before content renders.
3. Managers receive no organization-wide access by role name alone.
4. Unauthorized routes use Access Denied or the approved non-disclosure Not Found behavior.
5. Access changes clear removed-scope content and replace invalid history entries when necessary.
6. A route, query, fragment, or navigation-state object is untrusted input.

## Back and focus contract

### In-app origin exists

Back restores, when still authorized:

1. Origin route and local view.
2. Approved filters.
3. Active-session search text when permitted.
4. Loaded pagination range.
5. Scroll position.
6. Focus to the control or card that opened the destination.

### Direct link or lost origin

Use the route registry's safe fallback. Never fabricate a prior list or reveal another user's state.

### Changed or removed record

Return to the safe parent list, announce the change, and do not restore protected cached content.

### In-place workflow

Cancel or close returns focus to its opener and changes no business state unless a committed command already succeeded.

## Offline, stale, and unavailable navigation

1. Offline navigation may open only already loaded, authorized in-memory content approved by the owning screen.
2. Do not open uncached production records or protected lists offline.
3. State-changing actions remain disabled until session, permission, record version, and source version revalidate.
4. A disabled action explains whether connection, stale data, authorization, or service availability is the cause.
5. Reconnect never auto-submits a previously blocked action.
6. If an external device utility opened, Territory Desk still does not infer that contact occurred.

## Missing, unavailable, and unauthorized destinations

1. Missing or inaccessible Lead Detail returns generic lead unavailable behavior, then `/leads`.
2. Missing or inaccessible Representative Detail returns generic representative unavailable behavior, then `/directory`.
3. Missing or retired Help Topic returns `/help` with approved replacement suggestions.
4. Missing or inaccessible Help Request returns `/help#my-requests` without confirming existence.
5. Unauthorized Manager Insights returns `/access-denied` with Home and My Work.
6. Unsafe authentication return falls back to Home after successful authentication.
7. Unknown route uses `/not-found`.
8. Incompatible client uses `/update-required` before protected writes.

## Mobile and laptop consistency

1. Route names, labels, filters, permissions, and results are identical.
2. Mobile may use full-height sheets where laptop uses side panels or popovers.
3. Laptop may show a detail panel but must still update browser history to the canonical detail route.
4. Closing a panel or using Back restores the same logical origin and focus on both devices.
5. No device receives an additional business command or broader access.

## Privacy and analytics

1. Analytics record route templates, safe action labels, and result categories only.
2. Never record full URLs for protected detail pages.
3. Never include opaque record identifiers in analytics merely because they are allowed in a path.
4. Referrer policy and page metadata prevent protected context from leaking to external destinations.
5. Error reporting uses route templates and safe correlation references.
6. Sign Out clears active-session route state, filters, search, scroll, focus references, and protected navigation caches.

## Validation checklist

1. Enumerate every route in the router and reconcile it to this registry.
2. Verify static and dynamic route precedence prevents `new`, `requests`, and reserved paths from being treated as identifiers.
3. Verify every cross-screen primary, View All, drill-down, correction, help, and fallback action matches this contract.
4. Verify query parsing accepts only approved enumerated parameters.
5. Verify filters never broaden server-authorized scope.
6. Verify customer, employee, contact, search, note, token, and provider data never enter URLs or history.
7. Verify every detail direct link rechecks authentication, authorization, record state, and source version.
8. Verify browser Back restores authorized view, filters, pagination, scroll, and focus.
9. Verify direct-link fallbacks reveal no prior or protected context.
10. Verify no URL, query, or fragment can execute a business command.
11. Verify in-place workflows remain keyboard accessible and return focus.
12. Verify Help Request Detail is reporter authorized and does not disclose existence.
13. Verify manager routes and filters cannot exceed current scope.
14. Verify offline and stale navigation cannot load or mutate uncached production data.
15. Verify mobile and laptop route history remains logically identical.
16. Verify analytics, metadata, referrers, logs, cache, service worker, errors, and sign-out preserve route privacy.

## Step 2.12 acceptance checklist

- [x] Route classes and canonical authenticated, secondary, detail, authentication, and system registries are approved.
- [x] Static-before-dynamic route precedence and reserved-path behavior are approved.
- [x] Lead Overview, Activity, territory coverage, Insights, Data Status, and Help fragments are approved.
- [x] Allowed Territory, Leads, Directory, Notification, Insight, Data Status, and Help URL parameters are approved.
- [x] Home quick action, Action Required, Waiting, Feedback, Outcome, and Insight mappings are approved.
- [x] Territory, Directory, Leads, Notification, Manager Insight, Data Status, Profile, and Help cross-screen mappings are approved.
- [x] Help Request Detail uses `/help/requests/:requestId` and reporter-only authorization.
- [x] Representative insight cards open supporting Leads; manager View Insights opens authorized Team Insights.
- [x] Data Status affected-record actions use source-appropriate filtered destinations and never expose raw operational data.
- [x] Profile access help and sign-in help remain distinct.
- [x] Consequential and context-dependent flows remain in-place and cannot execute from a URL.
- [x] Authentication, authorization, Back, focus, direct-link, fallback, offline, stale, unavailable, and device-consistency contracts are approved.
- [x] URL, history, metadata, analytics, logs, cache, service-worker, and sign-out privacy rules are approved.
- [x] Route and cross-screen action validation checklist is approved as the final Phase 2 closure test.
