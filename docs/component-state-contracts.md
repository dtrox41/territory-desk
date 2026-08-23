# Reusable Component State Contracts

Status: Approved for Step 4.4

Decision scope: Define the visible, behavioral, semantic, keyboard, touch, asynchronous, and recovery states for every reusable component before React implementation begins. These contracts consume the approved Step 4.3 design tokens and the approved business workflows; they do not create new business statuses.

## Recommendation

Treat state as multiple independent axes instead of one long list of CSS variants:

1. **Interaction:** rest, hover, focus-visible, pressed.
2. **Selection:** current, selected, checked, expanded.
3. **Availability:** enabled, disabled, read-only, unauthorized.
4. **Operation:** idle, validating, pending, succeeded, definitely failed, outcome unknown.
5. **Data block:** loading, loaded, empty, partial error, stale, offline.
6. **Semantic message:** information, success, warning, danger.

This prevents contradictions such as treating an error field as unable to receive focus, treating a selected tab as merely hovered, or showing a failed request when the server outcome is actually unknown.

## State-resolution order

When more than one state applies, resolve it in this order:

1. **Authorization and existence:** unauthorized actions are not rendered; inaccessible records use the approved non-disclosing page/block state.
2. **Write safety:** unknown command outcome, stale command version, session loss, or a required reconciliation blocks duplicate writes.
3. **Pending operation:** the active command is visibly busy and cannot be activated again.
4. **Availability:** disabled and read-only semantics apply.
5. **Validation and semantic state:** error, warning, success, selected, current, stale, or offline meaning remains visible.
6. **Focus-visible:** focus is always drawn above error, selected, current, or semantic styling.
7. **Pressed:** temporary active feedback overrides hover without removing focus.
8. **Hover:** applies only when the input device genuinely supports hover.

Focus never disappears because a control is invalid, selected, destructive, or pending.

## Component coverage ledger

Every component named in the approved Step 4.2 inventory maps to a state owner below. Passive composition components do not receive fake hover, pressed, disabled, or loading styling; they render the state of their meaningful children or data region.

| Approved component(s) | State owner and special rule |
| --- | --- |
| `AppShell` | Startup, authenticated, offline, permission-change, maintenance, update-required, and unrecoverable-shell states |
| `SkipLink` | Visually available when focused; uses full focus treatment; moves focus to the main heading/content; never covered by the sticky top bar |
| `MobileTopBar`, `DetailTopBar`, `DesktopTopBar` | Navigation/link/button rules; title and count loading reserve dimensions; sticky surface remains opaque |
| `MobileBottomNav`, `DesktopNavRail` | Navigation-item current, focus, permission, count, and route-loading rules |
| `SecondaryMenu` | Navigation-drawer rules, not ARIA action-menu rules |
| `EnvironmentBanner` | Persistent environment-banner rule; Preview disclosure never auto-dismisses |
| `PageFrame`, `PrimarySecondaryGrid`, `FormLayout`, `SystemPageLayout` | Passive layout; child/block loading, error, empty, stale, and unauthorized composition |
| `PageHeader`, `HomeGreeting`, `SectionHeader` | Static heading/content state; long text and loading reserve hierarchy; View All follows link rules |
| `QuickActionGroup` | Button rules and one-primary-per-action-area rule |
| `SummaryGrid` | Card/count rules; zero, loading, failure, and authorized destination states |
| `SurfaceCard` | Passive surface unless it contains a single approved card link |
| `ActionCard`, `InsightCard` | Card and command rules; loading/partial-error/stale states remain block-local |
| `CompactRow`, `NotificationRow` | List-row rules; read/unread or selected meaning is explicit and not hover-dependent |
| `StatusBadge`, `CountBadge` | Badge/count rules; static unless rendered as a real filter button |
| `IconContainer` | Noninteractive by default; decorative icons are hidden; meaningful icons share text alternatives through their component |
| `MetadataList` | Static definition/list semantics; unknown, withheld, unavailable, and empty values use explicit text rather than blank space |
| `ActivityTimeline` | Ordered activity/list semantics; loading and partial failure preserve loaded history; pagination uses an explicit control |
| `Button`, `IconButton`, `TextLink` | Button/link state contracts |
| `Field` and native control wrappers | Field, validation, read-only, disabled, selection, and save-state contracts |
| `ViewSelector` | Tab/view-selector contract; mobile selection control is not automatically an ARIA tablist |
| `FilterButton` | Button plus applied-filter count rules |
| `FilterSheet` | Sheet, staged-filter, apply, error, keyboard, and focus-return rules |
| `Dialog` | Modal/alert-dialog contract selected by purpose |
| `InlineNotice` | Persistent semantic notice and announcement rules |
| `ToastRegion` | Duplicate low-risk confirmation and single-announcement rules |
| `Skeleton` | Loading placeholder contract |
| `EmptyState` | Context-specific zero/no-result/no-access distinction |
| `BlockError` | Partial-error, definite-failure, unknown-outcome, and retry rules |
| `ConnectionStatus` | Offline, reconnecting, restored, stale, and refresh-failure rules |

If implementation introduces a new reusable component, its state owner must be added to this ledger before the component is accepted.

## Universal interaction contract

| State | Visual treatment | Behavior and semantics |
| --- | --- | --- |
| Rest | Approved semantic surface, boundary, text, icon, and spacing | Correct native element and accessible name |
| Hover | Subtle tokenized surface/boundary change; no size change | Only inside `@media (hover: hover) and (pointer: fine)`; never required to understand the action |
| Focus-visible | Approved three-pixel blue ring; dark controls add two-pixel white separation | Visible for keyboard and other non-pointer focus; never clipped; forced colors use system focus |
| Pressed | Darker approved surface or inset treatment; no scale/layout shift | Exists only while pointer/key activation is held; business state does not change until the command is accepted |
| Selected/current | Persistent text plus check, underline, leading bar, or other non-color cue | Uses native checked state, `aria-selected`, `aria-current`, or `aria-pressed` only when the matching pattern requires it |
| Disabled | Explicit disabled surface/text/boundary; no whole-control opacity | Native `disabled` when discoverability is unnecessary; cannot activate or submit |
| Read-only | Normal legible text with subdued surface and visible `Read only` context | Remains selectable/focusable where useful; is not presented as disabled |
| Loading data | Dimensionally stable skeleton or bounded loading block | Container exposes busy state; decorative skeleton is hidden from assistive technology |
| Pending command | Original command area retains width; label changes to a specific progress verb | Activation locks immediately; `aria-busy` or status association; no optimistic completion for consequential writes |
| Success | Persistent page/block confirmation for consequential work | Announces once politely; focus moves only when workflow logically requires it |
| Error | Text explanation, semantic icon, tested danger treatment, and recovery action | Announces once when dynamically introduced; preserves valid data and user input |
| Empty | Plain-language explanation plus at most one useful next step | Zero and empty are not loading; no fake placeholder records |
| Stale | Visible last-refresh context and refresh/review action | Existing data may remain readable; unsafe writes are blocked until revalidated |
| Offline | Persistent connection message and truthful capability limits | No action claims to be sent, saved, or synchronized without authoritative confirmation |
| Unknown outcome | `Checking result` or `Outcome not yet confirmed` with command locked | Reconcile by idempotency key before offering retry; never encourage duplicate submission |

## Command-state machine

Every consequential command—Send Lead, Accept, Decline, Request Information, Reassign, Add Information, Correct Details, Complete Follow-up, Cancel, and support-request submission—uses this sequence:

```text
idle
  → validating
  → pending
     → succeeded
     → definitely_failed → retry_allowed
     → outcome_unknown → reconciling
                           → succeeded
                           → definitely_failed → retry_allowed
                           → still_unknown → support/recheck path
```

Rules:

1. Validation failure never enters `pending`.
2. Pending begins before the request can be activated again.
3. Each logical command carries its stable idempotency key and source record version.
4. `Succeeded` requires an authoritative response or successful reconciliation, not a toast, animation, SMS attempt, or client assumption.
5. A definite failure preserves input and offers one nearby retry.
6. An unknown outcome preserves input, locks the duplicate command, and checks the existing command result.
7. A stale-version conflict shows what changed and requires review before a new command.
8. There is no artificial minimum loading delay. Busy state begins immediately and ends when the authoritative outcome is known.

## Buttons

### Variants

1. `primary` — single recommended action in an action area.
2. `secondary` — valid alternative.
3. `tertiary` — low-risk navigation, reveal, or cancel.
4. `destructive` — decline, withdrawal, cancel, or destructive confirmation only.
5. `icon` — shell or low-risk utility with an accessible name; business commands retain visible text.

### State matrix

| State | Primary | Secondary | Tertiary | Destructive |
| --- | --- | --- | --- | --- |
| Rest | `blue-700`, white label | White, `blue-700` boundary/label | Transparent, `blue-700` label | Danger boundary fill, white explicit verb |
| Hover | `blue-800` | `blue-050` surface | `blue-050` surface | Danger foreground fill |
| Focus-visible | White separation plus blue focus ring | Blue focus ring | Blue focus ring | White separation plus blue focus ring |
| Pressed | `blue-900` | `blue-100` surface | `blue-100` surface | Danger foreground fill plus tokenized inset separation |
| Disabled | Disabled surface/text/boundary | Disabled surface/text/boundary | Disabled text with no misleading active cue | Disabled surface/text/boundary |
| Pending | Preserve width; specific label such as `Sending lead…` | Same role retained; specific pending label | Used only if this control owns the command | Preserve width; label such as `Declining…` |
| Success | Command is replaced by persistent result/next action | Does not turn into a decorative green button | Same | Confirmation remains outside the button |
| Error | Original enabled role returns only after definite failure | Nearby error and retry retain correct hierarchy | Same | Same; never silently repeat |
| Unknown | Locked with `Checking result…` | No duplicate alternative for same command | Recheck may be tertiary if safe | Destructive command remains locked until reconciled |

Button rules:

1. Use native `<button>`; default reusable type is `button`, and form submission sets `type="submit"` explicitly.
2. Enter and Space activate. Activation that opens a dialog moves focus into it; closing normally returns focus to the opener.
3. Loading preserves the original width and does not replace the explicit verb with only a spinner.
4. The spinner is decorative; the progress label carries meaning.
5. Disabled buttons explain the unavailable prerequisite in adjacent text when users cannot reasonably infer it.
6. `aria-disabled="true"` is reserved for discoverable composite items or the rare control that must remain focusable; code must still prevent activation.
7. A toggle button keeps a stable label when using `aria-pressed`. If the visible label changes from one command to its opposite, do not also use `aria-pressed`.
8. Press feedback uses color/boundary, never shrink/scale that makes a field target move.
9. Destructive commands require explicit verbs and a confirmation only when the consequence is difficult to reverse; routine Cancel navigation does not receive danger treatment.
10. One action area has at most one primary button.

## Text links and card links

1. Use a link only for navigation to a resource or route; use a button for a command.
2. Rest uses the approved link color and visible text cue in context. Inline links are underlined unless surrounding structure makes link purpose unmistakable.
3. Hover darkens the approved link color; focus adds the full focus ring/outline without removing underline.
4. Visited color is not used for authenticated workflow routes because it could imply business state.
5. Loading a destination leaves the originating route until navigation starts and then shows the destination's stable loading composition.
6. Links are not visually disabled. If navigation is unauthorized, omit the link; if a destination is temporarily unavailable, keep readable context and provide an explicit unavailable state.
7. A stretched card link may cover a simple single-destination card only when no nested control exists. Cards with actions expose a title/details link plus separate buttons.

## Fields and native controls

### Anatomy

1. Visible label.
2. Required or optional text where needed.
3. Help text.
4. Native input, textarea, select, checkbox, radio, or approved wrapper.
5. Inline validation message.
6. Optional bounded status such as `Checking territory…`.

### State matrix

| State | Visual treatment | Behavior |
| --- | --- | --- |
| Empty/rest | White surface, control boundary, visible label; placeholder is optional example only | Required empty is not initially shown as an error |
| Hover | Stronger approved boundary | No tooltip-only instruction |
| Focus-visible | Focus ring plus active boundary | Label/help/error relationship remains; text selection works normally |
| Filled | Default neutral styling | A value alone is not a success state |
| Validated | Optional quiet confirmation only when external verification matters | Do not paint every valid field green |
| Error | Danger boundary, icon where useful, precise text beneath field | `aria-invalid="true"`; error ID joins `aria-describedby` |
| Disabled | Native disabled state and explicit disabled tokens | Removed from submission and normal focus order |
| Read-only | Subdued surface, normal contrast, `Read only` text where ambiguity exists | Selectable and focusable when useful; submitted according to native behavior |
| Validating | Field remains stable; bounded progress text/icon | Avoid disabling unrelated fields; stale validation results are discarded |
| Save pending | Form command is pending; fields normally remain readable | Prevent edits only where changing input would invalidate the active command |

Validation rules:

1. Validate formatting after meaningful interaction and validate all required fields when the user attempts Continue, Review, or Send.
2. Do not show a page of red errors before the user interacts.
3. A failed step displays an error summary linked to each invalid field and moves focus to the summary or first invalid field according to the form context.
4. Error text states the problem and how to correct it; `Invalid value` alone is insufficient.
5. Server errors never erase client-valid input.
6. Correcting a field removes its stale error only after the relevant validation passes.
7. Help text remains available when an error appears; IDs preserve both descriptions.
8. Native autocomplete, input mode, and mobile keyboard hints are used only when safe for the field.
9. Customer contact data is never inserted into placeholders, URLs, logs, or examples.
10. Autofill, zoom, text expansion, and on-screen keyboard states cannot cover the label, value, error, or form action.

### Checkbox, radio, and switch rules

1. The label and control share at least a 44 × 44 target area.
2. Checked state uses native state plus a visible check/dot and tested color; color alone is insufficient.
3. Radio groups use a visible group label and arrow-key behavior supplied by native controls.
4. A switch is used only for a binary preference applied immediately, not for a choice that is committed with a later form submission.
5. Indeterminate checkboxes are used only if a genuine mixed selection exists and the meaning is stated.
6. Disabled options remain readable; if the reason matters, it is adjacent to the option or group.

## Search, filters, and chips

1. Search has a persistent visible label or an equivalent programmatic label plus visible purpose; placeholder alone is insufficient.
2. Clear Search is an accessible 44-pixel icon button and appears only when a value exists.
3. The search input retains focus while results update unless the user explicitly opens a result.
4. Loading appears in the results region; it does not replace the typed query.
5. `No matching results` is distinct from an empty directory, offline search, and result-load failure.
6. Applied filter chips include visible text and a labeled remove button. The entire chip is not an unlabeled close target.
7. Filter count is zero when no nondefault filters apply; it is not an unread badge.
8. Apply Filters is primary only when changes are staged. Clear All is tertiary and does not close the sheet without updating the result state truthfully.
9. A failed filter application preserves staged choices and offers retry or cancel.
10. Search/filter state restoration follows the approved route and Back contract without putting protected free text in the URL.

## Tabs and view selectors

Use true tabs only when one local panel replaces another in the same context. Route navigation uses links. Mobile list views use the approved view selector rather than six cramped tabs.

| State | Treatment and behavior |
| --- | --- |
| Rest | Visible text, minimum target, unselected semantics |
| Hover | Quiet blue surface when hover exists |
| Focus | Roving focus treatment distinct from selection |
| Selected | Visible underline/leading marker plus stronger text and `aria-selected="true"` |
| Pressed | Tokenized pressed surface without shifting labels |
| Disabled | Rare; discoverable disabled tab remains in arrow navigation only when its existence matters |
| Panel loading | Selected tab remains selected; associated panel becomes busy and shows stable loading state |
| Panel error | Selected tab remains selected; panel shows block error/retry |
| Panel empty | Selected tab remains selected; panel shows contextual empty state |

Keyboard contract:

1. Tab enters the tab list at the active tab; arrow keys move among tabs; Home and End move to first and last.
2. Automatic activation is allowed only when panel content is already present and appears without noticeable delay.
3. If changing panels requires a network request, arrow keys move focus and Enter/Space activates the focused tab.
4. Focus and selection remain visually distinct.
5. Every tab controls one labeled panel; IDs and relationships are stable.
6. Counts reserve space while updating and never replace labels.

## Navigation items

1. Mobile bottom and laptop rail items use the same order, words, destinations, icons, and current-state meaning.
2. Current route uses `aria-current="page"`, stronger text, and a persistent non-color marker such as an underline or leading bar.
3. Hover and focus follow ordinary link rules. Pressed does not move or scale the rail/bar.
4. Unauthorized destinations, including Manager Insights for representatives, are omitted rather than disabled.
5. A temporarily unavailable destination remains navigable to an explanatory block/page if the route itself is still authorized.
6. Count loading reserves the badge footprint; count failure does not block navigation.
7. Visual `99+` keeps the complete count in the accessible name where the exact count is authorized.
8. Bottom navigation never gains loading spinners that make destination positions move.

## Cards and list rows

### State matrix

| State | Treatment | Action behavior |
| --- | --- | --- |
| Rest | Surface, subtle boundary, stable content hierarchy | Explicit link/action targets |
| Hover | Quiet surface or boundary strengthening | Only if the row/card is actionable |
| Focus-within | The focused control receives full focus; optional quiet container emphasis | Container cannot replace individual control focus |
| Pressed | Quiet pressed surface; no scale or content movement | Only the activated target responds |
| Selected | Selected surface plus check/marker and accessible selected state | Used only for a real selection workflow, not ordinary navigation |
| Disabled/unavailable | Content remains readable; unavailable action is omitted or explained | Entire business record is not dimmed merely because one command is unavailable |
| Loading | Skeleton matches final row/card geometry | No focusable fake controls |
| Partial error | Available content stays visible; failed block has message and retry | Retry is beside the failed region |
| Stale/offline | Timestamp/status appears without hiding content | Unsafe actions are blocked pending refresh/revalidation |
| Empty | Render section-level empty state instead of an empty fake card | At most one useful next step |

Rules:

1. ActionCard order remains reason, fictional title, participants, status/timing, ranking reason, primary action, and at most one secondary action.
2. Compact actionable rows remain at least 72 pixels tall and may expand for wrapping.
3. A row with multiple controls is never one nested button or click handler.
4. Hover never reveals an action that is otherwise unavailable on touch.
5. Metadata truncation cannot hide owner, required action, status, or timing. Long fictional names wrap.
6. Optimistic UI may update a harmless local visual preference, but not authoritative handoff status, ownership, delivery, or follow-up completion.
7. Pagination uses an explicit `Load more`/next control or tested route paging; scrolling alone cannot be the only way to obtain more records.

## Status badges and counts

1. StatusBadge is noninteractive unless it is explicitly rendered as a filter button.
2. Every status displays approved text; semantic color and icon reinforce rather than replace it.
3. Unread count uses the danger count variant. Action-required count uses the warning variant. Ordinary totals use neutral text, not a notification badge.
4. `0` is a real loaded count. A loading count uses a reserved placeholder; a failed count uses an unavailable label accessible to assistive technology.
5. `99+` is visual abbreviation only; authorized exact meaning remains in the accessible name.
6. Badges wrap into a status row under large text rather than clip or overlap titles.
7. Status badges never show employee ranking or imply customer value.

## Menus, drawers, sheets, and dialogs

### Pattern selection

1. Use a **menu** for a compact set of actions or commands.
2. Use a **listbox/native select** for choosing one value.
3. Use the **navigation drawer** for mobile secondary navigation; it is not an ARIA menu.
4. Use a **bottom sheet** for bounded mobile filters or supporting choices.
5. Use a **dialog** for short focused decisions and consequential confirmation.
6. Never place the full Send Lead workflow inside a dialog or sheet.

### Menu states

1. The trigger exposes expanded state and menu relationship.
2. Enter/Space opens and focuses the first item; optional Down/Up Arrow opens at first/last.
3. Arrow keys move within the menu; Enter/Space activates; Escape closes and returns focus.
4. Hover and keyboard focus use the same visible item emphasis, but focus remains programmatically distinct.
5. Disabled menu items remain discoverable by arrow navigation only when their presence matters and cannot activate.
6. Menu loading shows a noninteractive loading row; failure shows an inline message plus Retry or Close; empty states explain that no actions are available.
7. Destructive menu items use an explicit destructive verb and icon/text cue; activation may open the appropriate confirmation dialog.

### Modal states

1. Opening makes the background—including shell navigation—inert and visibly obscured.
2. Focus moves inside based on task safety: heading/static text for complex or destructive content, first field for a simple entry dialog, or least destructive action when accidental confirmation is risky.
3. Tab and Shift+Tab remain within the modal. Escape closes except while a noncancelable commit is being reconciled.
4. A visible Close or Cancel control exists. Closing normally returns focus to the opener; if it no longer exists, focus moves to the logical updated heading/record.
5. Pending preserves dialog dimensions and locks only conflicting actions.
6. Validation and definite failure retain entered values inside the dialog.
7. Unknown outcome cannot be dismissed into an implied failure; the dialog or destination shows reconciliation status and a safe exit/recheck path.
8. A sheet respects dynamic viewport, on-screen keyboard, safe-area padding, large text, and 85dvh maximum target without clipping actions.
9. Nested modals are rejected except a proven critical system case.

## Inline notices, alerts, banners, and toasts

| Component | Use | Duration and announcement |
| --- | --- | --- |
| Inline notice | Contextual info, warning, error, or persisted success | Remains until context changes or user resolves/dismisses it; polite by default |
| Field error | Specific validation problem | Remains until corrected; tied to field; included in failed-submit summary |
| Environment banner | Persistent fictional Preview disclosure | Always visible in Preview; not repeatedly announced on every route |
| Connection banner | Offline, reconnecting, stale, or restored state | Persists while relevant; announces meaningful transitions once |
| Toast | Duplicate low-risk confirmation only | Eight seconds minimum after appearance; pauses on hover/focus; dismissible; never sole record |
| Alert dialog | Urgent message requiring a choice | Remains until choice; modal behavior and descriptive labeling required |

Rules:

1. Use `role="alert"` only for important dynamically introduced errors or urgent changes that warrant interruption.
2. Use a polite status region for progress and ordinary success. Do not announce the same message through both a toast and inline region.
3. Existing page-load messages are part of document structure; adding `role="alert"` does not guarantee they are announced.
4. Consequential success/failure, unknown outcomes, and required actions persist in the page or dialog and never depend on a disappearing toast.
5. Alerts do not steal focus. Use an alert dialog only when the user must make a decision before continuing.
6. Messages use a plain-language title, explanation, and one clear recovery action when available.
7. No toast, banner, or notice includes customer contact details or appears over the mobile primary action/bottom navigation.
8. Multiple related errors are consolidated rather than producing an alert storm.

## Loading, progress, empty, and block-error components

### Skeleton

1. Matches the final content dimensions closely enough to prevent layout movement.
2. Is never focusable and never represents invented names, values, or status.
3. The containing region exposes `aria-busy="true"` and one meaningful loading label; decorative skeleton pieces are hidden.
4. Reduced motion removes shimmer; a static tonal placeholder remains.
5. A skeleton cannot replace already loaded content during background refresh; retain content and show bounded refresh status.

### Spinner/progress

1. Used for bounded commands or regions, not as a full-screen indefinite substitute for the application shell.
2. Always has adjacent or programmatically associated progress text.
3. Determinate progress is shown only when actual progress is known.
4. No fake percentage, success checkmark, or completed animation is shown before authority confirms the result.

### Empty state

1. States what is empty: `No leads need your action`, not `Nothing here`.
2. Distinguishes a healthy zero from no access, no matches, unavailable data, filtered zero, and load failure.
3. Offers at most one highest-value next step, such as Clear Filters or Send Lead.
4. Does not use a large decorative illustration that pushes the explanation below the fold.

### Block error

1. Replaces only the failed block when the rest of the page is usable.
2. States whether data could not load, a command definitely failed, or the result is unknown.
3. Retry appears beside the failed block and never duplicates a command with unknown outcome.
4. Technical identifiers are omitted from user text but safe support/reference IDs may be offered through approved diagnostics.

## Connection, stale-data, and recovery states

1. **Online and current:** no unnecessary connectivity banner.
2. **Connection lost:** persistent banner says which reads remain available and that unsafe actions cannot be sent.
3. **Reconnecting:** show bounded progress without claiming synchronization.
4. **Reconnected:** reauthenticate/re-authorize and refresh source versions before enabling writes; announce restoration once.
5. **Stale:** show last successful refresh and keep stale content visibly labeled.
6. **Refresh failed:** keep authorized stale content if safe and offer Retry; do not replace it with a blank page.
7. **Pending interrupted:** determine whether the request was never sent, definitely failed, or has unknown outcome.
8. **Unknown outcome:** reconcile using command/idempotency identity; do not ask the user to submit again.
9. Offline/local prototype simulation is visibly labeled and cannot be mistaken for production offline write support.

## Authentication and permission changes

1. While startup identity is unresolved, show the approved startup composition and never flash a prior user's content.
2. Session-expiration warning is a persistent dialog/notice with exact remaining meaning; expiration blocks writes.
3. After expiration, unsaved work restoration follows the approved same-identity and reauthorization rules.
4. Role/scope removal immediately removes unauthorized routes/actions and replaces open protected content with the approved non-disclosing state.
5. Manager-only components are never merely hidden with CSS; the route and data layers also enforce access.
6. Sign-out clears protected client state before presenting Signed Out; browser Back cannot restore it.

## State copy contract

Use specific, outcome-based language:

| Avoid | Use |
| --- | --- |
| `Loading…` everywhere | `Loading your leads…`, `Checking territory…`, `Sending lead…` |
| `Something went wrong` | `We couldn't load your lead activity. Try again.` |
| `Error 409` | `This lead changed since you opened it. Review the latest information before responding.` |
| `Failed` after a lost response | `We haven't confirmed whether the lead was sent. We're checking before you try again.` |
| `Success!` | `Lead sent to Jordan Lee in Facility Services.` using fictional prototype data |
| `No data` | `No leads need your action.` or the exact empty reason |
| `Disabled` | `Choose a recipient before continuing.` |

Success copy may identify fictional participants in Preview. Production notification and lock-screen-visible surfaces follow the separately approved privacy restrictions.

## State combinations that must be tested

At minimum, implementation tests these combinations:

1. Focused error field.
2. Focused selected tab.
3. Focused destructive button.
4. Disabled control inside warning context.
5. Pending command while connection drops.
6. Unknown result after Send Lead.
7. Stale lead with a newly removed permission.
8. Loaded page with one failed secondary block.
9. Empty filtered list versus genuinely empty list.
10. Offline page with previously loaded authorized data.
11. Long fictional name with count/status badges at 200% zoom.
12. Bottom sheet with mobile keyboard and enlarged text.
13. Dialog error followed by correction and successful submit.
14. Menu with a discoverable disabled item.
15. Reduced-motion loading and modal transitions.
16. Forced-color focus on primary, danger, selected, and error states.
17. Screen-reader announcements with no duplicate alert/status message.
18. Touch device where no function depends on hover.

## Explicit rejections

Do not implement:

1. Hover-only actions or instructions.
2. Focus indicators removed, clipped, or replaced by color alone.
3. Entire rows/cards as buttons when they contain other controls.
4. Green valid styling on every completed field.
5. Generic errors that conflate definite failure with unknown outcome.
6. Optimistic success for status, ownership, delivery, or completion commands.
7. Disabled controls used to conceal an authorization decision.
8. Spinners without progress text, skeletons that contain fake data, or loading that erases readable stale content.
9. Toast-only consequential success or failure.
10. Auto-disappearing required actions or error alerts.
11. ARIA menus for ordinary site navigation or listboxes for action commands.
12. Modal forms for the full lead workflow, nested modal chains, or inaccessible background interaction.
13. State changes that resize, scale, reorder, or move the user's target.
14. Repeated live announcements for the same event.

## Standards references

- [W3C ARIA Authoring Practices: Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
- [W3C ARIA Authoring Practices: Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- [W3C ARIA Authoring Practices: Menu button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/)
- [W3C ARIA Authoring Practices: Menu and menubar](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/)
- [W3C ARIA Authoring Practices: Modal dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [W3C ARIA Authoring Practices: Alert](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)
- [W3C ARIA Authoring Practices: Keyboard interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
- [WCAG 2.2 error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification)

## Acceptance checklist

- [x] Independent interaction, selection, availability, operation, data, and semantic state axes are approved.
- [x] State-resolution order and focus precedence are approved.
- [x] Consequential command state machine and unknown-outcome reconciliation are approved.
- [x] Primary, secondary, tertiary, destructive, and icon-button states are approved.
- [x] Link versus button behavior and card-link restrictions are approved.
- [x] Field, validation, disabled, read-only, validating, checkbox, radio, and switch states are approved.
- [x] Search, filter, chip, tab, selector, and keyboard behavior are approved.
- [x] Mobile/laptop navigation current, unavailable, permission, and count states are approved.
- [x] Card, ActionCard, row, selection, loading, stale, partial-error, and empty states are approved.
- [x] StatusBadge, unread count, action count, ordinary total, zero, loading, and failure states are approved.
- [x] Menu, navigation drawer, bottom sheet, and dialog pattern/state contracts are approved.
- [x] Inline notice, alert, banner, connection message, toast, and alert-dialog rules are approved.
- [x] Skeleton, progress, empty, block-error, and background-refresh rules are approved.
- [x] Offline, reconnecting, stale, refresh, interrupted command, and recovery states are approved.
- [x] Authentication, permission-change, and sign-out component behavior is approved.
- [x] Specific state copy and required combination testing are approved.
- [x] Rejected hover-only, color-only, optimistic, toast-only, generic-error, fake-loading, and modal anti-patterns remain excluded.

## User action

No GitHub or coding action is required from the user. These state and recovery rules are approved. Step 4.5 will perform the cross-product accessibility rule audit before implementation.
