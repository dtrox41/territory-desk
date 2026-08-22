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

## Global navigation

- [ ] Mobile top bar and five-destination bottom navigation remain usable while scrolling.
- [ ] Home, Territory, Send Lead, Leads, and Directory use visible labels.
- [ ] General Visits and Calls do not appear as global destinations.
- [ ] Nested routes preserve the correct active destination.
- [ ] Notification count and action-required lead count have distinct meanings.
- [ ] Back navigation restores list filters and scroll position.
- [ ] Direct links have a safe fallback destination.
- [ ] Changed lead forms cannot be abandoned without an explicit choice.
- [ ] Real lead drafts are not persisted in browser local storage.
- [ ] Desktop navigation preserves mobile wording, order, and permissions.
- [ ] Unauthorized destinations are omitted and direct unauthorized routes fail safely.

## Home dashboard

- [ ] Dashboard identifies the next required cross-department action first.
- [ ] Send Lead and Find Territory appear near the top.
- [ ] Summary counts match their documented definitions.
- [ ] Action Required contains no duplicate handoffs.
- [ ] Ranking reason is visible and explainable.
- [ ] One-business-day breaches rank ahead of lower-priority items.
- [ ] General calls and visits do not appear.
- [ ] Waiting on Others excludes actions currently owed by the sender.
- [ ] Recent Feedback excludes routine delivery-only events.
- [ ] Insights link to supporting records and avoid volume-only rankings.
- [ ] Mobile item limits prevent an endless home screen.
- [ ] Loading skeletons do not cause layout shift.
- [ ] A block-level error does not blank other dashboard blocks.
- [ ] Offline or stale state shows the last successful refresh time.
- [ ] Dashboard analytics contain fictional IDs only and no lead details.

## Manager visibility

- [ ] Managers can identify stalled handoffs.
- [ ] Reassignment is restricted to authorized users.
- [ ] Insights balance volume with quality and outcomes.
- [ ] General calls and visits do not displace collaboration actions.

## Acceptance

- [ ] At least 90% of test users complete the core handoff without assistance.
- [ ] Sender and recipient can state the current owner, status, and next action.
- [ ] No disconnected duplicate of an existing Dynamics record is created.
