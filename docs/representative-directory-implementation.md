# Step 5.3.4 — Fictional Representative Directory Implementation

Status: Implementation complete locally; awaiting user approval

Date: 2026-08-24

## Outcome

The `/directory` and `/directory/:representativeId` routes now provide a
fictional people-discovery workflow for finding cross-department teammates,
understanding their approved service context, reviewing an authorized fictional
profile, and entering Lead Creation without bypassing territory validation.

No employee record is real. Names, identifiers, contacts, departments,
locations, territories, dates, and availability are fictional. The original
application, GitHub, Dynamics, company identity, messaging, and production
directory remain disconnected.

## Directory list

1. Persistent labeled search across display name, department, exact source
   division, location, and state.
2. Case-, spacing-, and accent-insensitive normalization.
3. Approved match order: exact name, name prefix, name contains, exact approved
   field, then approved-field prefix.
4. Deterministic alphabetical and stable-identifier tie breaking; no lead,
   outcome, response, value, seniority, or performance ranking.
5. Primary department filter plus collapsed source division, location, state,
   active status, and contact-availability filters.
6. URL-restorable fictional query and allowlisted filter values.
7. A short six-person first page, eight-item suggestion limit, cancellation of
   obsolete requests, and progressive Show More behavior.
8. Compact cards with minimum routing context, source divisions, location,
   state/ZIP summary, contact availability, status, View Representative, Send
   Lead, reporting, and source date.
9. Loading, empty, retryable error, stale, mismatched-version, offline, and
   filtered states.

## Identity and exception fixtures

- Two different fictional people named Cameron Brooks remain separate through
  stable identifiers, department, and location context.
- Robin Hale demonstrates an identity/contact exception: direct contact is
  disabled, while a tracked handoff may begin only for later territory
  revalidation.
- Sage Mitchell demonstrates missing direct contacts without losing stable
  in-app identity.
- Jamie Cole demonstrates an inactive historical profile excluded from ordinary
  search and blocked from new assignment.
- Devon Park demonstrates multiple departments, divisions, locations, states,
  and summarized coverage without an unbounded ZIP list.
- Massachusetts filtering demonstrates stale data that remains visible but
  blocks Send Lead.

## Representative detail

The canonical opaque-ID route shows status, department groups, exact source
divisions, locations, concise territory coverage, authorized fictional contact
details, separate Call/Text/Email simulations, Send Lead, source date, optional
actual verification date, and reporting.

Direct-contact activation reports that no external contact occurred and never
creates a handoff. Unknown identifiers fail closed. Inactive profiles point to
Territory Lookup. Connection loss keeps the already loaded profile visible but
disables direct contact and tracked-handoff entry.

## Handoff boundary

Directory and profile Send Lead links contain only the opaque fictional
representative identifier and a non-sensitive source marker. They do not contain
customer information, service, ZIP, assignment, phone, or email. Step 5.3.5
Lead Creation must collect the requested service and exact five-digit customer
ZIP, revalidate the current assignment version, and visibly handle a different,
ambiguous, open, stale, or mismatched recipient.

## Verification

- Search normalization, matching order, duplicate preservation, filtering,
  inactive exclusion, pagination, suggestion limits, historical detail, stale
  data, error recovery, offline blocking, and contact/handoff separation have
  automated coverage.
- Formatting, linting, React Router route generation, and strict TypeScript
  checks pass.
- All 26 environment, accessibility-token, and PWA foundation checks pass.
- All 45 domain, service, route, and component tests pass across 14 test files.
- The Preview production build passes with 146 client modules transformed and
  a GitHub Pages 404 fallback generated for the `/territory-desk/` base path.
- Browser QA passes at 390-pixel iPhone, 412-pixel Android, and 1440-pixel
  laptop widths with no horizontal overflow. Mobile bottom navigation and the
  laptop side rail switch correctly, duplicate Cameron Brooks results retain
  distinct accessible labels, canonical profile navigation succeeds, and the
  browser console contains no warnings or errors.
- The browser-based end-to-end accessibility scenario is defined for the
  Directory-to-profile path. Execution with external Playwright browser
  binaries remains part of the later deployment gate.

## Deliberately deferred

- Working service and ZIP revalidation in Lead Creation — Step 5.3.5.
- Persisted incorrect-information reports — later Data Status implementation.
- Real device contact handlers and confirmation policy.
- Real employees, contacts, territory assignments, authentication,
  authorization, or offline profile persistence.
- GitHub remote, workflow, push, Pages configuration, or deployment.

## Step 5.3.4 acceptance checklist

- [x] Directory remains people discovery; Territory remains routing authority.
- [x] Stable identifiers, not names or contacts, own identity.
- [x] Approved search fields, matching order, filters, and deterministic sorting
  are implemented.
- [x] The first page is bounded and progressive results preserve mobile use.
- [x] Duplicate names remain separate and accessible.
- [x] Conflicting, missing-contact, inactive, stale, offline, error, and empty
  states fail safely.
- [x] Contact utilities remain detail-only and distinct from tracked handoffs.
- [x] Send Lead passes only the representative identifier for later territory
  revalidation.
- [x] Manager behavior contains no performance ranking or unrestricted access.
- [x] Source updated and actual last verified dates remain separate.
- [x] Public data remains fictional and the original application is unchanged.

## Next decision

Approve Step 5.3.4 before implementation proceeds to Step 5.3.5, fictional Lead
Creation and territory revalidation.
