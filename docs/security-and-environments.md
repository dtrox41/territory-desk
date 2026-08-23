# Security and Environment Rules

## Non-negotiable credential rules

1. Never commit passwords, verification codes, API keys, access tokens, refresh tokens, client secrets, private keys, database connection strings, or production configuration values.
2. Never place a secret in a variable whose name begins with `VITE_`; Vite exposes those values to browser code.
3. Commit only `.env.example`, containing variable names and blank values.
4. Store real values only in an approved local secret store, deployment secret manager, or company-managed service.
5. Do not paste real credentials into project documentation, issues, pull requests, screenshots, test fixtures, logs, or chat.
6. Rotate any credential immediately if it is exposed.
7. Use fictional people, customers, opportunities, phone numbers, and email addresses until real-data use is approved.

## Environment separation

Territory Desk uses three distinct runtime environments:

| Environment | Purpose | Allowed data | External actions |
| --- | --- | --- | --- |
| Development | Local construction and automated tests | Fictional only | Simulated only |
| Preview | Stakeholder review and user testing | Fictional or specifically approved test data | Simulated by default |
| Production | Authorized employee use | Approved business data | Only approved integrations |

Rules:

1. Each environment receives separate configuration and credentials.
2. Development credentials must never access production records.
3. Preview must not silently send real email, SMS, push, or Dynamics writes.
4. Production integrations remain disabled until identity, authorization, audit, privacy, and rollback controls pass review.
5. Environment names and modes are validated at startup without printing their values.

## Approved initial modes

During prototype development, use:

```text
APP_ENV=development
DATA_MODE=fictional
NOTIFICATION_MODE=simulation
DYNAMICS_INTEGRATION_MODE=disabled
```

These are non-secret mode values. Real secret variables remain unset.

## Authentication and hosting boundary

1. GitHub Pages is allowed only for the fictional public prototype.
2. A browser-only password or role check cannot protect embedded employee, customer, lead, or manager data.
3. Production requires server-side authentication, authorization, session management, protected data delivery, and audit controls.
4. Do not store passwords, session identifiers, access tokens, refresh tokens, or provider credentials in `localStorage` or `sessionStorage`.
5. Prefer an approved server-managed session with HTTPS and a secure, HTTP-only cookie or an equivalently reviewed architecture.
6. Authentication provider, production hosting, session timeout values, and company identity contacts remain unselected until the architecture and company approvals are complete.
7. Production builds and servers reject demo persona creation and environment changes from user-controlled inputs.

## Logging rules

1. Logs may identify a fictional record ID and event type.
2. Logs must not contain customer contact details, message bodies, credentials, tokens, connection strings, or full Dynamics payloads.
3. Notification simulation records delivery state without transmitting a real message.
4. Error messages identify missing variable names but never display their values.

## Before any production connection

Confirm all of the following:

- Company identity and access method.
- Dynamics 365 environment owner and approved tables.
- Least-privilege permissions.
- Data retention and deletion rules.
- Approved hosting and database services.
- Approved SMS or messaging provider and budget.
- Audit logging and incident owner.
- Security review and deployment approval.
