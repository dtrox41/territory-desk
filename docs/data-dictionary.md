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
| `recipientId` | Requested receiving representative |
| `recipientDepartment` | Receiving department at submission time |
| `currentOwnerId` | Current accountable representative |
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

## Activity event

| Field | Purpose |
| --- | --- |
| `id` | Unique immutable event identifier |
| `handoffId` | Related lead handoff |
| `actorId` | User or service that created the event |
| `type` | Sent, delivered, viewed, response, status, follow-up, note, or outcome |
| `summary` | Human-readable event description |
| `occurredAt` | Event timestamp |
| `metadata` | Approved structured event details |

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
