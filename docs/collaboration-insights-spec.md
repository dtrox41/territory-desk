# Cross-Department Insights Specification

Status: Approved for Step 2.4

## Objective

Insights help representatives and managers close cross-department handoff loops, correct workflow problems, and learn whether collaboration is progressing. They do not rank employees, estimate compensation, or treat raw lead volume as success.

The mobile dashboard shows only immediate, actionable signals. Deeper trends and definitions belong in the permission-controlled Insights view on a company laptop or responsive browser.

The complete responsive manager-screen composition is approved in `docs/manager-insights-screen-spec.md`; this document remains the controlling source for metric formulas and measurement rules.

## Measurement boundary

### Facts available inside Territory Desk

The first release can calculate:

1. When a peer handoff was created, delivered in-app, viewed, and answered.
2. Whether the first meaningful response met the approved one-business-day target.
3. Whether the response was `Accept`, `Need Information`, or `Decline`.
4. Whether an accepted handoff has a structured next action.
5. Whether a lead-derived follow-up is due, completed, or overdue.
6. Whether a structured progress or outcome event was recorded.
7. Whether territory routing was unique, ambiguous, missing, or manually resolved.

### Facts that require future Dynamics validation

Do not claim or calculate verified revenue, booked business, conversion, or official opportunity outcomes until all of the following are approved:

1. Dynamics 365 application and environment.
2. Entity and field mapping.
3. Record-linking rules between a Territory Desk handoff and Dynamics.
4. Source-of-truth ownership for appointments and final outcomes.
5. Refresh schedule, permissions, and reconciliation behavior.

Prototype outcome records are fictional and must be visibly labeled demo data.

## KPI hierarchy

Use two primary workflow KPIs in the initial release. Add the outcome KPI only after its source is validated. Supporting drivers explain where action is needed; guardrails reveal whether a favorable-looking result is misleading.

### Primary KPI 1 — First-response target completion rate

**Decision supported:** Do managers need to remove a response bottleneck, and which open handoffs need immediate action?

**Formula:**

`valid peer handoffs with a first meaningful response on or before the target / valid peer handoffs whose response target has elapsed or was satisfied`

**Meaningful response:** `Accept`, `Need Information`, or `Decline`. A view, delivery event, general note, or notification acknowledgment does not count.

**Included:** peer-to-peer handoffs successfully assigned to an eligible recipient.

**Excluded:** test records outside the demo environment, duplicate handoffs confirmed through the approved duplicate process, handoffs withdrawn before the recipient could access them, and unresolved routing exceptions.

**Source:** Territory Desk handoff, response-target, ownership, and immutable activity-event records.

**Owner:** sales operations owns the definition; the product owner owns implementation; managers act on unresolved records.

**Dashboard action:** open the exact handoffs that missed or are approaching the target.

**Caveat:** this measures communication responsiveness, not lead quality, sales performance, or business outcome.

### Primary KPI 2 — Closed-loop update completion rate

**Decision supported:** Are accepted peer handoffs receiving the promised progress updates, or are they disappearing after acceptance?

**Formula:**

`accepted handoffs with their required structured update completed by its due time / accepted handoffs whose required-update due time has elapsed or was completed`

A qualifying structured update is one of:

1. A completed lead-derived follow-up with its result.
2. A new dated next action that replaces the completed action.
3. An `appointment_set` update.
4. A final `won`, `lost`, or `closed_not_qualified` outcome with the required reason or summary.

**Included:** accepted handoffs with an approved structured next action and due time.

**Excluded:** pending, declined, duplicate, withdrawn, and unresolved-ownership handoffs.

**Source:** Territory Desk handoff, next-action, follow-up, status, and immutable activity-event records.

**Owner:** the current handoff owner completes the update; managers act on overdue open loops; the product owner maintains the definition.

**Dashboard action:** open overdue handoffs or handoffs missing a next action.

**Caveat:** recording an update does not prove a favorable sales result. Repeated rescheduling remains visible and does not count as completed progress by itself.

### Gated outcome KPI — Qualified handoff progression rate

**Decision supported:** Are accepted cross-department handoffs reaching a verified appointment or approved later-stage outcome?

**Provisional formula:**

`mature accepted handoffs reaching appointment_set, won, or another approved qualified milestone / mature accepted handoffs`

This KPI is hidden from production until Dynamics mapping, milestone definitions, attribution, cohort maturity, and refresh timing are validated. A 30-day maturity window may be used for fictional prototype demonstrations, but it is not an approved production target or sales-cycle assumption.

## Diagnostic drivers

### Driver 1 — Median time to first meaningful response

Use the median, not only the average, to reduce distortion from a few very old handoffs. Show the 75th percentile in the detailed view so managers can see the slow tail. The record list behind the metric remains the source for action.

### Driver 2 — Next-action coverage

**Formula:** `open accepted handoffs with a valid future structured next action / all open accepted handoffs`

This reveals missing plans before they become overdue. A free-text note does not count as a structured next action.

### Driver 3 — Open-loop aging

Show counts in clear age bands rather than one blended average:

1. Within target.
2. Target missed by less than one business day.
3. Target missed by one to three business days.
4. Target missed by more than three business days.

Every band links to the underlying accessible handoffs.

## Guardrails

### Guardrail 1 — Routing exception rate

**Formula:** `handoffs blocked by missing or ambiguous ownership / all attempted handoffs`

A high value means territory or representative data needs correction; it must not be attributed to recipient performance.

### Guardrail 2 — Handoff disposition and information-request mix

Display `Accept`, `Need Information`, and `Decline` counts with approved reason categories. Do not reward a high acceptance rate in isolation. An unusually high acceptance rate can hide poor qualification, while a high decline or information-request rate can reveal incomplete sender information or routing defects.

### Guardrail 3 — Measurement completeness

Display the eligible denominator, excluded-record count, last refresh time, and the percentage of records with all required timestamps and ownership fields. Hide comparative rates when evidence is incomplete.

## Representative experience

### Mobile dashboard

Show at most three compact personal insights:

1. **Response Target** — completed on time out of eligible responses for the selected period; tapping opens missed or pending handoffs.
2. **Open Loops** — accepted handoffs with an overdue update or no next action; tapping opens those records.
3. **Recent Progress** — appointments or final outcomes recorded during the period; tapping opens the outcome timeline.

If no action is needed, replace the first two with one calm confirmation: `Your peer handoffs are up to date.` Do not fill the space with a volume chart.

### Detailed personal view

Allow `7 days`, `30 days`, and `90 days`; default to `30 days`. Show sent and received filters, department-pair filter, metric definition, eligible denominator, exclusions, and last refresh time.

Representatives can see their own sent and received handoffs and the feedback shared with them. They cannot use an insight link to access another representative’s private records.

## Manager experience

Managers see team-level operational insight only within their approved scope:

1. **My Work** preserves the representative experience for the manager's own handoffs and required actions.
2. **Team Insights** exposes the additional role-controlled management view.

Team Insights contains:

1. Handoffs with a missed first-response target.
2. Accepted handoffs with an overdue update or missing next action.
3. First-response target completion rate.
4. Closed-loop update completion rate.
5. Routing exceptions and measurement completeness.
6. Qualified progression only after the gated outcome definition is approved.

Managers do not receive organization-wide access merely because they have a manager role. Their scope is limited to the approved locations, departments, and representatives they supervise. Reassignment and other manager interventions require an approved reason and immutable audit event.

Recommended filters:

1. `7 days`, `30 days`, `90 days`; default `30 days`.
2. Sending department.
3. Receiving department.
4. Sent versus received.
5. Current workflow status.

Department-pair analysis should show where a process needs attention, not label a person as a winner or loser. Individual comparisons are excluded from the first release.

## Small-sample and comparison rules

1. Always display the eligible denominator beside a rate.
2. When a comparison group has fewer than 10 eligible handoffs, show `Insufficient volume for comparison` instead of a comparative rate or rank.
3. Counts may still appear when authorized and privacy-safe, because they lead to record-level action.
4. Do not display red/green performance judgments based solely on a percentage.
5. Do not compare departments until routing completeness and the metric denominator pass validation.
6. Do not compare periods with different definitions without showing a definition-change notice.

The threshold of 10 is a provisional product-safety rule, not a statistical claim. Revisit it with approved privacy policy and baseline data.

## Targets and baselines

1. The approved one-business-day response rule is a workflow deadline, not an employee ranking score.
2. Do not set target percentages for response completion, closed-loop updates, progression, appointments, wins, or declines from fictional prototype data.
3. After an authorized pilot produces 30 to 60 days of trustworthy activity, calculate a baseline by eligible department pair and sample size.
4. Review routing quality, missing data, and workflow adoption before interpreting the baseline as performance.
5. Any future target requires an approved owner, effective date, review date, scope, and versioned definition.
6. Historical results keep the definition and target version active when they were recorded; later changes do not rewrite them.

## Attribution rules

1. Preserve the original sender and sending department at submission time.
2. Preserve the original requested recipient and department.
3. Record every authorized reassignment without rewriting history.
4. Credit a response to the authenticated actor who made it.
5. Attribute a structured update to its authenticated actor and current owner at the time.
6. Never infer credit from notification delivery, record viewing, or a Dynamics match alone.
7. A declined handoff with a reason counts as a completed first response but not as qualified progression.
8. An appointment is an intermediate milestone, not a final closed-loop outcome.

## Data freshness and failure behavior

1. Show `Last updated` on every detailed insight view.
2. Territory Desk workflow metrics should reflect the last successful application refresh.
3. Future Dynamics-backed outcomes must show their separate source refresh time.
4. If one metric fails, keep other validated metrics available and label the failure.
5. If source data is stale, preserve the last validated value with a stale label; do not silently display it as current.
6. If the denominator or definition cannot be verified, show `Metric unavailable` and the reason.
7. No insight calculation may guess missing ownership, timestamps, or outcomes.

## Anti-gaming rules

1. Raw leads sent is context only, never the primary success measure.
2. A notification delivery or view does not count as a meaningful response.
3. A reschedule without completed progress does not improve closed-loop completion.
4. Duplicate records are excluded only through an auditable duplicate-resolution event.
5. Reopening or changing a final outcome preserves the prior outcome history.
6. Managers cannot edit a historical metric result directly; they correct the source event through an auditable workflow.
7. No customer-value, revenue, or employee-ranking score is inferred from incomplete data.

## Prototype display rules

1. Use fictional people, companies, handoffs, and outcomes.
2. Label the detailed view `Demo data`.
3. Provide enough fictional records to exercise success, missed-target, declined, information-request, routing-exception, and insufficient-sample states.
4. Every insight card links to its supporting fictional records.
5. Metric definitions are available from an `About this metric` control.

## Validation checklist

1. Recalculate each displayed numerator and denominator from fixture events.
2. Verify boundary cases at the exact response-target timestamp.
3. Verify timezone and business-day handling.
4. Confirm declined handoffs count as responded but not progressed.
5. Confirm views and delivery events do not count as responses.
6. Confirm missing next actions appear in Open Loops.
7. Confirm rescheduling alone does not count as completed progress.
8. Confirm unauthorized users cannot access supporting records through insight links.
9. Confirm a denominator below 10 suppresses comparison, not record-level action counts.
10. Confirm missing or stale data produces an explicit state rather than a guessed value.
11. Confirm no raw-volume leaderboard or individual ranking is rendered.
12. Reconcile future Dynamics-backed outcomes before enabling production outcome metrics.
13. Confirm fictional prototype percentages are labeled as demo values and are not presented as targets.

## Step 2.4 acceptance checklist

- [x] Two initial primary workflow KPIs are approved.
- [x] The future outcome KPI remains gated behind Dynamics validation.
- [x] Representative insights are personal, actionable, and limited to three mobile items.
- [x] Managers retain My Work and receive a separate role-controlled Team Insights view.
- [x] Manager insights remain within approved team scope.
- [x] Individual and raw-volume leaderboards are excluded.
- [x] Every rate includes its denominator, exclusions, definition, and refresh time.
- [x] Small-sample comparisons are suppressed.
- [x] Every insight links to accessible supporting records.
- [x] Routing and measurement-quality guardrails are visible.
- [x] Missing data fails explicitly instead of being guessed.
