# Territory Desk — Decision Log

Status: Active project record

Last updated: 2026-08-22

## D-001 — Keep the original project read-only

- Decision: The existing `territory-lookup` site and repository are reference-only. Territory Desk uses a separate folder, Git history, repository, deployment, and data environment.
- Reason: Preserve the original working version and eliminate accidental modification risk.
- Reversible: No, unless the user explicitly changes this boundary.

## D-002 — Use a neutral prototype identity

- Decision: Product name `Territory Desk`; subtitle `Cross-Division Sales Command Center`; repository name `territory-desk`; text-only prototype branding.
- Reason: Avoid presenting an unapproved prototype as an official corporate product.
- Reversible: Yes.

## D-003 — Focus on cross-department New Business collaboration

- Decision: Primary users are New Business Sales Representatives across local departments. Managers are secondary users.
- Reason: The main problem is fragmented rep-to-rep lead communication and weak visibility.
- Reversible: Partially; more roles may be added later.

## D-004 — Treat Dynamics 365 as the future system of record

- Decision: Territory Desk is a collaboration layer, not a replacement CRM. Real integration waits for confirmation of the exact Dynamics app, environment, tables, permissions, and owner.
- Reason: Dynamics already holds authoritative business records.
- Reversible: No for the current product scope.

## D-005 — Separate corporate Dynamics leads from peer handoffs

- Decision: Existing corporate Dynamics leads and Territory Desk peer handoffs are distinct workflows.
- Reason: Dynamics already emails and texts recipients for corporate leads, but it will not alert on independent peer handoffs.
- Reversible: Partially; approved integration may connect them later.

## D-006 — Use explicit handoff ownership and status

- Decision: A handoff starts as `Pending Acceptance`. The recipient selects `Accept`, `Need Information`, or `Decline`. Decline requires a reason. Acceptance transfers current ownership to the recipient.
- Reason: `Viewed` alone does not prove ownership or action.
- Reversible: Yes.

## D-007 — Require a Territory Desk SMS alert but simulate it initially

- Decision: Peer handoffs require an in-app alert and Territory Desk text alert. The no-budget prototype simulates provider delivery.
- Reason: Automated carrier SMS normally requires a paid or company-provided service.
- Reversible: Yes; an approved provider can be connected later.

## D-008 — Do not provision new Azure services

- Decision: The prototype and first release require no new Azure subscription, resources, Azure Communication Services, or separately billed Azure service.
- Reason: No Azure budget is available.
- Reversible: Yes, only with later funding and authorization.

## D-009 — Design mobile-first for a personal smartphone

- Decision: The primary device is a personally owned, employer-reimbursed smartphone. A company laptop is secondary.
- Reason: Representatives work in mixed field settings.
- Reversible: Partially; a native application may be considered later.

## D-010 — Use online-first resilience without full offline CRM

- Decision: Provide connection visibility, safe retry, duplicate prevention, and unfinished-form recovery. Do not build full offline CRM synchronization initially.
- Reason: Connectivity is generally strong and occasional weakness is a secondary concern.
- Reversible: Yes.

## D-011 — Remove general calls and visits from the dashboard

- Decision: Dashboard space is reserved for cross-department handoffs, required responses, lead-derived follow-ups, appointments produced by handoffs, outcomes, and actionable collaboration insights.
- Reason: General call and visit planning does not directly solve the identified coordination problem.
- Reversible: Yes, after the core workflow succeeds.

## D-012 — Measure quality and closed-loop outcomes

- Decision: Do not use raw lead volume as the primary success score. Measure acceptance, response time, quality, appointments, progress, and outcomes.
- Reason: Volume-only incentives can encourage low-quality handoffs.
- Reversible: Yes, through approved KPI governance.

## D-013 — Use a one-business-day initial response target

- Decision: The recipient should select `Accept`, `Need Information`, or `Decline` within one business day.
- Reason: Peer handoffs need a clear initial-response expectation.
- Consequence: A missed target displays `Needs Attention` but does not automatically penalize, decline, or reassign the lead.
- Reversible: Yes; management may configure it later.

## D-014 — Use all listed representatives as the initial population

- Decision: Everyone listed in the reference app belongs to the initial participant and rollout population.
- Reason: The product is intended to connect all relevant local departments.
- Reversible: Yes, if operational constraints require rollout waves.

## D-015 — Use fictional prototype business data

- Decision: Customer, lead, handoff, activity, notification, and follow-up records are fictional during the initial prototype.
- Reason: Real data requires approved security, identity, integration, and governance.
- Reversible: Yes, after safeguards and approvals are complete.

## D-016 — Separate public prototype hosting from protected production hosting

- Decision: GitHub Pages may host only the fictional public prototype. Production employee and customer data requires server-enforced authentication, authorization, protected sessions, and protected data delivery on an approved architecture.
- Reason: A static client bundle and browser-only password cannot keep embedded business data private or enforce record-level permissions.
- Alternatives considered: Reuse the original client-side login; embed employee data in a private-source Pages repository; select Azure immediately.
- Consequences: The prototype uses fictional personas and simulated access. Phase 3 must select a no-new-Azure backend, identity, session, database, and hosting architecture before real data or employee access is possible.
- Reversible: Partially. GitHub Pages can remain a prototype surface, but production cannot use it as the only security boundary.

## D-017 — Use React Router Framework Mode for one responsive frontend

- Decision: Build one smartphone-first and laptop-responsive web application using React, strict TypeScript, React Router Framework Mode, its Vite pipeline, semantic HTML, CSS Modules, typed service adapters, Vitest, React Testing Library, and Playwright. Run the fictional prototype in SPA Mode and defer PWA behavior until the routed UI is stable.
- Reason: The approved product has a large canonical route model, detailed state handling, cross-screen workflows, two device compositions, and a future protected API. Framework Mode makes those routes and boundaries explicit without selecting a production backend vendor.
- Alternatives considered: Plain HTML and JavaScript; manually assembled React and Vite; Next.js; React Native or Expo; no-code or Power Apps; immediate PWA implementation.
- Consequences: Normal paths require a host with SPA fallback behavior. The frontend uses typed fictional and future HTTP adapters, avoids general global state initially, and never treats client state as authorization.
- Reversible: Partially. React and route modules are the approved base; supporting libraries can change when implementation evidence justifies it.

## D-018 — Separate peer-handoff authority from CRM authority

- Decision: Territory Desk is authoritative for the cross-department peer-handoff and collaboration lifecycle. Dynamics remains authoritative for CRM records that exist there. Production app-owned workflow data uses a minimal PostgreSQL-compatible relational store behind a protected API and transactional outbox; a server-side Dynamics adapter begins disabled.
- Reason: The peer-handoff workflow must operate independently because it is separate from corporate Dynamics leads, while storing all customer and sales work in Territory Desk would create a shadow CRM.
- Alternatives considered: Dynamics-only storage; app-only CRM storage; browser storage; email, text, or spreadsheets as the record; direct no-code database access.
- Consequences: Peer-handoff status and CRM sales stage remain separate. Direct Dataverse access requires an approved Cintas environment, schema, permissions, Microsoft identity path, licensing, and owner. No new paid Azure workload is provisioned by this decision.
- Reversible: Partially. A later approved Dynamics extension could absorb some app-owned tables, but the authority and migration must be explicit and audited.

## D-019 — Verify every Dynamics mapping from Cintas metadata

- Decision: Classify fields as app-owned, CRM-owned, snapshot, derived, configured, candidate, unmapped, or excluded. Treat standard Dataverse `systemuser`, `account`, `contact`, `lead`, `opportunity`, `task`, and `appointment` mappings as candidates until exact Cintas environment metadata and permissions are approved.
- Reason: Dataverse environments can customize tables, columns, choices, relationships, ownership, and security. Display labels or standard documentation do not prove the Cintas schema.
- Alternatives considered: Assume standard Dynamics fields; map from screenshots; join by display name, phone, email, address, ZIP, or fuzzy similarity; automatically create a CRM lead for every peer handoff.
- Consequences: Submission snapshots remain immutable after CRM linkage. Peer and CRM statuses remain separate. Real integration is blocked until a versioned mapping passes metadata, permission, duplicate, test-record, business-owner, and security review.
- Reversible: Yes, through a new approved mapping version and migration plan; historical evidence is not rewritten.

## D-020 — Keep collaboration in-app and use privacy-safe calendar snapshots

- Decision: Territory Desk in-app workflow and activity remain authoritative. New and reassigned peer handoffs retain the required in-app plus SMS path, with SMS simulated in the prototype. The first-release Outlook option is a user-initiated, privacy-safe `.ics` follow-up snapshot. Automatic workflow email is off by default, and direct Microsoft Graph or Power Automate automation is deferred.
- Reason: This keeps cross-department feedback in one auditable workflow, preserves the required attention signal, supports Outlook without an unapproved Microsoft tenant dependency, and minimizes customer information copied to personal smartphones or external systems.
- Alternatives considered: Direct Microsoft Graph email and calendar automation now; an assumed Power Automate flow; automatic email for every event; browser-only delivery claims; email or calendar as the workflow record.
- Consequences: Calendar generation or download never proves import, synchronization, reminder display, or completion. Provider acceptance, delivery, notification read, lead view, and meaningful response remain distinct. A future direct connection requires approved Microsoft Entra registration, least-privilege permissions, licensing, protected hosting, credential handling, support, and company ownership.
- Reversible: Yes. A company-approved Graph, Power Automate, or provider adapter can be added behind the committed outbox without changing the authoritative handoff workflow.

## D-021 — Isolate Development, Preview, and Production

- Decision: Use local fictional Development, public fictional GitHub Pages Preview, and future protected Production as three isolated environment classes. Development and public Preview use in-memory fictional adapters without a database or live integrations. Production requires a protected host, server identity and authorization, API, isolated PostgreSQL-compatible database, approved SMS, audit, backup, recovery, and company approval.
- Reason: A public static preview cannot protect employee or customer information, while selecting a production vendor before identity, security, retention, ownership, and support requirements are known would create unnecessary cost and lock-in.
- Alternatives considered: One environment for all stages; a shared database with separate schemas; real test data on GitHub Pages; selecting a free-tier production vendor immediately; copying the Preview artifact directly into Production.
- Consequences: The proposed public preview is a separate `dtrox41/territory-desk` deployment containing fictional data only. A future protected Preview receives isolated nonproduction services before nonpublic test data. Code moves between stages from approved commits, but data, credentials, sessions, and integration checkpoints never do. Exact compatibility validation rejects unsafe mode combinations.
- Reversible: Partially. Providers and URLs can change, but environment and data isolation remain mandatory.

## D-022 — Use a product-first prototype identity

- Decision: Use Territory Desk as a real-text wordmark, Cross-Division Sales Command Center as a supporting descriptor, and a provisional professional blue, white-card, high-contrast direction. A later original TD monogram may be created. Do not copy, trace, crop, redraw, or embed the Cintas logo from the supplied screenshot, and do not create a placeholder corporate-logo file.
- Reason: The fictional prototype can develop a coherent, accessible visual identity without falsely implying corporate approval or publishing a degraded trademark asset from a screenshot.
- Alternatives considered: Extract the screenshot logo; reuse original embedded images and inline icons; block visual work until a corporate brand package arrives; make the prototype appear like an already approved Cintas application.
- Consequences: One shared BrandIdentity component reserves a company-endorsed variant but leaves it unavailable. Corporate-logo use requires an approved original asset, usage permissions, brand guidance, and context approval. Public Preview remains visibly fictional and contains no real employee, customer, or original-repository data.
- Reversible: Yes. An approved corporate brand package can replace or extend the temporary identity through the centralized brand component and asset register.

## D-023 — Use a field-first responsive shell and component hierarchy

- Decision: Use one mobile-first responsive shell with a compact sticky mobile top bar, five labeled bottom destinations, laptop text-and-icon rail, compact laptop top bar, bounded content canvas, and page-specific one- or two-column layouts that preserve mobile DOM and action order. Translate the reference image into reusable section, card, row, icon, button, form, overlay, and system-state patterns rather than copying its screen literally.
- Reason: Representatives need immediate lead actions, consistent smartphone/laptop behavior, outdoor readability, large targets, and predictable hierarchy. A decorative logo-first or dense CRM composition would slow field use and conflict with the approved workflow.
- Alternatives considered: Copy the screenshot literally; keep a large corporate header; add a permanent bottom action bar above navigation; use icon-only navigation; create three-column CRM dashboards; wrap every block in nested cards; use device detection instead of responsive layout.
- Consequences: Mobile keeps urgent lead actions near the top, laptop gains space without changing meaning or permission, and all component states share testable geometry and behavior. Exact tokens remain a separate Step 4.3 decision and may refine layout targets only when accessibility testing supplies evidence.
- Reversible: Partially. Breakpoint and measurement tokens can be tuned, but the information hierarchy, navigation model, semantic component roles, and mobile/laptop consistency remain approved.

## D-024 — Use a centralized high-contrast field-work token system

- Date: 2026-08-22
- Decision: Use a centralized three-layer token system with provisional Territory Desk blue, cool neutral surfaces, exact semantic status sets, system typography, a four-pixel spacing scale, 44-pixel minimum targets, 48-pixel default controls, restrained borders/radii/shadows, a dual-separation focus treatment, reduced-motion behavior, and fixed layering. Treat these colors as product-prototype colors rather than official Cintas colors, and defer dark mode.
- Reason: Representatives use personal smartphones in changing field conditions and company laptops, so the interface needs measured contrast, large targets, predictable density, low network dependency, and stable focus/motion behavior. Central tokens prevent inconsistent one-off styling as screens are built.
- Alternatives considered: Approximate the screenshot colors; use official-brand claims without an approved source package; load a custom web font; allow component-local values; use 24-pixel minimum targets; add dark mode immediately; rely on shadows, color, or animation to communicate state.
- Consequences: Approved ordinary text and non-text pairings have measurable thresholds; components must use semantic aliases; every interactive target remains at least 44 × 44 CSS pixels; status requires text and a non-color cue; filled controls use a white separation and blue outer focus ring; reduced-motion users receive immediate nonessential transitions; implementation adds automated contrast and token-use validation.
- Reversible: Partially. Exact values can be revised after measured field/accessibility testing or an approved brand package, but semantic roles, accessibility floors, centralized ownership, and non-color status meaning remain mandatory.

## D-025 — Model component state as independent, recoverable axes

- Date: 2026-08-22
- Decision: Define reusable component state through independent interaction, selection, availability, operation, data-block, and semantic-message axes. Use explicit state precedence, native controls and matching WAI-ARIA patterns, a consequential-command state machine, idempotent unknown-outcome reconciliation, block-local loading/error/empty behavior, persistent consequential results, and a coverage ledger for every approved component.
- Reason: Field connectivity can fail during a command, while focus, selection, validation, permission, and business state may coexist. A single visual-state flag would produce ambiguous failures, duplicate sends, inaccessible focus, or false success.
- Alternatives considered: Define only default/hover/disabled CSS; optimistically mark every command successful; treat lost responses as definite failures; use disabled styling for unauthorized actions; use generic clickable cards and custom widgets; rely on toast-only results; leave states to individual screen implementation.
- Consequences: Duplicate activation locks immediately, definite failure and unknown outcome remain distinct, unknown commands reconcile before retry, user input survives errors, permissions are enforced beyond presentation, focus remains visible across semantic states, and every new reusable component must declare its state owner before acceptance.
- Reversible: Partially. Individual visual treatments and component boundaries can be refined through testing, but truthful command outcomes, state independence, native semantics, permission enforcement, focus precedence, and safe reconciliation remain mandatory.

## D-026 — Treat WCAG 2.2 AA and field safety as release gates

- Date: 2026-08-22
- Decision: Target WCAG 2.2 Level AA across every Territory Desk route, role, responsive composition, component state, overlay, authentication/system surface, and recovery path. Exceed the minimum with 44-pixel targets, strong/unobscured focus, preserved/reusable input, truthful weak-connection recovery, physical-device and assistive-technology testing, independent review, and an explicit prohibition against using the app while driving. Do not claim conformance before implementation evidence exists.
- Reason: The app serves field representatives on personal smartphones and managers on company laptops, including variable connectivity and potentially diverse vision, motor, hearing, and cognitive needs. Automated scans or attractive designs cannot establish end-to-end accessibility or safe use.
- Alternatives considered: Target WCAG 2.1; test only the primary screen; rely on automated scanning; treat accessibility defects as post-pilot backlog; use the AA 24-pixel target floor; exclude third-party identity; omit weak-connection and driving safety from accessibility scope.
- Consequences: All 55 WCAG 2.2 A/AA criteria have required or conditional evidence; all 27 canonical route classes and 42 component entries remain in scope; blocker, major, and known A/AA defects block release; supported device/assistive-technology coverage is documented; company-approved human testing is required before a protected employee pilot.
- Reversible: Partially. Supported technology details and evidence tooling may change as devices and company policy are verified, but the AA floor, truthful claim language, end-to-end scope, release-blocking defect policy, and field-safety guardrails remain mandatory.

## D-027 — Start with a minimal typed SPA scaffold

- Date: 2026-08-22
- Decision: Implement the separate prototype with React 19.2.8, React Router 8.3.0 Framework Mode, SPA rendering, Vite 8.2.2, strict TypeScript 5.9.3, pnpm exact-version locking, Vitest/Testing Library, Playwright/Axe, ESLint/JSX accessibility rules, Prettier, centralized approved CSS tokens, an exact Preview base path, and a generated GitHub Pages 404 fallback. Add no UI framework, state library, icon package, analytics SDK, web font, service worker, or integration client until an implemented requirement justifies it.
- Reason: The approved product needs a maintainable mobile/laptop foundation and strong test boundaries, but premature packages and integrations would increase bundle, security, accessibility, and upgrade risk before the shell and workflows exist.
- Alternatives considered: Copy the original application's implementation; use a basic non-framework Vite SPA; add Tailwind and a component kit immediately; use hash routing; add production authentication and data adapters to the public prototype; use current ESLint 10 with an accessibility plugin that does not declare it compatible.
- Consequences: Preview remains a fictional static application; navigation is typed and can later move to a protected server architecture; all versions are reproducible; ESLint remains on the latest compatible 9.x line until the JSX accessibility plugin supports ESLint 10; browser-route refreshes use the GitHub Pages 404 fallback; the original repository and GitHub remain unchanged.
- Reversible: Partially. Individual development tools and libraries can be upgraded or added with evidence, but the separate repository, typed route boundary, fictional public Preview, exact environment safety, accessibility checks, and no-unjustified-dependency policy remain mandatory.

## D-028 — Implement one representative-first responsive application shell

- Date: 2026-08-23
- Decision: Implement one persistent responsive `AppShell` with an approved real-text Territory Desk identity, an original code-native outline icon family, five primary destinations, a native-dialog mobile drawer, a persistent laptop rail, typed canonical placeholder routes, route-title and forward-focus management, fictional notification counts, manager-navigation omission by default, and shared loading, error, and not-found system pages. A tested manager-view variation may reveal Manager Insights only after future authorization resolves; the visual flag never grants access.
- Reason: Field representatives need the same predictable workflow on personal smartphones and company laptops, while managers need a future role-specific entry without duplicating the application. Central ownership prevents route label, icon, focus, active-state, and access-presentation drift.
- Alternatives considered: Separate mobile and laptop applications; icon-only navigation; a third-party component or icon library; duplicating headers per route; showing manager navigation to every user; treating a URL or client-side presentation flag as authorization; populating product screens before the shell was pressure-tested.
- Consequences: Every current product route has a typed fictional placeholder inside a shared shell; unknown paths recover outside the shell; static paths precede dynamic identifiers; representatives do not see manager navigation; direct `/insights` entry does not expose manager content; initial load preserves Skip Link behavior; forward navigation focuses the destination heading; and Step 5.3 can build product screens without reimplementing the frame. Real authorization remains a server-enforced production requirement.
- Reversible: Partially. Labels, icons, breakpoints, and rail measurements can be refined through testing, but one shared responsive shell, representative-first access presentation, centralized route metadata, real-link navigation, truthful system states, and server-enforced authorization remain mandatory.

## D-029 — Make Home an action-first fictional peer-handoff dashboard

- Date: 2026-08-24
- Decision: Replace the Home shell placeholder with a fictional representative dashboard that prioritizes Send Lead, Find Territory, collaboration summary, deterministic Action Required ranking, Waiting on Others, Recent Feedback and Outcomes, and personal Cross-Department Insights. Route data enters through a typed `HomeDashboardService` and deterministic fictional adapter. Exclude calls, visits, revenue, conversion, raw-volume ranking, and direct dashboard mutations.
- Reason: The product succeeds only if representatives can quickly understand what cross-department lead action is required, see whether peers are responding, and close collaboration loops. A generic activity dashboard or copied CRM home screen would consume scarce smartphone space without solving the communication failure this app targets.
- Alternatives considered: Recreate the supplied call-and-visit mockup; show separate large cards for every lead category; rank by lead value or volume; place Action Required before the approved collaboration summary without first testing density; import fixture arrays directly into the route; allow one-tap Accept, Decline, or Complete from Home.
- Consequences: Home shows fictional peer-handoff data only; the four highest-ranked actions are explainable; the Leads badge matches the five-item Action Required total and remains distinct from unread notifications; compact smartphones preserve summary meaning while surfacing the Action Required heading; and future protected data can replace the adapter without rewriting page composition. Commands remain in detail workflows where validation, authorization, idempotency, and outcome handling can be implemented safely.
- Reversible: Partially. Fictional names, counts, copy, card density, and responsive measurements can change through testing, but Home remains action-first, service-backed, non-ranking, privacy-minimized, and free of direct consequential commands.

## D-030 — Make territory search explicit, action-safe, and non-guessing

- Date: 2026-08-24
- Decision: Implement Territory Lookup as a typed, fictional, read-only search boundary that accepts exact five-digit ZIP, ZIP+4, city, or city-and-state input; normalizes ZIP+4 to five digits with an explicit message; requires all five ZIP digits; requires state disambiguation when a city has multiple matches; and returns a no-match state instead of fuzzy, neighboring, or inferred routing. Suggestions come from a deterministic fictional adapter, and normalized non-sensitive criteria alone may enter the URL. Assignment cards remain deferred to Step 5.3.3 Territory Results.
- Reason: Sending a lead to the wrong department or representative is materially worse than asking for clarification. Representatives also need a fast smartphone lookup that remains understandable on company laptops and does not expose a customer name, address, or protected record in browser history.
- Alternatives considered: Guess a ZIP from partial digits; fuzzy-match misspelled cities; choose the first Springfield automatically; copy the original application's records; place customer names or addresses in search; return full assignment results before the result model is implemented; connect directly to Dynamics during the public prototype.
- Consequences: Search validation, suggestion behavior, URL serialization, lookup state, and future assignment rendering have separate owners. The current Preview proves recognition and disambiguation using fictional fixtures only; it does not prove a real territory assignment, representative identity, data freshness, or Dynamics synchronization. Future protected data can replace the adapter behind the service interface without changing the input contract.
- Reversible: Partially. Fixture coverage, labels, filter options, and data adapters can change, but exact normalization, ambiguity handling, privacy-safe URL state, truthful no-match behavior, and the prohibition against guessed assignments remain required.

## D-031 — Gate territory handoffs on exact, stable routing evidence

- Date: 2026-08-24
- Decision: Render fictional territory assignments by department and exact source division, ordered Needs Review, Open, then Assigned. Expose Send Lead only when the search has one exact ZIP, the assignment has one stable eligible representative, the location label is usable, and the source is current. Pass the routing snapshot through in-memory navigation state with no recipient or assignment identifiers in the URL. City searches require an explicit ZIP selection; open, conflicting, incomplete, and stale assignments route to help or reporting instead of recipient selection. Route-level fictional loading reconstructs results for direct links and browser Back.
- Reason: The collaboration workflow fails if a fast-looking result silently chooses among conflicts, sends from stale data, loses context after navigation, or treats an untracked contact utility as a lead handoff. The result screen must make uncertainty more visible than action.
- Alternatives considered: Enable Send Lead on every assigned-looking card; place routing snapshots in query parameters; arbitrarily choose the first conflicting representative; infer an open territory from a neighboring ZIP; let city search send without an exact ZIP; hide stale or incomplete records; keep results only in ephemeral component state; open actual device contact handlers from the public fictional prototype.
- Consequences: Fictional exact ZIP `63101` demonstrates assigned, open, conflicting, and missing-contact states across five departments; Columbia demonstrates multi-ZIP city gating; Boston demonstrates stale-source blocking; Atlanta demonstrates contact availability without a real device action; New York demonstrates an incomplete location label. Filters use allowlisted URL values and never silently broaden. Future protected services must revalidate the in-memory snapshot before a handoff is submitted.
- Reversible: Partially. Fixture names, department-card density, breakpoint layout, and adapter implementation can change, but exact-ZIP gating, one-stable-recipient gating, exception visibility, non-guessing behavior, privacy-safe navigation, route restoration, and contact-versus-handoff distinction remain required.

## Operating rule

Every future material decision records its date, decision, reason, alternatives, consequences, and reversibility.
