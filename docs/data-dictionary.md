# Provisional Data Dictionary

All fields are provisional until the Dynamics 365 mapping and privacy review are complete.

## Representative

| Field | Purpose |
| --- | --- |
| `id` | Stable application or mapped Dynamics identifier |
| `displayName` | Representative name shown to users |
| `department` | Uniform, Facility Services, First Aid, or another approved department |
| `territories` | ZIP, city, state, or service-line responsibility |
| `managerId` | Authorized manager relationship |
| `active` | Controls routing eligibility |
| `notificationPreferences` | Approved in-app, email, push, or SMS behavior |
| `sourceVersion` | Directory or identity source version used for the active record |
| `sourceUpdatedAt` | Date the source dataset reports it was updated |
| `lastVerifiedAt` | Optional separate authoritative or human verification timestamp |
| `identityException` | Optional duplicate-name, conflicting-contact, or missing-identity review state |

## Lead handoff

| Field | Purpose |
| --- | --- |
| `id` | Unique handoff identifier |
| `senderId` | Representative who submitted the handoff |
| `senderDepartment` | Sending department at submission time |
| `requestedRecipientId` | Representative currently requested to respond before acceptance |
| `recipientDepartment` | Receiving department at submission time |
| `currentOwnerId` | Current accountable representative |
| `requiredActionOwnerId` | User who currently owes the next required action |
| `recordVersion` | Concurrency token for safe status and ownership commands |
| `companyName` | Fictional during prototype |
| `contactSummary` | Minimum approved contact context |
| `opportunitySummary` | Why the handoff is relevant |
| `streetAddress` | Optional customer street address |
| `city` | Canonical or validated customer city |
| `state` | Validated customer state |
| `zipCode` | Five-digit routing ZIP |
| `customerContactName` | Optional customer contact name |
| `customerPhone` | Optional normalized customer phone |
| `customerEmail` | Optional normalized customer email |
| `contactAvailability` | Phone, email, both, or not-yet-available selection |
| `contactUnavailableReason` | Required explanation when no contact method is available |
| `requestedService` | Approved department or service display group |
| `requestedDivision` | Exact source division used for routing |
| `territoryAssignmentId` | Versioned assignment used to validate the recipient |
| `territorySourceVersion` | Assignment data version at submission |
| `customerTiming` | ASAP, within 7 days, within 30 days, later, or unknown |
| `customerTimingReason` | Required explanation for ASAP timing |
| `customerRequestedContactAt` | Optional customer-requested contact timestamp |
| `opportunityContext` | Optional approved opportunity context |
| `additionalNotes` | Optional internal handoff notes |
| `idempotencyKey` | Server-enforced duplicate-submission protection key |
| `responseTargetAt` | Calculated first meaningful response deadline |
| `responseTargetState` | Pending, completed-on-time, completed-late, or missed |
| `informationReviewTargetAt` | Separate deadline after requested information is supplied |
| `attentionState` | Derived action-required, waiting, needs-attention, up-to-date, or closed state |
| `viewedAt` | First authenticated recipient detail-view timestamp |
| `acceptedAt` | Ownership-acceptance timestamp |
| `closedAt` | Final outcome, decline, or withdrawal timestamp |
| `closureReason` | Approved reason for decline, withdrawal, loss, or non-qualified closure |
| `outcomeSource` | Territory Desk demo or future verified Dynamics source |
| `status` | Current workflow state |
| `priority` | Reserved for a future approved urgency classification; not used for initial queue ranking |
| `nextAction` | Current required action |
| `followUpAt` | Optional lead-derived follow-up timestamp |
| `dynamicsRecordId` | Future mapped Dynamics identifier |
| `createdAt` | Submission timestamp |
| `updatedAt` | Latest material-change timestamp |

## Handoff status

Initial values:

1. `pending_acceptance`
2. `needs_information`
3. `declined`
4. `accepted`
5. `in_progress`
6. `appointment_set`
7. `won`
8. `lost`
9. `closed_not_qualified`
10. `withdrawn`

## Activity event

| Field | Purpose |
| --- | --- |
| `id` | Unique immutable event identifier |
| `handoffId` | Related lead handoff |
| `actorId` | User or service that created the event |
| `family` | System, notification, follow-up, progress, appointment, or outcome |
| `type` | Approved event type within its family |
| `summary` | Human-readable event description |
| `occurredAt` | Event timestamp |
| `recordedAt` | Immutable server timestamp when the event was stored |
| `sourceTimezone` | Timezone used for a user-reported occurred time |
| `source` | User, system, manager, notification service, or future Dynamics |
| `correlationId` | Groups records created by one atomic command |
| `idempotencyReference` | Safe duplicate-command protection reference |
| `supersedesEventId` | Prior event corrected by this event |
| `visibilityScope` | Permission-derived event visibility |
| `metadata` | Approved structured event details |

## Lead follow-up

| Field | Purpose |
| --- | --- |
| `id` | Unique follow-up identifier |
| `handoffId` | Required related peer-handoff identifier |
| `ownerId` | Current accountable follow-up owner |
| `createdById` | Authenticated creator |
| `actionType` | Call, email, appointment, proposal, research, coordination, information, review, or other |
| `summary` | Concise next-action commitment |
| `dueAt` | Exact due timestamp after date-only defaulting when needed |
| `timezone` | IANA or approved full timezone identifier used to interpret due time |
| `reminderLeadTime` | Optional in-app reminder offset |
| `status` | Open, completed, or canceled lifecycle state |
| `timingState` | Derived upcoming, due-today, or overdue state |
| `completionResult` | Approved structured result when completed |
| `completedAt` | Completion timestamp |
| `canceledAt` | Cancellation timestamp |
| `cancelReason` | Approved cancellation reason |
| `recordVersion` | Concurrency token for safe commands |
| `calendarUid` | Opaque stable UID used for optional calendar export |
| `calendarSequence` | Version of the latest exported snapshot |
| `createdAt` | Creation timestamp |
| `updatedAt` | Latest material-change timestamp |

## Notification delivery

| Field | Purpose |
| --- | --- |
| `id` | Unique attempt identifier |
| `handoffId` | Related lead handoff |
| `recipientId` | Intended recipient |
| `channel` | In-app, simulated SMS, email, or approved future provider |
| `status` | Queued, simulated, sent, delivered, or failed |
| `attemptedAt` | Attempt timestamp |
| `providerReference` | Future non-sensitive provider identifier |
| `failureReason` | Safe operational failure summary |

## In-app notification

| Field | Purpose |
| --- | --- |
| `id` | Unique user-facing notification identifier |
| `recipientId` | Authenticated user to whom the notification is addressed |
| `handoffId` | Optional related peer-handoff identifier |
| `sourceEventId` | Event or reminder that caused the notification |
| `correlationId` | Atomic command correlation used for deduplication |
| `category` | Lead alert, feedback-outcome, or reminder-system category |
| `type` | Approved user-facing notification type |
| `safeMessage` | Privacy-minimized in-app display message |
| `destinationType` | Lead, follow-up, data-status, or other approved route type |
| `destinationId` | Opaque identifier resolved after authorization |
| `createdAt` | Server creation timestamp |
| `readAt` | Optional personal read timestamp |
| `linkedActionState` | Optional derived action-needed, resolved, waiting, or unavailable state |
| `idempotencyReference` | Safe duplicate-notification protection reference |

## Territory assignment

| Field | Purpose |
| --- | --- |
| `id` | Assignment identifier |
| `zipCode` | Normalized ZIP code |
| `city` | Normalized city |
| `state` | State abbreviation |
| `department` | Routed department or service line |
| `representativeId` | Responsible representative |
| `effectiveFrom` | Assignment start date |
| `effectiveTo` | Optional assignment end date |
| `sourceVersion` | Import or source-data version |
| `sourceUpdatedAt` | Date the source dataset reports it was updated |
| `lastVerifiedAt` | Optional separate authoritative or human verification timestamp |
| `status` | Assigned, open, inactive, or needs-review state |
| `exceptionType` | Optional ambiguity, missing-data, or contact-conflict reason |

## Insight result

An insight result is a versioned, permission-scoped read model. It does not replace source handoff, follow-up, activity, territory, or future Dynamics records.

| Field | Purpose |
| --- | --- |
| `id` | Opaque generated result identifier |
| `scopeKey` | Server-resolved authorized manager scope |
| `filterDefinition` | Approved non-sensitive period, department, direction, and status filters |
| `metricKey` | Approved KPI, driver, guardrail, or exception definition |
| `definitionVersion` | Metric definition used to calculate the result |
| `numerator` | Eligible qualifying-record count when applicable |
| `denominator` | Eligible population count when applicable |
| `excludedCount` | Records excluded by the approved definition |
| `comparisonEligible` | Whether volume, routing, completeness, and definition checks permit comparison |
| `sourceVersions` | Territory Desk and future Dynamics source versions used |
| `sourceRefreshedAt` | Last successful refresh for each contributing source |
| `generatedAt` | Time the compatible result set was produced |
| `staleState` | Current, stale, partial, unavailable, or mismatched display state |

## Data source snapshot

| Field | Purpose |
| --- | --- |
| `id` | Opaque compatible status-snapshot identifier |
| `sourceType` | Territory, directory, workflow, notification, SMS, or future Dynamics category |
| `sourceVersion` | Stable version supplied by or assigned to the source |
| `status` | Available, attention-needed, stale, unavailable, or version-mismatch state |
| `affectedCapabilities` | Approved action categories affected by the current state |
| `sourceUpdatedAt` | Timestamp reported by the source, when provided |
| `importedAt` | Time Territory Desk loaded the source version |
| `validatedAt` | Time approved checks completed for the version |
| `lastVerifiedAt` | Time an authorized person or authoritative process explicitly verified it |
| `lastRefreshedAt` | Time the application last successfully retrieved it |
| `statusCheckedAt` | Time the displayed status checks were evaluated |
| `freshnessRuleVersion` | Configured source-specific freshness policy, when approved |
| `scopeKey` | Server-resolved visibility scope for the snapshot |

## Data-quality issue

| Field | Purpose |
| --- | --- |
| `id` | Opaque issue identifier and user tracking reference |
| `category` | Approved routing, identity, location, freshness, mismatch, processing, notification, or reconciliation category |
| `sourceType` | Source area affected by the report or detected condition |
| `sourceRecordId` | Optional opaque referenced source identifier |
| `sourceVersion` | Source version visible when the issue was reported or detected |
| `reporterId` | Authenticated reporting user, protected by permission rules |
| `detectedAt` | First system or user detection time |
| `lastConfirmedAt` | Most recent approved confirmation time |
| `description` | Minimum factual reporter description; no customer data |
| `affectedCapability` | Lookup, routing, directory, workflow, insight, notification, or Dynamics action affected |
| `status` | Submitted, acknowledged, under-review, resolved, or closed-no-change |
| `resolutionSummary` | Reporter-visible approved outcome summary |
| `resolvedAt` | Optional resolution or closure timestamp |
| `visibilityScope` | Server-enforced issue and aggregate visibility |
| `idempotencyReference` | Safe duplicate-report retry protection |
| `relatedIssueId` | Optional existing issue linked after confirmed duplicate review |

## User profile preference

Source-controlled identity and access fields remain on the authoritative representative, directory, and authentication records. This entity stores only approved user-editable defaults.

| Field | Purpose |
| --- | --- |
| `userId` | Authenticated owner of the preference record |
| `defaultReminderLeadTime` | At due time, 15 minutes, one hour, one day, or no extra reminder |
| `laptopLeadCardDensity` | Optional expanded or compact mode only when both are implemented |
| `recordVersion` | Concurrency token preventing silent cross-session overwrite |
| `idempotencyReference` | Safe retry protection for the latest preference command |
| `updatedAt` | Latest committed preference update time |

Role, scope, department, location, territory, work timezone, email, phone, SMS eligibility, and authentication method are explicitly excluded from this entity.

## Help topic

| Field | Purpose |
| --- | --- |
| `id` | Stable approved topic identifier |
| `slug` | Non-sensitive URL path segment |
| `title` | Task-oriented topic title |
| `summary` | Concise approved description |
| `audience` | Representative, manager, or all authenticated users |
| `keywords` | Approved search terms without customer or employee data |
| `contentVersion` | Published instruction version |
| `appVersionRange` | Product versions for which the topic is valid |
| `ownerId` | Approved content-owner identifier |
| `status` | Draft, approved, retired, or replaced |
| `lastReviewedAt` | Most recent approved content review time |
| `replacementTopicId` | Optional approved successor for a retired topic |

## Support or product-feedback request

| Field | Purpose |
| --- | --- |
| `id` | Opaque reporter tracking reference |
| `reporterId` | Authenticated request owner |
| `type` | Application problem or product suggestion |
| `category` | Approved problem or product-area category |
| `impact` | Blocked, limited, confusing, minor, or approved suggestion impact |
| `summary` | Short privacy-reviewed request summary |
| `description` | Optional bounded problem details or improvement idea |
| `contactPermission` | Whether the approved owner may contact the reporter |
| `safeDiagnosticContext` | Previewed app version, environment class, route template, time, device class, connectivity, and safe error class |
| `status` | Reporter-visible lifecycle status appropriate to the request type |
| `routingState` | Not configured, simulated, queued, routed, delayed, or failed |
| `idempotencyReference` | Safe duplicate-submission protection |
| `relatedRequestId` | Optional clarification, withdrawal, duplicate, or reopen relationship |
| `createdAt` | Committed submission timestamp |
| `updatedAt` | Latest reporter-visible update time |

Support requests are separate from lead Activity events and Data-quality issues.
