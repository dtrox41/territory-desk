# Global Navigation Specification

Status: Approved for Step 2.1

## Navigation objective

The navigation must let a field representative reach the core cross-department workflow with one tap while keeping notifications and current ownership visible. It must use the same mental model on a smartphone and company laptop.

## Recommended mobile structure

### Persistent top bar

The top bar remains visible while scrolling on primary screens.

Left to right:

1. Profile and secondary-menu button.
2. Text identity: `Territory Desk`.
3. Notification bell with unread count.

Rules:

1. Do not use the official corporate logo until authorized.
2. The bell appears on every authenticated primary and detail screen.
3. The top bar may become a compact detail header with a Back control and screen title on nested pages.
4. The top bar must not cover content when the phone text size is enlarged.

### Persistent bottom navigation

Use five labeled destinations:

1. **Home** — prioritized actions, unread handoffs, waiting-on-others items, lead-derived follow-ups, and recent outcomes.
2. **Territory** — ZIP/city lookup and department routing.
3. **Send Lead** — visually prominent primary action in the center.
4. **Leads** — received, sent, needs-information, in-progress, and completed handoffs.
5. **Directory** — representatives, departments, territories, and approved contact actions.

Why this replaces the earlier proposal:

1. Lead-derived follow-ups belong inside Home and Leads rather than requiring a separate global destination.
2. Activity history belongs inside each lead rather than as a disconnected global list.
3. General visits were removed from first-release scope and must not appear in navigation.
4. Directory access is core to cross-department collaboration and deserves a primary destination.

### Secondary menu

The profile/menu button opens:

1. My Profile.
2. Manager Insights, shown only to authorized managers.
3. Data Status.
4. Help and Feedback.
5. Sign Out.

Settings that are not yet functional must not appear as dead menu items.

## Route model

| Destination | Route | Purpose |
| --- | --- | --- |
| Home | `/` | Current actions and collaboration summary |
| Territory | `/territory` | Territory search and results |
| Send Lead | `/leads/new` | Structured handoff creation |
| Leads | `/leads` | Received, sent, and status-filtered handoffs |
| Lead Detail | `/leads/:leadId` | Ownership, response, progress, activity, and outcome |
| Directory | `/directory` | Representative discovery |
| Notifications | `/notifications` | Complete notification history |
| Manager Insights | `/insights` | Authorized cross-department oversight |
| Data Status | `/data-status` | Territory version, refresh date, and known exceptions |
| Help | `/help` | Guidance and feedback entry point |
| Profile | `/profile` | Identity and approved notification preferences |

## Active-state rules

1. Active navigation uses icon, text, and a visible indicator; color is never the only signal.
2. The active destination includes `aria-current="page"` for assistive technology.
3. Nested lead routes keep **Leads** active.
4. `/leads/new` keeps **Send Lead** active.
5. Territory results keep **Territory** active.
6. Manager Insights is highlighted in the secondary menu or desktop rail when active.
7. Focus and active states are visually distinct.

## Notification and action counts

Use two different counts with different meanings:

1. The top-bar bell counts unread notification events.
2. The Leads destination counts handoffs requiring the current user’s action.

Rules:

1. Counts display `99+` when larger than 99.
2. Opening the notification center does not mark everything read automatically.
3. A notification becomes read when its item is opened or the user explicitly selects Mark Read.
4. SMS delivery never changes the in-app unread or viewed state.
5. Accessible labels announce the meaning, such as `3 unread notifications` or `2 leads require action`.
6. Zero counts are hidden visually but remain semantically unambiguous.

## Back-button behavior

1. Browser and device Back returns to the prior in-app screen when history exists.
2. Returning from a lead preserves the Leads filter, sort, and scroll position for the current session.
3. A directly opened lead link falls back to `/leads` when no in-app history exists.
4. A directly opened territory result falls back to `/territory`.
5. Closing the secondary menu returns focus to the button that opened it.
6. Back navigation must never submit, accept, decline, or reassign a lead.

## Unfinished-form protection

When a user tries to leave a changed but unsaved lead form, show three clear choices:

1. **Stay and Continue** — closes the warning and returns to the form.
2. **Save Draft** — saves through the approved authenticated draft service when available.
3. **Discard Draft** — requires confirmation and then leaves the form.

Prototype and production rules:

1. Fictional prototype drafts may be retained only for the active browser session.
2. Do not store real customer or opportunity details in persistent browser `localStorage` on a personal phone.
3. Production drafts should be saved server-side after authentication and security approval.
4. A brief connection interruption keeps the current in-memory form intact.
5. Submission uses an idempotency identifier so retry cannot create a duplicate handoff.
6. A clean, unchanged form exits without a warning.

## Desktop and laptop structure

Use a persistent left navigation rail with the same order and labels as mobile:

1. Home.
2. Territory.
3. Send Lead.
4. Leads.
5. Directory.

Below the primary destinations:

1. Manager Insights when authorized.
2. Data Status.
3. Help.

The desktop top bar contains the current page title, notification bell, and profile control. The content layout may become wider or multi-column, but routes, wording, icons, status meanings, and permissions remain consistent with mobile.

## Accessibility and field-use requirements

1. Primary controls meet a minimum 44-by-44 CSS-pixel target.
2. Every icon has a visible text label in primary navigation.
3. Keyboard users can reach navigation in a predictable order and use a Skip to Content link.
4. Visible focus is never removed.
5. Navigation works at 200% text zoom without hiding actions.
6. Safe-area spacing prevents mobile browser and device controls from covering the bottom navigation.
7. Status and active state never rely on color alone.
8. Outdoor contrast meets WCAG AA requirements.

## Permission behavior

1. Unauthorized destinations are omitted rather than shown as broken links.
2. Direct navigation to an unauthorized route shows a clear access message and a safe return path.
3. Manager access adds Insights; it does not replace the representative navigation model.
4. Sign Out clears session-only fictional drafts and returns to the approved sign-in screen.

## Step 2.1 acceptance checklist

- [x] Mobile top and bottom navigation are approved.
- [x] Primary destinations and labels are approved.
- [x] Visits are absent from the global navigation.
- [x] Notification and action counts have distinct meanings.
- [x] Back behavior is defined for lists, details, and direct links.
- [x] Unsaved forms cannot be lost silently.
- [x] Desktop navigation preserves the mobile mental model.
- [x] Manager-only navigation is permission-controlled.
- [x] Accessibility requirements are testable.
