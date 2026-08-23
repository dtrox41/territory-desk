# Phase 2 Exit Audit

Initial audit date: 2026-08-22

Repeat audit date: 2026-08-22

Status: Final route-and-action contract closure required before Phase 3

## Repeat-audit decision

Do not enter technical architecture yet.

All eight screen families identified by the first audit now have approved, detailed specifications. State handling, responsive behavior, privacy, accessibility, and role boundaries meet the Phase 2 product-definition threshold.

The repeat audit found a smaller but material consolidation gap: cross-screen navigation and action destinations are not yet represented by one complete canonical contract. Beginning architecture now would force route names, filtered-list destinations, and direct-link fallbacks to be chosen during implementation.

## Exit-criteria results

| Exit criterion | Result | Evidence |
| --- | --- | --- |
| Every first-release screen family has an approved specification | Pass | All primary, detail, secondary, authentication, and system-state families now have approved screen specifications. |
| Every first-release route is listed in one canonical route model | Partial | Screen documents define the routes, but `docs/navigation-spec.md` does not yet include every nested, help-request, authentication, and system route. |
| Every primary button maps to an exact approved command or navigation result | Partial | Core workflow commands are complete; several cross-screen actions still need exact destination, filter, preserved-state, and fallback mappings. |
| Empty, loading, partial, error, stale, offline, unauthorized, and success behavior is documented | Pass | Each applicable screen specification defines these states and corresponding safe recovery. |
| Representative and manager permissions are explicit | Pass | Personal My Work, manager scope, team insight, record-participant access, and direct-link denial rules are approved. |
| Lead fields, statuses, ownership, follow-ups, and activity are approved | Pass | Lead creation, status and ownership, follow-up, activity, list, and detail specifications reconcile. |
| Action ranking and collaboration insights are approved | Pass | Deterministic action ordering, KPI definitions, denominators, guardrails, drill-downs, and small-sample rules are approved. |
| Smartphone and laptop composition is defined | Pass | Every routed application screen preserves one mental model with device-appropriate composition. |
| Accessibility and privacy requirements are testable | Pass | Each screen includes accessibility, data-minimization, URL, analytics, cache, and prototype-data requirements. |
| Authentication and production-hosting boundaries are approved | Pass | GitHub Pages is fictional-prototype-only; production requires server-enforced authentication, authorization, session, and data delivery. |

## Previously identified gaps now closed

1. Leads List — approved in `docs/leads-list-spec.md`.
2. Lead Detail — approved in `docs/lead-detail-spec.md`.
3. Notification Center — approved in `docs/notification-center-spec.md`.
4. Manager Insights — approved in `docs/manager-insights-screen-spec.md`.
5. Data Status — approved in `docs/data-status-screen-spec.md`.
6. My Profile — approved in `docs/profile-screen-spec.md`.
7. Help and Feedback — approved in `docs/help-feedback-screen-spec.md`.
8. Authentication and System Pages — approved in `docs/authentication-system-pages-spec.md`.

## Remaining gap 1 — Canonical route registry

The route inventory is distributed across approved documents. The global route model currently omits or does not consolidate:

1. Representative Detail — `/directory/:representativeId`.
2. Help Topic — `/help/:topicSlug`.
3. Reporter-visible Help Request Detail — an exact canonical route is not yet named.
4. Sign In — `/sign-in`.
5. Authentication Return — `/auth/return`.
6. Sign-in Help — `/sign-in/help`.
7. Session Expired — `/session-expired`.
8. Access Required — `/access-required`.
9. Access Denied — `/access-denied`.
10. Account Unavailable — `/account-unavailable`.
11. Signed Out — `/signed-out`.
12. Offline — `/offline` when represented as a route.
13. Maintenance — `/maintenance`.
14. Update Required — `/update-required`.
15. Not Found — `/not-found`.
16. Unexpected Error — `/error`.

The canonical registry must also distinguish full routes from fragments, in-place panels, dialogs, and filtered views so implementation does not create unnecessary pages.

## Remaining gap 2 — Cross-screen action destinations

Several approved controls describe the correct intent but do not yet name one exact destination contract:

1. Home **View All** for Action Required.
2. Home **View All** or equivalent for Waiting on Others.
3. Home feedback and outcome expansion.
4. Home representative and manager **View Insights** behavior.
5. Data Status **View affected records** for territory, directory, workflow, notification, and Dynamics conditions.
6. Profile **Report access problem** versus **Get sign-in help** routing.
7. Help **My Requests** detail direct links.

Each mapping needs:

1. Origin.
2. Visible action label.
3. Destination route, fragment, dialog, or in-place view.
4. Allowed non-sensitive parameters or filters.
5. Authentication and authorization rule.
6. Browser Back and focus restoration.
7. Direct-link fallback.
8. Offline, stale, unavailable, and unauthorized behavior.

## Remaining gap 3 — Route privacy and fallback reconciliation

Approved screen documents contain strong local rules, but one shared contract must confirm:

1. Which filters may be represented in URLs.
2. Which identifiers must remain opaque.
3. Which values never appear in URLs, history, previews, metadata, analytics, or logs.
4. Which destination handles missing, inaccessible, retired, or changed records.
5. Whether browser Back returns to the source list, Home, My Work, or another safe route.
6. How direct links preserve no unauthorized source-screen state.

## Required closure step

### Step 2.12 — Approve the Route and Cross-Screen Action Contract

Create one canonical contract that:

1. Registers every first-release route and non-route surface.
2. Adds the reporter-visible Help Request Detail route.
3. Maps every cross-screen primary and View All action.
4. Defines allowed parameters, privacy restrictions, permission checks, active navigation, Back behavior, focus restoration, and safe fallbacks.
5. Reconciles mobile and laptop behavior without inventing device-specific workflows.
6. Adds route-contract acceptance tests.

This is a consolidation step, not a new feature family.

## Phase 3 entry rule

Phase 3 begins only after Step 2.12 is approved and a final validation confirms:

1. Every routed or stateful surface is registered.
2. Every primary cross-screen action has one deterministic destination or command.
3. Every direct link rechecks authentication, authorization, and record or source version.
4. Every unavailable or unauthorized destination has a safe fallback.
5. URL, history, metadata, analytics, and cache rules preserve privacy.
6. No implementation-time product decision remains in the route and action layer.

## Audit conclusion

Phase 2 is close but not complete. The prior eight screen gaps are closed. One bounded Step 2.12 contract is required before technical architecture.
