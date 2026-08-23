# Product Requirements

## Objective

Territory Desk enables New Business Sales Representatives in different departments to find one another, exchange qualified cross-department leads, provide a timely response, coordinate the next action, and close the communication loop.

## Primary workflow

1. Search by ZIP code, city, service line, department, or representative.
2. Verify the correct receiving representative.
3. Create a structured cross-department handoff.
4. Save the handoff as `Pending Acceptance`.
5. Generate an in-app notification and simulated SMS event.
6. Record authenticated viewing separately from notification delivery.
7. Require `Accept`, `Need Information`, or `Decline`.
8. Transfer ownership after acceptance.
9. Create lead-derived follow-ups and record progress.
10. Return activities, feedback, appointments, and outcomes to the sender.

## First-release capabilities

1. Responsive mobile-first dashboard and laptop layout.
2. Territory lookup by ZIP code and city.
3. Territory results grouped by department or service line.
4. Representative directory.
5. Structured lead creation.
6. Lead status, ownership, and immutable activity history.
7. Lead-derived follow-ups.
8. Action Required inbox.
9. Notifications with unread counts.
10. Provider-neutral SMS simulation.
11. Waiting-on-others and recent-feedback views.
12. Actionable manager collaboration insights.

## Home dashboard priority

The home dashboard prioritizes a unified Action Required queue, then Waiting on Others, Recent Feedback and Outcomes, and permission-appropriate collaboration insights. New handoffs and lead-derived follow-ups are filterable categories inside Action Required rather than duplicated as separate large mobile cards.

## Explicit exclusions for the initial release

1. General daily call planner.
2. General customer-visit planner.
3. Route optimization or GPS tracking.
4. Real-time chat.
5. AI-written sales messages.
6. Full CRM replacement.
7. Raw-volume leaderboards.
8. Full offline CRM synchronization.
9. Paid carrier SMS.
10. Real business data before authorization.

## Ownership rules

1. Pending handoffs retain a sending representative and requested recipient.
2. Acceptance transfers current ownership to the recipient.
3. `Need Information` returns a required question to the sender without closing the handoff.
4. Decline requires a reason and returns responsibility to the sender.
5. Managers may perform authorized reassignment.
6. Every transition records actor and timestamp.

## Response target

The recipient should provide the first meaningful response by the end of the next business day in the recipient’s approved local timezone. Missing the target marks the handoff `Needs Attention`; it does not automatically penalize, decline, or reassign it.

`Viewed` is not a meaningful response. `Accept`, `Need Information`, and `Decline` satisfy the first-response target.

## Collaboration measurement

The initial workflow KPIs are first-response target completion and closed-loop update completion. Qualified progression remains a gated outcome KPI until Dynamics mapping and attribution are validated.

Insights must be actionable, link to accessible supporting records, display their eligible denominator and freshness, and avoid individual or raw-volume leaderboards. Missing or ambiguous evidence produces an explicit unavailable state rather than a guessed result.

## Territory lookup

Lookup supports five-digit ZIP, ZIP+4, city, and city-state searches. City-only searches must resolve to an exact ZIP before lead submission whenever the matching ZIPs have different assignments. Ambiguous, open, missing, or conflicting assignments cannot be routed automatically.

The primary successful action is Send Lead, which prefills verified routing context into the structured handoff form. Direct call, email, and text actions remain contact utilities and do not count as tracked handoffs.

## Representative directory

The Directory supports teammate discovery by name, department, exact division, location, and state or approved region. Representatives are keyed by stable identifiers rather than display names, and contacts are permission controlled.

Starting Send Lead from Directory preselects a person but does not bypass routing. The requested service and customer ZIP must validate against the current territory assignment before submission; mismatches and exceptions remain explicit.

## Lead creation

Each submitted handoff has one requested department and one accountable recipient. The authenticated sender, validated territory context, customer need, and response target are recorded before privacy-safe in-app and simulated-SMS notification attempts begin.

Lead creation uses Route, Customer, Opportunity, and Review & Send steps. It supports incomplete contact availability without fabricated data, warns about possible duplicates, and uses idempotent server submission so retries cannot create duplicate handoffs.

## Lead status and ownership

Handoff status, current owner, required-action owner, attention state, response target, view state, notification state, and outcome source are separate. Before acceptance the sender owns the record while the requested recipient owes the response; acceptance atomically transfers ownership to the recipient.

Only approved state transitions are allowed. Need Information, Decline, withdrawal, manager reassignment, progress, appointments, outcomes, corrections, and future Dynamics reconciliation preserve immutable history and use explicit permissions and reasons.

## Data and integration boundary

1. Prototype records are fictional.
2. Dynamics 365 remains authoritative for records that already live there.
3. Real integration uses a service adapter after the Dynamics environment and permissions are confirmed.
4. The app may own collaboration metadata that Dynamics does not own, subject to approval.
5. Sensitive details do not appear in SMS previews.
