# Visual Layout and Reusable Component Rules

Status: Approved for Step 4.2

Decision scope: Convert the supplied mobile concept and approved product specifications into reusable smartphone and laptop composition rules. This step defines structure, dimensions, hierarchy, component roles, responsive behavior, and interaction placement. Step 4.3 will formalize the exact color, typography, spacing, radius, shadow, target-size, and motion tokens.

## Recommendation

Use one responsive application shell with:

1. A compact sticky mobile top bar.
2. A persistent five-destination mobile bottom navigation.
3. A persistent laptop navigation rail and compact laptop top bar.
4. One main content region whose layout changes from a single priority column to task-specific two-column compositions.
5. Reusable section headers, cards, rows, icon containers, badges, buttons, forms, overlays, and system states.
6. Mobile DOM and reading order preserved at every width.

The design must feel like a field-work command center, not a decorative corporate homepage and not a dense CRM screen.

## Reference-to-product translation

| Reference-image element | Territory Desk rule | Change required |
| --- | --- | --- |
| Centered corporate logo | Compact real-text `Territory Desk` identity | No screenshot-extracted logo; reduce vertical space |
| Left hamburger | Profile and secondary-menu control | Keep 44-pixel minimum target and visible accessible name |
| Right notification bell | Persistent unread-notification access | Keep count distinct from Leads action count |
| Large personalized greeting | Compact greeting, date, and action-status sentence | Urgent work must remain above the fold |
| Large category cards | Reusable dashboard sections | Sections become Action Required, Waiting on Others, Feedback and Outcomes, and Insights |
| Circular category icons | Shared icon-container pattern | Use one licensed outline family and pair icons with text |
| Numbered rows | Ordered or counted rows only when order has approved meaning | Never imply employee ranking or customer value |
| Filled and outlined action pair | Primary and secondary button hierarchy | Quick actions become Send Lead and Find Territory |
| Fixed bottom action pair | Approved top quick actions plus bottom navigation | Do not create a second permanent bottom action bar |
| General calls and visits | Excluded | Replace with peer-handoff actions and lead-derived follow-ups |

## Responsive tiers

Breakpoints are content behavior thresholds, not device detection:

| Tier | Viewport rule | Shell | Default content behavior |
| --- | --- | --- | --- |
| Compact mobile | Below 400 CSS pixels | Mobile top and bottom bars | Single column; controls stack when two cannot fit |
| Mobile | 400–767 CSS pixels | Mobile top and bottom bars | Single column; two quick actions; 2 × 2 summary |
| Wide mobile/tablet | 768–1023 CSS pixels | Mobile navigation model retained | Wider single column or safe two-column subgrids |
| Laptop | 1024 CSS pixels and above | Left rail plus laptop top bar | Page-specific one- or two-column layout |
| Wide laptop | 1280 CSS pixels and above | Wider rail and bounded content canvas | Stable primary/secondary column ratios; no excessive line length |

Rules:

1. A 1024-pixel media query may switch to the laptop shell only when 200% zoom and large-text tests still preserve navigation.
2. If zoom or available content width makes the rail plus content unsafe, collapse back to the mobile shell behavior.
3. Never detect `iPhone`, `Android`, or laptop user-agent strings to choose layout.
4. Use CSS grid, flexbox, logical properties, `minmax()`, and `clamp()`; avoid device-specific fixed positioning.
5. No core screen scrolls horizontally at 320 CSS pixels.
6. Reading, focus, and screen-reader order remain the approved mobile priority order even when laptop visuals use columns.

## Application-shell measurements

These values are Step 4.2 layout targets. Step 4.3 will assign them to named tokens and adjust them only if contrast, zoom, or device testing justifies a change.

| Element | Mobile target | Laptop target |
| --- | --- | --- |
| Top bar | Minimum 64 px plus top safe area | 64–72 px |
| Detail top bar | Minimum 56 px plus top safe area | 64 px |
| Bottom navigation | 68 px plus bottom safe area | Not shown |
| Left rail | Not shown | 224 px at 1024–1279; 256 px at 1280+ |
| Main inline padding | 16 px compact; 20 px standard mobile | 24 px at 1024; 32 px at 1280+ |
| Main block padding | 16–24 px by tier | 24–32 px |
| Maximum content canvas | Full available width with padding | 1440 px centered within remaining shell |
| Form content width | Full available width | 720 px maximum unless review layout needs an aside |
| Reading-text width | Full available width | Approximately 70 characters maximum |

Do not use these shell heights to clip enlarged text. Each is a minimum height; content may increase the bar height when accessibility settings require it.

## Mobile shell

### Mobile top bar

Use a three-region grid:

1. Left: profile and secondary-menu button.
2. Center: real-text `Territory Desk` identity.
3. Right: notification bell and unread count.

Rules:

1. The left and right regions reserve equal minimum width so the identity remains visually centered.
2. Both controls meet at least 44 × 44 CSS pixels.
3. The bar is sticky at the top with an opaque or sufficiently solid surface; scrolling text cannot reduce contrast behind it.
4. Use a subtle bottom border for separation; do not rely on a heavy floating shadow.
5. Apply `padding-top: env(safe-area-inset-top)` where supported.
6. The title truncates only after preserving both controls; it never overlaps a badge.
7. The unread badge displays `99+` above 99 and has an accessible label with the full meaning.
8. The profile/menu control is not labeled `hamburger`; its accessible name describes the action.
9. On the Notifications screen, the bell remains part of the shell but does not duplicate a second actionable bell in content.

### Compact detail top bar

Nested routes replace the left profile control with Back and the center wordmark with the current page title when needed.

Order:

1. Back.
2. Screen title.
3. Notification bell or approved low-frequency overflow action.

Do not place two competing Back controls. Direct-link fallback behavior follows the approved route contract.

### Mobile bottom navigation

Use five equal destinations:

1. Home.
2. Territory.
3. Send Lead.
4. Leads.
5. Directory.

Rules:

1. Keep it fixed or sticky at the viewport bottom without covering content.
2. Add `env(safe-area-inset-bottom)` beneath the navigation surface.
3. Reserve document padding equal to navigation height plus safe area and at least one spacing unit.
4. Each destination has an icon, visible label, and minimum 44-pixel target.
5. Send Lead receives stronger visual emphasis but remains inside the same navigation geometry; do not use an oversized floating circle.
6. Active state combines text weight, icon treatment, and an indicator; color alone is insufficient.
7. The Leads badge means required actions and remains distinct from the bell unread count.
8. Labels do not disappear on narrow screens.
9. At large text sizes, allow the navigation to grow or use a safe alternate composition; never overlap labels.
10. When a modal sheet or dialog is open, background navigation is inert.

## Laptop shell

### Navigation rail

The rail contains:

1. Territory Desk identity at the top.
2. Home, Territory, Send Lead, Leads, and Directory in mobile order.
3. A clear separator.
4. Manager Insights when authorized.
5. Data Status.
6. Help.
7. Profile and Sign Out near the bottom or in the profile control.

Rules:

1. The rail is persistent only when enough content width remains.
2. Every destination retains visible text; do not collapse to an icon-only rail in the first release.
3. Send Lead is visually prominent without breaking keyboard order.
4. Manager Insights is omitted when unauthorized, not shown disabled.
5. Use one active indicator aligned consistently across primary and secondary destinations.
6. Rail scrolling is independent only when viewport height requires it and never hides Sign Out permanently.

### Laptop top bar

The top bar contains:

1. Current page title and optional concise context.
2. Data freshness or environment label only when relevant.
3. Notification bell.
4. Profile control.

Do not repeat the full product descriptor in every laptop top bar.

### Laptop content grid

Default dashboard and detail split:

```text
┌─────────────────────── shell top bar ───────────────────────┐
│                                                             │
│  primary column: minmax(0, 2fr)  secondary: minmax(320, 1fr)│
│                                                             │
│  full-width lower content when the approved sequence needs it│
└─────────────────────────────────────────────────────────────┘
```

Rules:

1. Use a two-column grid only when both columns remain readable.
2. Collapse the secondary column below the primary column before either becomes cramped.
3. Primary/secondary visual placement never changes the DOM sequence.
4. Do not create a three-column CRM dashboard in the first release.
5. Cap content width so large monitors do not create very long scanning distances.

## Page-frame hierarchy

Every authenticated primary screen follows:

1. Skip link.
2. Application shell navigation.
3. Main landmark.
4. Page heading or compact Home greeting.
5. Optional concise page description or current action summary.
6. Primary page actions.
7. Filters, tabs, or summary when required.
8. Main task content.
9. Supporting content.
10. Safe status or help context.

Only one visible `h1` identifies the current page. Section cards do not each restart the heading hierarchy incorrectly.

## Home composition

### Mobile wireframe

```text
┌─ safe area ───────────────────────┐
│ Menu     Territory Desk     Bell  │
├───────────────────────────────────┤
│ Fictional Prototype notice        │
│ Good morning, [fictional name]    │
│ Date · action-status sentence     │
│ [ Send Lead ] [ Find Territory ]  │
│ [ New ] [ Needs Attention ]       │
│ [ Waiting ] [ Outcomes ]          │
│                                   │
│ Action Required          View All │
│ [highest-priority action card]    │
│ [next action card]                │
│                                   │
│ Waiting on Others        View All │
│ [compact status rows]             │
│                                   │
│ Feedback and Outcomes    View All │
│ [compact event rows]              │
│                                   │
│ Cross-Department Insights         │
│ [up to three useful insights]     │
├───────────────────────────────────┤
│ Home Territory Send Leads Directory│
└─ bottom safe area ────────────────┘
```

### Mobile order and limits

1. Compact greeting and current date.
2. Send Lead and Find Territory.
3. Four-item collaboration summary.
4. Action Required, maximum four visible items.
5. Waiting on Others, maximum three.
6. Feedback and Outcomes, maximum three.
7. Cross-Department Insights, maximum three.

Do not add a large standalone card around every dashboard section. Use a section heading followed by grouped cards or rows so the page does not become layers of nested white rectangles.

### Laptop order

1. Greeting, quick actions, and summary span the content canvas.
2. Action Required uses the larger left column and may show up to eight items.
3. Waiting on Others and Insights use the right column.
4. Feedback and Outcomes spans the appropriate lower width and may show up to six items.
5. Reading and keyboard order remain greeting, actions, summary, Action Required, Waiting, Feedback, Insights.

## Greeting hierarchy

The reference image gives the greeting excessive space. Territory Desk uses:

1. `Good morning, [fictional first name]` or `Welcome back` as the Home `h1`.
2. Weekday and full date as secondary text.
3. One action-oriented sentence such as `3 lead actions need your attention`.

Rules:

1. Keep the entire greeting block compact enough that quick actions and the top of the summary are visible on a common smartphone viewport.
2. Reserve stable loading height to prevent layout shift.
3. Do not show customer or opportunity context.
4. Do not include live clock seconds or continuously changing decorative time.
5. Name failure uses `Welcome back`; never display `undefined`, an email address, or a placeholder token.
6. Manager identity does not replace the user's representative workflow greeting.

## Quick-action group

Mobile shows:

1. Send Lead — filled primary.
2. Find Territory — outlined secondary.

Laptop may add Find Representative as a lower-emphasis tertiary action.

Rules:

1. Use two equal columns when labels fit at 200% zoom.
2. Stack vertically below the safe fit threshold.
3. Maintain at least a 48-pixel control height.
4. The buttons remain in normal document flow; they are not permanently floating.
5. Send Lead opens the required flow and never submits immediately.
6. Do not add Call, Visit, Log Activity, View Route, or disabled integration buttons merely to fill space.

## Collaboration-summary grid

Use four compact summary items:

1. New.
2. Needs Attention.
3. Waiting.
4. Outcomes.

Layout:

1. Compact mobile: 2 × 2.
2. Standard mobile: 2 × 2.
3. Wide mobile and laptop: one row of four when each item remains readable.

Each item has number, plain-language label, optional short explanation for assistive technology, and a clear filtered destination. Zero is shown as a valid result, not a loading placeholder.

## Section-heading pattern

Order:

1. Optional semantic icon container.
2. Section title.
3. Optional count or status.
4. Optional trailing `View All` link.

Rules:

1. Use sentence case: `Action Required`, not decorative all caps.
2. The title and action remain aligned when the title wraps.
3. `View All` includes the destination context accessibly, such as `View all action-required leads`.
4. Do not make the entire heading row an unlabeled click target.
5. Use an icon only when it improves recognition; not every heading needs one.
6. Counts are data, not notification badges, unless their meaning is explicitly unread or action required.

## Surface and card hierarchy

Use three surface levels:

1. **Canvas** — cool light-neutral page background.
2. **Section surface** — optional white group surface for complex blocks.
3. **Item card or row** — actionable lead, notification, follow-up, insight, or status item.

Rules:

1. Standard cards target a 16-pixel radius, one-pixel border, and restrained or no shadow.
2. Use low elevation for large grouped dashboard surfaces and temporary overlays, not every row.
3. Use border, spacing, and background contrast before adding shadow.
4. Interactive cards receive visible hover, focus-within, pressed, loading, and error treatment.
5. A card is not one giant nested button when it contains secondary controls.
6. Card title, metadata, status, reason, and actions follow a predictable order.
7. Do not place a card inside another card merely for decoration.
8. Error and warning borders include icon and text; red or amber alone is insufficient.
9. Card content never overflows horizontally at long fictional names or 200% zoom.
10. Skeleton cards match final block dimensions and never show false data.

## Action-card anatomy

Order:

1. Required-action label or reason.
2. Fictional company or opportunity title.
3. Sender/recipient and department context.
4. Current status and timing.
5. Visible ranking explanation where required.
6. Primary action.
7. At most one secondary action.

Mobile behavior:

1. Metadata wraps below the title.
2. Buttons use full row width when two inline actions would fall below 44-pixel targets.
3. A compact disclosure may reveal secondary metadata, not required action context.

Laptop behavior:

1. Metadata may occupy a middle column.
2. Actions align consistently at the row end.
3. The card never becomes a wide spreadsheet row with inaccessible tiny columns.

## Compact row anatomy

Use for Waiting, Feedback, Notifications, directory results, and supporting lists.

1. Optional 40-pixel icon or initials container.
2. Flexible text block with title and one or two metadata lines.
3. Status or time.
4. One explicit row action or disclosure.

Target minimum row height is 72 pixels. Dense laptop mode is not implemented until it can preserve target size, scan order, and readability.

## Icon-container pattern

Recommended sizes:

1. Small: 32-pixel container with 16–18-pixel icon for compact metadata.
2. Standard: 40-pixel container with 20-pixel icon for rows and section headings.
3. Large: 48-pixel container with 24-pixel icon for empty states or major actions.

Rules:

1. Circle is the default for status-independent category icons.
2. Rounded square may distinguish primary tools or navigation when approved by the token system.
3. Do not use shape alone for semantic status.
4. Icon containers never imply ranking unless an approved ordinal number is explicitly present.
5. All repeated icons use the same optical stroke and alignment.

## Button hierarchy

### Primary

Use for the single recommended action in a decision area:

1. Filled blue background.
2. High-contrast label and optional leading icon.
3. Minimum 48-pixel height for major actions.
4. One primary button per card, dialog, form step, or action group.

### Secondary

Use for a valid alternative:

1. White or transparent surface.
2. Blue border and label.
3. Same height and label weight as the paired primary action where appropriate.

### Tertiary

Use for low-risk navigation, reveal, or cancel:

1. Text or quiet surface.
2. Still meets 44-pixel target when interactive.

### Destructive

Use for decline confirmation, withdrawal, cancellation, or destructive support action only when semantically appropriate. It is not styled as the ordinary primary blue action.

Global rules:

1. Labels use explicit verbs.
2. Icons do not replace labels for business commands.
3. Loading preserves width and prevents duplicate activation.
4. Disabled controls remain legible and explain why when that information is useful.
5. Focus treatment is stronger than hover and remains visible in high contrast.
6. Mobile form confirmations may be full width; ordinary compact row actions should not become oversized without need.

## Status badges and counts

1. Status badges use short approved status words, icon or shape where helpful, and semantic background/text contrast.
2. Unread and required-action counts use different component variants and accessible names.
3. `Needs Attention` is not an aggressive pulsing red alarm.
4. Do not use badges for ordinary metadata.
5. Long translated or enlarged labels wrap or become a compact status row rather than clipping.
6. Raw performance rank never appears as a badge.

## Forms and step flows

Mobile:

1. One column.
2. One logical field group per section.
3. Labels above controls.
4. Error directly after the related field.
5. Review and Send is a separate explicit step.
6. Main action remains in document flow above bottom-navigation clearance.

Laptop:

1. Keep the primary form column near 720 pixels.
2. A read-only review or routing summary may use a secondary column when it does not change reading order.
3. Do not create a wide two-column form merely because space exists.

Global:

1. Use native input semantics and mobile keyboard hints.
2. Required and optional status is textual.
3. Help text precedes errors in a stable relationship.
4. Date, time, timezone, ZIP, phone, and email formatting remain understandable when zoomed.
5. Unsaved-work dialogs follow the approved route contract.

## Filters, tabs, and search

1. Six equal-width tabs never appear across a smartphone.
2. Use a clearly labeled view selector plus Filters with active-count indicator on mobile.
3. Laptop may use visible tabs only when all labels fit without horizontal scrolling.
4. Mobile filter controls open a bottom sheet; laptop filters may use an inline panel or dialog.
5. Applied filters appear as removable text chips only when each remains accessible and does not expose protected free text in a URL.
6. Search and filter controls do not unexpectedly jump scroll or focus.

## Sheets, dialogs, menus, and toasts

### Mobile bottom sheet

1. Use for filters, bounded supporting choices, and low-risk detail.
2. Maximum height approximately 85 dynamic viewport height.
3. Include safe-area bottom padding.
4. Keep title, close control, and final actions reachable at large text.
5. Background shell and bottom navigation are inert while open.

### Dialog

1. Use for consequential confirmation, session state, and short focused decisions.
2. Target maximum width 560 pixels on laptop.
3. Never use a dialog for a long lead form.
4. Initial focus, escape behavior, close, error retention, and return focus are explicit.

### Secondary menu

1. Mobile uses an edge drawer no wider than the lesser of 320 pixels or most of the viewport.
2. Laptop uses the persistent rail and profile menu; it does not open the same full drawer unnecessarily.
3. Close returns focus to the opener.

### Toast or live status

1. Use for confirmed low-risk results, not as the only record of consequential success or failure.
2. Never include customer contact information.
3. Preserve long enough for reading and announce through the correct live-region priority.

## Loading, empty, error, stale, and offline composition

Every data block owns its state:

1. Loading uses dimensionally stable skeletons.
2. Empty states explain what belongs there and offer one useful next step when appropriate.
3. Partial error leaves independently loaded blocks visible.
4. Stale and offline states show last successful refresh and disable unsafe writes.
5. Retry stays beside the failed block.
6. Full-screen state pages are reserved for authentication, access, maintenance, update required, not found, or unrecoverable shell failures.
7. Unknown write result does not use a generic error that encourages duplicate submission.

## Safe-area and viewport rules

1. Use `min-height: 100dvh` with a safe fallback rather than relying only on `100vh`.
2. Add top safe-area inset to the mobile top bar.
3. Add bottom safe-area inset to bottom navigation and modal sheets.
4. Main content bottom padding equals bottom navigation height, bottom safe area, and an additional spacing buffer.
5. Anchored focus and route targets use scroll padding so sticky bars do not cover headings or errors.
6. The on-screen keyboard must not hide the current field or form action.
7. Landscape phone layout keeps the mobile information order and may reduce decorative spacing, never targets.
8. Do not assume every personal smartphone reports nonzero safe-area values.

## Accessibility and field-use rules

1. Minimum interactive target is 44 × 44 CSS pixels; primary actions target 48-pixel height.
2. Layout works at 200% zoom and large mobile text.
3. Visible focus is never removed and is not clipped by overflow containers.
4. Text, icons, and controls meet approved contrast requirements in outdoor conditions.
5. Reduced-motion preference removes nonessential transform, shimmer, and auto-scrolling behavior.
6. Status, selection, and priority never rely on color alone.
7. Touch, keyboard, screen reader, browser Back, and device rotation preserve the same workflow.
8. Cards, rows, tables, headings, forms, dialogs, and navigation use semantic HTML.
9. Content does not move unexpectedly when counts, badges, errors, or async results appear.
10. Long fictional names and localization expansion are tested before real content is considered.

## Component inventory created by these rules

### Shell

1. `AppShell`.
2. `SkipLink`.
3. `MobileTopBar`.
4. `DetailTopBar`.
5. `MobileBottomNav`.
6. `DesktopNavRail`.
7. `DesktopTopBar`.
8. `SecondaryMenu`.
9. `EnvironmentBanner`.

### Page and layout

1. `PageFrame`.
2. `PageHeader`.
3. `HomeGreeting`.
4. `QuickActionGroup`.
5. `SummaryGrid`.
6. `PrimarySecondaryGrid`.
7. `FormLayout`.
8. `SystemPageLayout`.

### Content

1. `SectionHeader`.
2. `SurfaceCard`.
3. `ActionCard`.
4. `CompactRow`.
5. `NotificationRow`.
6. `InsightCard`.
7. `StatusBadge`.
8. `CountBadge`.
9. `IconContainer`.
10. `MetadataList`.
11. `ActivityTimeline`.

### Controls and feedback

1. `Button`.
2. `IconButton`.
3. `TextLink`.
4. `Field` and native control wrappers.
5. `ViewSelector`.
6. `FilterButton`.
7. `FilterSheet`.
8. `Dialog`.
9. `InlineNotice`.
10. `ToastRegion`.
11. `Skeleton`.
12. `EmptyState`.
13. `BlockError`.
14. `ConnectionStatus`.

These names establish responsibilities, not a requirement to create one file per minor visual fragment. Components remain reusable only when they have a clear semantic and behavioral contract.

## Anti-patterns explicitly rejected

1. Full-screen decorative logo header before actionable content.
2. Multiple permanent action bars competing with navigation.
3. Every section wrapped in multiple nested rounded cards.
4. Icon-only global navigation.
5. Horizontal tab scrolling as the default mobile filter solution.
6. Desktop-only dense tables squeezed onto a smartphone.
7. Three-column CRM dashboards.
8. Floating buttons that cover records or bottom navigation.
9. Color-only priority, status, or selection.
10. Ranking numbers without approved ordinal meaning.
11. Motion, shimmer, or badge pulsing that creates pressure rather than clarity.
12. Large blank areas preserved merely to match the screenshot.
13. Different action wording or ordering between smartphone and laptop.
14. Fixed heights that clip enlarged text.
15. Customer contact information on Home, notifications, or lock-screen-visible surfaces.

## Step 4.2 acceptance checklist

- [x] One responsive shell and the five-destination mobile navigation remain approved.
- [x] The mobile top bar, compact detail header, bottom navigation, laptop rail, and laptop top bar compositions are approved.
- [x] The 400, 768, 1024, and 1280 CSS-pixel behavior thresholds are approved as starting points subject to zoom testing.
- [x] Shell dimensions, main padding, rail widths, content canvas, and form-width targets are approved.
- [x] Home mobile and laptop hierarchy matches approved workflow priority and item limits.
- [x] The greeting is compact and never pushes urgent actions unnecessarily below the fold.
- [x] Send Lead and Find Territory remain the two mobile quick actions.
- [x] Collaboration summary uses New, Needs Attention, Waiting, and Outcomes.
- [x] Section-heading, surface, card, action-card, compact-row, icon-container, button, badge, and form anatomy are approved.
- [x] Standard cards use restrained radius, border, and elevation without nested-card overload.
- [x] Primary, secondary, tertiary, and destructive actions have distinct roles and explicit labels.
- [x] Mobile filters use a view selector and sheet rather than six cramped tabs.
- [x] Sheets, dialogs, menus, toast/status, and focus-return behavior are approved.
- [x] Loading, empty, error, stale, offline, and unknown-result states preserve block-level usability.
- [x] Mobile safe-area, dynamic viewport, keyboard, sticky-header, and bottom-navigation clearance rules are approved.
- [x] Laptop columns preserve mobile DOM, reading, keyboard, and workflow order.
- [x] Component inventory and responsibility boundaries are approved.
- [x] Rejected decorative, CRM-density, nested-card, icon-only, floating-action, and color-only patterns remain out of scope.
- [x] Exact design tokens remain Step 4.3 and may refine target values only with test evidence.

## User action required now

No GitHub, CSS, or component action is required from the user. Review whether this structural interpretation matches how representatives should scan and act on the app. On approval, Step 4.3 will assign the exact reusable design tokens that make these rules implementable in code.
