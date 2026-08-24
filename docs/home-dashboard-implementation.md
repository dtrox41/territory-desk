# Step 5.3.1 — Fictional Home Dashboard Implementation

Status: Implementation complete locally; awaiting user approval

Date: 2026-08-24

## Outcome

The Home route now answers the approved first question: **What cross-department lead action should I take next?** It replaces the Step 5.2 shell placeholder with an action-first dashboard for the fictional representative Taylor.

The dashboard is a safe GitHub Preview demonstration. Every person, company, handoff, count, status, and timestamp is fictional. No source from the original application, employee directory, customer record, Dynamics environment, messaging provider, browser storage, or protected service is connected.

## Business objective represented

The prototype demonstrates how New Business representatives across Uniform, Facility Services, First Aid, and other departments can:

1. Send a lead to the correct teammate.
2. See which peer handoffs require their response or follow-up.
3. See whether a handoff they sent was viewed, accepted, or updated.
4. Receive meaningful feedback and outcomes inside one collaboration record.
5. Act on open loops without relying on scattered texts and emails.
6. Review personal collaboration signals without an employee leaderboard or unsupported sales claims.

The dashboard deliberately excludes calls per day, customer visits per day, revenue, conversion, rep ranking, and generic CRM activity. Those measures do not support the approved peer-handoff objective.

## Implemented hierarchy

1. Compact fictional representative greeting, date, and action count.
2. Send Lead and Find Territory quick actions on smartphones.
3. Find Representative as the third quick action on wider screens.
4. Collaboration Summary with New, Needs Attention, Waiting, and Outcomes.
5. Action Required with five total actions and the four highest-ranked cards shown.
6. Waiting on Others with two sent handoffs.
7. Recent Feedback and Outcomes with three meaningful events.
8. Cross-Department Insights with Response Target, Open Loops, and Recent Progress.

All View All, primary, secondary, and supporting-record links follow the approved Step 2.12 route contract. Dashboard actions only navigate to the relevant workflow; they do not silently accept, decline, complete, message, or otherwise mutate a handoff.

## Action Required ranking

The fictional adapter returns one item per handoff in this deterministic order:

1. Response target missed.
2. Lead-derived follow-up overdue.
3. Requested information received.
4. New unread peer handoff.

Every card displays its ranking reason. Customer value, estimated revenue, sender seniority, department, and raw lead volume do not influence priority.

The Leads navigation badge now equals the five-item Action Required total. It remains separate from the three unread-notification count.

## Data and service boundary

The route does not import mock arrays. It uses:

- Shared domain types in `app/domain/home-dashboard.ts`.
- A `HomeDashboardService` interface.
- A deterministic in-memory fictional adapter.
- A React Router `clientLoader` that obtains the screen model through that service.
- A pure `HomeDashboard` feature component that receives typed dashboard data.

This boundary lets a future protected HTTP service replace the fictional adapter without rewriting the page composition. The client-side display remains unable to grant authorization or prove an external business outcome.

## Accessibility and field-use behavior

1. The route has one main landmark, one descriptive `h1`, and logical `h2` and `h3` hierarchy.
2. Quick actions and cards use real links with visible labels.
3. Every tested link and button is at least 44 × 44 CSS pixels.
4. Relative timestamps expose an exact fictional date, time, and timezone through their accessible name.
5. Status meaning appears in text; color remains supplemental.
6. View All links include section-specific accessible names.
7. Lists, ordered queues, articles, sections, and navigation landmarks preserve meaning.
8. Forward navigation focuses the destination heading; browser Back returns to Home.
9. The 320-pixel composition hides summary descriptions visually to surface Action Required sooner, while each summary link retains its full accessible meaning.
10. No content requires hover, drag, location, camera, microphone, contacts, calendar permission, or a persistent browser cache.

## Responsive pressure-test findings

The first 390-pixel implementation placed the Action Required heading immediately below the usable initial viewport. Browser inspection caused two refinements:

1. The separate top-of-page demo-refresh row moved into the lower Insights block.
2. Summary cards became more compact, with a special 320-pixel treatment that preserves full accessible labels while omitting secondary descriptions visually.

Final observed results:

- 320 × 800: no horizontal overflow; two smartphone quick actions; Action Required visible above the bottom navigation; no target below 44 pixels.
- 390 × 844: no horizontal overflow; Action Required visible in the initial usable viewport; no target below 44 pixels.
- 1440 × 900: 256-pixel rail, 1184-pixel main area, one visible primary navigation model, three quick actions, two-column Action Required and Waiting composition, and full-width Feedback and Insights blocks.
- Navigation: Find Territory reached the canonical route and focused its `h1`; browser Back returned to the Home dashboard.
- Browser console: no warnings or errors.
- DOM audit: one copy of every dashboard section and nine expected article records.

## Automated verification

- Prettier: passed.
- ESLint and JSX accessibility rules: passed.
- React Router type generation and strict TypeScript: passed.
- Environment and design-token tests: 24 passed.
- Component, navigation, and fictional-adapter tests: 9 passed across five files.
- Total automated non-browser tests: 33 passed.
- Preview production build: passed with the exact `/territory-desk/` base path.
- GitHub Pages `index.html` and `404.html` fallback: generated and identical.
- Six Playwright/Axe browser tests remain defined for the future GitHub workflow gate. The current macOS sandbox limitation is not represented as a local end-to-end pass.

## Deliberately deferred

- Working Lead Detail commands and status changes.
- Live data refresh, block-local loading, retry, stale, and offline simulations.
- Real identity, representative scope, manager scope, or authorization.
- Real employee, customer, Dynamics, SMS, Outlook, email, or calendar data.
- Analytics transmission or persistent browser storage.
- GitHub remote, workflow, push, Pages configuration, or deployment.

Those behaviors require later screen steps or the approved protected-production gates.

## Step 5.3.1 acceptance checklist

- [x] Step 5.2 was accepted before Home implementation began.
- [x] Home answers the next cross-department lead-action question first.
- [x] Calls-per-day and customer-visits-per-day content remains excluded.
- [x] Typed fictional data enters through the approved service boundary.
- [x] Quick actions and all dashboard drill-downs use approved canonical destinations.
- [x] Action Required ranking is deterministic and explainable.
- [x] Waiting, feedback, outcomes, and personal insights close the collaboration loop.
- [x] Notification and Action Required counts remain distinct.
- [x] Smartphone and laptop compositions pass targeted pressure checks.
- [x] Automated non-browser checks and Preview production build pass.
- [x] Original application and GitHub remain unchanged.

## Next decision

Approve Step 5.3.1 before implementation proceeds to Step 5.3.2, the fictional Territory Lookup screen.
