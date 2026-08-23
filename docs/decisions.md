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

## Operating rule

Every future material decision records its date, decision, reason, alternatives, consequences, and reversibility.
