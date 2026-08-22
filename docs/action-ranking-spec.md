# Lead Action Required Ranking Specification

Status: Approved for Step 2.3

## Objective

The Action Required queue presents the current user’s most important cross-department lead action first. Ranking must be deterministic, explainable, resistant to gaming, and based only on approved workflow facts.

The queue does not predict revenue, customer value, or employee performance.

## Action-item eligibility

An item appears only when the authenticated user owns a required action.

Eligible actions:

1. Respond to a new handoff.
2. Respond after the sender supplied requested information.
3. Complete or reschedule a lead-derived follow-up.
4. Add a next action to an accepted lead.
5. Acknowledge a manager-authorized reassignment.

Not eligible:

1. General calls, visits, or personal tasks.
2. Completed, lost, won, or closed-not-qualified leads with no required update.
3. Notification delivery events.
4. Tasks owned by another representative.
5. Items the current user cannot access.

## One action item per handoff

The queue shows at most one item for a handoff and user at a time.

If several conditions apply, display the highest-ranked required action and preserve the other conditions in the lead detail. This prevents the same handoff from appearing multiple times as unread, overdue, and missing a next action.

## Recommended priority order

| Rank | Action condition | Visible reason | Primary action |
| ---: | --- | --- | --- |
| 1 | First-response target missed | Response target missed | Respond Now |
| 2 | Lead-derived follow-up overdue | Follow-up overdue | Complete Follow-Up |
| 3 | Sender supplied requested information | Information received | Review Information |
| 4 | New handoff not viewed | New lead | Review Lead |
| 5 | Handoff viewed but no first response | Response needed | Respond |
| 6 | Lead-derived follow-up due today | Follow-up due today | Open Follow-Up |
| 7 | Accepted lead has no next action | Next action missing | Add Next Action |
| 8 | Authorized reassignment needs acknowledgment | Reassignment pending | Review Assignment |

Rules:

1. Rank is categorical; scores are not added together.
2. A missed first-response target outranks every lower category.
3. A new unread handoff does not immediately outrank an overdue commitment.
4. Customer size, estimated revenue, sender seniority, department, and raw lead volume do not affect rank.
5. Managers cannot secretly promote an item without creating an auditable approved priority event.

## Tie-breaking

When two items share a category:

1. Earliest due timestamp first when a due timestamp exists.
2. Otherwise, oldest required-action timestamp first.
3. Then oldest handoff creation timestamp.
4. Finally, stable handoff ID for deterministic ordering.

The queue must not reorder identical items randomly between refreshes.

## One-business-day response calculation

### Recommended definition

The recipient’s first meaningful response is due by the end of the next business day in the recipient’s approved local timezone.

Meaningful responses:

1. `Accept`.
2. `Need Information` with a required question or explanation.
3. `Decline` with a required reason.

`Viewed` is not a meaningful response.

### Business-day rules

1. Default business days are Monday through Friday.
2. Default end of business day is 5:00 PM in the recipient’s local timezone.
3. A handoff submitted before 5:00 PM is due at 5:00 PM on the next business day.
4. A handoff submitted at or after 5:00 PM is treated as received on the next business day and is due at 5:00 PM on the following business day.
5. Saturday and Sunday do not count.
6. Company holidays require a future configurable calendar source; they must not be hard-coded into application logic.
7. If timezone is missing, the app uses the approved location timezone and records that fallback.

Examples:

| Sent | Target |
| --- | --- |
| Monday at 10:00 AM | Tuesday at 5:00 PM |
| Friday at 3:00 PM | Monday at 5:00 PM |
| Friday at 6:00 PM | Tuesday at 5:00 PM |

### Target behavior

1. Selecting any meaningful response satisfies the first-response target.
2. `Need Information` creates a new action for the sender but does not keep the recipient’s first-response timer open.
3. Missing the target changes the visible action reason to `Response target missed` and the lead attention state to `Needs Attention`.
4. Missing the target does not automatically penalize, decline, or reassign the lead.
5. A later response remains valid and records the elapsed time.
6. Management may configure the schedule later; changes must be versioned and must not silently rewrite historical results.

## Follow-up timing

1. A follow-up becomes `due today` at the start of its approved due date in the owner’s timezone.
2. It becomes overdue after its due time, or after the configured end of business day when no time was provided.
3. Rescheduling requires a new due date and an audit event.
4. Completing the follow-up removes it from Action Required and records completion.
5. Snoozing without a recorded reschedule is not allowed.

## Accepted leads without a next action

1. Acceptance should request a next action or follow-up.
2. If acceptance completes without one, create a lower-ranked `Next action missing` item.
3. The item clears when an authorized next action is recorded.
4. A general note does not satisfy this requirement unless it contains an approved structured next action.

## Reassignment behavior

1. Only an authorized manager can reassign a handoff.
2. Reassignment records previous owner, new owner, manager, reason, and timestamp.
3. The new owner receives an acknowledgment item.
4. Reassignment does not erase prior response-target history.
5. A manager escalation view may show missed targets, but the representative’s queue remains focused on actions they can complete.

## Card behavior

Each ranked item shows:

1. Visible reason label.
2. Fictional company or opportunity.
3. Sender or relevant actor and department.
4. Current status.
5. Due or elapsed time.
6. Primary action.
7. Open Details secondary action.

Rules:

1. Destructive or consequential decisions such as Decline and Reassign occur in the detail workflow, not as one-tap dashboard actions.
2. Items cannot be dismissed merely to remove them from the queue.
3. Opening an item does not mark the required action complete.
4. Completing an action updates or removes the card without an unexpected focus jump.

## Explainability

Every item exposes a short explanation, for example:

- `Ranked first because the response target was missed.`
- `Ranked because this lead-derived follow-up is overdue.`
- `Ranked because requested information was supplied.`

The system must not expose an unexplained internal score.

## Data failure behavior

1. If a required timestamp is missing, display `Timing unavailable` and place the item below valid timed items in the same category.
2. If current ownership is ambiguous, do not place the item in a personal queue; show a manager-visible routing exception.
3. If status history conflicts, preserve the record and show a data-status exception rather than guessing.
4. If the queue refresh fails, retain the last successful order with a stale-data label.

## Audit events

Record:

1. Action item created.
2. Action reason changed.
3. Response target calculated.
4. Response target missed.
5. Required action completed.
6. Follow-up rescheduled.
7. Ownership reassigned.

Audit events store identifiers, actors, timestamps, and approved reason codes. They do not store credentials or notification secrets.

## Test cases

1. Monday morning handoff receives a Tuesday 5:00 PM target.
2. Friday afternoon handoff receives a Monday 5:00 PM target.
3. Friday evening handoff receives a Tuesday 5:00 PM target.
4. Viewing without responding does not satisfy the target.
5. `Need Information` satisfies the recipient’s first-response target and creates a sender action.
6. A missed target rises above a new unread handoff.
7. An overdue follow-up rises above a new unread handoff but below a missed response target.
8. The same handoff never appears twice for one user.
9. Equal-category items remain stable across refreshes.
10. Missing ownership creates an exception instead of assigning randomly.
11. Completing an action removes or changes the queue item.
12. No ranking changes based on lead value, department, or sender seniority.

## Step 2.3 acceptance checklist

- [x] Eligible and ineligible actions are approved.
- [x] One handoff creates at most one current action item per user.
- [x] Priority order is approved.
- [x] Tie-breaking is deterministic.
- [x] One-business-day calculation is approved.
- [x] `Viewed` does not satisfy the response target.
- [x] Missing a target does not create an automatic penalty or reassignment.
- [x] Follow-up timing and rescheduling are auditable.
- [x] Ranking excludes unapproved value and performance assumptions.
- [x] Every visible rank has an explanation.
- [x] Ambiguous ownership fails safely.
