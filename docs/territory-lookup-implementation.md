# Step 5.3.2 — Fictional Territory Lookup Implementation

Status: Implementation complete locally; awaiting user approval

Date: 2026-08-24

## Outcome

The `/territory` route now provides an interactive, fictional search screen for finding a territory by ZIP, ZIP+4, city, or city and state. It replaces the Step 5.2 placeholder while preserving the approved separation between search in Step 5.3.2 and assignment cards in Step 5.3.3 Territory Results.

This is a safe GitHub Preview demonstration. Every location, ZIP, status, source date, and location identifier is fictional. The original application, employee directory, customer records, Dynamics 365, messaging, Outlook, browser storage, and protected services remain disconnected.

## Implemented behavior

1. Exact five-digit ZIP search.
2. ZIP+4 normalization to its first five digits with an explicit on-screen explanation.
3. City and city-state search with normalized state abbreviations.
4. Rejection of empty, partial, malformed, or unsupported input without inventing a result.
5. Deterministic, non-fuzzy fictional suggestions with keyboard selection and dismissal.
6. Explicit state selection when a city has multiple fictional matches, demonstrated by Springfield, Illinois and Springfield, Missouri.
7. Truthful no-match recovery with Clear Search, Directory, and missing-data routes.
8. Department as the primary filter plus collapsed State, Location, and Assignment Status filters.
9. Privacy-safe normalized URL criteria; customer name, address, phone, notes, and employee data never enter the URL.
10. A routing-source panel showing `Source updated`, explicitly declining to claim a nonexistent human-verification timestamp, the fictional-data boundary, and a Data Status link.

The recognized-location state deliberately says that matching assignment cards will appear after Territory Results is completed. It does not imply that a real representative or ownership assignment has been verified.

## Data and service boundary

The screen uses:

- `app/domain/territory-search.ts` for pure parsing and normalization.
- `TerritoryLookupService` for suggestions, duplicate-city matches, and known-ZIP recognition.
- A deterministic in-memory fictional adapter with demo locations in Georgia, Illinois, Massachusetts, Missouri, and New York.
- A feature component that owns ephemeral form, suggestion, filter, validation, announcement, and lookup-view state.
- The canonical `/territory` route and approved query-parameter allowlist.

No route imports original-app data, no assignment is mutated, and no URL value grants authorization or proves a real business record.

## Accessibility and field-use behavior

1. One main landmark and one semantic page `h1`; sections use logical `h2` headings.
2. Native form, input, select, button, link, `details`, and `summary` controls.
3. Accessible combobox/listbox suggestion semantics with Arrow Up, Arrow Down, Enter, and Escape behavior.
4. Invalid ZIP input sets `aria-invalid`, exposes a visible alert, preserves the entered value, and restores focus to the search field.
5. Ambiguous cities produce visible state-choice buttons instead of automatic routing.
6. All measured visible controls meet the 44 × 44 CSS-pixel minimum.
7. Filters begin collapsed to reduce field-use density.
8. Status meaning is written in text and does not depend on color.
9. No location permission, camera, microphone, contacts, or persistent storage is required.
10. The screen warns users not to enter a customer name or street address.

## Pressure-test findings and corrections

The first automated pass found duplicated validation text in a test selector and a synchronous effect-state pattern. Those were corrected by targeting the semantic alert and moving immediate suggestion reset behavior to direct input actions.

The connected-browser pass then found a real deferred-render race: after selecting `63101` from suggestions, the earlier `63` request could reopen the list. The final implementation suppresses suggestions after a deliberate selection or submission until the user edits again. Retesting confirmed that the list remains closed.

Final observed results:

- 320 × 800: no horizontal overflow; one main and page heading; collapsed filters; every measured visible control at least 44 pixels.
- 390 × 844: clean single-column smartphone composition with the search action above optional filters.
- 1440 × 900: persistent laptop rail, inline search fields, separate routing-source panel, no horizontal overflow, and no undersized measured controls.
- Partial ZIP: visible alert, `aria-invalid=true`, preserved input, and focus returned to the field.
- Keyboard suggestions: `63` → Arrow Down → Enter selected `63101` and dismissed the list.
- ZIP+4: `63101-1234` normalized visibly and serialized only as `zip=63101`.
- Duplicate city: Springfield required Illinois or Missouri; Missouri produced `city=Springfield&state=MO`.
- No match: `99999` returned a truthful no-assignment state without guessing.
- Filters: normalized allowlisted values entered the URL; no customer or employee data did.
- Browser console: no warnings or errors.

## Automated verification

- Prettier: passed.
- ESLint and JSX accessibility rules: passed.
- Strict TypeScript: passed.
- Environment and design-token tests: 24 passed.
- Component, domain, navigation, and fictional-adapter tests: 17 passed across eight files.
- Total automated non-browser tests: 41 passed.
- Preview production build: passed with the exact `/territory-desk/` base path; 131 client modules transformed.
- GitHub Pages `index.html` and `404.html` fallback: generated and identical.
- Nine Playwright/Axe tests are defined for desktop Chromium, mobile Chromium, and mobile WebKit. Local execution was attempted but the separate Playwright browser binaries are not installed; this dependency failure is not represented as an app pass. The connected-browser workflow and responsive checks above did pass.

## Deliberately deferred

- Department and representative assignment cards — Step 5.3.3 Territory Results.
- Real territory, location, department, or representative data.
- Protected identity, role, location scope, and authorization.
- Dynamics integration, synchronization, or verification.
- Loading, stale-data, offline, retry, and unknown-outcome simulations beyond the current suggestion status.
- GitHub remote, workflow, push, Pages configuration, or deployment.

## Step 5.3.2 acceptance checklist

- [x] Step 5.3.1 was accepted before Territory Lookup implementation began.
- [x] Search accepts the four approved input forms without fuzzy routing.
- [x] Partial and malformed ZIP input cannot submit.
- [x] ZIP+4 normalization is visible and privacy-safe.
- [x] Duplicate-city state disambiguation is required.
- [x] Suggestions work by pointer and keyboard and remain dismissed after selection.
- [x] No-match recovery never guesses a neighboring territory.
- [x] Typed fictional data enters through the approved service boundary.
- [x] Smartphone and laptop compositions pass targeted pressure checks.
- [x] Automated non-browser checks and the Preview production build pass.
- [x] Original application and GitHub remain unchanged.

## Next decision

Approve Step 5.3.2 before implementation proceeds to Step 5.3.3, the fictional Territory Results screen.
