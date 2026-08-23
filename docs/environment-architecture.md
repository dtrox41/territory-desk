# Development, Preview, and Production Environment Architecture

Status: Approved for Step 3.5

Decision scope: Define how Territory Desk development, public preview, protected preview readiness, and eventual production remain isolated. This step does not create a GitHub repository, deploy the site, select a production hosting/database vendor, connect company identity, enable live SMS, or enable Dynamics.

## Recommendation

Use three environment classes with hard data and capability boundaries:

1. **Development** — local construction, automated tests, and fictional data only.
2. **Preview** — the reviewable fictional prototype. The initial preview may use GitHub Pages under the new `dtrox41/territory-desk` repository, but it is public and therefore contains no real employee or customer data, no real authentication, no database, and no live integrations.
3. **Production** — a future company-approved protected application with a separate host, server-side identity and authorization, protected API, isolated PostgreSQL-compatible database, audit controls, and approved providers.

The strongest near-term path is to build and review the complete fictional product in Development and Preview before selecting a production vendor. Selecting a backend vendor now would create cost and lock-in before Cintas identity, security, retention, hosting, and integration ownership are known.

## Critical correction to the original environment outline

The earlier phrase `each environment requires its own database` is too broad.

The corrected rule is:

> Every environment that uses persistent server storage must have an isolated database and credentials. The fictional browser-only Development and public GitHub Pages Preview use deterministic fictional adapters and do not need a database.

This avoids creating an unnecessary public prototype database and eliminates the risk that preview accidentally becomes a shadow production system.

## Environment summary

| Dimension | Development | Preview | Production |
| --- | --- | --- | --- |
| Purpose | Build, test, debug | Stakeholder review and fictional workflow testing | Authorized employee collaboration |
| Initial URL | `http://localhost:5173` | Proposed `https://dtrox41.github.io/territory-desk/` after separate repo connection and deployment approval | Company-approved HTTPS URL; not selected |
| Hosting | Local developer process | GitHub Pages static hosting | Protected application host; provider not selected |
| Data | Fictional only | Fictional only | Approved minimum business data |
| Persistence | In-memory fixtures; optional throwaway local test database later | In-memory fictional state that can reset | Isolated PostgreSQL-compatible database |
| Authentication | Visible demo personas | Visible simulated sign-in and demo personas | Company-approved server-enforced identity and session |
| Authorization | Fictional role scenarios | Fictional role scenarios | Server-enforced role, scope, and record authorization |
| In-app notifications | Fictional | Fictional | Server-created authoritative records |
| SMS | Simulated | Simulated | Live only after approved provider and policy |
| Email | Disabled; optional fictional draft test | Disabled by default | Disabled initially; future approved adapter only |
| Calendar | Privacy-safe `.ics` test | Privacy-safe `.ics` | Privacy-safe `.ics`; Graph only if later approved |
| Dynamics | Disabled | Disabled | Disabled until exact mapping and permission approval |
| Logging | Developer-safe diagnostics using fictional IDs | Privacy-safe build and browser diagnostics | Protected structured operational and audit logging |
| Environment label | Persistent `Development` banner | Persistent `Fictional Prototype` banner | No demo banner; verified production identity |

## Environment 1 — Development

### Exact purpose

Development is where Codex builds the application and runs automated or manual checks before anything becomes viewable through GitHub Pages.

### Development rules

1. Run from the new Territory Desk repository only.
2. Use `localhost`; do not expose the development server to the public internet by default.
3. Use deterministic fictional representatives, companies, contacts, territories, handoffs, notifications, follow-ups, and outcomes.
4. Use a typed in-memory service adapter for initial UI work.
5. Simulate network delay, offline state, retries, duplicate commands, permissions, stale data, failures, and role variations.
6. Reset fictional data predictably between tests.
7. Use no real employee source export, customer record, Dynamics credential, SMS destination, mailbox, or production URL.
8. Do not send real external actions.
9. Keep unfinished lead forms in current memory only.
10. Use local test artifacts and logs that contain fictional opaque IDs only.

### Optional local database

A throwaway local PostgreSQL-compatible database may be added when backend command and transaction implementation begins. It must:

1. Contain fictional seed data only.
2. Use development-only credentials.
3. Be reproducible from migrations and seeds.
4. Be safe to destroy and recreate.
5. Have no network route or credential capable of accessing Preview or Production.

It is not needed to begin the responsive fictional frontend.

## Environment 2 — Preview

### Initial preview recommendation

After the new repository is connected under the intended `dtrox41` GitHub account and the application scaffold passes local tests, deploy a static fictional preview to:

`https://dtrox41.github.io/territory-desk/`

This URL is proposed, not created in this step.

GitHub Pages is static hosting and GitHub warns that Pages sites are publicly available even when the repository is private on plans that support private-repository Pages. Treat every preview asset, source map, network response, URL, screenshot, and browser bundle as public.

### Preview rules

1. Display `Fictional Prototype — Do not enter real employee or customer information` persistently.
2. Include only fictional personas and fictional business records.
3. Use simulated authentication with no security claim.
4. Use the fictional adapter; do not call a database, Dynamics, Graph, SMS, email, or company API.
5. Reset preview workflow state on refresh or through a clear demo reset mechanism.
6. Do not persist lead drafts, contacts, sessions, roles, or workflow records in browser storage.
7. Mark SMS attempts `Simulated`.
8. Generate only privacy-safe `.ics` data from fictional follow-ups.
9. Disable Dynamics, production HTTP adapters, live support routing, and real outbound actions at build time.
10. Include a visible build identifier and last-deployed time without exposing repository secrets or private metadata.
11. Test every direct canonical route and the GitHub Pages fallback before sharing the URL.
12. Test smartphone and laptop layouts on the deployed build, not only localhost.

### GitHub Pages build requirements

When implementation reaches deployment:

1. Create a new repository named `territory-desk` under `dtrox41`; do not rename, reuse, fork, or attach the original repository.
2. Preserve the new repository's independent history.
3. Set Vite's preview base path to `/territory-desk/`.
4. Use GitHub Actions as the Pages publishing source because the Vite application requires a build.
5. Pin action revisions and package versions rather than using uncontrolled floating versions.
6. Run install, format, lint, type-check, unit, production-build, and applicable end-to-end checks before deployment.
7. Upload only the generated static preview artifact.
8. Include no `.env`, secret, private source import, employee export, production configuration, or provider credential in the artifact.
9. Use a tested fictional-only SPA fallback for normal routes because GitHub Pages does not provide a general application rewrite rule.
10. Verify asset paths, initial navigation, browser refresh, Back, direct links, and not-found behavior under the repository subpath.
11. Retain the deployment log and exact source commit.
12. Provide the user the preview URL and commit identifier after successful deployment.

No workflow or GitHub Pages setting is created until the user approves the environment contract and the new GitHub repository connection is explicitly ready.

### If a protected pilot becomes necessary

Do not add real employee or customer data to the GitHub Pages preview.

Instead:

1. Move the active Preview environment to an approved protected host.
2. Add server-side identity and authorization.
3. Create a Preview-only protected API and database.
4. Use synthetic or separately approved test data, never a casual production copy.
5. Issue Preview-only credentials with no Production access.
6. Keep external actions simulated unless each test destination and provider is approved.
7. Mark the environment visibly as `Preview`.
8. Keep the public GitHub Pages build fictional or retire it.

This change requires a separate approval because it changes the data and security risk, even though it remains the Preview environment class.

## Environment 3 — Production

### Production boundary

Production is not GitHub Pages and is not created during prototype construction. It requires a protected frontend/application host and server-side application API.

Production must provide:

1. Company-approved HTTPS URL and DNS ownership.
2. Company-approved identity provider and server-managed session.
3. Server-side authentication, role, team scope, and record authorization.
4. Protected same-origin or explicitly approved API access.
5. A dedicated PostgreSQL-compatible database and credentials.
6. Database migrations, backups, restore tests, retention, and deletion policy.
7. Secure secret management and credential rotation.
8. Structured privacy-safe operational logs and append-only business audit evidence.
9. Rate limits, idempotency, concurrency control, retry, and transactional outbox behavior.
10. Approved security headers, cross-origin rules, cache rules, and incident response.
11. Approved SMS provider before the required live assignment-text promise is enabled.
12. Dynamics, Graph, and automatic email disabled until their separate approval gates pass.

### Production vendor decision

Do not select a provider merely because it has a free tier. Production selection must compare:

1. Company approval and contractual ownership.
2. Identity compatibility.
3. Region and data-residency requirements.
4. Encryption and secret management.
5. PostgreSQL compatibility and transaction support.
6. Backup, point-in-time recovery, and restore evidence.
7. Audit and access logs.
8. Availability, support, incident response, and exit/export path.
9. Expected pilot and full-use cost.
10. Ability to keep Preview and Production isolated.

The fictional UI prototype can be completed before these facts are available. Real-user launch cannot.

## Environment configuration contract

### Server or build-pipeline modes

The approved implementation will replace the current broad environment check with an exact compatibility matrix.

| Variable | Development | Preview | Production initial |
| --- | --- | --- | --- |
| `APP_ENV` | `development` | `preview` | `production` |
| `DATA_MODE` | `fictional` | `fictional` | `protected-api` |
| `AUTH_MODE` | `demo` | `demo` | `server-session` |
| `SMS_MODE` | `simulation` | `simulation` | `live` only after provider approval |
| `EMAIL_MODE` | `disabled` | `disabled` | `disabled` |
| `CALENDAR_MODE` | `ics` | `ics` | `ics` |
| `DYNAMICS_INTEGRATION_MODE` | `disabled` | `disabled` | `disabled` until separate approval |
| `DEMO_PERSONAS_ENABLED` | `true` | `true` | `false` |
| `PERSISTENCE_MODE` | `memory` initially | `memory` | `database` |

Rules:

1. These mode names are non-secret configuration; credentials and connection values remain separate and secret.
2. A client-visible `VITE_` value may display environment name, base path, or build ID only. No `VITE_` value is trusted as a security control.
3. Secrets never use a `VITE_` prefix because Vite embeds those values in browser code.
4. Production authorization and real-data access are enforced by the server, not a build variable.
5. Build modes cannot be changed through a URL, browser storage, demo menu, or developer tools.
6. Production uses a separate build that excludes fictional persona controls and fixture selection from executable routes.
7. Preview contains no dormant live-provider credential or switch that a browser user can activate.
8. Environment values are validated without printing secret values.

### Public client metadata

Only bounded non-sensitive values may enter the browser bundle:

1. Environment display name.
2. Public application base path.
3. Public release or build identifier.
4. Fictional-prototype flag for the visible warning.
5. Public support wording or approved non-secret feature availability.

Do not include:

1. Database URL.
2. SMS, email, Graph, Dynamics, or identity credentials.
3. Tenant secrets or private keys.
4. Internal service endpoints that should not be disclosed.
5. Real user, role, permission, territory, or customer data.

## Startup and build fail-closed checks

The environment checker must reject:

1. Preview or Development with `protected-api`, live SMS, Graph email, Graph calendar, or Dynamics write access.
2. Preview or Development with any Production database or API origin.
3. Production with demo authentication or demo personas enabled.
4. Production with memory persistence for real workflow use.
5. Production with browser-only authorization.
6. Production containing fictional fixture imports in production route code.
7. Any build with a secret-shaped value in a client-exposed variable.
8. Unknown environment, data, authentication, SMS, email, calendar, Dynamics, or persistence values.
9. A Preview build without the fictional-data warning.
10. A Production build displaying itself as Preview or allowing environment switching.

There are two separate gates:

1. **Safe to start** — configuration cannot cross an environment boundary.
2. **Ready for go-live** — every required Production owner, provider, policy, test, backup, and rollback requirement is approved.

A configuration may be safe for a controlled Production smoke test while still failing go-live readiness. The interface must state `Not ready for live use`; it cannot silently degrade a required feature.

## Data and credential isolation

1. Never copy Production data into Development.
2. Never copy Production data into a public Preview.
3. A future protected Preview uses synthetic or explicitly approved test data.
4. Do not rely on separate schemas in one shared database as the primary Production/Preview boundary.
5. Use separate database instances or projects, users, passwords, connection strings, backups, and migration checkpoints.
6. Use separate identity registrations, redirect URLs, provider credentials, SMS destinations, integration checkpoints, and webhook secrets where external systems are later enabled.
7. A Development or Preview credential has no permission to Production.
8. Production secrets exist only in approved server/deployment secret management.
9. Rotating one environment cannot interrupt another.
10. Environment identifiers accompany operational correlation, but physical/service isolation remains the primary boundary.

## Release and promotion contract

Code may move forward; data, credentials, sessions, and integration checkpoints never move forward with it.

### Development to Preview

1. Select an approved source commit.
2. Install from the committed lockfile.
3. Run environment safety validation.
4. Run formatting, lint, type-check, unit, component, build, and applicable end-to-end tests.
5. Scan the source and built artifact for prohibited secrets and real data.
6. Build with the Preview compatibility matrix and `/territory-desk/` base path.
7. Deploy the static artifact through the GitHub Pages workflow.
8. Smoke-test the deployed Home, Territory, Send Lead, Leads, Directory, Notifications, Profile, Help, system pages, and direct links.
9. Test representative and manager fictional personas on smartphone and laptop viewports.
10. Record the deployment URL, source commit, build ID, test result, and known limitations.

### Preview to Production

Production is not promoted merely by copying the GitHub Pages artifact.

1. Approve the production provider, company ownership, identity, database, secrets, SMS, retention, incident, and support plans.
2. Approve real-data scope and complete security/privacy review.
3. Provision isolated Production services and credentials.
4. Apply reviewed database migrations with a rollback or forward-recovery plan.
5. Build from an approved immutable source commit using the Production matrix.
6. Run the full automated test and security gate.
7. Deploy without demo personas, fictional adapters, or Preview configuration.
8. Run permission, role, scope, session, audit, backup, restore, notification, failure, and rollback tests.
9. Complete controlled user acceptance with approved test records.
10. Record final release approval before live employee/customer use.

## Rollback contract

1. Every Preview and Production deployment records source commit and build ID.
2. Keep the last known-good deployable application artifact or reproducible source/lockfile combination.
3. Database changes require compatible rollback or forward-recovery instructions before deployment.
4. Rolling back code must not silently discard or reinterpret newer workflow data.
5. Provider or Dynamics failures use kill switches that preserve in-app workflow.
6. A failed Preview deployment rolls back only Preview.
7. A failed Production deployment cannot redirect users to the public fictional Preview as though it were Production.
8. Production outage displays an approved safe system page without customer or employee information.

## Logging and observability by environment

### Development

1. Debug detail is allowed only with fictional data.
2. Browser and test logs may use fictional opaque IDs.
3. Logs are disposable and never receive Production payloads.

### Preview

1. Record build, route template, safe error class, and fictional correlation IDs.
2. Do not record free-text searches, form bodies, email addresses, phone numbers, or calendar contents.
3. Clearly label simulated provider states.

### Production

1. Separate operational logs from append-only business activity and security audit evidence.
2. Record authenticated actor ID, approved event type, safe target ID, result class, correlation ID, and server timestamp where required.
3. Exclude customer contact details, message bodies, credentials, tokens, raw provider payloads, and full Dynamics payloads.
4. Approve retention, access, alert ownership, incident procedures, and deletion or legal-hold rules before launch.

## Pressure-tested failure scenarios

| Scenario | Required protection |
| --- | --- |
| Real name accidentally entered in public Preview | Persistent warning, no persistence, no network write, documented reset; never describe Preview as safe for real data |
| Production variable pasted into `.env.example` | Secret scan and review fail; rotate immediately if real |
| Browser user changes an environment flag | No access change because server and build determine environment |
| Preview calls a Production API | Origin, credential, network, startup, and API authorization controls reject it |
| Production deploy contains demo persona selector | Build and startup gate fail |
| GitHub Pages direct link returns 404 | Tested custom fallback or deployment failure; do not share until fixed |
| Preview deployment fails | Prior Preview remains; Production unaffected |
| Production migration fails | Stop rollout and execute approved recovery; never point Production at Preview data |
| Live SMS is unavailable at planned launch | Go-live gate fails or scope is explicitly reapproved; do not claim SMS delivery |
| Dynamics remains unavailable | Show Not Connected; independent peer-handoff workflow continues |
| Production host is not yet approved | Complete fictional product only; do not enable real identities or data |

## Implementation sequence after approval

Codex performs these actions; the user does not need to edit files manually:

1. Mark this Step 3.5 contract approved and record the decision.
2. Consolidate `docs/security-and-environments.md` against this contract.
3. Expand `.env.example` with blank non-secret mode names and blank future server secret names.
4. Upgrade `scripts/check-environment.mjs` from broad allowed values to the exact compatibility matrix.
5. Add automated safety tests for every rejected cross-environment combination.
6. Complete Phase 3 documentation exit checks.
7. Begin Phase 4 design-system work locally.
8. Create and connect the separate `dtrox41/territory-desk` GitHub repository only when explicitly authorized and connection is ready.
9. Add the GitHub Pages workflow only after the React/Vite scaffold and test commands exist.
10. Deploy only fictional preview assets and verify the URL before sharing it.

## User action required now

None of the following should be done yet:

1. Do not create a database account.
2. Do not buy hosting.
3. Do not enter customer or employee information.
4. Do not create production credentials.
5. Do not configure Microsoft, SMS, email, or Dynamics integrations.
6. Do not modify the original repository.

The current action is to review and approve or question this environment contract.

## Step 3.5 acceptance checklist

- [x] Three environment classes—Development, Preview, and Production—are approved.
- [x] Development and public Preview use fictional data and simulated actions only.
- [x] Public GitHub Pages Preview has no database, real authentication, real employee/customer data, or live integrations.
- [x] The proposed preview repository and URL are separate under `dtrox41/territory-desk` and do not touch the original app.
- [x] GitHub Pages uses a Vite repository base path and tested normal-route fallback before sharing.
- [x] A future protected Preview requires a protected host, API, identity, and isolated nonproduction database before approved nonpublic data is used.
- [x] Production requires a protected host, server-side identity and authorization, API, isolated database, secret management, audit, backup, recovery, and approved providers.
- [x] Production hosting and database vendors remain unselected until company requirements are known.
- [x] Environment configuration uses an exact compatibility matrix and rejects unsafe combinations.
- [x] Client-visible environment values are non-secret and never enforce authorization.
- [x] Demo personas and fictional adapter controls are excluded from Production.
- [x] Development and Preview credentials can never access Production.
- [x] Production data is never copied into Development or public Preview.
- [x] Code is promoted from an approved commit; data, credentials, sessions, and checkpoints are never promoted with it.
- [x] Preview and Production deployment, testing, rollback, and evidence remain separate.
- [x] Production go-live remains blocked until identity, security, retention, support, SMS, and company approvals pass.
- [x] The original repository remains untouched.

## Official references reviewed

1. GitHub Pages publishing and public-availability warning: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
2. GitHub Pages custom workflows: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
3. GitHub Pages custom 404 behavior: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site
4. Vite static deployment and GitHub repository base path: https://vite.dev/guide/static-deploy.html
