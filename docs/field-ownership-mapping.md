# Field Ownership and Provisional Dynamics Mapping

Status: Approved for Step 3.3

Decision scope: Define field-level authority, the initial app-owned relational schema, standard Dataverse mapping candidates, and the exact process for replacing candidates with verified Cintas logical names.

This document does not claim access to the Cintas Dataverse environment and does not authorize a real connection or write.

## Mapping confidence labels

Every mapping uses one label:

| Label | Meaning |
| --- | --- |
| `APP` | Territory Desk is authoritative for this field or record. |
| `CRM` | Dynamics is authoritative after a verified CRM record exists. |
| `SNAPSHOT` | Territory Desk preserves the value visible at a specific business event; it is not a live master-data replacement. |
| `DERIVED` | Calculated from approved source fields and a versioned rule. |
| `CONFIG` | Controlled by approved application or company configuration. |
| `CANDIDATE` | Standard Dataverse table or column that must be verified in the Cintas environment. |
| `UNMAPPED` | No safe source or destination is approved yet. |
| `EXCLUDED` | Deliberately outside Territory Desk. |

No `CANDIDATE` field may be enabled in production code as though it were verified.

## Naming rules

1. TypeScript domain fields use `camelCase`.
2. PostgreSQL columns use `snake_case`.
3. Dataverse mappings use exact environment logical names, never localized display labels.
4. Territory Desk UUIDs remain separate from Dataverse GUIDs.
5. The external environment key and entity logical name accompany every external record ID.
6. Submission-time snapshots are immutable even when a linked CRM record later changes.
7. Current CRM values, when approved, are displayed separately from historical snapshots.

## Standard Dataverse candidates

Microsoft publishes the following standard candidates. Their presence, customization, security, and suitability in the Cintas environment are unverified.

| Business concept | Standard candidate | Entity set | Standard primary ID | Initial Territory Desk use |
| --- | --- | --- | --- | --- |
| Employee or Dynamics user | `systemuser` | `systemusers` | `systemuserid` | Read-only identity-link candidate |
| Company | `account` | `accounts` | `accountid` | Optional verified CRM company link |
| Customer contact | `contact` | `contacts` | `contactid` | Optional verified CRM contact link |
| CRM lead | `lead` | `leads` | `leadid` | Optional explicit create or link after approval |
| CRM opportunity | `opportunity` | `opportunities` | `opportunityid` | Optional link after qualification or existing match |
| CRM task | `task` | `tasks` | `activityid` | Future follow-up candidate; not first-release authority |
| CRM appointment | `appointment` | `appointments` | `activityid` | Future verified appointment candidate |
| Generic CRM activity view | `activitypointer` | `activitypointers` | `activityid` | Read model only; do not create a generic activitypointer row |

Standard availability does not prove Cintas uses the standard table for the same business purpose.

## Representative and identity mapping

Territory Desk needs an app profile even if a Dynamics user exists because application access, peer-handoff participation, department routing, and manager scope are not assumed to equal CRM ownership permissions.

| Domain field | PostgreSQL field | Authority | Standard Dynamics candidate | Rule |
| --- | --- | --- | --- | --- |
| `id` | `app_user.id` | `APP` | None | Opaque Territory Desk UUID. |
| External user link | `external_record_link.external_id` | `CRM`/`CANDIDATE` | `systemuser.systemuserid` | Store only after exact identity verification. |
| `displayName` | `representative_snapshot.display_name` | `SNAPSHOT` | `systemuser.fullname` | Read-only candidate; preserve source version. |
| Work email destination | `representative_snapshot.work_email` | `SNAPSHOT` | `systemuser.internalemailaddress` | Permission-controlled; never use personal email by default. |
| Approved SMS destination | `representative_snapshot.sms_destination` | `SNAPSHOT` | `systemuser.mobilephone` | Candidate only; company must approve source and SMS eligibility. |
| `department` | `representative_snapshot.department_code` | `SNAPSHOT` | Custom column, position, or business unit | Do not infer solely from job title. |
| Exact division | `representative_snapshot.division_code` | `SNAPSHOT` | Cintas-specific mapping | `UNMAPPED` until verified. |
| Location | `representative_snapshot.location_code` | `SNAPSHOT` | Business unit or Cintas-specific mapping | Exact division and location are separate values. |
| `managerId` | `representative_snapshot.manager_app_user_id` | `SNAPSHOT` | `systemuser.parentsystemuserid` | Candidate relationship; validate manager scope separately. |
| `active` | `app_user.active` | `APP` plus source check | `systemuser.isdisabled` | A CRM-enabled user is not automatically app-authorized. |
| App role | Role-assignment table, later identity design | `APP`/`CONFIG` | CRM role or team may inform it | Never infer manager access from a visible title. |
| `territories` | Versioned assignment relationship | `SNAPSHOT` | `systemuser.territoryid` or custom data | Standard territory is not assumed to match service-line routing. |
| Work timezone | `representative_snapshot.timezone_name` | `SNAPSHOT` | Approved identity or company source | Store an approved timezone identifier, not only a UTC offset. |
| `sourceVersion` | `representative_snapshot.source_version` | `SNAPSHOT` | Source metadata/version | Required for routing and profile freshness. |
| `sourceUpdatedAt` | `representative_snapshot.source_updated_at` | `SNAPSHOT` | Source timestamp | Separate from app import time. |
| `lastVerifiedAt` | `representative_snapshot.last_verified_at` | `SNAPSHOT` | Approved verification | Never fabricate from `modifiedon`. |
| `identityException` | `representative_snapshot.exception_code` | `APP` | None | Records duplicate, conflicting, inactive, or missing mapping. |

## Customer company and account mapping

The original handoff snapshot remains app-owned evidence of what the sender submitted. A later CRM link does not rewrite that evidence.

| Territory Desk value | Authority | Standard account candidate | Behavior |
| --- | --- | --- | --- |
| Company name at submission | `SNAPSHOT` | `account.name` | Preserve submitted value; optionally display a separately labeled current CRM name. |
| Street at submission | `SNAPSHOT` | `account.address1_line1` | Map only after verified account selection. |
| City | `SNAPSHOT` | `account.address1_city` | Routing ZIP remains independently validated. |
| State | `SNAPSHOT` | `account.address1_stateorprovince` | Normalize for Territory Desk without rewriting CRM. |
| ZIP | `SNAPSHOT` | `account.address1_postalcode` | A matching ZIP alone never proves account identity. |
| External account ID | `CRM` | `account.accountid` | Stored in `external_record_link`, not `handoff`. |
| Account number | `CRM`/`CANDIDATE` | `account.accountnumber` | Prefer as matching evidence only if Cintas defines and governs it. |
| CRM version | `CRM` | `@odata.etag` or version metadata | Used for concurrency and freshness, not user display. |

Rules:

1. Free-text company name never auto-creates or auto-links an account.
2. ZIP and name similarity may produce candidates but require authorized confirmation.
3. An exact approved alternate key may support deterministic matching.
4. Territory Desk does not store account financial, credit, billing, contract, or broad history fields.

## Customer-contact mapping

| Territory Desk value | Authority | Standard contact candidate | Behavior |
| --- | --- | --- | --- |
| Contact name at submission | `SNAPSHOT` | `contact.fullname` | Preserve original entry. |
| Phone at submission | `SNAPSHOT` | `contact.telephone1` or `contact.mobilephone` | Exact candidate selected by approved mapping; do not guess which phone is preferred. |
| Email at submission | `SNAPSHOT` | `contact.emailaddress1` | Normalize comparison separately from display value. |
| Contact company relationship | `SNAPSHOT` then `CRM` when linked | `contact.parentcustomerid` | Verify related account or customer target. |
| External contact ID | `CRM` | `contact.contactid` | Stored in versioned external link. |
| Contact permission indicators | `CRM`/`CANDIDATE` | `donotphone`, `donotemail`, related policy fields | Must be reviewed before approved outbound use; presence of a phone or email is not consent. |
| CRM version | `CRM` | `@odata.etag` or version metadata | Conflict and freshness control. |

Rules:

1. Name alone never auto-links a contact.
2. Territory Desk does not copy personal history, birthdays, family information, credit fields, or marketing profiles.
3. A peer handoff may contain minimum contact context without creating a CRM contact.
4. CRM contact creation is a separately approved command with duplicate review.

## Peer-handoff field ownership

All fields below remain authoritative in Territory Desk even when the handoff links to a CRM lead or opportunity, unless explicitly marked `DERIVED`, `SNAPSHOT`, or `CRM link`.

| Domain field | Database column | Ownership | Dynamics candidate or rule |
| --- | --- | --- | --- |
| `id` | `handoff.id` | `APP` | Never replaced by `leadid` or `opportunityid`. |
| `senderId` | `handoff.sender_app_user_id` | `APP` | Optional verified `systemuser` link is separate. |
| `senderDepartment` | `handoff.sender_department_snapshot` | `SNAPSHOT` | Preserve at submission. |
| `requestedRecipientId` | `handoff.requested_recipient_app_user_id` | `APP` | Recipient before acceptance. |
| `recipientDepartment` | `handoff.recipient_department_snapshot` | `SNAPSHOT` | Preserve at submission. |
| `currentOwnerId` | `handoff.current_owner_app_user_id` | `APP` | Not equal to CRM `ownerid` by default. |
| `requiredActionOwnerId` | `handoff.required_action_owner_app_user_id` | `APP` | No direct CRM equivalent. |
| `recordVersion` | `handoff.record_version` | `APP` | Incremented by committed app commands. |
| `companyName` | `handoff.company_name_snapshot` | `SNAPSHOT` | Candidate `lead.companyname` or linked `account.name`. |
| `contactSummary` | Structured contact columns/read model | `SNAPSHOT`/`DERIVED` | Do not copy a raw CRM contact payload. |
| `opportunitySummary` | `handoff.need_summary` | `APP` | Candidate `lead.subject` plus approved description mapping. |
| `streetAddress` | `handoff.street_address_snapshot` | `SNAPSHOT` | Candidate lead/account address after approval. |
| `city` | `handoff.city_snapshot` | `SNAPSHOT` | Preserved routing context. |
| `state` | `handoff.state_snapshot` | `SNAPSHOT` | Preserved routing context. |
| `zipCode` | `handoff.zip_code_snapshot` | `SNAPSHOT` | Preserved routing key. |
| `customerContactName` | `handoff.contact_name_snapshot` | `SNAPSHOT` | Optional linked contact remains separate. |
| `customerPhone` | `handoff.contact_phone_snapshot` | `SNAPSHOT` | Encrypted/protected according to later provider design. |
| `customerEmail` | `handoff.contact_email_snapshot` | `SNAPSHOT` | Encrypted/protected according to later provider design. |
| `contactAvailability` | `handoff.contact_availability` | `APP` | No CRM mapping required. |
| `contactUnavailableReason` | `handoff.contact_unavailable_reason` | `APP` | No CRM mapping required. |
| `requestedService` | `handoff.requested_service_code` | `APP`/`SNAPSHOT` | Cintas-specific CRM mapping remains `UNMAPPED`. |
| `requestedDivision` | `handoff.requested_division_code` | `APP`/`SNAPSHOT` | Cintas-specific mapping remains `UNMAPPED`. |
| `territoryAssignmentId` | `handoff.territory_assignment_id` | `APP` | Foreign key to versioned app assignment. |
| `territorySourceVersion` | `handoff.territory_source_version_id` | `SNAPSHOT` | Required provenance. |
| `customerTiming` | `handoff.customer_timing_code` | `APP` | Does not drive queue priority. |
| `customerTimingReason` | `handoff.customer_timing_reason` | `APP` | Required for ASAP only. |
| `customerRequestedContactAt` | `handoff.customer_requested_contact_at` | `APP` | Separate from response target and follow-up due time. |
| `opportunityContext` | `handoff.opportunity_context` | `APP` | Map to CRM only through an approved bounded field. |
| `additionalNotes` | `handoff.additional_shared_notes` | `APP` | Shared, bounded, not private CRM notes. |
| `idempotencyKey` | `command_receipt.idempotency_key_hash` | `APP` | Store a safe representation and command ownership. |
| `responseTargetAt` | `handoff.response_target_at` | `DERIVED` then stored | Versioned one-business-day rule. |
| `responseTargetState` | `handoff.response_target_state` | `DERIVED`/`APP` | No CRM stage mapping. |
| `informationReviewTargetAt` | `handoff.information_review_target_at` | `DERIVED` then stored | Separate target after information supplied. |
| `attentionState` | Read model | `DERIVED` | Calculated per viewer and current state. |
| `viewedAt` | `handoff.first_recipient_viewed_at` | `APP` | Notification delivery is not view. |
| `acceptedAt` | `handoff.accepted_at` | `APP` | Does not qualify a CRM lead automatically. |
| `closedAt` | `handoff.closed_at` | `APP` | Peer closure remains separate from CRM close. |
| `closureReason` | `handoff.closure_reason_code` plus bounded detail | `APP` | CRM status reason mapping requires approval. |
| `outcomeSource` | `handoff.outcome_source` | `APP`/`CRM` label | Identifies demo, user, manager, or verified CRM evidence. |
| `status` | `handoff.status` | `APP` | Never synchronized directly to CRM `statecode`/`statuscode`. |
| `priority` | Reserved/unimplemented | `EXCLUDED` initially | Not used for ranking. |
| `nextAction` | Derived from required action and follow-up | `DERIVED` | Not an unstructured source-of-truth field. |
| `followUpAt` | Derived from active follow-up | `DERIVED` | Canonical due time lives on `follow_up`. |
| `dynamicsRecordId` | Replaced by `external_record_link` | `CRM link` | Must include environment and entity logical name. |
| `createdAt` | `handoff.created_at` | `APP` | Immutable server timestamp. |
| `updatedAt` | `handoff.updated_at` | `APP` | Latest material app change, not CRM `modifiedon`. |

## Candidate CRM lead mapping

A peer handoff does not automatically become a Dynamics lead. If Cintas approves explicit lead creation, these are candidates only:

| Territory Desk source | Standard lead candidate | Direction | Verification required |
| --- | --- | --- | --- |
| Generated safe topic | `lead.subject` | App to CRM | Required text pattern, length, and Cintas convention. |
| Company snapshot | `lead.companyname` | App to CRM | Account/contact linkage policy. |
| Contact name parts | Lead first/last-name columns | App to CRM | Name parsing is not automatic; require structured source or review. |
| Contact phone | Approved lead phone column | App to CRM | Exact logical field and consent policy. |
| Contact email | Approved lead email column | App to CRM | Exact logical field and consent policy. |
| Address snapshot | Lead primary-address columns | App to CRM | Country/state/ZIP normalization. |
| Customer need | Approved subject/description/custom field | App to CRM | Data-minimization and maximum length. |
| Requested service/division | Cintas custom choice or lookup | App to CRM | Exact custom schema and allowed values. |
| Recipient | `ownerid` or Cintas assignment field | App to CRM | CRM security ownership may differ from peer recipient. |
| Territory Desk ID | Approved custom alternate-key column, if available | App to CRM | Requires Cintas solution change; otherwise use app mapping only. |
| CRM identifier | `lead.leadid` | CRM to app link | Store in `external_record_link`. |
| CRM state and reason | `statecode` and `statuscode` | CRM to labeled read model | Never overwrite peer status. |
| Created/modified version | CRM timestamps and ETag | CRM to link metadata | Used for freshness and conflict, not peer timing KPIs. |

Do not map raw option numbers until the actual environment choices and meanings are exported and approved.

## Candidate CRM opportunity mapping

An opportunity is linked only when one already exists or an approved Dynamics process qualifies/creates it.

| Territory Desk concept | Standard opportunity candidate | Rule |
| --- | --- | --- |
| CRM opportunity ID | `opportunity.opportunityid` | External link only. |
| Display name | `opportunity.name` | CRM authoritative. |
| Customer | `customerid`, `parentaccountid`, or `parentcontactid` | Exact relationship pattern must be verified. |
| Owner | `ownerid` | CRM ownership does not overwrite peer-handoff ownership. |
| Originating lead | `originatingleadid` | Read only when the CRM process supplies it. |
| CRM state and status reason | `statecode`, `statuscode` | Separate labeled CRM stage/outcome. |
| Estimated or actual value | Environment-approved revenue fields | Excluded from initial Territory Desk ranking and KPIs. |
| Close evidence | Approved close/status fields and timestamps | May support verified outcome only after reconciliation rules pass. |

## Activity, task, follow-up, and appointment mapping

| Territory Desk record | Initial authority | Standard candidate | Rule |
| --- | --- | --- | --- |
| Append-only collaboration activity | Territory Desk | No one-to-one generic mapping | Never write directly to `activitypointer`; map a concrete activity type only if approved. |
| Primary lead-derived follow-up | Territory Desk | `task` | First release remains app-owned; optional future link uses `activityid`. |
| Follow-up summary | Territory Desk | `task.subject` | Must remain privacy-minimized if exported. |
| Follow-up due time | Territory Desk | `task.scheduledend` | Timezone and snapshot behavior must be reconciled. |
| Follow-up owner | Territory Desk | `task.ownerid` | Requires verified system-user link and permission. |
| Follow-up regarding record | Territory Desk link | `task.regardingobjectid` | Only after CRM account/lead/opportunity link is verified. |
| Appointment | Territory Desk until verified CRM source exists | `appointment` | Candidate `activityid`, `subject`, scheduled start/end, owner, regarding, state, and status. |
| Customer call | Territory Desk shared event | `phonecall` candidate | Do not copy recording, transcript, or raw body. |
| Customer email | Territory Desk shared event | `email` candidate | Do not copy message body or attachments. |

Activity integration is deferred from initial synchronization because generic CRM activities are polymorphic, permission-sensitive, and easy to duplicate.

## App-only entity ownership ledger

Unless a later approved mapping explicitly changes it, every field in these existing data-dictionary entities is `APP`, `SNAPSHOT`, `DERIVED`, or `CONFIG` and has no direct CRM write:

| Entity | Primary key | Write owner | Created/updated behavior | Archive or deletion boundary |
| --- | --- | --- | --- | --- |
| `activity_event` | UUID | Validated app command or integration service | `recorded_at` immutable; corrections append | Company audit/retention policy required |
| `follow_up` | UUID | Authorized current owner or manager command | Versioned; revisions preserved | Retain history under approved policy |
| `follow_up_revision` | UUID | System from follow-up command | Immutable | Follows related follow-up policy |
| `in_app_notification` | UUID | Notification service | Read timestamp user-specific | Retention period unresolved |
| `notification_delivery_attempt` | UUID | Notification worker | Append attempts; safe error categories | Provider and company policy required |
| `command_receipt` | UUID | API command boundary | Immutable successful command result | Expiry must exceed safe retry window |
| `integration_outbox` | UUID | Same transaction as business command | State changes by worker | Operational retention unresolved |
| `integration_attempt` | UUID | Integration worker | Append each attempt | Operational retention unresolved |
| `territory_source_version` | UUID | Approved import process | Immutable version metadata | Preserve versions used by active/history records |
| `territory_assignment` | UUID | Approved import or correction process | Effective-dated and versioned | Never overwrite a historical assignment snapshot |
| `source_snapshot` | UUID | Source-monitor process | Versioned evaluation | Operational retention unresolved |
| `data_quality_issue` | UUID | Authorized reporter/system | Versioned status and reporter-visible updates | Governance policy required |
| `user_preference` | User UUID | Authenticated user for allowlisted preferences | Optimistic concurrency | Delete or transfer on approved deactivation policy |
| `support_request` | UUID | Authenticated reporter/support workflow | Reporter-visible lifecycle | Support retention unresolved |
| `help_topic` | UUID/slug | Approved content owner | Versioned publication | Retire with replacement, do not silently repurpose slug |
| `insight_result` | UUID | Server calculation | Reproducible definition/source versions | Cache only; recompute under retention policy |
| `external_record_link` | UUID | Approved integration command | Versioned state; no silent relink | Preserve reconciliation history |
| `external_record_version` | UUID | Integration worker | Append or version approved source tokens | Operational retention unresolved |
| `integration_checkpoint` | UUID | Integration worker | Environment/source scoped | Never share across environments |

## Required base columns for app-owned tables

Every mutable app-owned business table includes, as applicable:

1. Opaque primary UUID.
2. `created_at` server timestamp.
3. `created_by_app_user_id` or trusted service actor.
4. `updated_at` server timestamp.
5. Integer or opaque `record_version`.
6. Environment boundary supplied by database isolation, not a user-editable row value.
7. Approved status code with a database constraint where stable.
8. Soft-retirement or closure fields only when the lifecycle requires them.

Append-only event and attempt tables do not expose an ordinary update operation.

## Read and write directions

| Data class | Prototype | Initial production | Later approved integration |
| --- | --- | --- | --- |
| Peer handoffs | Fictional adapter read/write | Territory Desk API/database read/write | Remains app authoritative |
| Territory and directory | Fictional fixtures | Approved import/source snapshots | Read from approved source; corrections routed to owner |
| CRM user identity | Fictional personas | Unmapped or company identity mapping | Read approved minimum from verified source |
| CRM account/contact | Fictional display | No automatic connection | Read/link; create only through separately approved command |
| CRM lead/opportunity | Not connected | Not connected | Explicit link/create and selective read/write |
| CRM task/appointment/activity | Not connected | Territory Desk app-owned workflow | Optional selected links; no broad two-way sync |
| Dynamics status/outcome | Unavailable label | Unavailable label | Read-only evidence first, controlled reconciliation later |

## Matching and duplicate-control rules

Use this order:

1. Existing verified `external_record_link` in the same Dynamics environment.
2. Exact approved alternate key.
3. Exact approved business identifier such as a governed account number.
4. Bounded search returning candidates for human confirmation.
5. No match.

Never auto-link solely on:

1. Company display name.
2. Contact display name.
3. Phone number.
4. Email address.
5. Street address or ZIP.
6. Fuzzy similarity score.

Duplicate warnings never expose inaccessible CRM records.

## Exact Cintas verification procedure

When Cintas provides approved read-only development/test access, the integration owner performs these steps:

1. Record the exact environment URL and owner.
2. Retrieve the Dataverse service document and `$metadata` document.
3. Export table metadata for candidate and Cintas-specific tables.
4. Record each table's logical name, entity-set name, primary ID, primary name, ownership type, change-tracking support, and optimistic-concurrency support.
5. Export approved column logical names, types, required levels, maximum lengths, choices, lookup targets, create/update/read validity, and security restrictions.
6. Export relevant relationships, alternate keys, duplicate-detection rules, and business-unit ownership rules.
7. Identify the actual tables used by the Cintas Dynamics application rather than assuming every standard table is active.
8. Map each Territory Desk candidate to an exact verified logical name or mark it unavailable.
9. Test read access using fictional or authorized test records.
10. Test missing, inactive, inaccessible, duplicate, and conflicting records.
11. Review the mapping with the CRM owner, security owner, business-process owner, and data owner.
12. Version and approve the mapping before any write is enabled.
13. Perform write tests only in the approved test environment with rollback and duplicate checks.
14. Record the approved production promotion and rollback procedure.

Screenshots and display labels are insufficient evidence for a production mapping.

## Unresolved Cintas-specific mapping items

1. Exact Dynamics 365 application and environment.
2. Whether representatives are standard `systemuser` records for this purpose.
3. Department, division, location, manager, role, timezone, and territory sources.
4. Whether peer referrals should ever create a standard lead, custom referral table, or another record type.
5. Account and contact matching identifiers.
6. Required lead and opportunity fields.
7. Cintas service-line choices and logical values.
8. Business-unit and owner assignment behavior.
9. CRM status and status-reason meanings.
10. Whether tasks, appointments, calls, or emails may be created or only linked.
11. Alternate-key and duplicate-detection configuration.
12. Field-level security and least-privilege access.
13. Dynamics deep-link format.
14. Retention, deletion, audit, legal-hold, and incident ownership.

These do not block the fictional prototype. They block real Dynamics connectivity and Dynamics-dependent KPIs.

## Step 3.3 acceptance checklist

- [x] Mapping confidence labels and no-guess rule are approved.
- [x] Standard Dataverse tables and columns remain candidates until verified against Cintas metadata.
- [x] Representative and identity field ownership is approved.
- [x] Submission-time company and contact values remain immutable snapshots after CRM linking.
- [x] The field-by-field peer-handoff ownership matrix is approved.
- [x] A peer handoff never automatically creates a Dynamics lead or opportunity.
- [x] Candidate lead and opportunity mappings require exact environment verification and a separate controlled command.
- [x] App activity never writes a generic `activitypointer` row directly.
- [x] Initial follow-ups and appointments remain app-owned; concrete CRM activity links are deferred.
- [x] App-only entity ownership, key, version, author, and retention boundaries are approved as the initial schema basis.
- [x] Exact and verified links precede alternate keys, governed identifiers, and human-confirmed candidate search.
- [x] Display-name, phone, email, ZIP, address, and fuzzy-only automatic linking are rejected.
- [x] The exact Cintas metadata-verification procedure is approved.
- [x] Unresolved Cintas mappings block integration but do not block fictional prototype construction.
- [x] No production Dynamics field, choice value, permission, or relationship is treated as known without approved metadata evidence.

## Official references reviewed

1. Dataverse table definitions and primary attributes: https://learn.microsoft.com/en-us/power-apps/developer/data-platform/entity-metadata
2. Dataverse Web API entity types and alternate-key metadata: https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/web-api-entitytypes
3. Standard Account entity: https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/reference/account?view=dataverse-latest
4. Standard Contact entity: https://learn.microsoft.com/en-us/power-apps/developer/data-platform/reference/entities/contact
5. Standard Lead entity: https://learn.microsoft.com/en-us/dynamics365/developer/reference/entities/lead
6. Standard Opportunity entity: https://learn.microsoft.com/en-us/dynamics365/developer/reference/entities/opportunity
7. Standard System User entity: https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/reference/systemuser?view=dataverse-latest
8. Standard Appointment entity: https://learn.microsoft.com/en-us/power-apps/developer/data-platform/reference/entities/appointment
