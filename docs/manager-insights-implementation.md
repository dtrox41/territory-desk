# Step 5.3.9 — Fictional Manager Insights

Status: Implementation complete locally; awaiting user approval

Date: 2026-08-24

## Outcome

`/insights` is now an authorized fictional Team Insights workspace that helps a
manager identify cross-department handoff loops requiring intervention. It is
separate from the manager's personal My Work list and does not rank employees,
forecast sales, infer compensation, or substitute for Dynamics 365.

The current local preview intentionally uses the authorized manager shell
variation so this step can be inspected. Representative denial, manager with no
scope, authorization lookup failure, and mid-session scope removal are tested
as distinct fail-closed service and screen states. A client presentation flag
does not grant production access.

## Source and metric model

The displayed values are calculated from 26 fictional handoff-event records.
They are not hard-coded dashboard percentages. One compatible snapshot supplies
the headline, KPIs, guardrails, department-pair rows, and record drill-downs.

The snapshot includes:

1. Authorized scope key and plain-language scope label.
2. Applied filter definition.
3. Metric definition version.
4. Source version and refresh label.
5. Numerators, denominators, exclusions, and rates.
6. Measurement completeness and routing states.
7. Result generation time.

The fictional adapter calculates:

- First-response target completion from Accept, Need Information, or Decline
  events at or before the precomputed one-business-day deadline.
- Closed-loop update completion from qualifying structured progress completed
  by the approved update due time.
- Unique Needs Attention handoffs independently from overlapping diagnostic
  category counts.
- Median and 75th-percentile meaningful response time.
- Next-action coverage for open accepted handoffs.
- Open-loop aging bands.
- Routing exception rate, disposition mix, and measurement completeness.
- Department-pair comparison eligibility and action counts.

Views, notification reads, delivery events, general notes, and rescheduling
alone do not count as meaningful response or completed progress. Unresolved
routing and incomplete evidence are excluded instead of guessed.

## Overview

The default Overview answers where the authorized team needs help before the
manager changes a filter. It includes:

- Demo-data, scope, and freshness context.
- Data trust banner with completeness, eligible records, and exclusions.
- Deduplicated Needs Attention headline.
- Missed first response, overdue update, missing next action, and routing
  exception groups.
- Exactly two primary workflow KPI cards.
- Plain numerator and denominator text beside every displayed rate.
- Metric-definition controls and supporting-record actions.
- Diagnostic response time, next-action coverage, and aging bands.
- Routing, completeness, and response-disposition guardrails.
- Department-pair diagnostics ordered by actionable exceptions rather than a
  performance rank.

The fictional pairs demonstrate three different trust outcomes:

1. Enough validated volume for a displayed comparison.
2. Fewer than 10 eligible handoffs, labeled **Insufficient volume for
   comparison**.
3. A comparison suppressed because routing or completeness validation failed.

Qualified progression remains visibly unavailable because Dynamics mapping and
reconciliation have not been approved. No fictional revenue or conversion
result is rendered.

## Filters

Period, sending department, receiving department, direction, and workflow
status apply to one compatible result. The default period is 30 days.

- Smartphone filters open in a full-height native dialog with explicit Apply,
  Cancel, and Reset controls.
- Laptop filters remain visible in the page header area.
- Filters narrow the fictional authorized scope and cannot broaden it.
- Only allowlisted non-sensitive codes enter the URL.
- Customer names, employee names, phone numbers, email addresses, notes, and
  manager scope keys do not enter the URL.
- An empty filter result says **No eligible handoffs for this period and
  scope** rather than presenting `0%`.

## Exceptions and supporting records

Overview counts open the Exceptions view with the same period and filters.
Every metric and attention group has a supporting-record path.

Record cards show only:

- Fictional company name.
- Sending and receiving departments.
- Workflow status.
- Authorized current and required-action owners.
- Exact exception or supporting-evidence reason.
- Exact workflow time in Central Time.
- Open Lead or Review Routing.

No acceptance, decline, closure, withdrawal, reassignment, or other business
mutation executes from the list. Open Lead carries only the active Insights
return location in protected navigation state. Lead Detail returns to the prior
view, filters, record type, and URL fragment without changing notification or
lead state.

Supporting records use bounded 20-record pagination. New activity shows **New
updates available** without changing visible counts or order while the manager
is reading.

## Access and failure behavior

The screen implements and tests:

- Authorized multi-department manager scope.
- Representative direct-route denial without team disclosure.
- Manager with no active scope, which is not misrepresented as zero
  performance.
- Authorization lookup failure with no retained team result.
- Mid-session scope removal that immediately clears prior names and counts.
- Initial loading and generic unavailable states.
- Empty filters and no eligible records.
- Partial primary-metric or department-pair failure.
- Stale compatible result labeling.
- Offline demo-data visibility with refresh disabled until reconnection.
- New-update holding behavior.
- Supporting-record failure without guessed counts.

## Responsive and accessibility behavior

- The verified 390 × 844 smartphone layout has no document-level horizontal
  overflow.
- The filter dialog is 352 pixels wide inside the 390-pixel viewport.
- The verified 1440 × 900 laptop layout uses a 745/359-pixel operating grid,
  persistent manager navigation, and a contained 1070-pixel diagnostic table.
- Phone exceptions use readable stacked cards instead of squeezed table
  columns.
- Phone department-pair diagnostics use stacked definition/value cards while
  the laptop uses the full semantic table.
- Rates retain numerator, denominator, period, and eligibility text.
- Native links, buttons, selects, dialog, headings, table caption, row headers,
  and live regions provide the interaction semantics.
- Color is supplementary; urgency, freshness, unavailable, and comparison
  states always have text.
- Primary controls maintain the approved 44-pixel minimum target.

## Verification completed

- Focused manager-domain, service, component, Lead Detail, and shell tests: 37
  passed.
- Full application tests: 139 passed across 30 files.
- Environment and PWA tests: 26 passed.
- Formatting, ESLint, React Router type generation, and TypeScript: passed.
- Production build: 168 client modules transformed; static GitHub Pages
  fallback generated.
- Browser QA: 390 × 844 smartphone and 1440 × 900 laptop passed.
- Browser console: no errors.

The local file watcher emits nonfatal `EMFILE` notices after compilation on
this machine. The production build and static-preview generation still finish
successfully.

## Deliberately deferred

- Real authentication, server-enforced role resolution, and protected manager
  scope.
- Real manager, employee, customer, or lead data.
- Company business-calendar and holiday validation for response deadlines.
- Protected persistence, retention, sign-out clearing, and production browser
  cache policy.
- Dynamics entity mapping, progression, revenue, conversion, and official
  outcome reconciliation.
- Real manager intervention commands such as reasoned reassignment.
- Live analytics, exports, downloads, print reports, or emailed reports.
- Physical-device, company-browser, screen-reader, and 200-percent-zoom
  acceptance in a deployed protected environment.

## Step 5.3.9 acceptance checklist

- [x] Team Insights remains separate from personal My Work.
- [x] Fictional authorized manager scope is explicit and narrowable only.
- [x] Overview and Exceptions preserve one compatible result context.
- [x] Needs Attention is deduplicated across overlapping conditions.
- [x] Two approved workflow KPIs reconcile to supporting records.
- [x] Numerators, denominators, exclusions, freshness, and definitions are
  visible.
- [x] No employee ranking, raw-volume leaderboard, forecast, or compensation
  interpretation is rendered.
- [x] Valid, insufficient-volume, and quality-blocked department-pair cases are
  distinct.
- [x] Consequential manager actions remain in authorized Lead Detail flows.
- [x] Unauthorized, no-scope, removed-scope, empty, partial, stale, offline,
  mismatch-safe, and failure behavior is explicit.
- [x] Smartphone and laptop layouts pass overflow and interaction checks.
- [x] Original application and GitHub remain unchanged.

## Next decision

Approve Step 5.3.9 before implementation proceeds to Step 5.3.10 Data Status.
