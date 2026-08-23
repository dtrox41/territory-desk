# Territory Desk

**Cross-Division Sales Command Center**

Territory Desk is a mobile-first collaboration tool for New Business Sales Representatives and managers across Uniform, Facility Services, First Aid, and other local departments.

Its core workflow is:

> Find territory → verify representative → send cross-department lead → notify recipient → receive a meaningful response → coordinate the next action → show the outcome

## Project status

The project is in isolated workspace setup and requirements definition. Application code, real integrations, and production data have not been added yet.

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

## Repository status

This repository is local-only until a separate GitHub repository is explicitly created and connected under the approved account.
