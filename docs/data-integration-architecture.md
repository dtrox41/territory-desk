# Data and Dynamics Integration Architecture

Status: Approved for Step 3.2

Decision scope: Data ownership, relational-storage model, and future Dynamics boundary. This step does not select a database vendor, production host, identity provider, SMS provider, or exact Dynamics table mapping.

## Recommended architecture

Use a hybrid ownership model:

1. Territory Desk owns the cross-department **peer handoff and collaboration workflow**.
2. Dynamics 365 remains authoritative for CRM accounts, contacts, leads, opportunities, activities, appointments, sales stages, and outcomes that exist in Dynamics.
3. Territory Desk uses a minimal PostgreSQL-compatible relational database in production for app-owned workflow records, immutable activity, follow-ups, notifications, territory versions, idempotency, and integration state.
4. The browser never connects directly to PostgreSQL or Dynamics.
5. A protected Territory Desk application API performs authorization, transactions, data minimization, and audit creation.
6. A server-side Dynamics adapter is disabled until Cintas supplies an approved Dataverse environment, table mapping, permissions, identity path, and integration owner.
7. Fictional prototype data continues through the approved frontend fictional adapter and does not require a production database or Dynamics connection.

## The ownership clarification

The prior broad statement that Territory Desk would store only application metadata is too narrow for the approved workflow.

A peer handoff must exist before the recipient can be notified, view it, accept it, request information, decline it, schedule a follow-up, or return feedback. Because the user confirmed that this workflow is separate from corporate Dynamics leads and Dynamics will not alert on it, the handoff itself must have an authoritative home.

The corrected boundary is:

- Territory Desk is the system of record for the **peer referral and collaboration lifecycle**.
- Dynamics is the system of record for the **CRM lifecycle** when a CRM record exists.
- A link between them does not merge their status models or make one silently overwrite the other.

This does not turn Territory Desk into a replacement CRM. Account management, pipeline management, revenue forecasting, private CRM notes, quoting, contracts, and broad customer history remain excluded.

## Pressure-tested alternatives

| Option | Advantage | Material weakness | Decision |
| --- | --- | --- | --- |
| Store every peer handoff only in Dynamics | One business-data platform | Requires approved schema, access, identity, licensing, and integration before the app can function; may not represent the peer workflow cleanly | Reject as the initial dependency |
| Store all customer and sales work only in a new app database | Maximum implementation control | Creates a shadow CRM, duplicate customer truth, and difficult reconciliation | Reject |
| Store browser data in `localStorage`, IndexedDB, or static files | No server cost | Cannot enforce record access, concurrent workflow transitions, shared audit, retention, or secure personal-phone use | Reject |
| Use email, text, or spreadsheets as the database | Familiar and inexpensive | Weak ownership, duplication, concurrency, audit, search, permission, and reliable status behavior | Reject |
| Use Airtable or another no-code database directly from the browser | Quick prototype persistence | Vendor, cost, security, record-level access, API, retention, and company-approval questions would become implicit architecture decisions | Reject for the core data layer |
| Minimal relational app database plus future Dynamics adapter | Keeps peer collaboration independent while preserving CRM authority | Requires an explicit mapping and conflict model | Recommend |

## System-of-record matrix

| Information | Authoritative system before Dynamics link | Authoritative system after Dynamics link | Territory Desk behavior |
| --- | --- | --- | --- |
| Peer-handoff status and acceptance | Territory Desk | Territory Desk | Never inferred from a Dynamics sales stage |
| Peer-handoff sender, recipient, owner, and required-action owner | Territory Desk | Territory Desk | Preserves the collaboration chain and reassignment history |
| Peer-handoff activity and feedback | Territory Desk | Territory Desk | Stores only approved shared collaboration events |
| Lead-derived follow-up | Territory Desk | Territory Desk unless explicitly mapped later | Optional privacy-safe calendar snapshot remains separate |
| In-app notification and SMS attempt | Territory Desk | Territory Desk | Dynamics delivery does not satisfy Territory Desk notification state |
| Territory assignment and directory mapping | Approved source imported or referenced by Territory Desk | Same approved source until company changes ownership | Versioned, validated, and correction-routed |
| CRM account | Dynamics when an account exists | Dynamics | Store an opaque reference and minimum display snapshot only |
| CRM contact | Dynamics when a contact exists | Dynamics | Do not copy broad contact history or private notes |
| CRM lead or opportunity | Not created merely by sending a peer handoff | Dynamics once explicitly created or matched | Link without replacing the peer handoff |
| CRM sales stage, revenue, quote, and contract | Not owned by Territory Desk | Dynamics | Read only when approved and mapped |
| Verified CRM appointment, activity, or outcome | Territory Desk demo value before integration | Dynamics when mapped and reconciled | Label source and never guess a conflict |

## Recommended data flow

### Peer-handoff creation

1. Browser sends one validated command to the protected Territory Desk API.
2. API verifies the authenticated sender, recipient eligibility, territory version, fields, and idempotency key.
3. One database transaction stores the handoff, response target, immutable creation events, and notification jobs.
4. The transaction commits before any external notification attempt.
5. The API returns the saved handoff and safe notification state.
6. In-app and simulated-SMS workers process their jobs independently.
7. Dynamics remains untouched unless a later approved command or policy explicitly requests CRM creation or linkage.

### Future Dynamics linkage

1. An authorized user or approved rule requests a CRM lookup, creation, or link.
2. The application records one integration command and stable idempotency reference.
3. A server-side worker reads the committed integration outbox.
4. The Dynamics adapter validates the configured environment and table map.
5. The adapter queries or writes only the approved fields.
6. The adapter records the opaque Dynamics record identifier, entity logical name, version token, mapping version, and synchronization result.
7. Retry, throttling, permission, validation, and mapping failures remain visible and do not duplicate the peer handoff.
8. A CRM result enters Territory Desk only after source, freshness, authorization, and reconciliation checks pass.

## Architecture flow

```text
Smartphone or laptop browser
            |
            v
Protected Territory Desk API
      |                 |
      v                 v
App-owned relational   Transactional outbox
workflow database             |
                              v
                   Server-side Dynamics adapter
                              |
                              v
                   Approved Dataverse Web API
```

The frontend has no PostgreSQL password, Dataverse token, client secret, certificate, or provider credential.

## Why PostgreSQL-compatible relational storage

The collaboration workflow needs atomic multi-record commands and enforceable relationships:

1. One handoff creation must commit its core audit events once.
2. Acceptance must change ownership and record activity atomically.
3. One accepted handoff has at most one active primary follow-up.
4. Idempotency keys must reject duplicate commands.
5. Foreign keys preserve valid relationships among handoffs, events, notifications, users, and assignments.
6. Unique and check constraints enforce durable invariants beyond TypeScript validation.
7. An outbox record must commit with the business command that created it.

PostgreSQL is the recommended database family, not yet the selected provider. Local development, preview, and production will use separate environments. Production service, backup, recovery, encryption, regional hosting, price, and company approval are decided later.

## Proposed app-owned table families

### Identity and routing references

1. `app_user` — stable authenticated-user mapping and active state; source-controlled fields remain external.
2. `representative_snapshot` — minimum versioned directory display and routing attributes.
3. `territory_source_version` — imported source identity, timestamps, validation, and compatibility.
4. `territory_assignment` — versioned ZIP, division, department, and representative relationship.

### Collaboration workflow

1. `handoff` — current peer-handoff state, ownership dimensions, minimum customer context, response target, and optional CRM link state.
2. `handoff_participant` — sender, requested recipient, prior owner, manager intervention, and approved participant relationship when history requires it.
3. `activity_event` — append-only collaboration and system timeline.
4. `follow_up` — current primary follow-up and concurrency version.
5. `follow_up_revision` — immutable prior due time, owner, reschedule, completion, or cancellation detail when a separate event is insufficient.

### Notifications and commands

1. `in_app_notification` — user-facing authorized notification.
2. `notification_delivery_attempt` — simulated or future provider delivery state.
3. `command_receipt` — idempotency key, authorized actor, command type, result reference, and safe expiry metadata.
4. `integration_outbox` — committed future work for Dynamics or an approved external channel.
5. `integration_attempt` — retry, provider response class, next attempt, and non-sensitive error category.

### Trust, configuration, and support

1. `source_snapshot` — source availability, freshness, validation, and version compatibility.
2. `data_quality_issue` — auditable territory, directory, workflow, notification, or integration correction request.
3. `user_preference` — approved editable preferences only.
4. `support_request` — configured problem and suggestion workflow.
5. `feature_flag` and `application_configuration` — server-controlled environment behavior with no secrets in ordinary rows.

### Future integration mapping

1. `external_record_link` — Territory Desk ID, external system, environment key, entity logical name, opaque external ID, mapping version, and link state.
2. `external_record_version` — last approved external version token, source refresh, and reconciliation state.
3. `integration_checkpoint` — change-tracking or polling checkpoint when an approved synchronization mode exists.

## Minimum handoff data rule

Territory Desk stores only what the recipient needs to evaluate and act on the referral:

1. Company name and location.
2. Minimum available customer contact method or approved unavailable reason.
3. Requested service, division, recipient, and routing evidence.
4. Concise customer need and timing.
5. Sender, ownership, response, follow-up, feedback, and outcome context.

Excluded from the initial app-owned database:

1. Attachments.
2. Email or text bodies.
3. Call recordings or transcripts.
4. Private notes.
5. Quotes, contracts, invoices, or payment information.
6. Broad account history.
7. Compensation data.
8. Unapproved revenue or forecasting fields.
9. Copied Dynamics payloads.

## Identifier and mapping rules

1. Territory Desk generates its own opaque IDs for app-owned records.
2. Browser routes expose only approved opaque IDs.
3. External Dynamics IDs remain separate and never become Territory Desk primary keys.
4. Every external link records the Dynamics environment key and entity logical name; an ID alone is not globally meaningful.
5. The exact Dynamics table and column logical names come from approved environment metadata, not display labels or guesses.
6. Integration-created records use a stable alternate key or recorded idempotency mapping when the approved schema supports one.
7. Retried commands return the existing mapped result instead of creating duplicates.
8. Display names never serve as join keys.

## Concurrency and transaction rules

1. Every mutable aggregate has a record version.
2. Commands include the version last viewed by the user.
3. Stale commands return a reviewable conflict and never silently overwrite.
4. Handoff state, ownership, required-action owner, response result, related activity, and outbox work commit atomically when one command changes them.
5. Activity events are append-only; corrections create linked events.
6. Database primary, foreign-key, unique, and check constraints protect structural invariants.
7. Future Dynamics writes use approved ETags or equivalent optimistic-concurrency behavior where supported.
8. Cross-system operations are not one distributed database transaction; the outbox and reconciliation state make partial success explicit.

## Dynamics integration boundary

### Supported future interface

The preferred direct interface is the Microsoft Dataverse Web API through authenticated server-side HTTP requests. The Web API is OData v4 and is available across languages and platforms.

The Dynamics adapter must support:

1. Environment-specific base URL and metadata.
2. Explicit entity and field allowlists.
3. Minimal `$select` queries and bounded page sizes.
4. Alternate keys or stored mappings for idempotent integration.
5. ETag-based conflict detection where the table supports optimistic concurrency.
6. Change tracking only after the exact synchronization direction and table support are approved.
7. `429 Too Many Requests` handling using the returned `Retry-After` guidance.
8. Correlation IDs and privacy-safe operational logs.
9. Environment-specific circuit breaking and Data Status reporting.

### No-Azure clarification

No new Azure subscription, Azure Communication Services resource, token-purchased AI service, or separately billed Azure workload is part of this recommendation.

However, a direct Dataverse Web API integration cannot truthfully be described as having no Microsoft identity dependency. Microsoft documents that Dataverse OAuth uses Microsoft Entra ID and that published applications require an app registration. A server-to-server connection also requires an approved application user and secret or certificate configuration.

Therefore:

1. Territory Desk will not create an Azure or Entra registration independently.
2. Direct Dynamics integration stays disabled unless Cintas provides an approved existing tenant path and administrator support.
3. Existing employee access to the Dynamics user interface does not prove API or app-registration permission.
4. If Cintas prohibits any Entra app registration, direct Dataverse integration is unavailable.
5. An approved Power Automate flow or internal company integration gateway may satisfy the adapter instead, but licensing, capacity, ownership, and security must still be verified.
6. Email scraping, browser automation, shared user passwords, and copied session tokens are prohibited workarounds.

## Dynamics synchronization policy

Do not start with continuous two-way synchronization.

Recommended progression:

1. **Disabled** — fictional prototype; Dynamics cards explicitly show Not Connected.
2. **Read-only mapping test** — approved test environment and fictional or authorized test records.
3. **Explicit link** — authorized user links one peer handoff to one verified CRM record.
4. **Controlled write** — approved creation or update of narrowly mapped CRM records through queued idempotent commands.
5. **Selective reconciliation** — approved fields return through change tracking or bounded polling.
6. **Expanded automation** — only after error rates, duplicates, permissions, volume, attribution, and ownership pass pilot review.

Rules:

1. A Dynamics outage never deletes or duplicates a Territory Desk handoff.
2. A failed Dynamics link never shows `Synced`.
3. Territory Desk peer status and Dynamics CRM stage remain separately labeled.
4. No last-writer-wins rule silently resolves a disagreement.
5. Conflicts display Needs Reconciliation with source, timestamp, mapping version, and permitted next action.
6. Dynamics-dependent KPIs remain unavailable until mapping and reconciliation are validated.

## Data lifecycle and deletion boundary

Exact retention durations cannot be responsibly invented in this step. They require Cintas legal, privacy, records-management, CRM, and security owners.

Before production, define:

1. Active handoff retention.
2. Declined, withdrawn, lost, and closed handoff retention.
3. Append-only activity and audit retention.
4. Notification and provider-attempt retention.
5. Idempotency receipt retention.
6. Territory-version and correction-report retention.
7. Support and suggestion retention.
8. Dynamics-link and reconciliation retention.
9. User deactivation and reassignment behavior.
10. Backup retention, restoration testing, and legal-hold behavior.

Deleting a CRM record does not automatically authorize deletion of Territory Desk audit history, and deleting a Territory Desk peer handoff does not silently delete a Dynamics record.

## Environment separation

| Environment | Data | Dynamics | Notifications | Database |
| --- | --- | --- | --- | --- |
| Development | Fictional only | Disabled | Simulated | In-memory first; local isolated relational database when backend work begins |
| Preview | Fictional or explicitly approved test data | Disabled by default; test tenant only after approval | Simulated by default | Separate preview database |
| Production | Approved minimum business data | Approved production environment only | Approved channels only | Separate protected production database |

No environment shares credentials, connection strings, encryption keys, tables, storage, queues, or integration checkpoints with another.

## Failure and recovery behavior

1. Database failure before commit returns Not Sent and creates no notification claim.
2. Unknown submission result is recovered through the idempotency key.
3. Notification failure preserves the committed handoff.
4. Dynamics failure preserves the committed handoff and queued integration state.
5. Retry uses bounded exponential delay and provider `Retry-After` guidance where applicable.
6. Poison or repeatedly failing integration work moves to an operator-visible failed state; it does not retry forever.
7. Users receive plain-language status, not raw database, OAuth, or Dataverse errors.
8. Data Status reports availability and freshness without exposing customer records or connection details.
9. Backup restoration, point-in-time recovery, and disaster-recovery targets are required provider-selection criteria in a later step.

## Required mapping information from Cintas

The following is not needed to build the fictional prototype, but is mandatory before a real Dynamics connection:

1. Exact Dynamics 365 application name.
2. Dataverse environment URL and approved environment owner.
3. Development or test environment separate from production.
4. Approved tables and logical names.
5. Approved columns and logical names.
6. Existing account, contact, lead, opportunity, activity, task, appointment, owner, and manager relationships.
7. Status and status-reason values.
8. Record ownership and business-unit security model.
9. Duplicate-detection and alternate-key rules.
10. Permitted read and write operations.
11. Integration identity method and administrator.
12. API, Power Platform request, licensing, and capacity constraints.
13. Retention, audit, deletion, and incident owners.
14. Deep-link format for authorized employees.

## Step 3.2 acceptance checklist

- [x] Territory Desk is approved as system of record for the peer-handoff collaboration lifecycle.
- [x] Dynamics remains authoritative for CRM records that exist in Dynamics.
- [x] Peer-handoff and CRM status models remain separate and explicitly linked.
- [x] A minimal PostgreSQL-compatible relational database is approved for production app-owned data.
- [x] The database provider and production host remain deferred.
- [x] Browser-to-database and browser-to-Dynamics connections are rejected.
- [x] The protected API, relational database, transactional outbox, and server-side adapter pattern is approved.
- [x] The proposed app-owned table families are approved as a schema-planning basis.
- [x] Minimum handoff data and explicit exclusions are approved.
- [x] Territory Desk and Dynamics use separate opaque identifiers plus a versioned link record.
- [x] Commands use transactions, idempotency, record versions, and append-only activity.
- [x] Dynamics integration begins disabled and advances through controlled stages only.
- [x] No continuous two-way synchronization is attempted initially.
- [x] No-Azure means no new paid Azure workload; it does not bypass the documented Entra requirement for direct Dataverse OAuth.
- [x] Direct Dynamics integration remains blocked without Cintas tenant, environment, schema, permission, identity, licensing, and owner approval.
- [x] Email scraping, browser automation, shared passwords, and copied session tokens are rejected.
- [x] Retention durations remain a company-governance decision before production.
- [x] No real database or Dynamics connection is created until later architecture and company approvals are complete.

## Official references reviewed

1. Microsoft Dataverse Web API overview: https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/overview
2. Microsoft Dataverse OAuth authentication: https://learn.microsoft.com/en-us/power-apps/developer/data-platform/authenticate-oauth
3. Microsoft Dataverse Web API types and environment metadata: https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/web-api-types-operations
4. Microsoft Dataverse conditional operations and ETags: https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/perform-conditional-operations-using-web-api
5. Microsoft Dataverse alternate keys: https://learn.microsoft.com/en-us/power-apps/developer/data-platform/use-alternate-key-reference-record
6. Microsoft Dataverse change tracking: https://learn.microsoft.com/en-us/power-apps/developer/data-platform/org-service/samples/synchronize-data-external-systems-using-change-tracking
7. Microsoft Dataverse service-protection limits: https://learn.microsoft.com/en-us/power-apps/developer/data-platform/api-limits
8. Microsoft Power Platform integration requirements: https://learn.microsoft.com/en-us/power-platform/architecture/key-concepts/integration-patterns/requirements
9. PostgreSQL constraints: https://www.postgresql.org/docs/current/ddl-constraints.html
