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

## Operating rule

Every future material decision records its date, decision, reason, alternatives, consequences, and reversibility.
