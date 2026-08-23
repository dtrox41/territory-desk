# Data Status Screen Specification

Status: Approved for Step 2.11e

Route: `/data-status`

## Purpose

Data Status tells an authenticated user whether Territory Desk information is dependable enough for the action they are trying to take, what known problem may affect them, and what safe next step is available.

It is a plain-language trust and routing-safety screen. It is not an engineering health console, source-data editor, incident-management system, or replacement for the actual workflow screens.

## Primary user question

The default screen must answer:

> Can I safely look up a territory, choose a representative, send a lead, and rely on the collaboration status right now?

The answer must distinguish between:

1. A system that is available.
2. Data that is current enough for its approved use.
3. A source that has been human or authoritatively verified.
4. A known exception that affects only some records.
5. A condition that makes a specific action unsafe.

## Product boundaries

1. Data Status never edits a territory assignment, representative, lead, activity, follow-up, notification, or Dynamics record.
2. Reporting incorrect information creates an auditable data-quality issue; it does not immediately correct source data.
3. A green-looking summary never overrides a record-level warning or version check.
4. A Data Status warning does not automatically change lead ownership, status, response timing, or history.
5. Technical secrets, provider payloads, raw stack traces, database details, and internal infrastructure identifiers are never shown.
6. Prototype Data Status uses fictional display records and clearly labels them **Demo data**.
7. Aggregated findings from the original source audit remain internal design evidence; the public prototype does not present them as live production status.

## Audience and access

### Authenticated representative

May see:

1. Overall action-safety summary.
2. Approved source names and user-facing status.
3. Relevant freshness and version labels.
4. Known issues that may affect available routing or collaboration actions.
5. Their own submitted data reports and reporter-visible updates.
6. Safe retry, report, and navigation actions.

### Authorized manager

Receives the same screen plus approved aggregate issue counts within authorized locations and departments. Manager access does not reveal unrestricted organization-wide employee or customer information.

### Future data owner or administrator

Resolution, source upload, mapping, approval, and rollback tools require a separately approved administrative workflow. They are excluded from the first-release Data Status screen.

### Unauthenticated user

Direct access returns to the approved sign-in flow. No source names, record counts, issue details, employee information, or operational condition is exposed before authentication.

## Overall status model

Use one of five user-facing states for each data area and for the overall summary:

1. **Available** — required validation passed and the source is within its configured freshness rule.
2. **Attention needed** — the source is usable for some records, but known exceptions or incomplete coverage require caution.
3. **Stale** — the last successful validated version exceeded its approved freshness rule.
4. **Unavailable** — the source cannot currently support its dependent action.
5. **Version mismatch** — required sources do not share a compatible version and the dependent action is blocked.

Rules:

1. Status is based on approved checks, never color or HTTP availability alone.
2. If no freshness rule is configured, show **Freshness target not configured**; do not call the source Available solely because it loaded.
3. The overall state reflects the most consequential current restriction, not an average of source states.
4. A partial exception does not label the entire application unavailable when unaffected records remain safe.
5. Every status states its affected action and safe alternative.
6. Color supplements, but never replaces, the status word, icon, and explanatory text.

## Action-safety summary

The first content block shows the current status of these user actions:

1. **Search territories**.
2. **Choose a representative**.
3. **Send a lead**.
4. **Update an existing lead**.
5. **Receive in-app alerts**.
6. **Send Territory Desk SMS alerts**.
7. **Use Dynamics-backed outcomes**.

Each action displays one of:

1. **Available**.
2. **Available with exceptions**.
3. **Read only**.
4. **Temporarily unavailable**.
5. **Not connected**.
6. **Simulation only**.

Examples:

1. Territory and directory version mismatch: Search may remain available, but **Send a lead** is unavailable until routing can be revalidated.
2. SMS provider unavailable: Lead submission may still succeed; the recipient's in-app notification remains separate and SMS shows failed or queued according to the approved notification rules.
3. Dynamics integration disabled: Peer collaboration remains available while Dynamics-backed outcomes show **Not connected**.
4. Offline production session: Already loaded safe context may be read only, while searches and state-changing actions requiring revalidation are unavailable.

## Screen composition

Show sections in this order:

1. Page header and environment label.
2. Overall action-safety summary.
3. Data source cards.
4. Known issues affecting the user or authorized scope.
5. My submitted reports.
6. Status and timestamp definitions.
7. Help route.

## Header

Show:

1. Page title: **Data Status**.
2. Plain-language overall state, such as **Routing available with 2 known exceptions**.
3. **Status checked** time.
4. Standard notification bell and profile control.
5. Persistent **Demo data** label in the prototype.

Do not show development, preview, production, provider, database, or deployment identifiers unless the current environment label is explicitly approved for that audience. Prototype may show **Prototype — simulated services**.

## Data source cards

### 1. Territory routing

Purpose: ZIP, city, service, division, location, and responsible-representative assignment.

Show:

1. Status.
2. Source version.
3. Source updated time when supplied by the source.
4. Imported time.
5. Validated time.
6. Last verified time only when a real verification occurred.
7. Approved freshness rule or **Not configured**.
8. Assignment coverage summary permitted for the user's scope.
9. Known ambiguity, open territory, city-alias, and incomplete-location counts permitted for the user's scope.
10. **View affected records** and **Report a problem**.

### 2. Representative directory

Purpose: stable identity, active routing eligibility, department, location, approved contact availability, and manager relationship.

Show:

1. Status and source version.
2. Source updated, imported, validated, and last verified times using their exact meanings.
3. Whether the directory version is compatible with territory routing.
4. Approved counts of inactive, conflicting-identity, or incomplete-contact records within scope.
5. **Open Directory**, **View affected records**, and **Report a problem**.

Do not display phone numbers, email addresses, or unrestricted employee lists on Data Status.

### 3. Territory Desk workflow data

Purpose: peer handoffs, ownership, responses, follow-ups, activity history, outcomes recorded inside Territory Desk, and insight calculation inputs.

Show:

1. Status.
2. Last successful application refresh.
3. Latest validated event time.
4. Whether new writes and updates are available.
5. Whether insight results are current, stale, partial, or mismatched.
6. Safe summary of delayed or failed processing when it affects the user.
7. **Open My Work** or manager-authorized **Open Team Insights**.

Do not expose customer names, record payloads, event bodies, or individual performance information.

### 4. Notification channels

Show channels independently:

1. **In-app notifications**.
2. **Territory Desk SMS**.
3. Any approved future email channel.

For each channel show:

1. Available, delayed, unavailable, not configured, or simulation-only state.
2. Last successful service check when approved.
3. Whether the condition affects new sends, delivery confirmation, or both.
4. The safe fallback, such as **In-app notification remains available**.

Never display recipient phone numbers, message bodies, provider references, carrier errors, credentials, tokens, or raw retry counts.

Prototype SMS always displays **Simulation only — no carrier text is sent**.

### 5. Dynamics 365 connection

Until the approved integration exists, show:

1. **Not connected**.
2. **Territory Desk peer handoffs remain separate from corporate Dynamics leads**.
3. **Dynamics-backed outcomes and reconciliation are unavailable**.
4. No connect button, credential form, or implication that the user should configure Azure.

After future approval, the card must separately show source environment label, last successful refresh, reconciliation state, and affected capabilities without revealing secrets or raw Dynamics payloads.

## Timestamp definitions

These labels are not interchangeable:

1. **Source updated** — date or time supplied by the source dataset or owning system.
2. **Imported** — time Territory Desk received or loaded that version.
3. **Validated** — time approved automated or human checks completed for that version.
4. **Last verified** — time an authorized person or authoritative process explicitly confirmed the record or dataset.
5. **Last refreshed** — time the current application view successfully obtained data.
6. **Status checked** — time the system last evaluated the displayed health checks.

Rules:

1. Never substitute one timestamp when another is absent.
2. Show **Not provided** or **Not yet verified** instead of guessing.
3. Visible dates use the user's approved timezone and readable format.
4. Operationally precise times include timezone.
5. Relative time such as **12 minutes ago** is accompanied by an exact time on focus, hover, or disclosure.

## Known issues

### Issue categories

1. Multiple representatives assigned to one routing group.
2. Open or missing territory assignment.
3. ZIP or city alias requiring clarification.
4. Missing city, state, location, division, or department label.
5. Representative identity or contact conflict.
6. Inactive representative still referenced by current routing.
7. Territory and directory version mismatch.
8. Delayed workflow or insight processing.
9. Notification channel condition that affects user delivery.
10. Future Dynamics mapping or reconciliation issue.

### Issue card

Show only:

1. Plain-language category.
2. Affected capability.
3. Scope-safe location, department, division, ZIP, or opaque record context when authorized.
4. First detected and most recently confirmed times.
5. Reporter-visible status.
6. Safe workaround or next action.
7. **View affected records** or **Report related problem**.

Do not show full contact details, customer information, internal assignment history, reporter identity, engineering diagnostics, or source payloads.

### Ordering

Order by user impact:

1. Blocks lead submission or ownership updates.
2. Could route a new lead to the wrong person.
3. Prevents lookup or directory access.
4. Delays notifications or insights while the core write succeeded.
5. Informational limitation or future integration gap.

Ties use oldest unresolved detection time, then stable identifier.

## Reporting incorrect information

### Entry points

The same report workflow may open from:

1. Territory result.
2. Representative profile.
3. Lead routing or detail.
4. Data Status source card.
5. Existing known-issue card.

### Form

Prefill only approved opaque identifiers and already authorized display context. The user selects:

1. Wrong representative.
2. Missing or open assignment.
3. Duplicate or ambiguous assignment.
4. Incorrect department, division, or service.
5. ZIP, city, state, or location issue.
6. Representative inactive or contact information outdated.
7. Data appears stale.
8. Other, with required explanation.

Collect:

1. Short factual description.
2. Optional approved callback preference; do not request customer data.
3. Confirmation that submission does not immediately change routing.

Attachments, screenshots, customer records, and unrestricted free-form files are excluded from the first release.

### Submission behavior

1. Revalidate authentication, authorization, source version, and referenced record.
2. Create one idempotent data-quality issue.
3. Preserve the source version and displayed context.
4. Show confirmation and tracking reference.
5. Add a reporter-visible event to My Submitted Reports.
6. Notify the approved data owner through a future approved operational channel; prototype simulates this.
7. Do not mutate the source record, remove an exception, or enable blocked routing.

Duplicate likely reports may link to an existing issue after confirmation, but the user's report and reporter-visible follow-up remain traceable.

## My Submitted Reports

Show only reports submitted by the current user and reporter-visible updates.

Statuses:

1. **Submitted**.
2. **Acknowledged**.
3. **Under review**.
4. **Resolved**.
5. **Closed — no source change**.

Each card shows category, safe affected context, submitted time, current status, last update time, and approved resolution summary. It does not expose the assigned reviewer or other reporters unless policy later approves it.

Resolution status is informational. The affected action remains governed by the active validated source version, not by the report label alone.

## Version and refresh rules

1. Every territory and directory version has a stable opaque identifier.
2. New lead submission requires compatible active territory and directory versions.
3. A refresh never silently rewrites routing snapshots stored on existing handoffs.
4. A direct link re-runs authorization and version checks.
5. If a newer version arrives while the user reads, show **New status available** without replacing content or moving focus.
6. Manual refresh requests one compatible status snapshot.
7. Source cards from incompatible snapshot versions never render together as one trusted summary.
8. Rollback and source-version approval remain future data-owner operations, not user controls.

## Mobile composition

1. Overall action-safety summary first.
2. Each source appears as a collapsed card with status, affected action, and last relevant time.
3. Expanding a card reveals version, timestamp meanings, issues, and actions.
4. Known issues use stacked cards.
5. My Submitted Reports is collapsed when empty.
6. Technical definition text stays behind **What do these labels mean?**
7. No horizontal tables or dense diagnostic grid appears.

## Laptop composition

1. Same reading and action order as mobile.
2. Action-safety summary and source cards may use two columns.
3. Known issues and submitted reports may use accessible tables when that improves scanning.
4. Wider layout does not add unrestricted data, administrative controls, or hidden technical detail.

## Loading, empty, stale, offline, and error states

### Initial loading

Render the title, action-safety shell, and stable source-card placeholders. Do not display Available, zero exceptions, or current timestamps before validation completes.

### No known issues

Show **No known data issues affect your available actions**. This means no current known issue within the displayed scope; it does not claim the data is universally perfect.

### No submitted reports

Show **You have not submitted a data report** with a short explanation of where reporting is available.

### Partial source failure

Keep independently validated source cards visible. Label the failed card **Unavailable** or **Status unavailable** and do not calculate an overall Available state from incomplete evidence.

### Stale status snapshot

Keep the last authorized validated snapshot with **Stale — status last checked [time]**. Dependent actions follow their own stricter revalidation rules and may remain blocked.

### Offline

1. Prototype may show the last in-memory fictional snapshot with **Offline demo status**.
2. Production personal phones do not persist real issue or employee data for offline browsing without security approval.
3. New searches, lead sends, status-changing actions, and report submission remain unavailable when authorization and versions cannot be revalidated.
4. A report form already in memory remains intact until reconnect or explicit discard, but is not stored persistently.

### Authorization change

Clear prior scope information immediately, refresh authorized status, and announce the change.

### Status mismatch

Show **Data status could not be reconciled** when source cards belong to incompatible snapshot versions. Do not show a trusted overall state.

### Report submission failure

Preserve the active in-memory description, show whether the issue was not submitted or its result is unknown, and use idempotent retry. Never create duplicate reports silently.

## Privacy and security

1. Every source summary, count, issue, and report is permission filtered server-side.
2. Aggregate counts cannot reveal unauthorized locations, departments, employees, or customers.
3. Customer information is excluded from Data Status.
4. Employee phone numbers and email addresses are excluded from source and issue cards.
5. URLs contain only approved non-sensitive codes and opaque identifiers.
6. Page titles, metadata, analytics, logs, and error breadcrumbs contain no employee contact or issue narrative.
7. Production caches and persistent browser storage do not retain real status records on personal smartphones without approval.
8. Sign out clears session-held status, filters, issue drafts, and report results.
9. Export, bulk download, source upload, source edit, and resolution controls are excluded.

## Accessibility

1. Status is expressed in text, not color alone.
2. Source cards use real buttons with expanded state and clear accessible names.
3. Timestamp labels remain distinct to screen readers.
4. Issue tables have correct headers and mobile card equivalents.
5. Focus returns to the originating control after dialogs and nested pages close.
6. Refresh and status changes are announced without repeated noise.
7. Touch targets are at least 44 by 44 CSS pixels.
8. Content remains usable at 200% zoom and large phone text sizes.
9. The reading order remains summary, sources, issues, reports, definitions, and help.

## Analytics boundary

Allowed events include:

1. `data_status_opened`.
2. `data_status_source_expanded` with safe source category.
3. `data_status_issue_list_opened` with safe issue category.
4. `data_status_report_started` with safe entry-point category.
5. `data_status_report_submitted` with safe category.
6. `data_status_refresh_requested`.
7. `data_status_error_shown` with safe error class.

Never include employee or customer names, contact information, report narrative, raw record identifiers, source payloads, provider references, credentials, or unrestricted scope information.

## Fictional prototype scenarios

Provide fictional scenarios for:

1. All core Territory Desk actions available while Dynamics is not connected.
2. Territory routing available with a known ambiguous assignment.
3. Territory and directory version mismatch that blocks new lead submission.
4. Directory identity conflict.
5. Source updated but not yet human verified.
6. Stale routing data.
7. Workflow data partial failure while lookup remains available.
8. In-app notifications available while SMS is simulation only.
9. No known issues in the user's scope.
10. User report submitted, under review, resolved, and closed with no source change.
11. Offline and stale snapshot behavior.
12. Unauthorized direct route.
13. Mid-session scope change.
14. Failed report submission with safe retry.

All displayed representatives, assignments, locations, issues, and report narratives are fictional.

## Validation checklist

1. Verify every overall state reconciles to the displayed source and action states.
2. Verify a partial failure cannot produce a false Available summary.
3. Verify every timestamp label uses its approved meaning and missing times are not substituted.
4. Verify territory and directory version mismatch blocks new handoff routing.
5. Verify source refresh never rewrites an existing handoff's routing snapshot.
6. Verify SMS failure does not falsely mark lead submission failed after the handoff committed.
7. Verify Dynamics disabled does not block the separate peer-handoff workflow.
8. Verify report submission is idempotent and never mutates source data directly.
9. Verify My Submitted Reports contains only the current user's reporter-visible records.
10. Verify managers cannot broaden scope through URLs or filter manipulation.
11. Verify source, issue, and aggregate responses do not leak unauthorized identities or counts.
12. Verify stale, partial, offline, unavailable, authorization, mismatch, and retry states fail safely.
13. Verify new status does not jump content or move focus while the user reads.
14. Verify mobile, laptop, keyboard, screen-reader, touch-target, contrast, zoom, and large-text behavior.
15. Verify prototype status and reports use fictional data and visibly simulated integrations.

## Step 2.11e acceptance checklist

- [x] Data Status is approved as a trust and action-safety screen, not an administrative console.
- [x] Overall Available, Attention needed, Stale, Unavailable, and Version mismatch meanings are approved.
- [x] Search, representative, lead, workflow, in-app, SMS, and Dynamics action states remain separate.
- [x] Territory, directory, workflow, notification, and Dynamics source cards are approved.
- [x] Source updated, Imported, Validated, Last verified, Last refreshed, and Status checked remain distinct.
- [x] Known issue categories, scope-safe cards, impact ordering, and workarounds are approved.
- [x] Reporting creates an auditable issue without directly changing source data.
- [x] My Submitted Reports statuses and visibility are approved.
- [x] New lead routing requires compatible territory and directory versions.
- [x] Dynamics remains not connected and SMS remains simulation only in the prototype.
- [x] Representative, manager, unauthenticated, and future data-owner boundaries are approved.
- [x] Loading, no-issue, no-report, partial, stale, offline, unauthorized, mismatch, and retry states are approved.
- [x] Privacy, security, accessibility, analytics, versioning, and fictional-data rules are approved.
