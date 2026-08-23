# Territory Desk

**Cross-Division Sales Command Center**

Territory Desk is a mobile-first collaboration tool for New Business Sales Representatives and managers across Uniform, Facility Services, First Aid, and other local departments.

Its core workflow is:

> Find territory → verify representative → send cross-department lead → notify recipient → receive a meaningful response → coordinate the next action → show the outcome

## Project status

Phase 2 product definition, Phase 3 architecture definition, and Phase 4 visual/accessibility-system definition are complete. Step 5.1 application scaffolding is accepted. Step 5.2 responsive application-shell implementation is complete locally and awaiting user approval. Step 5.3 product-screen implementation has not started. No real integrations or production data have been added.

## Safety boundaries

1. The original `territory-lookup` project is read-only and is not modified by this repository.
2. Prototype customer, lead, handoff, activity, notification, and follow-up data must be fictional.
3. Dynamics 365 remains the future system of record for business records that already live there.
4. No new Azure subscription or separately billed Azure service is required.
5. Real credentials, tokens, private keys, customer data, and employee-sensitive data must never be committed.
6. Real carrier SMS is simulated until a company-approved, funded, non-Azure or existing enterprise provider is available.

## Documentation

- `docs/decisions.md` — approved material decisions
- `docs/product-requirements.md` — product scope and workflow requirements
- `docs/data-dictionary.md` — provisional entities and fields
- `docs/testing-checklist.md` — acceptance and quality checks
- `docs/security-and-environments.md` — credential and environment safeguards
- `docs/data-quality-report.md` — source-import validation and unresolved routing findings
- `docs/navigation-spec.md` — approved mobile and laptop navigation behavior
- `docs/home-dashboard-spec.md` — approved action-first home dashboard behavior
- `docs/action-ranking-spec.md` — approved Lead Action Required ordering and response-time rules
- `docs/collaboration-insights-spec.md` — approved cross-department KPI and insight rules
- `docs/territory-lookup-spec.md` — approved ZIP/city routing and lookup behavior
- `docs/representative-directory-spec.md` — approved representative discovery and profile behavior
- `docs/lead-creation-spec.md` — approved structured peer-lead creation and submission behavior
- `docs/lead-status-ownership-spec.md` — approved handoff lifecycle, ownership, and transition rules
- `docs/follow-up-reminder-spec.md` — approved lead-derived follow-up and calendar-reminder behavior
- `docs/activity-history-spec.md` — approved append-only collaboration timeline behavior
- `docs/phase-2-exit-audit.md` — current screen-coverage audit and required gap-closure sequence
- `docs/leads-list-spec.md` — approved personal lead-list views, cards, filters, and states
- `docs/lead-detail-spec.md` — approved role-aware lead workspace composition and states
- `docs/notification-center-spec.md` — approved in-app alert history, unread, and navigation behavior
- `docs/manager-insights-screen-spec.md` — approved manager operational dashboard composition and safeguards
- `docs/data-status-screen-spec.md` — approved data trust, action-safety, and issue-reporting behavior
- `docs/profile-screen-spec.md` — approved current-user identity, access, preference, and session behavior
- `docs/help-feedback-screen-spec.md` — approved task guidance, request routing, support, and product-feedback behavior
- `docs/authentication-system-pages-spec.md` — approved sign-in, session, access, outage, and error behavior
- `docs/route-action-contract-spec.md` — approved canonical route, cross-screen action, Back, and fallback contract
- `docs/frontend-architecture.md` — approved Step 3.1 frontend stack, boundaries, structure, and test architecture
- `docs/data-integration-architecture.md` — approved Step 3.2 app-owned data and future Dynamics boundary
- `docs/field-ownership-mapping.md` — approved Step 3.3 field authority, app schema, and Cintas Dynamics verification contract
- `docs/outlook-email-calendar-architecture.md` — approved Step 3.4 Outlook, email, calendar, SMS-boundary, and delivery-state architecture
- `docs/environment-architecture.md` — approved Step 3.5 Development, Preview, Production, deployment, and environment-isolation architecture
- `docs/brand-assets-spec.md` — approved Step 4.1 brand-asset inventory, temporary identity, permissions, and replacement policy
- `docs/visual-layout-component-rules.md` — approved Step 4.2 responsive shell, page hierarchy, component anatomy, and field-use layout rules
- `docs/design-tokens.md` — approved Step 4.3 color, typography, spacing, sizing, focus, motion, and validation tokens
- `docs/component-state-contracts.md` — approved Step 4.4 interaction, validation, operation, loading, failure, recovery, and accessibility states
- `docs/accessibility-conformance-plan.md` — approved Step 4.5 WCAG scope, interaction rules, test matrix, evidence, severity, and release gates
- `docs/scaffold-implementation.md` — implemented Step 5.1 toolchain, structure, safety boundaries, verification, and known test-environment limitation
- `docs/application-shell-implementation.md` — implemented Step 5.2 responsive shell, route registry, access boundary, focus behavior, and verification

## Local development

Required versions are Node.js `^20.19.0 || >=22.12.0` and pnpm `11.19.0`.

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm check
pnpm test:e2e
```

The public fictional Preview build uses `VITE_PUBLIC_BASE_PATH=/territory-desk/`. Exact environment combinations are enforced by `scripts/check-environment.mjs`.

## Repository status

This repository is local-only until a separate GitHub repository is explicitly created and connected under the approved account.
