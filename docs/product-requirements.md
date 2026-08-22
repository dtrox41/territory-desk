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

The recipient should provide the first meaningful response within one business day. Missing the target marks the handoff `Needs Attention`; it does not automatically penalize, decline, or reassign it.

## Data and integration boundary

1. Prototype records are fictional.
2. Dynamics 365 remains authoritative for records that already live there.
3. Real integration uses a service adapter after the Dynamics environment and permissions are confirmed.
4. The app may own collaboration metadata that Dynamics does not own, subject to approval.
5. Sensitive details do not appear in SMS previews.
