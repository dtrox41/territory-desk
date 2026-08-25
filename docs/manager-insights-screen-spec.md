# Manager Insights Screen Specification

Status: Approved for Step 2.11d

Route: `/insights`

## Purpose

Team Insights helps an authorized manager find cross-department handoffs that need intervention, understand where collaboration workflows are breaking down, and open the exact records needed to correct the problem.

It is an operational collaboration view, not an employee leaderboard, compensation scorecard, sales forecast, or substitute for Dynamics 365.

The approved KPI formulas, exclusions, small-sample rules, and Dynamics gate remain defined in `docs/collaboration-insights-spec.md`. This specification composes those rules into one complete, responsive screen and does not redefine them.

## Primary manager question

The default screen must answer, before the manager changes a filter:

> Where does my authorized team need help closing a cross-department handoff loop today?

Secondary questions are:

1. Are first meaningful responses occurring within the one-business-day workflow target?
2. Are accepted handoffs receiving their promised updates and next actions?
3. Are routing exceptions or incomplete data making the workflow appear better or worse than it is?
4. Which authorized records support each count or rate?

## Product boundaries

1. Representatives and managers use the same application and workflow language.
2. Managers retain **My Work** in `/leads` for their own sent, received, and assigned handoffs.
3. **Team Insights** is a separate role-controlled view for authorized team scope.
4. A manager role never grants organization-wide access by itself.
5. Insight cards and tables do not directly accept, decline, close, withdraw, or bulk reassign handoffs.
6. Record-level intervention occurs after the manager opens the authorized Lead Detail screen.
7. Raw leads sent or received may appear only as denominator or scope context, never as the primary success measure.
8. Individual representative ranking and cross-representative comparison are excluded from the first release.
9. Revenue, booked business, conversion, and verified opportunity outcomes remain unavailable until Dynamics mapping and reconciliation are approved.

## Access and scope

### Authorized manager

The screen uses server-enforced scope consisting only of approved combinations of:

1. Location.
2. Sending department.
3. Receiving department.
4. Supervised representative.

The effective scope is the intersection of the authenticated manager's permissions and the selected filters. Filters may narrow access but never broaden it.

### Representative without manager permission

1. The Manager Insights navigation item is omitted.
2. Direct navigation to `/insights` shows **Manager access required**.
3. The safe actions are **Return to Home** and **Open My Work**.
4. The response and client bundle expose no team counts, employee names, customer names, or cached insight data.

### Manager with no active scope

Show **No team scope is assigned** with instructions to contact the approved administrator or data owner. Do not show an empty zero-performance dashboard.

### Scope change during a session

If access changes while the screen is open:

1. Stop rendering the prior scope.
2. Clear client-held results for the removed scope.
3. Announce **Your access changed. Team Insights has been refreshed.**
4. Return to the closest still-authorized scope or the no-scope state.

## Global screen structure

### Header

Show:

1. Page title: **Team Insights**.
2. Plain-language scope summary, such as **North Location · Uniform + Facility Services**.
3. Visible **Last updated** time.
4. A **Data details** control.
5. The standard notification bell and profile control.

In the fictional prototype, show a persistent **Demo data** label near the title.

### Two screen views

Use two local views, not additional global navigation destinations:

1. **Overview** — operating condition, primary workflow KPIs, and diagnostic context.
2. **Exceptions** — authorized handoffs and data problems requiring attention.

The selected view is represented by the URL fragment `#overview` or `#exceptions`. Browser Back restores the prior view, filter state, loaded range, scroll position, and focus during the active session.

## Global filters

Show a small set of filters that apply consistently to every eligible metric and exception list:

1. Period: `7 days`, `30 days`, or `90 days`; default `30 days`.
2. Sending department.
3. Receiving department.
4. Direction: `Sent`, `Received`, or `Both` relative to the selected scope.
5. Current workflow status.

Rules:

1. The period uses the approved metric-specific eligible-event date, not one guessed date for every metric.
2. Each metric definition states which date places a record in the period.
3. Department options include only authorized values.
4. Sending and receiving departments remain separate; selecting both identifies a department pair.
5. Selecting `Both` does not double-count one handoff.
6. The first release does not include arbitrary custom date ranges.
7. **Reset filters** returns to the authorized default scope and 30-day period.
8. Non-sensitive filter codes may appear in the URL; customer names, representative names, phone numbers, email addresses, and free text never appear in it.
9. A filter change updates all compatible cards, counts, and lists as one versioned result.
10. If one component cannot update, label that component unavailable rather than silently mixing periods or scopes.

## Mobile composition

The smartphone experience prioritizes action and works during ordinary intermittent connectivity:

1. Header, scope, freshness, and Demo data label.
2. Compact filter summary with **Change filters**.
3. **Needs Attention** exception summary.
4. Primary workflow KPI cards.
5. Routing and measurement guardrails.
6. Disposition and information-request mix.
7. Metric definitions and source details.

Filters open in an accessible full-height sheet with explicit **Apply** and **Cancel** controls. Changing selections does not update the screen until **Apply** is activated.

Do not compress a wide laptop table into unreadable columns. Mobile department-pair results use stacked rows with the same fields and drill-down actions.

## Laptop composition

Use the same information order with more simultaneous context:

1. Persistent left navigation.
2. Page title, scope, freshness, and filters in the header area.
3. A two-column operating layout:
   - larger left column for **Needs Attention** and supporting records;
   - right column for KPI cards and data-quality guardrails.
4. Full-width department-pair diagnostic table below.
5. Metric definitions and data details at the bottom or in a side panel.

Laptop layout may expose more rows at once, but it does not add metrics, permissions, or actions unavailable on mobile.

## Overview view

### 1. Data trust banner

Show a compact banner before the metrics with:

1. Workflow-data last refresh time.
2. Territory-assignment source version and last verified date.
3. Eligible-record completeness.
4. Excluded-record count.
5. Any stale, partial, definition-change, or routing-quality warning.

Healthy data uses neutral wording such as **Data checks passed for this view**. Do not use celebratory color as proof of quality.

Selecting **Data details** opens the approved Data Status destination with the current non-sensitive scope and metric context.

### 2. Needs Attention

Show these authorized, deduplicated action groups in this order:

1. **Missed first response** — handoffs whose response target has elapsed without a meaningful response.
2. **Overdue update** — accepted handoffs whose required structured update is overdue.
3. **Missing next action** — open accepted handoffs without a valid future structured next action.
4. **Routing exceptions** — missing or ambiguous routing records requiring approved resolution.

Each group shows:

1. Exact count within the active scope.
2. Oldest affected age or due time when available.
3. Plain-language reason it needs attention.
4. **Review records** action.

One handoff may qualify for more than one diagnostic condition, but the total **Needs Attention** headline count is the number of unique authorized handoffs, not the sum of category counts.

`Review records` opens the Exceptions view with the corresponding filter. It never performs a business-state change.

When no qualifying exception exists, show **No team handoffs need manager attention for this view**. Do not replace the space with a volume chart.

### 3. Primary workflow KPI cards

Show exactly the two approved first-release primary KPIs:

1. **First-response target completion**.
2. **Closed-loop update completion**.

Each card includes:

1. Plain-language metric name.
2. Rate when evidence is eligible for display.
3. Numerator and denominator as text, such as **18 of 22 eligible handoffs**.
4. Selected period.
5. Excluded-record count.
6. Last refresh time.
7. **About this metric**.
8. **View supporting records**.

The one-business-day rule is displayed as a workflow deadline, not a performance grade.

Do not show a percentage target from fictional data. A target percentage may be added only after the approved pilot baseline and governance process.

### 4. Diagnostic drivers

Show only drivers that help the manager find a workflow cause:

1. Median time to first meaningful response, with the 75th percentile available in details.
2. Next-action coverage.
3. Open-loop aging bands.

Open-loop aging bands are:

1. Within target.
2. Missed by less than one business day.
3. Missed by one to three business days.
4. Missed by more than three business days.

Each count links to the exact authorized supporting records. Use a compact stacked list or table on mobile. A visual bar may supplement the text on laptop, but it cannot be the only representation.

### 5. Guardrails

Show:

1. Routing exception rate and underlying counts.
2. Accept, Need Information, and Decline mix with approved reason categories.
3. Measurement completeness, eligible denominator, and exclusions.

Do not label a high acceptance rate as good or a high decline rate as bad. The mix exists to locate qualification, information, or routing problems.

### 6. Department-pair diagnostics

The department-pair section helps managers find process friction between authorized sending and receiving departments.

Show one row per eligible pair with:

1. Sending department.
2. Receiving department.
3. Eligible denominator.
4. First-response target completion.
5. Closed-loop update completion.
6. Open exception count.
7. Routing or completeness warning.
8. **View records** action.

Rules:

1. Default order is highest actionable exception count, then oldest exception, then department names alphabetically.
2. This is not a ranking and uses no winner, loser, top, bottom, best, or worst language.
3. A comparison group with fewer than 10 eligible handoffs shows **Insufficient volume for comparison** instead of a comparative rate or rank.
4. Authorized counts may remain visible when they safely support action.
5. Department comparisons remain unavailable when routing completeness or the denominator fails validation.

### 7. Qualified progression placeholder

The production screen does not render Qualified Handoff Progression until Dynamics 365 entity mapping, record linking, milestone definitions, attribution, maturity, refresh, and reconciliation are approved.

The fictional prototype may include a clearly separated card only when it shows:

1. **Demo only — not connected to Dynamics 365**.
2. Fictional source label.
3. The provisional 30-day maturity assumption.
4. No production target or employee-performance interpretation.

If those labels cannot be guaranteed, omit the card entirely.

## Exceptions view

### Exception types

Allow one or more of:

1. Missed first response.
2. Overdue update.
3. Missing next action.
4. Routing exception.
5. Incomplete measurement fields.

### Exception row or card

Show only the minimum context needed to choose a record:

1. Company name.
2. Sending and receiving departments.
3. Current workflow status.
4. Current owner display name when authorized.
5. Required-action owner display name when authorized.
6. Exception reason.
7. Exact due time or age with timezone when relevant.
8. Primary action: **Open lead** or **Review routing**.

Do not show phone numbers, email addresses, street address, full opportunity notes, provider errors, or raw integration data in the list.

### Ordering and pagination

1. Use the canonical action severity and due-time logic where applicable.
2. Routing exceptions follow response and overdue workflow exceptions unless they block access to a customer handoff.
3. Ties use created time and opaque identifier for deterministic order.
4. Use stable cursor pagination.
5. New results arriving while the manager reads do not jump the list; show **New updates available**.
6. Returning from Lead Detail restores filters, loaded range, scroll, and focus during the active session.

### Manager actions

The list provides no bulk acceptance, decline, closure, withdrawal, reassignment, or historical correction.

After **Open lead**, Lead Detail may expose an authorized manager command such as reassignment. That command requires its approved reason, confirmation, concurrency check, committed result, and immutable audit event.

## Drill-down contract

Every count and displayed metric has a supporting-record destination.

1. The destination repeats the metric name, period, scope, denominator, and exclusions.
2. It shows only records the manager is currently authorized to access.
3. The list result reconciles to the displayed count or explains why a record changed after refresh.
4. Direct links re-run authorization and never trust client-supplied scope.
5. If a metric has no record-level drill-down because its data is unavailable, the action is disabled with an explanation.
6. Opening a drill-down does not mark lead notifications read or change any lead state.

## Small-sample and comparison safety

1. Always show the eligible denominator beside a rate.
2. Fewer than 10 eligible handoffs suppresses comparison and rank, not necessarily an authorized action count.
3. The threshold is a provisional product-safety rule, not a claim of statistical significance.
4. Do not compare periods that used different metric definitions without a visible definition-change notice.
5. Do not compare departments until routing and completeness checks pass.
6. Do not use red or green alone to judge a rate.
7. Do not infer individual performance from a team or department-pair result.

## Data and source contract

### First-release sources

Use only validated Territory Desk records for:

1. Lead handoff state and timestamps.
2. Meaningful responses.
3. Ownership and required-action ownership.
4. Structured next actions and follow-ups.
5. Immutable activity events.
6. Territory routing status.
7. Authorized manager scope.

### Future Dynamics source

Dynamics-backed results remain separately labeled and separately refreshed. Territory Desk never fills missing Dynamics outcomes with assumptions or free-text interpretations.

### Consistency

One versioned insight result supplies the compatible headline, cards, guardrails, and drill-down context. It includes:

1. Scope key.
2. Filter definition.
3. Metric definition version.
4. Numerator.
5. Denominator.
6. Exclusions.
7. Comparison eligibility.
8. Source refresh times.
9. Result generation time.

The screen never silently combines results produced under different scopes, periods, definition versions, or source-refresh versions.

## Loading and refresh behavior

### Initial loading

1. Render the page title, authorized scope shell, filters, and stable section placeholders.
2. Do not show zero values while results are unknown.
3. Announce **Loading Team Insights** to assistive technology without repeated announcements for every component.

### Manual refresh

1. Refresh requests a new versioned result.
2. Keep the last validated result visible with **Refreshing** when safe.
3. Replace the view only after the compatible result is complete.
4. Do not duplicate records or reset the manager's scroll unexpectedly.

### New activity

Do not mutate visible counts or reorder exception rows while the manager is reading. Show **New updates available** and let the manager refresh deliberately.

## Empty, partial, stale, offline, and error states

### No action needed

Show the calm empty state for Needs Attention while keeping validated KPI and guardrail context.

### No eligible data

Show **No eligible handoffs for this period and scope**. Explain which filters or eligibility rules produced the result and offer **Reset filters**. Do not display `0%`.

### Insufficient comparison volume

Show authorized counts and **Insufficient volume for comparison**. Do not imply failure or hide actionable records.

### Partial metric failure

Keep compatible validated sections visible. The failed section shows **Metric unavailable**, a safe reason, last successful refresh when available, and **Try again**.

### Stale data

Keep the last validated result only when its scope and definition remain authorized. Label it **Stale — last updated [time]** and identify which source is stale.

### Offline

1. Fictional prototype data may display its last in-memory result with **Offline demo data**.
2. Production on a personal phone does not persist real team or customer insight records for offline browsing unless a later security review approves it.
3. Every state-changing manager action remains unavailable offline.
4. Reconnect offers a deliberate refresh.

### Authorization failure

Immediately remove prior results and show the safe manager-access state. Do not retain names or counts from the prior scope.

### Result mismatch

If sections return different scope, filter, definition, or source versions, show **Insights could not be reconciled** and do not present the conflicting rate as trustworthy.

### Drill-down mismatch

If a displayed count changes before its list opens, show the newly authorized current result and a plain explanation that the records changed after refresh.

## Privacy and security

1. Server-side authorization applies to every aggregate, filter option, row, count, and drill-down.
2. Aggregates never become a side channel for discovering an unauthorized department, representative, or customer.
3. URLs use only approved non-sensitive codes and opaque identifiers.
4. Customer names, employee names, contact details, and notes remain out of URLs, page metadata, analytics payloads, logs, and error-reporting breadcrumbs.
5. Production browser caches and persistent storage do not retain real team results on personal smartphones without security approval.
6. Sign out clears session-held filters and results.
7. Export, download, copy-all, print report, and email report are excluded from the first release.
8. Insight access and manager interventions are auditable.

## Accessibility

1. Heading order describes scope, action, metrics, diagnostics, and details.
2. Every rate is announced with numerator, denominator, period, and eligibility context.
3. Color is never the only indicator of urgency, freshness, completeness, or comparison state.
4. Any chart has an equivalent accessible table or text list.
5. Table headers and row actions have programmatic relationships.
6. Filters are keyboard operable and retain focus after Apply or Cancel.
7. Touch targets are at least 44 by 44 CSS pixels.
8. Content remains usable at 200% text zoom and large phone text settings.
9. Refresh, filter, unavailable, and new-update states are announced without excessive repetition.
10. Returning from a record restores focus to the control that opened it.

## Analytics boundary

Allowed product analytics record only approved event names and non-sensitive categories, such as:

1. `manager_insights_opened`.
2. `manager_insights_view_changed`.
3. `manager_insights_filter_applied`.
4. `manager_insights_metric_definition_opened`.
5. `manager_insights_drilldown_opened`.
6. `manager_insights_refresh_requested`.
7. `manager_insights_error_shown` with a safe error class.

Analytics must not contain customer data, representative names, phone numbers, email addresses, handoff notes, raw record identifiers, individual employee performance, or unauthorized scope details.

## Fictional prototype scenarios

Provide fictional data that demonstrates:

1. Manager with authorized multi-department scope.
2. Manager's own My Work remaining separate.
3. Missed first response.
4. Overdue update.
5. Missing next action.
6. Routing exception.
7. Two primary KPI cards with reconciling drill-downs.
8. Accept, Need Information, and Decline mix.
9. Department pair with enough volume for display.
10. Department pair below the comparison threshold.
11. No-action-needed state.
12. No eligible records after filters.
13. Partial metric failure.
14. Stale result.
15. Offline behavior.
16. Manager with no scope.
17. Representative denied direct route access.
18. Scope removal while the screen is open.
19. Demo-only progression card or its intentional omission.

All companies, representatives, departments-to-person mappings, activities, and outcomes in the prototype are fictional.

## Validation checklist

1. Recalculate every numerator, denominator, exclusion, and action count from fixture events.
2. Verify the Overview and Exceptions views reconcile under every filter combination.
3. Verify the unique Needs Attention count does not sum duplicate category membership.
4. Verify the exact one-business-day boundary, timezone, and business-calendar handling.
5. Verify views, deliveries, notification reads, and free-text notes do not count as meaningful responses.
6. Verify rescheduling alone does not count as completed progress.
7. Verify the below-10 rule suppresses comparisons while preserving safe action counts.
8. Verify no individual ranking or raw-volume leaderboard can render.
9. Verify every drill-down re-runs authorization and matches its displayed metric context.
10. Verify unauthorized filter manipulation cannot broaden scope.
11. Verify a mid-session scope removal clears prior results.
12. Verify partial, stale, offline, mismatch, and error states never display guessed values.
13. Verify incompatible result versions never render together.
14. Verify Dynamics-dependent outcomes remain hidden or unmistakably demo-only.
15. Verify back navigation restores filters, loaded range, scroll, and focus.
16. Verify mobile, laptop, keyboard, screen-reader, touch-target, contrast, zoom, and large-text behavior.
17. Verify URLs, analytics, logs, metadata, caches, and sign-out preserve privacy.

## Step 2.11d acceptance checklist

- [x] Team Insights remains separate from each manager's My Work.
- [x] Manager scope is limited to approved locations, departments, and representatives.
- [x] Overview and Exceptions screen composition is approved for smartphone and laptop.
- [x] Period, department, direction, and status filters are approved and never broaden access.
- [x] Needs Attention groups and the unique headline count are approved.
- [x] The two approved workflow KPIs retain their existing formulas and visible denominators.
- [x] Diagnostic drivers, guardrails, and department-pair display are approved.
- [x] Individual rankings, raw-volume leaderboards, and unsupported performance judgments remain excluded.
- [x] Small-sample, completeness, definition-version, and Dynamics gates are approved.
- [x] Every count and metric provides a permission-safe supporting-record path.
- [x] Manager interventions remain in Lead Detail with reasons, confirmation, concurrency protection, and audit history.
- [x] Empty, no-data, insufficient-volume, partial, stale, offline, unauthorized, mismatch, and refresh states are approved.
- [x] Privacy, security, accessibility, analytics, source, and prototype boundaries are approved.
