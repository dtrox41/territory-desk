# Accessibility Conformance and Release Plan

Status: Approved for Step 4.5

Decision scope: Establish the accessibility target, screen and state coverage, semantic and interaction rules, testing matrix, evidence requirements, defect severity, and release gates for the fictional Preview and future protected Production application. This plan consumes the approved layout, token, and component-state contracts. It does not claim that an application that has not yet been built conforms.

## Recommendation

Target **WCAG 2.2 Level AA** across the complete Territory Desk experience, then deliberately exceed the minimum in the areas most important to field use:

1. Use 44 × 44 CSS-pixel minimum targets instead of relying on WCAG's smaller AA exceptions.
2. Keep focused controls fully visible where practical, exceeding the AA rule that they not be entirely obscured.
3. Use the approved high-contrast three-pixel focus treatment.
4. Preserve input and eliminate duplicate entry across the Send Lead flow.
5. Make consequential commands reviewable, correctable, reversible where possible, and truthful under connection loss.
6. Test representative and manager workflows with keyboard, VoiceOver, TalkBack, NVDA, zoom, text spacing, forced colors, reduced motion, and touch.
7. Treat accessibility defects in the core lead handoff as release blockers.
8. Prohibit use while driving and avoid urgency patterns that pressure representatives to interact with a moving vehicle.

WCAG is the minimum technical target. Field safety, cognitive clarity, personal-device privacy, and truthful weak-connection recovery remain additional product requirements.

## Target versus conformance claim

1. **Current factual status:** Territory Desk has an approved design specification but no implemented UI. It cannot yet claim WCAG conformance.
2. **Design target:** Every public Preview and future protected Production route, state, viewport, role, and supported interaction meets WCAG 2.2 Level A and AA.
3. **Preview wording:** Use `Designed toward WCAG 2.2 AA; accessibility testing is in progress` until evidence is complete. Do not use `WCAG compliant`, an accessibility badge, or a conformance logo prematurely.
4. **Conformance claim gate:** A claim requires a completed criterion ledger, automated and manual evidence, supported-technology statement, known-limitation review, and named owner/date/version.
5. **Future company documentation:** A VPAT or Accessibility Conformance Report is a separate company-governed deliverable and is not inferred from this plan.
6. Accessibility review applies to first-party UI and to any future identity, SMS deep-link, calendar, Dynamics, chart, or third-party component included in the user journey.

## Scope ledger

Accessibility testing covers all 27 canonical route classes and their authorized role variations:

| Route group | Included surfaces |
| --- | --- |
| Shell and Home | Application shell, skip link, top bars, bottom navigation, laptop rail, Home dashboard, quick actions, counts, action cards |
| Territory and Directory | Territory Lookup, result/exception states, Representative Directory, Representative Detail, territory panel, contact actions |
| Lead workflow | Leads List, Send Lead steps, Review & Send, Lead Detail overview/activity, response, correction, reassignment, follow-up actions |
| Collaboration and management | Notification Center, Manager Insights, Data Status, Profile, Help, help topics, reporter-visible requests |
| Authentication | Sign In, authentication return, sign-in help, session expiration, access required/denied, account unavailable, signed out |
| System | Offline, maintenance, update required, not found, unexpected error, startup, stale, reconnecting, partial failure |
| Overlay and transient | Menus, navigation drawer, filter sheet, dialogs, alert dialogs, inline notices, connection banner, toast/status region |

Every route is tested in loading, loaded, empty where possible, validation error, block failure, stale/offline, unauthorized, long-content, zoom, keyboard, and screen-reader states. Role-controlled routes are tested as both an authorized manager and an unauthorized representative. Direct links and browser Back are part of the same scope.

## WCAG 2.2 Level A and AA applicability ledger

`Required` means the application must produce implementation evidence. `Conditional` means the current design omits the content type, but the criterion becomes required if that content is introduced.

### Perceivable

| Criterion | Level | Territory Desk rule and evidence |
| --- | --- | --- |
| 1.1.1 Non-text Content | A | Meaningful icons/images have equivalent names or descriptions; decorative icons are hidden; charts require a text summary and accessible data view |
| 1.2.1 Audio-only and Video-only (Prerecorded) | A | Conditional: no time-based media in first release; any later media requires an equivalent alternative |
| 1.2.2 Captions (Prerecorded) | A | Conditional: later prerecorded video requires synchronized captions |
| 1.2.3 Audio Description or Media Alternative | A | Conditional: later video requires an alternative or audio description |
| 1.2.4 Captions (Live) | AA | Conditional: later live media requires captions |
| 1.2.5 Audio Description (Prerecorded) | AA | Conditional: later prerecorded video requires audio description when visual content is needed |
| 1.3.1 Info and Relationships | A | Native landmarks, headings, lists, forms, labels, groups, tables, status, timeline, and definition relationships preserve structure programmatically |
| 1.3.2 Meaningful Sequence | A | DOM, reading, focus, and mobile priority order remain logical when laptop columns rearrange visually |
| 1.3.3 Sensory Characteristics | A | Instructions never depend only on position, shape, color, sound, or direction |
| 1.3.4 Orientation | AA | Portrait and landscape remain supported; no device orientation lock |
| 1.3.5 Identify Input Purpose | AA | User-identity fields use valid autocomplete purpose tokens; customer fields do not misuse personal autocomplete tokens |
| 1.4.1 Use of Color | A | Status, priority, ownership, current selection, validation, and chart meaning include text and non-color cues |
| 1.4.2 Audio Control | A | Conditional: no automatic audio; later audio longer than three seconds requires independent control |
| 1.4.3 Contrast (Minimum) | AA | Approved normal text pairings reach at least 4.5:1 and qualifying large text reaches at least 3:1 |
| 1.4.4 Resize Text | AA | Text reaches 200% without lost content/function; containers grow and no required text is clipped |
| 1.4.5 Images of Text | AA | Real text is used for identity, labels, headings, data, and status; approved logos are the limited brand exception |
| 1.4.10 Reflow | AA | Core content works at 320 CSS pixels without two-dimensional scrolling; legitimate data visualization exceptions still provide reflowing alternatives |
| 1.4.11 Non-text Contrast | AA | Control boundaries, selected/focus cues, meaningful icons, and graphical state reach at least 3:1 against adjacent colors |
| 1.4.12 Text Spacing | AA | No loss at line height 1.5, paragraph spacing 2, letter spacing 0.12, and word spacing 0.16 times font size |
| 1.4.13 Content on Hover or Focus | AA | No required hover-only content; any tooltip/popover is dismissible, hoverable, and persistent under the required conditions |

### Operable

| Criterion | Level | Territory Desk rule and evidence |
| --- | --- | --- |
| 2.1.1 Keyboard | A | Every action and workflow works with keyboard alone; composite widgets implement their approved keys |
| 2.1.2 No Keyboard Trap | A | Users can leave every control; modal focus remains intentionally contained and has an operable close/cancel path |
| 2.1.4 Character Key Shortcuts | A | No single printable-character shortcut is enabled by default; future shortcuts must be remappable, disableable, or active only on focus |
| 2.2.1 Timing Adjustable | A | No workflow forces fast completion; session limits warn accessibly and allow extension when policy permits; any essential exception is documented |
| 2.2.2 Pause, Stop, Hide | A | No auto-updating or moving content persists without control; loading shimmer stops under reduced motion and never conveys information |
| 2.3.1 Three Flashes or Below Threshold | A | No flashing, strobing, or pulsing alarm content |
| 2.4.1 Bypass Blocks | A | A focus-visible Skip to main content link bypasses repeated shell navigation |
| 2.4.2 Page Titled | A | Every route receives a concise unique document title such as `Send Lead — Territory Desk` |
| 2.4.3 Focus Order | A | Focus follows meaningful DOM/task order; no positive `tabindex`; overlays and route changes use explicit focus placement |
| 2.4.4 Link Purpose (In Context) | A | Link text and accessible names describe destinations, including each View All link's context |
| 2.4.5 Multiple Ways | AA | Primary destinations are available through consistent navigation; secondary content is reachable through navigation, contextual links, directory/help, or approved search |
| 2.4.6 Headings and Labels | AA | One descriptive page heading and logical subsections; labels describe purpose rather than visual appearance |
| 2.4.7 Focus Visible | AA | Approved focus-visible treatment appears on every interactive component and is not removed |
| 2.4.11 Focus Not Obscured (Minimum) | AA | Sticky bars, banners, sheets, toast, and keyboard do not fully cover the focused component; scroll padding targets full visibility where practical |
| 2.5.1 Pointer Gestures | A | No multipoint or path-based gesture is required; all functions use simple controls |
| 2.5.2 Pointer Cancellation | A | Commands execute on release/click rather than pointer-down; accidental activation can be canceled before release or safely corrected |
| 2.5.3 Label in Name | A | The visible action words occur in the accessible name, supporting voice control |
| 2.5.4 Motion Actuation | A | Device movement is never required; no shake, tilt, or location-motion command |
| 2.5.7 Dragging Movements | AA | No drag-only reordering, slider, map, or sheet operation; a simple pointer/button alternative always exists |
| 2.5.8 Target Size (Minimum) | AA | Territory Desk exceeds the 24-pixel AA floor with a 44 × 44 minimum target and 48-pixel default controls |

### Understandable

| Criterion | Level | Territory Desk rule and evidence |
| --- | --- | --- |
| 3.1.1 Language of Page | A | Root document language is declared; initial interface language is English |
| 3.1.2 Language of Parts | AA | A language change inside content is marked when one is intentionally introduced |
| 3.2.1 On Focus | A | Focus never submits, navigates, opens a modal, or changes business state by itself |
| 3.2.2 On Input | A | Changing a field does not unexpectedly change context; auto-updating results remain announced and focus-stable |
| 3.2.3 Consistent Navigation | AA | Mobile and laptop navigation keep approved order, naming, and destination meaning within each responsive variation |
| 3.2.4 Consistent Identification | AA | Repeated actions retain the same visible and accessible names across screens |
| 3.2.6 Consistent Help | A | Help and Feedback remains in the same relative secondary-navigation position within each shell variation |
| 3.3.1 Error Identification | A | Errors are identified in text, associated with the field/block, and distinguished from unknown outcomes |
| 3.3.2 Labels or Instructions | A | Every field has a persistent label and necessary format/help instructions before submission |
| 3.3.3 Error Suggestion | AA | When known, error copy explains how to correct the problem without exposing protected information |
| 3.3.4 Error Prevention (Legal, Financial, Data) | AA | Review & Send permits confirmation/correction; destructive changes require review or reversibility; corrections preserve history |
| 3.3.7 Redundant Entry | A | Data entered earlier in the same lead process is prefilled or available for selection and remains editable when valid |
| 3.3.8 Accessible Authentication (Minimum) | AA | Authentication permits password managers/copy-paste and avoids cognitive-function tests unless a conforming alternative/mechanism exists |

### Robust

| Criterion | Level | Territory Desk rule and evidence |
| --- | --- | --- |
| 4.1.2 Name, Role, Value | A | Native controls first; custom widgets expose correct name, role, state, value, relationships, and changes |
| 4.1.3 Status Messages | AA | Loading, success, error, count, connection, and result changes are programmatically determined without unnecessary focus movement |

WCAG 2.2 removed the former 4.1.1 Parsing criterion. Valid, maintainable markup remains an engineering quality requirement, but it is not represented as a current WCAG 2.2 success criterion.

## Semantic page contract

Every rendered route provides:

1. A unique document title.
2. Declared page language.
3. One application header/banner where appropriate.
4. One primary navigation landmark with an accessible label appropriate to its responsive variant.
5. One `<main>` landmark with a stable target for the skip link.
6. One descriptive `<h1>` representing the current route.
7. Logical heading levels without choosing levels for visual size.
8. Native lists for navigation, cards/rows when list semantics apply, and the activity timeline.
9. Native table markup for genuinely tabular manager information, including caption and header associations.
10. A consistent Help and Feedback route.
11. A unique route-level loading, access, error, or not-found heading when ordinary content cannot render.

Generic `<div>` and click handlers cannot replace a button, link, heading, list, table, fieldset, label, status, or landmark when native HTML expresses the purpose.

## SPA route and focus behavior

1. Forward navigation updates the document title and places focus on the destination `<h1>` or the main region according to the approved route transition.
2. Browser Back restores the originating view, filters, scroll position, and focus when the authorized origin remains available.
3. Direct links place focus at the safe destination heading after authentication/authorization resolution.
4. Opening a dialog, sheet, or action menu moves focus according to the approved component contract.
5. Closing returns focus to the opener unless the completed action logically removes it; then focus moves to the updated record heading or next safe target.
6. Validation failure moves focus to an error summary or first invalid field and exposes links/relationships to every invalid input.
7. Dynamically added content does not unexpectedly steal focus.
8. Sticky top/bottom bars use scroll padding and content clearance so focused controls and route anchors remain visible.
9. Fragment-selected panels receive appropriate selected state and heading context without executing a command.

## Keyboard and switch-control contract

1. Complete every core workflow using Tab, Shift+Tab, Enter, Space, Escape, arrow keys where the pattern requires, and browser Back.
2. Do not use positive `tabindex`.
3. Static content is not added to the tab order without a specific focus-management reason.
4. Navigation, forms, cards, rows, tabs, menus, dialogs, sheets, filters, activity panels, and help remain reachable in a logical order.
5. Focus is never trapped outside an intentionally active modal.
6. Keyboard commands do not depend on holding a key for a precise duration.
7. No command executes twice from key repeat or mixed pointer/keyboard events.
8. Skip Link is the first ordinary focus target and becomes visibly usable when focused.

## Screen-reader contract

1. Test the accessible name, role, value/state, description, grouping, reading order, and result announcement—not merely whether an element is discoverable.
2. Decorative icons are hidden. Icon-only utilities receive concise names; business actions retain visible text.
3. Status badges expose their full textual meaning. Visual `99+` uses the authorized complete count in its accessible label.
4. Form labels, help, required/optional meaning, errors, and format instructions are programmatically associated.
5. Tables and charts provide a linear summary and data relationship; no canvas/SVG-only insight is accepted.
6. Route changes are announced through title/focus behavior rather than an unnecessarily chatty global live region.
7. Loading, connection, success, error, and unknown-outcome messages announce once through the appropriate polite or assertive channel.
8. Repeated cards and action buttons include enough context to distinguish them without exposing additional unauthorized information.
9. Hidden responsive copies are not duplicated in the accessibility tree.
10. Sign-out, role loss, and route change remove stale protected content from both the visible page and accessibility tree.

## Visual, zoom, and reflow contract

1. Test the exact approved contrast matrix from source tokens; never rely on screenshots or rounded ratios.
2. Test 200% text resize without loss of content or function.
3. Test reflow at 320 CSS pixels and desktop zoom that produces an equivalent narrow viewport.
4. Test the WCAG text-spacing override values simultaneously.
5. Long fictional names, departments, cities, status, dates, and translated-length expansion wrap without covering actions.
6. No core horizontal scrolling. A genuinely two-dimensional chart/table exception provides a labeled accessible alternative and keeps surrounding content reflowed.
7. Forced colors preserve text, controls, selection, current navigation, status, error, and focus meaning.
8. Browser/user styles can override fonts, colors, spacing, and zoom without hiding functionality.
9. Background images, transparency, glare, and sticky overlap cannot reduce tested contrast.
10. Outdoor review occurs on representative smartphone brightness settings; this is a usability test beyond calculated WCAG ratios.

## Touch, speech, and device contract

1. Every interactive target remains at least 44 × 44 CSS pixels in portrait and landscape.
2. Adjacent destructive and primary actions have adequate physical separation and explicit labels.
3. Touch functionality never depends on hover, right click, precision dragging, or a multi-finger gesture.
4. Pointer activation completes on release so sliding away can cancel before activation when supported.
5. Visible labels are included verbatim in accessible names so speech users can say what they see.
6. Interface operation never requires shaking, tilting, rotating, or moving the device.
7. On-screen keyboard, safe areas, browser controls, bottom navigation, banners, and sheets do not hide the active field or action.
8. Portrait and landscape preserve content and functionality.
9. No initial release workflow requires camera, microphone, location, contacts, motion, or calendar permission.

## Forms, errors, and cognitive clarity

1. Keep the approved four-step Send Lead flow: Route, Customer, Opportunity, Review & Send.
2. Each step begins with a descriptive heading, short purpose, required/optional explanation, and visible progress text such as `Step 2 of 4`.
3. Previously entered valid information remains visible and editable on later steps; do not request it again.
4. Review & Send presents destination representative/department, customer need, location, timing, contact availability, and notification behavior before final submission.
5. Required fields use text, not only an asterisk or color.
6. Errors identify the exact problem and correction. Technical codes remain outside ordinary copy.
7. Error summary and inline errors remain synchronized.
8. Definite failure preserves input. Unknown outcome explains that confirmation is pending and prevents duplicate submission.
9. Destructive actions state what changes, what remains, and whether reversal is available.
10. Use plain language, short sentences, sentence case, explicit verbs, familiar department names, and unambiguous dates/times with timezone context.
11. Avoid unexplained abbreviations, rank language, shame, urgency animation, and raw system terminology.
12. The one-business-day response target is an operational status, not a countdown that forces the user to complete a timed UI task.

## Authentication and timeout accessibility

1. Production identity remains unselected until Cintas approval; the eventual provider must be evaluated as part of the end-to-end journey.
2. Do not block password managers, autofill, copy, paste, or approved device-based authentication.
3. Do not require users to solve a puzzle, memorize/transcribe arbitrary characters, or manually copy a one-time code when no accessible alternative/mechanism exists.
4. Authentication errors identify a next action without revealing whether a protected account/record exists.
5. Session expiration warning is focus-accessible, announced once, and gives adequate time to extend when company security policy permits.
6. If security policy makes a timeout essential, document the reason and preserve eligible unsaved work only under the approved same-identity rules.
7. Reauthentication returns the same authorized user to a safe reviewed state; it never silently submits pending input.
8. Demo persona selection in Preview is clearly fictional and fully keyboard/screen-reader operable.

## Motion, updating content, and notifications

1. Honor `prefers-reduced-motion`; remove nonessential transitions, shimmer, smooth scroll, and transforms.
2. Never flash, strobe, pulse, auto-scroll, or animate status to create pressure.
3. Auto-updating counts do not repeatedly interrupt screen-reader users.
4. A user can pause or dismiss any later moving/updating content that persists, unless the content is essential and separately justified.
5. Toasts contain duplicate low-risk confirmation only and pause on hover/focus; consequential messages persist.
6. In-app, SMS, and future system notifications use generic privacy-safe text and never treat delivery as authenticated reading.
7. Notification sound/vibration is controlled by the user agent/device; Territory Desk does not add an independent autoplay sound.

## Driving and field-safety rule

Representatives must not interact with Territory Desk while driving.

1. Onboarding/help includes: `Park safely before using Territory Desk. Do not read, type, or respond while driving.`
2. Generic SMS attention copy ends with or includes `Open Territory Desk when safe.` where company messaging policy permits.
3. No pulsing countdown, repeated in-app alarm, escalating visual pressure, or lock-screen customer detail encourages immediate road use.
4. No command can be completed directly from an SMS notification without opening the authenticated app and reviewing the record.
5. The app does not request motion or continuous location access to determine whether the employee is driving.
6. Route/navigation functionality remains outside the initial Territory Desk scope. If introduced, it requires a separate safety, privacy, accessibility, and company-policy review.

This rule is not a substitute for company driving policy; it is a product guardrail that avoids creating an unsafe interaction incentive.

## Minimum supported testing matrix

Exact operating-system and browser versions are locked at the start of implementation and rechecked before each pilot. The company-laptop operating system is still unverified; Windows is a planning assumption, not a fact.

| Context | Minimum manual coverage |
| --- | --- |
| Personal smartphone — iOS | Safari, VoiceOver, text enlargement, portrait/landscape, reduced motion, weak connection |
| Personal smartphone — Android | Chrome, TalkBack, font/display enlargement, portrait/landscape, reduced motion, weak connection |
| Company laptop — assumed Windows | Current supported Edge, keyboard only, NVDA, 200% zoom, 320-CSS-pixel reflow equivalent, forced colors |
| Secondary desktop browser | Current supported Chrome, keyboard, zoom, reduced motion |
| Optional development cross-check | Safari/VoiceOver on macOS when available; not a substitute for iPhone testing |

Touch testing must use physical hardware before a production pilot. Browser emulation helps layout testing but does not replace VoiceOver, TalkBack, keyboard, or real touch behavior.

## Core manual workflow scripts

Each script runs as a keyboard-only user and with the applicable screen reader; smartphone scripts also use touch exploration:

1. Enter fictional Preview and identify the environment disclosure.
2. Navigate the complete shell with Skip Link and consistent navigation.
3. Find a territory by fictional ZIP/city, interpret a routed result, and recover from an exception.
4. Open a representative profile and begin Send Lead with safe prefill.
5. Complete all four Send Lead steps, intentionally trigger errors, correct them, review, and submit once.
6. Open a received lead from Home, Leads, and Notification Center; confirm current owner/status/action.
7. Respond, request information, provide feedback, and observe the sender-side update.
8. Create, reschedule, complete, and cancel a follow-up; review privacy-safe calendar export explanation.
9. Use filters, list views, Back restoration, fragments, long names, zero results, and pagination.
10. As manager, open Insights and exceptions; as representative, confirm the manager route/action/data is unavailable without disclosure.
11. Exercise Data Status, Profile, Help, request submission, and reporter-only request history.
12. Trigger offline, stale, partial failure, session expiration, access denied, not found, update required, and unknown Send Lead outcome.
13. Sign out and confirm browser Back, accessibility tree, counts, and focus expose none of the prior identity's content.

## Automated and manual evidence

### Automated gates

1. Static JSX/HTML accessibility linting for every component.
2. Unit/component assertions by accessible role, name, description, state, and relationship rather than CSS selector alone.
3. Automated accessibility scans for every canonical route and meaningful state fixture.
4. Exact contrast-token calculation using unrounded source values.
5. Playwright keyboard workflow checks, focus-order snapshots where useful, route-title checks, reduced-motion checks, and viewport/reflow checks.
6. Build-time rejection of missing accessible names, unsafe raw component colors, invalid heading/landmark patterns where detectable, and duplicate IDs.
7. Zero automated serious or critical findings in the selected scanner before preview publication.

Automated tools cannot prove WCAG conformance. They supplement—not replace—manual keyboard, screen-reader, zoom, cognition, touch, and recovery testing.

### Manual evidence record

For each criterion/route/state combination, retain:

1. Build identifier and source commit.
2. Date and tester.
3. Device, operating system, browser, assistive technology, zoom/text settings, and orientation.
4. Workflow and fictional persona.
5. Expected and observed behavior.
6. Pass, fail, not applicable, or blocked result with evidence.
7. Defect link, severity, owner, retest result, and approval.

Do not record real customer, employee, lead, contact, credential, token, screenshot, or protected diagnostic data in accessibility evidence.

## Defect severity and release policy

| Severity | Definition | Release effect |
| --- | --- | --- |
| Blocker | Core workflow cannot be completed; keyboard trap; inaccessible authentication; hidden focus; false/duplicate command result; protected data exposure | Preview/Production release blocked |
| Major | WCAG A/AA failure, material screen-reader/zoom/touch barrier, or missing equivalent on a supported route/state | Release blocked until fixed or feature removed from scope |
| Moderate | Accessibility/usability defect with a viable but inefficient workaround and no A/AA failure | Must have owner, documented impact, and approved near-term fix; cannot be silently ignored |
| Minor | Cosmetic inconsistency that does not reduce access, meaning, operation, or safety | May enter backlog with evidence |

There is no waiver for a known Level A or AA failure merely because an automated tool did not detect it or the feature is labeled a prototype.

## Human review requirement

1. The implementer completes routine automated and manual checks continuously.
2. Before public Preview is represented as accessible, a second knowledgeable reviewer independently performs keyboard, zoom/reflow, form-error, and screen-reader checks.
3. Before a protected employee pilot, obtain company-approved testing with at least one experienced screen-reader user/tester and one keyboard/zoom or mobility-access tester; include representatives and managers when recruitment permits.
4. Accessibility feedback routes through the approved Help and Feedback system and never requires inaccessible evidence such as a screenshot.
5. A named product owner owns triage, remediation, retest, supported-technology updates, and accessibility-statement accuracy.

## Phase 4 exit and implementation gates

Step 4.5 approval completes the design-definition portion of Phase 4, but does not prove visual or accessibility conformance before screens exist.

Before Step 5 implementation begins:

1. Layout rules, design tokens, component states, and this accessibility plan are approved.
2. Every component has a state owner and intended native/ARIA pattern.
3. WCAG A/AA criteria have an applicability rule and evidence method.
4. Device/assistive-technology dependencies and the unverified laptop operating system are recorded.

Before Preview publication:

1. Every canonical fictional route/state passes the applicable automated gate.
2. Core workflows pass keyboard, screen-reader, zoom/reflow, touch, reduced-motion, and error-recovery tests.
3. No blocker, major, or known WCAG A/AA defect remains.
4. Preview uses truthful in-progress/conformance language and an accessible feedback path.

Before protected Production or employee pilot:

1. End-to-end identity and third-party surfaces are included.
2. Physical-device and independent human testing is complete.
3. Accessibility evidence, known limitations, support ownership, company review, and release approval are current.

## Explicit rejections

Do not:

1. Claim WCAG conformance from design documents or automated scans alone.
2. Ship a known Level A/AA failure because the application is a prototype.
3. Use color, position, icon, vibration, sound, or animation as the only meaning.
4. Lock orientation, disable zoom, clip enlarged text, or require horizontal scrolling for core content.
5. Depend on hover, drag, swipe, motion, precise timing, or pointer-down activation.
6. Remove outlines, use positive `tabindex`, or allow sticky content to cover focus.
7. Introduce custom ARIA widgets when native HTML supplies the required behavior.
8. Block password managers, copy/paste, or accessible authentication alternatives.
9. Erase valid input or require redundant re-entry after errors or between lead steps.
10. Auto-dismiss consequential errors, required actions, unknown outcomes, or success evidence.
11. Publish charts, PDFs, media, or third-party flows without equivalent accessibility scope.
12. Encourage interaction while driving or expose customer detail in a road-visible notification.

## Standards references

- [WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/)
- [WCAG 2.2 changes and new criteria](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)
- [WCAG reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow)
- [WCAG focus not obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)
- [WCAG target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [WCAG text spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing)
- [WCAG content on hover or focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html)
- [WCAG error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html)
- [WCAG redundant entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html)
- [WCAG accessible authentication](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html)
- [W3C ARIA Authoring Practices patterns](https://www.w3.org/WAI/ARIA/apg/patterns/)

## Acceptance checklist

- [x] WCAG 2.2 Level AA is approved as the complete application target without a premature conformance claim.
- [x] Enhanced 44-pixel target, focus visibility, input-preservation, weak-connection, and field-safety requirements are approved.
- [x] All canonical authenticated, role-controlled, authentication, system, overlay, and transient states are in scope.
- [x] Every Level A and AA criterion has an application or conditional rule.
- [x] Native semantic page, heading, landmark, list, table, form, and status requirements are approved.
- [x] SPA document-title, route-focus, Back restoration, error-focus, and sticky-content rules are approved.
- [x] Keyboard, no-trap, skip-link, composite-widget, and no-positive-tabindex requirements are approved.
- [x] Screen-reader naming, grouping, reading-order, chart alternative, live-region, and protected-content rules are approved.
- [x] Contrast, 200% text, 320-pixel reflow, text spacing, forced-color, long-content, and outdoor tests are approved.
- [x] Touch, pointer cancellation, label-in-name, no-drag, no-motion-actuation, orientation, safe-area, and permission rules are approved.
- [x] Four-step form clarity, redundant-entry prevention, Review & Send, error correction, and plain-language rules are approved.
- [x] Authentication, password-manager, copy/paste, cognitive-test, session-warning, and reauthentication rules are approved.
- [x] Reduced-motion, no-flash/pulse, updating-count, toast, and notification rules are approved.
- [x] Explicit no-driving interaction and privacy-safe attention-message rules are approved.
- [x] iOS/VoiceOver, Android/TalkBack, assumed Windows/Edge/NVDA, keyboard, zoom, forced-color, and physical-device matrix is approved subject to device verification.
- [x] Thirteen core manual workflow scripts are approved.
- [x] Automated, manual, evidence-record, privacy, and independent-review requirements are approved.
- [x] Blocker/major release policy and no-known-A/AA-defect gate are approved.
- [x] Accessibility feedback ownership and protected-pilot human testing are approved.
- [x] Rejected premature claims, inaccessible interactions, redundant entry, disappearing outcomes, inaccessible third parties, and driving pressure remain excluded.

## User action

No GitHub or coding action is required from the user. This release standard is approved. Step 4.5 and the Phase 4 design definition are complete. Step 5.1 will scaffold the separate React/TypeScript application and begin implementing the approved system with fictional data only.
