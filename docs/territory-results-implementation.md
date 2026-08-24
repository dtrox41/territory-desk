# Step 5.3.3 — Fictional Territory Results Implementation

Status: Implementation complete locally; awaiting user approval

Date: 2026-08-24

## Outcome

The `/territory` workflow now turns an approved fictional ZIP or city lookup into grouped department and representative results. It demonstrates the full decision boundary between a uniquely assigned recipient, an open territory, a conflicting assignment, stale routing data, missing contact methods, and an incomplete location label.

No result is real. Every person, ZIP assignment, location number, source division, status, date, and identifier is fictional. The original application, employee directory, Dynamics 365, messaging, Outlook, browser storage, and production services remain disconnected.

## Implemented result contract

1. Result header with canonical city/state, ZIP coverage, matching count, exception count, active filters, and `Source updated`.
2. Department groups preserving exact fictional source-division labels.
3. Required ordering: Needs Review, Open, then Assigned; no customer-value, lead-volume, or representative-performance ranking.
4. Assigned cards with location, ZIP coverage, fictional representative, contact availability, source date, Send Lead, View Representative, contact disclosure, and reporting action.
5. Conflict cards listing every fictional representative and stating that Territory Desk will not choose automatically.
6. Open Territory cards that fabricate no recipient and replace Send Lead with Request Routing Help.
7. City results that show every known ZIP and require an explicit customer ZIP before Send Lead appears.
8. Stale-source results that remain readable but block Send Lead.
9. Incomplete-location results that remain visible but block Send Lead and request routing help.
10. No-result, filtered-empty, loading, retryable-error, state-disambiguation, and ZIP+4-normalization behavior.

## Fictional pressure-test fixtures

- `63101` — five department results: three uniquely assigned, one open territory, and one two-representative conflict. Facility Services also demonstrates unavailable Text contact.
- `Columbia, MO` — `65201` and `65203`; Send Lead remains unavailable until one ZIP is chosen, after which three stable assignments are available.
- `02108` — stale-source result; Send Lead is blocked.
- `30303` — assigned result with restricted Call, available Email, and unavailable Text; demo contact never opens a real device utility.
- `10001` — incomplete location label; Send Lead is blocked.
- `62701` — unique assigned result.
- `65806` — open territory.

## Handoff and privacy boundary

Send Lead appears only when all of these are true:

1. Search uses one exact five-digit ZIP.
2. Assignment status is Assigned.
3. Exactly one stable fictional representative can receive handoffs.
4. Source state is current.
5. Location label is usable.

The link destination is exactly `/leads/new`. A fictional routing snapshot travels through React Router in-memory navigation state and includes only the approved assignment, ZIP, city, state, department, division, location, representative, and fictional source-version identifiers. The URL contains none of those internal identifiers and never contains customer data or contact details. The future Lead Creation screen must revalidate the snapshot before submission.

Call, Email, and Text are explicitly separate from Send Lead. In the public prototype they are simulated controls only: activation announces that no device action and no tracked handoff occurred.

## Route and filter restoration

The connected-browser test found that the first implementation restored `zip=30303` after returning from Send Lead but lost the visible assignment cards. Route-level fictional loading now reconstructs the recognized result for direct links and browser Back. The same fix also re-runs city ambiguity and no-result rules for a directly opened safe URL.

Department, state, location, and status filters apply immediately to the visible result. Approved values use the canonical `department`, `state`, `location`, and `status` parameters. Unknown values fall back safely instead of creating a blank filter or broadening scope. Result counts and active-filter labels always reflect the visible records.

## Accessibility and responsive behavior

1. Results form one labeled region with semantic department regions, articles, headings, lists, and description lists.
2. Status is written in text and reinforced by boundary color; color is never the only cue.
3. Every measured visible control meets the 44 × 44 CSS-pixel minimum.
4. Contact utilities use a native disclosure and remain keyboard operable.
5. Loading and stale states use programmatic status announcements; errors preserve the query and offer Try Again.
6. Conflict lists expose each fictional representative as a separate link.
7. Smartphone results use one column and fixed bottom navigation without horizontal overflow.
8. Laptop results use two balanced department columns while preserving DOM, reading, and keyboard order.

Observed results:

- 320 × 800: no horizontal overflow; no undersized measured targets; exception cards remain readable.
- 390 × 844: no horizontal overflow; no undersized measured targets; city ZIP selection, filtering, contact disclosure, and exception recovery passed.
- 1440 × 900: no horizontal overflow; two 523-pixel department columns; no undersized measured targets.
- Browser console: no warnings or errors.
- Direct link and Back: `?zip=30303` reconstructed Atlanta results after returning from `/leads/new`.
- Safe filters: `status=needs-review` showed one conflict and no result-level Send Lead action.

## Automated verification

- Prettier: passed.
- ESLint and JSX accessibility rules: passed.
- React Router type generation and strict TypeScript: passed.
- Environment and design-token tests: 24 passed.
- Component, domain, navigation, and fictional-adapter tests: 24 passed across nine files.
- Total automated non-browser tests: 48 passed.
- Preview production build: passed with the exact `/territory-desk/` base path; 136 client modules transformed.
- GitHub Pages `index.html` and `404.html` fallback: generated and identical.
- Nine Playwright/Axe tests remain defined for desktop Chromium, mobile Chromium, and mobile WebKit. Their separate local browser binaries are not installed, so this dependency failure is not represented as an app pass; the connected-browser tests above did pass.

## Deliberately deferred

- Working Lead Creation fields and routing revalidation — Step 5.3.5 after Directory.
- Working Representative Detail content — Step 5.3.4 Directory.
- Persisted data-quality report submission and My Submitted Reports — later Data Status work.
- Actual device Call, Email, and Text utilities with authorization and confirmation.
- Real territory, representative, contact, location, or customer data.
- Protected authentication, authorization, Dynamics synchronization, and production data freshness.
- GitHub remote, workflow, push, Pages configuration, or deployment.

## Step 5.3.3 acceptance checklist

- [x] Step 5.3.2 was accepted before Territory Results implementation began.
- [x] Department groups preserve exact source-division labels.
- [x] Needs Review, Open, and Assigned ordering is deterministic.
- [x] City results require an exact customer ZIP before Send Lead.
- [x] Open, conflicting, stale, and incomplete results cannot silently send.
- [x] Stable assigned results pass a privacy-safe in-memory routing snapshot.
- [x] Contact utilities cannot be mistaken for a tracked handoff.
- [x] Filters change visible records, counts, labels, and safe URL state together.
- [x] Direct links and browser Back reconstruct fictional results.
- [x] Smartphone and laptop compositions pass targeted pressure checks.
- [x] Automated non-browser checks and Preview production build pass.
- [x] Original application and GitHub remain unchanged.

## Next decision

Approve Step 5.3.3 before implementation proceeds to Step 5.3.4, the fictional Representative Directory.
