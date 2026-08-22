# Testing Checklist

## Repository safety

- [ ] Original repository remains unchanged.
- [ ] New repository has no original remote or history.
- [ ] Secrets and environment files are ignored.
- [ ] Only fictional business data is present.

## Territory lookup

- [ ] Responsible representative can be found in under 15 seconds.
- [ ] At least 95% of tested searches return a result or clear exception.
- [ ] ZIP and city inputs normalize safely.
- [ ] Missing and duplicate assignments show actionable exceptions.
- [ ] Multi-representative routing groups never select an owner silently.
- [ ] ZIP city aliases resolve without creating duplicate territory records.
- [ ] Representative contact conflicts require data-owner resolution.

## Lead handoff

- [ ] Complete handoff can be submitted in under 60 seconds.
- [ ] Sender, departments, recipient, owner, and status are always visible.
- [ ] Invalid status transitions are rejected.
- [ ] Decline requires a reason.
- [ ] Weak-connection retry does not duplicate a handoff.
- [ ] Sender sees every recipient response and progress update.

## Notifications

- [ ] New handoff creates an unread in-app notification.
- [ ] Simulated SMS attempt is recorded.
- [ ] SMS preview contains no sensitive customer details.
- [ ] Delivery does not count as authenticated viewing.
- [ ] Opening the handoff records `viewed` once.
- [ ] Failure and retry states are visible and safe.

## Response target

- [ ] One-business-day target measures the first meaningful response.
- [ ] Missed target displays `Needs Attention`.
- [ ] Missed target does not auto-decline, penalize, or reassign.
- [ ] Target remains configurable.

## Mobile and accessibility

- [ ] No mobile screen scrolls horizontally.
- [ ] Touch targets are usable on a smartphone.
- [ ] Text remains readable outdoors and at supported zoom levels.
- [ ] Core workflows work with keyboard navigation.
- [ ] Controls have accessible names and visible focus.
- [ ] Status does not rely on color alone.

## Manager visibility

- [ ] Managers can identify stalled handoffs.
- [ ] Reassignment is restricted to authorized users.
- [ ] Insights balance volume with quality and outcomes.
- [ ] General calls and visits do not displace collaboration actions.

## Acceptance

- [ ] At least 90% of test users complete the core handoff without assistance.
- [ ] Sender and recipient can state the current owner, status, and next action.
- [ ] No disconnected duplicate of an existing Dynamics record is created.
