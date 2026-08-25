# Leads List Specification

Status: Approved for Step 2.11a

Route: `/leads`

## Objective

Give each representative one permission-safe place to find peer handoffs by responsibility and lifecycle without mixing notification counts, duplicating Action Required items, or forcing the user to scan every record for the next commitment.

The default view answers `Which leads require my action?` Other views provide sent, received, waiting, active, and completed history.

## Personal versus manager scope

1. `/leads` is the authenticated user's **My Work** list.
2. A manager who also works leads sees their own records under the same definitions.
3. Team-wide oversight remains in `/insights` and its authorized drill-downs.
4. A manager role does not silently add every team record to the personal list.
5. Links from Manager Insights may open an authorized team record, but Back returns to the manager's prior Insights context.

## View selector

Use one clearly labeled `View` control on mobile and an equivalent visible list or tab set on laptop:

1. **Action Required** — default.
2. **Waiting on Others**.
3. **Received**.
4. **Sent**.
5. **In Progress**.
6. **Completed**.

Do not place six cramped equal-width tabs across a smartphone. The selected view and count remain visible without relying on horizontal scrolling.

## View definitions

### Action Required

Include open handoffs for which `requiredActionOwnerId` is the current user and an approved action exists.

Examples:

1. Respond to a new handoff.
2. Review information supplied by the sender.
3. Supply requested information.
4. Complete or reschedule an overdue or due-today follow-up.
5. Add a missing next action.
6. Acknowledge reassignment.

Rules:

1. One handoff creates at most one visible item for the current user.
2. Use the approved deterministic Action Required ranking and explanations.
3. Closed handoffs appear only when an approved correction action is outstanding.
4. The Leads navigation badge equals this view's current count, not unread notifications.

### Waiting on Others

Include open handoffs sent by the current user where another identified participant owes the response, information review, follow-up, or progress update.

Rules:

1. Exclude actions currently owed by the sender.
2. Show who owes the next action and the permitted due context.
3. Do not encourage duplicate off-platform chasing before the approved target.
4. A missed target may offer **Open Lead**; escalation remains an approved manager workflow rather than a public pressure button.
5. Closed handoffs leave this view and remain in Sent and Completed.

### Received

Include handoffs received from another representative when the current user is or was the requested recipient or accepted owner.

Rules:

1. Include open and closed history.
2. Exclude self-created same-person records.
3. Preserve a reassigned-away handoff in history with `Reassigned` context when the user previously owned it.
4. Action badges remain visible but ordering follows the Received view, not Action Required ranking.

### Sent

Include every handoff whose immutable `senderId` is the current user.

Rules:

1. Include pending, accepted, declined, withdrawn, active, and final outcomes.
2. Show requested and current recipient context when permission allows.
3. A reassignment never removes the record from Sent.
4. Revised and another-department handoffs show their linked relationship without collapsing separate accountability.

### In Progress

Include handoffs currently owned by the user with status `accepted`, `in_progress`, or `appointment_set`.

Rules:

1. Exclude pending acceptance, needs information before acceptance, and terminal records.
2. Show current primary follow-up and next-action state.
3. Missing next action remains visible and links to creation.
4. A future follow-up is visible even when no action is due today.

### Completed

Include authorized handoffs involving the current user with terminal status:

1. Declined.
2. Withdrawn.
3. Won.
4. Lost.
5. Closed — Not Qualified.

Rules:

1. Label prototype outcomes as demo data.
2. Show the closing actor, timestamp, and approved reason or source summary.
3. Reopened records leave Completed and return to the correct open view while history remains intact.
4. No completed record can be deleted or hidden merely to improve counts.

## Mobile layout

Display in this order:

1. Compact page title: `Leads`.
2. Selected view with count.
3. Search control.
4. **Filters** button with active-filter count.
5. Applied-filter chips with individual removal.
6. Sort explanation when not obvious, such as `Ranked by required action`.
7. Lead cards.
8. Progressive-load control or end-of-results message.

Bottom navigation remains visible with safe-area spacing. List controls must not push the first result excessively below the fold.

## Laptop layout

1. Persistent left app navigation.
2. Secondary leads-view list or tabs in the content area.
3. Search, filters, and result count in one toolbar.
4. Wider rows may show more routing and timing context.
5. Optional preview panel may appear only if the canonical Lead Detail route, browser history, focus, and direct links remain correct.
6. Reading and keyboard order match the mobile mental model.

## Search

Search only records the current user is authorized to access by:

1. Company or organization name.
2. Handoff reference.
3. Sender display name.
4. Requested recipient or current-owner display name.

Do not search free-text customer needs, internal details, phone, email, or street address in the first release.

Rules:

1. Search applies within the selected view and active filters.
2. Debounce remote requests and ignore obsolete responses.
3. Preserve the search in active session state, not the URL, because it may contain a customer or employee name.
4. Do not log raw search text in analytics or client errors.
5. Clearing search restores the prior filters and selected view.
6. No-result search never reveals that an inaccessible record exists.

## Filters

Mobile uses a modal sheet or full-screen filter panel. Laptop may use a sidebar or popover.

Approved filters:

1. Department or service display group.
2. Exact source division.
3. Handoff status.
4. Attention state.
5. Direction: sent or received, only where meaningful.
6. Updated period: 7 days, 30 days, 90 days, or custom approved date range.
7. Has routing or data exception.

Rules:

1. Show only filters relevant to the selected view.
2. Display the number of active filters.
3. **Apply Filters** confirms mobile changes; **Cancel** makes none.
4. **Clear All** requires no confirmation because it changes only the view.
5. Non-sensitive filter identifiers and selected view may appear in the URL for Back and shareable navigation.
6. Customer or person search text never appears in the URL.
7. Filters never broaden access.

## Sort rules

### Action Required

Use `docs/action-ranking-spec.md`, including deterministic tie-breaking and visible ranking reason.

### Waiting on Others

1. `needs_attention` first.
2. Earliest missed or upcoming due timestamp.
3. Oldest required-action timestamp.
4. Stable handoff identifier.

### Received and Sent

1. Newest material collaboration update first.
2. Then creation timestamp.
3. Then stable handoff identifier.

Routine notification-delivery attempts do not count as a material update and cannot keep an old handoff artificially at the top.

### In Progress

1. Overdue primary follow-up.
2. Due-today primary follow-up.
3. Missing next action.
4. Earliest future primary follow-up.
5. Most recent material update.
6. Stable handoff identifier.

### Completed

1. Newest terminal timestamp first.
2. Then most recent correction timestamp.
3. Then stable handoff identifier.

Users may choose only approved alternate sorts for non-action views, such as oldest update or company name. Action Required never permits a sort that hides the approved priority order.

## Lead card

Show only the context needed to choose the next action:

1. Attention or required-action label.
2. Company or organization name.
3. Handoff status.
4. Requested department or service.
5. Direction and participant context, such as `From Jordan · Facility Services` or `To Casey · First Aid & Safety`.
6. Current owner when different from requested recipient and relevant.
7. Required action or primary follow-up.
8. Due or elapsed timing with exact timestamp available.
9. Latest material feedback summary.
10. Primary action.
11. Secondary **Open Lead** only when the primary action is different.

Do not show customer phone, email, street address, full opportunity notes, or raw notification errors on a list card.

## Per-view primary actions

### Action Required

Use the approved action for the current ranked reason:

1. Review Lead.
2. Respond.
3. Review Information.
4. Provide Information.
5. Complete Follow-Up.
6. Add Next Action.
7. Review Assignment.

Consequential Accept, Decline, Withdraw, Reassign, or final-outcome commands occur on Lead Detail or their explicit review flow—not as an accidental one-tap list action.

### Other views

Primary action is **Open Lead**. Contextual secondary actions such as **Create Next Action** may appear only when authorized and when they cannot bypass the approved workflow.

## No bulk or swipe actions

The first release excludes:

1. Bulk Accept.
2. Bulk Decline.
3. Bulk Complete.
4. Bulk Reassign.
5. Swipe-to-complete, decline, or delete.

These actions carry different customer context, reasons, owners, and audit requirements. Mobile swipe may reveal **Open Lead** but cannot be the only accessible control.

## Card interaction and focus

1. Selecting the card body opens `/leads/:leadId`.
2. Primary buttons use the approved explicit action.
3. Opening a card may mark a related notification read and record authenticated view when applicable; it does not complete the required action.
4. Back restores selected view, non-sensitive filters, search for the active session, loaded page range, scroll position, and originating-card focus.
5. Opening a notification-linked lead and returning follows the notification history context instead.
6. A direct link rechecks permission and uses `/leads` as the safe fallback.

## Counts

1. Each view count uses that view's exact inclusion definition.
2. A handoff may appear in several historical views because views are lenses, but only once within one view.
3. The Leads navigation badge equals Action Required count.
4. The notification bell equals unread notification-event count.
5. Filtered result count is displayed separately and never replaces the full view count silently.
6. Counts larger than 99 use `99+` only in compact badges; the list header shows the authorized exact count when available.
7. A failed count displays unavailable state, not zero.

## Pagination and live updates

1. Load 20 cards initially on mobile and an appropriate equivalent on laptop.
2. Use stable cursor pagination to avoid duplicates when records change.
3. **Load More** is the accessible baseline; automatic infinite loading may enhance it but cannot remove keyboard access.
4. New or reordered items arriving while the user reads do not unexpectedly move the list.
5. Show `New updates available` with an explicit **Refresh List** action.
6. Refresh preserves selected view and filters, then restores focus predictably.
7. A completed action updates or removes its card without moving focus to an unrelated item.

## Empty states

### Action Required

`You're caught up. New lead actions will appear here.`

Actions: **Find Territory** and **View Waiting on Others**.

### Waiting on Others

`No sent handoffs are waiting on another representative.`

Actions: **Send Lead** and **View Sent**.

### Received

`No peer handoffs have been received yet.`

Action: **Open Directory**.

### Sent

`You have not sent a peer handoff yet.`

Actions: **Find Territory** and **Send Lead**.

### In Progress

`You do not own an active accepted handoff.`

Action: **View Received**.

### Completed

`Completed peer-handoff outcomes will appear here.`

Action: **View In Progress**.

### Filtered or searched no result

`No leads match the current search and filters.`

Actions: **Clear Search** and **Clear Filters**. Do not use a new-lead sales prompt when records may simply be filtered out.

## Loading states

1. Render app shell, title, and selected view immediately.
2. Show stable skeleton cards matching final dimensions.
3. Do not display zero counts during loading.
4. Changing views or filters preserves the toolbar and shows localized result loading.
5. Loading more preserves existing cards.
6. Screen readers receive one concise loading announcement, not one per skeleton.

## Error states

### Initial-list failure

Show `Leads could not be loaded` with **Retry** and safe navigation to Home. Do not render cached records without a stale label.

### Count failure

Show `Count unavailable`; do not substitute zero.

### Load-more failure

Keep existing cards and show an inline **Retry Loading More** control.

### Record changed

If an action fails because the lead changed, keep the card, show the current safe summary, and require re-review.

### Unauthorized record

Remove inaccessible cached content immediately, show no record details, and provide a safe return to the current list.

### Partial-data card

Show available safe fields plus `Some lead details are unavailable`. Disable only actions whose required data cannot be validated.

## Stale and offline behavior

Territory Desk remains online-first:

1. Keep the last successful authorized list visible with `Last updated` and stale or offline label.
2. Disable consequential writes that require current server validation.
3. Allow opening already loaded authorized fictional prototype detail during the active session.
4. Do not load uncached real records offline.
5. Retry preserves selected view, filters, and search.
6. Never persist real list cards, company names, participant names, or customer context in browser local storage on a personal phone.

## Privacy and security

1. Every query, count, card, and action is permission filtered server-side.
2. A total count cannot reveal inaccessible records.
3. Search does not expose inaccessible matches or raw query text to analytics.
4. Customer and participant search text remains outside URLs.
5. Page metadata and browser previews do not contain customer names or lead summaries.
6. No real lead list data enters GitHub or a public prototype bundle.
7. Client-disabled actions are not authorization controls.
8. Sign Out clears active-session search, filters containing sensitive values, cached list cards, and fictional drafts.

## Analytics events

Use fictional or non-sensitive identifiers only:

1. `leads_view_opened` with approved view key.
2. `leads_filter_applied` with non-sensitive filter keys.
3. `lead_card_opened` with fictional or opaque identifier.
4. `lead_primary_action_selected` with action type.
5. `leads_page_loaded` with page number or cursor category, not raw cursor.
6. `leads_error_shown` with safe error category.

Exclude company names, participant names, search text, customer details, notes, exact handoff content, and contact information.

## Accessibility requirements

1. View selector has a persistent label and announces count.
2. Search and filters have persistent labels and selected-state announcements.
3. Cards use semantic headings and do not become one inaccessible nested button.
4. Card body and explicit actions have distinct focus targets.
5. Status, attention, direction, and due state use text, not color alone.
6. Relative time exposes exact date, time, and timezone.
7. Result-count, refresh, removal, and error changes are announced without excessive repetition.
8. Back restores focus to the originating card.
9. Load More is keyboard and screen-reader accessible.
10. Controls meet 44-by-44 CSS-pixel minimum targets and the list works at 200% text zoom.

## Required fictional prototype scenarios

1. Each of the six views with mixed statuses.
2. One handoff eligible for several views but appearing once within each.
3. Every Action Required reason and primary action.
4. Waiting within target and waiting past target.
5. Received handoff reassigned away.
6. Sent handoff reassigned to a different recipient.
7. In-progress overdue, due-today, missing-action, and future-action order.
8. Completed outcome reopened.
9. Search by company, reference, sender, and recipient.
10. Relevant and irrelevant filters by view.
11. Empty, filtered-empty, loading, partial, error, stale, and offline states.
12. Pagination with new updates arriving.
13. Action completion with stable focus.
14. Direct link, Back restoration, and notification-origin return.
15. Manager My Work separated from Team Insights.
16. Unauthorized record and count protection.
17. Keyboard, screen-reader, touch-target, and large-text behavior.

## Step 2.11a acceptance checklist

- [x] My Work and Manager Insights scopes remain separate.
- [x] Six view definitions and counts are approved.
- [x] Search fields, privacy behavior, filters, and sorting are approved.
- [x] Card content and per-view primary actions are approved.
- [x] Action Required uses the canonical ranking and never duplicates a handoff.
- [x] No bulk or destructive swipe actions are included.
- [x] Back, direct-link, focus, pagination, and live-update behavior are approved.
- [x] Empty, loading, error, partial, stale, offline, unauthorized, and success behavior are defined.
- [x] Count meanings remain distinct from notification unread counts.
- [x] Analytics exclude customer, participant, search, and lead content.
- [x] Privacy, authorization, accessibility, and prototype scenarios are approved.
