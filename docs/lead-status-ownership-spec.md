# Lead Status and Ownership Specification

Status: Approved for Step 2.8

## Objective

Define an explainable handoff lifecycle in which exactly one person is accountable at a time, every required action has an owner, senders receive feedback, managers can resolve exceptions without erasing history, and workflow signals never masquerade as sales outcomes.

## Separate state dimensions

The application must store and display these dimensions separately:

1. **Handoff status** — the business stage of the peer handoff.
2. **Current owner** — the person accountable for the handoff record.
3. **Required-action owner** — the person who must act next.
4. **Attention state** — up to date, action required, waiting, or needs attention.
5. **Response-target state** — pending, completed on time, completed late, or missed.
6. **View state** — whether the authenticated recipient opened the handoff.
7. **Notification state** — unread, read, queued, simulated, sent, delivered, failed, or unavailable by channel.
8. **Outcome source** — Territory Desk prototype state or future verified Dynamics source.

Changing one dimension does not silently change another. For example, SMS delivery does not mark a handoff viewed, viewing does not satisfy the response target, and reassignment does not erase earlier response history.

## Handoff statuses

### Open statuses

1. `pending_acceptance` — saved and awaiting Accept, Need Information, or Decline.
2. `needs_information` — recipient asked a specific question and the sender owes information.
3. `accepted` — recipient accepted ownership; work may not yet have started.
4. `in_progress` — the owner recorded active progress or completed a next action.
5. `appointment_set` — a lead-derived customer appointment is recorded; this is not a final outcome.

### Closed statuses

1. `declined` — requested recipient declined before accepting, with a reason.
2. `won` — verified favorable final outcome, subject to future Dynamics mapping.
3. `lost` — verified unfavorable final outcome with reason.
4. `closed_not_qualified` — closed with an approved non-qualified reason.
5. `withdrawn` — sender withdrew the handoff before acceptance, with reason.

`new`, `sent`, `viewed`, `contacted`, `proposal`, `overdue`, and `reassigned` are not first-release handoff statuses:

1. New and viewed belong to view or notification state.
2. Sent belongs to the creation activity history.
3. Overdue belongs to attention and response-target state.
4. Reassigned is an ownership event.
5. Contacted and proposal may be captured as structured progress activities until departments and Dynamics mapping approve shared stage definitions.

This prevents different departments from interpreting the same status differently.

## Initial ownership

When a handoff is created:

1. `senderId` is the authenticated creator and is immutable.
2. `requestedRecipientId` identifies the person asked to respond.
3. `currentOwnerId` remains the sender until acceptance.
4. `requiredActionOwnerId` is the requested recipient.
5. Status is `pending_acceptance`.
6. The system calculates the first-response target.
7. The recipient receives in-app and simulated-SMS notification attempts.

This distinguishes record responsibility from the recipient's obligation to respond.

## First meaningful response

Only these recipient actions satisfy the first-response target:

1. **Accept**.
2. **Need Information** with a required specific question.
3. **Decline** with a required reason.

Viewing, acknowledging a notification, adding an unrelated note, calling outside the app, or receiving an SMS does not satisfy the target.

The response event stores whether it occurred on time or late. A late response remains valid and does not disappear from history.

## Accept

When the requested recipient accepts:

1. Status becomes `accepted`.
2. `currentOwnerId` transfers from sender to recipient.
3. `requiredActionOwnerId` becomes the recipient until a structured next action is assigned.
4. The response target is completed on time or late.
5. The sender receives an in-app feedback event.
6. The acceptance screen requests a structured next action and due date.
7. If the recipient chooses **Add Later**, the accepted handoff creates the approved `Next action missing` item.
8. The ownership transfer and acceptance are one atomic transaction.

Acceptance cannot occur if recipient eligibility or assignment authorization was revoked. The app then shows the changed routing and offers routing help.

## Need Information

When the recipient needs information:

1. A specific question or explanation is required.
2. Status becomes `needs_information`.
3. `currentOwnerId` remains the sender because acceptance has not occurred.
4. `requiredActionOwnerId` becomes the sender.
5. The recipient's first-response target is satisfied.
6. The sender receives an Action Required item and in-app notification.

When the sender supplies information:

1. The reply is recorded as an immutable activity.
2. Status returns to `pending_acceptance`.
3. `requiredActionOwnerId` returns to the requested recipient.
4. The original first-response result remains completed and is not reset.
5. A separate information-review target is due by the end of the next business day.
6. The recipient sees `Information received` in Action Required.
7. Missing the information-review target changes the label to `Information review overdue` but does not rewrite the first-response KPI.

If the sender cannot answer, the sender may provide that explanation, withdraw before acceptance, or request routing help. The action cannot be dismissed without a recorded resolution.

## Decline

Decline is available to the requested recipient before acceptance and requires one approved reason:

1. Wrong territory.
2. Wrong department or service.
3. Insufficient information.
4. Duplicate handoff.
5. Service not offered or customer not eligible.
6. Other, with explanation.

Rules:

1. Status becomes `declined`.
2. `currentOwnerId` remains or returns to the sender.
3. `requiredActionOwnerId` clears because decline is terminal; the sender may voluntarily create a revised handoff.
4. The first-response target is satisfied on time or late.
5. The sender receives the reason and next options.
6. `No capacity` is not a normal decline reason; use manager-assisted reassignment so a valid lead does not disappear.
7. Decline counts as a meaningful response but never as qualified progression.

The sender may correct the information and choose **Create Revised Handoff**. This creates a linked new record with new routing validation and a new response target; it does not reopen or overwrite the declined history.

## Withdraw

The sender may withdraw only while status is `pending_acceptance` or `needs_information` and before acceptance.

Required reasons:

1. Entered by mistake.
2. Confirmed duplicate.
3. Customer no longer interested.
4. Incorrect customer or opportunity information.
5. Other, with explanation.

Withdrawal:

1. Sets status `withdrawn`.
2. Clears the current required action.
3. Notifies the requested recipient in-app.
4. Preserves all prior creation, delivery, view, response, and information-request events.
5. Cannot be used after acceptance; the current owner or authorized manager must record the proper later outcome.

## Progress after acceptance

### Accepted to in progress

Status becomes `in_progress` when the owner records an approved material progress event or completes the first structured next action. A general note alone does not automatically change status.

Examples of progress activities:

1. Customer contacted.
2. Discovery completed.
3. Proposal or quote activity recorded.
4. Internal coordination completed.
5. Another approved department-specific activity.

The activity type is stored separately so future Dynamics mapping can distinguish stages.

### Appointment set

`appointment_set` requires:

1. Appointment date and time.
2. Timezone.
3. Approved appointment type.
4. Next action after the appointment or an explicit plan to add it later.

Appointment set is an intermediate milestone. It may return to `in_progress` if the appointment is canceled or completed without a final outcome. The reversal requires a reason and preserves the appointment history.

### Final outcomes

`won`, `lost`, and `closed_not_qualified` require:

1. Outcome timestamp.
2. Approved reason or result category.
3. Concise outcome summary.
4. Source label: Territory Desk demo or future Dynamics.
5. Dynamics record identifier only after approved mapping.

Final outcomes clear ordinary next actions, notify the sender in-app, and appear in Recent Feedback and Outcomes. They remain provisional in the prototype and cannot be represented as official business results.

## Allowed transition table

| Current status | Allowed next status | Authorized actor | Required information |
| --- | --- | --- | --- |
| `pending_acceptance` | `needs_information` | Requested recipient | Specific question |
| `pending_acceptance` | `accepted` | Requested recipient | Acceptance; next action requested |
| `pending_acceptance` | `declined` | Requested recipient | Decline reason |
| `pending_acceptance` | `withdrawn` | Sender | Withdrawal reason |
| `needs_information` | `pending_acceptance` | Sender | Information response |
| `needs_information` | `declined` | Requested recipient | Decline reason |
| `needs_information` | `withdrawn` | Sender | Withdrawal reason |
| `accepted` | `in_progress` | Current owner | Material progress or completed action |
| `accepted` | `appointment_set` | Current owner | Appointment details |
| `accepted` | final outcome | Current owner or authorized manager | Structured outcome |
| `in_progress` | `appointment_set` | Current owner | Appointment details |
| `in_progress` | final outcome | Current owner or authorized manager | Structured outcome |
| `appointment_set` | `in_progress` | Current owner | Reversal or completed-appointment reason |
| `appointment_set` | final outcome | Current owner or authorized manager | Structured outcome |
| final outcome | approved open status | Authorized manager or approved data owner | Reopen/correction reason |

Any transition not listed is rejected server-side. A corrected or reopened final outcome preserves the original terminal event and adds a new versioned transition.

## Ownership rules

1. A handoff always has exactly one `currentOwnerId` while retained by the system.
2. Ownership cannot be a department name, shared inbox, or blank value unless a future queue-owner model is explicitly approved.
3. Before acceptance, the sender owns the record and the requested recipient owns the response action.
4. Acceptance transfers record ownership to the recipient.
5. After acceptance, the sender remains an authorized collaborator and feedback recipient but cannot edit the owner's next action or outcome.
6. The current owner can update progress, next actions, appointments, and outcomes within permission.
7. Ownership changes never alter the immutable original sender.
8. Contact-data changes never change ownership by themselves.
9. No transition may assign ownership to an inactive or unauthorized identity.

## Manager reassignment

Only an authorized manager within scope may reassign, and a reason is always required.

Record:

1. Prior owner or requested recipient.
2. New owner or requested recipient.
3. Manager identity.
4. Reason category and explanation.
5. Timestamp.
6. Status and next-action snapshot.
7. Territory and directory data versions.

### Reassignment before acceptance

1. `currentOwnerId` remains the sender.
2. `requestedRecipientId` changes to the new recipient.
3. `requiredActionOwnerId` becomes the new recipient.
4. Prior recipient response history and target result are preserved.
5. A new recipient-specific response target begins at reassignment time.
6. The new recipient receives in-app and simulated-SMS notification attempts.
7. The prior recipient receives an in-app reassignment notice.

The new recipient is never measured against time before assignment.

### Reassignment after acceptance

1. `currentOwnerId` transfers immediately to the new owner so the handoff is never ownerless.
2. Status and structured next action remain intact.
3. `requiredActionOwnerId` becomes the new owner.
4. The new owner receives a required reassignment acknowledgment.
5. Earlier first-response history is preserved and no new first-response KPI is created.
6. The new owner receives in-app and simulated-SMS notification attempts.
7. The prior owner and sender receive in-app notices.
8. Existing next-action due dates remain visible. A manager may reschedule during reassignment only with a reason, and time missed before reassignment is not attributed to the new owner.

If the new owner disputes the reassignment, they request manager review; they cannot discard or anonymously return the handoff.

## Role permissions

### Sender

May:

1. View their sent handoff and permitted feedback.
2. Supply requested information.
3. Withdraw before acceptance.
4. Add relevant information after acceptance without changing recipient-owned fields.
5. Create a revised or another-department handoff.

May not:

1. Accept or decline on behalf of the recipient.
2. Edit recipient progress or outcomes.
3. Reassign ownership.
4. Delete history.

### Requested recipient or current owner

May:

1. Accept, request information, or decline before acceptance.
2. Manage structured next actions after acceptance.
3. Record progress, appointment, and outcome events.
4. Request correction of an accidental event through the auditable correction workflow.

May not:

1. Change original sender or routing snapshot.
2. Delete history.
3. Reassign without manager authorization.

### Manager

May within approved scope:

1. View stalled handoffs and routing exceptions.
2. Reassign with reason.
3. Correct or reopen a status with reason.
4. Resolve an individual routing exception.

Manager authority does not grant unrestricted organization-wide access or direct editing of source identity and territory records.

### System

May:

1. Calculate targets and attention states.
2. Create auditable notification and required-action events.
3. Execute idempotent retries.
4. Apply approved Dynamics reconciliation later.

The system may not invent missing ownership, reasons, outcomes, or user actions.

## Attention-state derivation

Attention state is calculated, not manually selected:

1. `action_required` — the current user owes the highest-ranked action.
2. `waiting` — another identified user owes the next action.
3. `needs_attention` — an approved target or required action is overdue, or a routing/data exception blocks progress.
4. `up_to_date` — open handoff has a valid future next action and no current exception.
5. `closed` — terminal status with no unresolved correction action.

A handoff may produce different attention states for different users. The same handoff can be waiting for the sender while action is required for the recipient.

## Notifications and feedback

Recommended default channels:

1. New assignment or reassignment: in-app plus simulated SMS.
2. Accept, Need Information, Decline, information supplied, appointment, and final outcome: in-app.
3. SMS for later updates remains an approved future user preference; avoid notification fatigue in the initial prototype.

Every sender-facing response or outcome links to the handoff timeline. Notification delivery never proves that a user viewed or completed the underlying action.

## Concurrency and idempotency

1. Every handoff has a version number or equivalent concurrency token.
2. Status and ownership commands include the version the user reviewed.
3. If another user changed the record, reject the stale command and show the current state.
4. Each command uses an idempotency key so retries return the same transition result.
5. Accept and manager reassignment cannot both win silently; one commits and the other must re-review.
6. A double-tap on Accept, Decline, or a final outcome creates one event.
7. Server authorization and transition validation are authoritative; disabled client buttons are not security controls.

## Audit event requirements

Every material transition records:

1. Event identifier.
2. Handoff identifier.
3. Actor identifier and role.
4. Previous and new status.
5. Previous and new current owner.
6. Previous and new required-action owner.
7. Reason code and approved explanation when required.
8. Occurred-at server timestamp.
9. User-local display timezone.
10. Data and rule-definition versions.
11. Command idempotency key or correlation reference.
12. Source: authenticated user, system calculation, manager action, or future Dynamics reconciliation.

Audit events are append-only. Corrections add events; they do not rewrite or delete prior events.

## Dynamics boundary

1. Territory Desk owns peer-handoff collaboration state in the prototype.
2. Dynamics 365 remains the future source of truth for business records already maintained there.
3. `won`, `lost`, appointment, contacted, and proposal mappings are not production-authoritative until the exact Dynamics app, entities, fields, permissions, and reconciliation rules are approved.
4. Future mapped values show source and last-sync time.
5. A source conflict displays `Needs reconciliation`; the application does not silently choose the most favorable outcome.
6. Territory Desk collaboration history remains immutable even when a linked Dynamics business outcome changes.

## Deletion and correction

1. Ordinary users cannot hard-delete a handoff.
2. Mistaken pre-acceptance submissions use Withdraw with reason.
3. Duplicate or invalid accepted records use an approved terminal outcome and reason.
4. Privacy deletion or legal-retention requests require a future approved administrative process that preserves the minimum required audit evidence.
5. A visible correction identifies what changed without exposing restricted prior values to unauthorized viewers.

## Required fictional prototype scenarios

1. Pending handoff accepted on time and late.
2. Need Information, sender reply, and information-review response.
3. Decline for each reason family.
4. Sender withdrawal before acceptance and blocked withdrawal afterward.
5. Accepted with next action and accepted using Add Later.
6. In-progress activity and appointment set.
7. Appointment canceled back to in progress.
8. Won, lost, and closed-not-qualified outcomes.
9. Manager reopen with reason.
10. Reassignment before and after acceptance.
11. New owner acknowledgment and disputed reassignment review.
12. Inactive or unauthorized reassignment target.
13. Stale simultaneous Accept and Reassign commands.
14. Double-tap and lost-response idempotent retry.
15. Dynamics conflict and unavailable outcome source.
16. Sender, recipient, manager, and unauthorized-user permission checks.

## Step 2.8 acceptance checklist

- [x] Status, ownership, required action, attention, response, view, notification, and outcome-source states remain separate.
- [x] Open and closed status vocabulary is approved.
- [x] Sender ownership before acceptance and recipient ownership after acceptance are approved.
- [x] Accept, Need Information, Decline, and Withdraw rules are approved.
- [x] Information review receives a separate target without rewriting first-response results.
- [x] Post-acceptance progress, appointment, and final-outcome requirements are approved.
- [x] Only listed transitions are allowed.
- [x] Reassignment before and after acceptance preserves history and never leaves the handoff ownerless.
- [x] Sender, recipient, owner, manager, and system permissions are approved.
- [x] Attention state is derived rather than manually selected.
- [x] Update notifications favor in-app feedback while new assignments use in-app and simulated SMS.
- [x] Concurrency, idempotency, audit, correction, and deletion rules are approved.
- [x] Dynamics outcome states remain gated behind verified mapping.
- [x] Prototype scenarios cover success, failure, conflict, and permission cases.
