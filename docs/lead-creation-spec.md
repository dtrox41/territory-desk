# Lead Creation Specification

Status: Approved for Step 2.7

Route: `/leads/new`

## Objective

Lead Creation turns a cross-department opportunity into a structured, attributable, trackable handoff. It must be fast enough for a field representative, detailed enough for the recipient to act, and safe enough to prevent misrouting, duplicate submission, silent data loss, or exposure of customer information.

The form creates one handoff for one requested department and one accountable recipient. It does not send an untracked email or text as the lead record.

## Core decisions

1. One submitted handoff has one requested department and one recipient.
2. The authenticated sender is recorded automatically and cannot be impersonated through the form.
3. Customer ZIP and requested service are validated against the current territory assignment before submission.
4. The initial saved status is `pending_acceptance`.
5. The recipient's first meaningful response is due under the approved one-business-day rule.
6. The handoff is saved before in-app or SMS notification attempts begin.
7. Notification failure never deletes or duplicates the saved handoff.
8. Real lead drafts are not persisted in browser local storage on a personal phone.
9. Prototype records and contacts are fictional.
10. Direct Mail or Messages links are not used as the system of record.

## Entry paths

### From Territory Lookup

Prefill and lock to the selected assignment version:

1. Customer five-digit ZIP.
2. Canonical city and state.
3. Requested department or service display group.
4. Exact source division.
5. Location number.
6. Recipient stable identifier.
7. Territory assignment identifier and source version.

The user can change the ZIP, service, or recipient only by reopening routing validation. A change never leaves an apparently confirmed stale recipient in place.

### From Representative Directory

Prefill the representative identifier only. Require requested service and customer ZIP, then validate that the selected person is the current assignment. Follow the approved mismatch and routing-exception behavior.

### From global Send Lead

Begin with `Where should this lead go?` Require service and customer ZIP before recipient confirmation.

### From an existing handoff

After a successful submission, **Create Another Department Handoff** may copy approved company, location, and customer-contact fields into a new unsent form. It must require a different requested department, new territory validation, a new recipient, a new handoff ID, and explicit review before submission.

## Mobile form structure

Use four short steps rather than one long unstructured page:

1. **Route** — department, ZIP, assignment, recipient.
2. **Customer** — company, address, contact methods.
3. **Opportunity** — customer need, timing, context.
4. **Review & Send** — full confirmation and submission.

The step indicator uses text and position, such as `Step 2 of 4: Customer`. Users may move back without losing active-session data. They cannot skip a required incomplete step.

Do not make any form interaction suitable or encouraged while driving. The Help text states: `Complete lead details only when safely parked or using your company laptop.`

## Laptop form structure

Use the same four sections and validation rules. Laptop may present Route and Customer in adjacent columns and keep a concise review summary visible, but the final submission sequence remains identical.

## Step 1 — Route

### Required fields

1. Requested department or service display group.
2. Customer five-digit ZIP.
3. Current territory assignment.
4. Recipient stable identifier.

### Displayed routing evidence

1. Canonical city and state.
2. Exact source division.
3. Location number.
4. Recipient display name.
5. Assignment status.
6. Source updated date.
7. Last verified date only when separately available.

### Rules

1. The recipient must be active and authorized to receive app handoffs.
2. The assignment and directory data versions must be compatible.
3. Ambiguous or open territory cannot be auto-routed.
4. Representatives use **Request Routing Help** for an exception.
5. Authorized managers may select a recipient for that handoff with a required reason and audit event.
6. A sender cannot submit a handoff to themself.
7. Same-department handoffs may be allowed for approved specialty routing, but are labeled `Internal department handoff` and excluded from cross-department metrics.
8. Changing the department or ZIP clears the confirmed recipient until revalidated.

## Step 2 — Customer

### Required fields

1. Company or organization name.
2. City.
3. State.
4. Five-digit ZIP.
5. Contact-availability selection.

### Optional fields

1. Street address.
2. Customer contact name.
3. Customer phone.
4. Customer email.

### Contact-availability choices

1. `Phone available` — phone becomes required.
2. `Email available` — email becomes required.
3. `Phone and email available` — both become required.
4. `Contact information not yet available` — a short explanation becomes required.

This allows a legitimate early opportunity without encouraging fake contact details. The recipient can request information or decline with an approved reason.

### Validation

1. Company name: trim surrounding spaces; allow real business punctuation and Unicode; 2–120 characters.
2. Street address: optional; 2–160 characters when entered.
3. City: 2–100 characters; prefilled from routing but editable only through location revalidation when it conflicts.
4. State: approved two-letter value consistent with the selected ZIP when source data is available.
5. ZIP: exactly five digits after ZIP+4 normalization.
6. Contact name: optional; 2–100 characters when entered.
7. Phone: accept common punctuation and extensions; normalize server-side; do not reject merely because formatting differs.
8. Email: trim spaces, perform practical structure validation, preserve the original display value, and normalize the comparison value.
9. Never require a sender to invent missing customer information.

## Step 3 — Opportunity

### Required field

**What does the customer need?** — concise actionable summary, 10–1,000 characters.

Recommended prompt:

`Describe the service requested, what you learned, and the most useful next step for the receiving representative.`

### Customer timing

Required selection:

1. `As soon as possible`.
2. `Within 7 days`.
3. `Within 30 days`.
4. `More than 30 days`.
5. `Timing unknown`.

Selecting `As soon as possible` does not change the approved Action Required ranking. It requires a short reason so the recipient understands the customer context without allowing senders to game queue order.

### Optional fields

1. Customer-requested contact date and time.
2. Opportunity context, up to 1,000 characters.
3. Additional internal notes, up to 2,000 characters.

The customer-requested date describes customer timing; it does not replace the system-calculated first-response target or automatically become the recipient's accepted follow-up.

### Excluded initial fields

1. Unstructured `High`, `Medium`, or `Low` priority that affects ranking.
2. Revenue estimates used for prioritization or performance reporting.
3. Attachments, because storage, malware scanning, retention, and mobile privacy are not yet approved.
4. AI-generated sales notes or messages.
5. General call or visit planning.

If opportunity size is needed later, each department must first approve a meaningful unit and definition. A vague Small/Medium/Large field would create inconsistent data and misleading comparisons.

## Step 4 — Review & Send

Display a plain-language confirmation containing:

1. `Send to` recipient and department.
2. Exact division and location.
3. Customer company and location.
4. Contact name and available methods.
5. Customer need summary.
6. Customer timing and optional requested contact date.
7. Sender identity.
8. Response expectation: `The recipient will be asked to respond by the end of the next business day.`
9. Notification expectation: `Territory Desk will create an in-app alert and a simulated SMS event for this prototype.`

Actions:

1. Primary: **Send Lead**.
2. Secondary: **Back to Edit**.
3. Tertiary: **Save Draft**, only through the approved draft behavior.

The final button must not read merely `Submit` or `Continue`. Pressing Enter in an earlier field must not bypass Review & Send.

## Duplicate prevention

### Accidental duplicate submission

1. Generate one idempotency key when the unsent form begins.
2. Reuse the key for retries of the same submission.
3. Disable the final button after the first valid activation and show progress.
4. The server returns the existing successful handoff when the same key is retried.
5. Refreshing the confirmation page does not create another handoff.

### Possible existing lead

Before final submission, check authorized active handoffs using normalized company, ZIP, requested department, contact method, and a configurable recent time window.

If a possible match exists:

1. Show `A similar handoff may already exist.`
2. Allow **View Existing Lead** when authorized.
3. Allow **Continue New Handoff** only with a required reason.
4. Never expose another user's inaccessible customer record through duplicate matching.
5. Fuzzy similarity is a warning, not an automatic merge or rejection.

## Draft behavior

### Fictional prototype

1. Keep the draft in memory for the active browser session.
2. Clearing the session or signing out removes it.
3. Label all values fictional.

### Future production

1. Save drafts server-side only after authentication and security approval.
2. Autosave may occur after a valid field change, but it must show `Saving`, `Saved`, or `Could not save`.
3. Do not store real customer details in persistent browser local storage, URL parameters, analytics, or notification payloads.
4. A brief connection interruption keeps the active in-memory form visible.
5. Leaving a changed form requires **Stay and Continue**, **Save Draft**, or confirmed **Discard Draft**.
6. Drafts require an approved retention period and deletion policy before production.

## Submission transaction

The server-side sequence is:

1. Recheck authentication and sender identity.
2. Recheck authorization and recipient eligibility.
3. Revalidate the ZIP, requested service, territory assignment, and data versions.
4. Revalidate required fields and accepted value limits.
5. Check the idempotency key.
6. Create the handoff with status `pending_acceptance`.
7. Record sender, requested recipient, routing snapshot, and created timestamp.
8. Calculate and store the first-response target using the approved business-day rule.
9. Record immutable `handoff_created` and `pending_acceptance_started` activity events.
10. Commit the handoff and core audit events atomically.
11. Queue the in-app notification.
12. Queue the provider-neutral simulated SMS attempt.
13. Return the saved handoff and notification-status summary.

The customer handoff must exist before notification attempts. Notification work is retryable and cannot create another handoff.

## Notification content

### In-app notification

May include the minimum authorized context:

`New peer lead from [sender display name] in [department]. Review and respond by [target].`

The notification opens the authenticated handoff detail. It does not mark the handoff viewed until the detail is successfully opened by the recipient.

### SMS simulation and future real SMS

Use privacy-safe text:

`Territory Desk: You have a new peer lead from [sender first name or approved display]. Sign in to review it.`

Do not include customer name, contact information, address, opportunity notes, or a response link containing sensitive identifiers. A real SMS provider remains deferred until company approval and funding.

## Success confirmation

After the save succeeds, navigate to the new handoff detail and announce:

`Lead sent to [recipient]. Their response is requested by [exact date and local time].`

Show:

1. Handoff reference.
2. Recipient and department.
3. Status `Pending Acceptance`.
4. Exact response-target date, time, and timezone.
5. In-app notification state.
6. SMS state: simulated, queued, sent, failed, or unavailable.
7. **View Lead**.
8. **Create Another Department Handoff**.
9. **Return Home**.

Do not report `Lead sent` until the handoff itself is saved. If SMS fails, say `Lead saved; SMS alert could not be completed` and keep retry behavior separate.

## Failure behavior

### Validation failure

Keep all entered values, show a summary at the top, place an inline message at each invalid field, and focus the summary. Do not erase later steps.

### Routing changed before submission

Show the old and current routing context without exposing unauthorized data. Require the user to accept the current assignment or request routing help; do not silently send to either recipient.

### Authentication or authorization failure

Do not save or notify. Preserve only the active in-memory form when safe, direct the user to sign in or request access, and never reveal restricted recipient details.

### Connection interruption before save

Keep the active form visible, show `Not sent`, and allow retry with the same idempotency key. There is no offline production submission queue in the first release.

### Save succeeded but response was lost

Retry with the same idempotency key and return the already-created handoff.

### Notification failure

Keep the saved lead. Show the channel failure, queue an approved retry, and create an operational event. Do not ask the sender to submit the lead again.

## Privacy and security

1. Collect only information needed to route and act on the handoff.
2. Protect every form, draft, duplicate check, and confirmation route with authentication and authorization.
3. Use TLS in production and approved server-side storage.
4. Never place customer fields in URLs, page metadata, client error logs, or analytics.
5. Never commit real customer, lead, or employee-contact data to GitHub.
6. Never include credentials, provider secrets, or Dynamics tokens in the client.
7. Escape displayed text and validate again server-side.
8. Use approved retention, deletion, access-log, and incident policies before real data enters the system.
9. Sign Out clears active-session fictional drafts and cached sensitive views.
10. Customer data is never sent directly to the employee's personal SMS inbox through the app notification.

## Accessibility requirements

1. Every field has a persistent label, instructions, required indicator, and programmatic error association.
2. Required status does not rely on color or an asterisk alone.
3. Step changes move focus to the new step heading and announce progress.
4. Validation summary links to each invalid field.
5. Previously entered values survive validation.
6. Review values use real text, not disabled form controls that screen readers may skip.
7. Buttons meet the 44-by-44 CSS-pixel minimum target.
8. The form supports keyboard use, mobile screen readers, 200% text zoom, and autofill where safe.
9. Success and failure announcements do not rely on visual toast messages alone.
10. The on-screen keyboard type matches phone, email, ZIP, and date inputs.

## Required fictional prototype scenarios

1. Lead started from a confirmed Territory result.
2. Lead started from Directory with a matching assignment.
3. Lead started globally with no recipient selected.
4. Directory-selected recipient does not own the ZIP and service.
5. Ambiguous and open routing.
6. Customer with phone, email, both, and neither yet available.
7. ASAP timing with required reason.
8. Possible duplicate warning and authorized existing-lead link.
9. Double tap and network retry return one handoff.
10. Routing changes between form start and submission.
11. Save succeeds while simulated SMS fails.
12. Connection interruption before save.
13. Session draft recovery and discard confirmation.
14. Create Another Department Handoff with separately validated recipient.
15. Validation, accessibility, large text, and keyboard-only completion.

## Step 2.7 acceptance checklist

- [x] One recipient and one requested department per handoff are approved.
- [x] Entry paths and routing-prefill behavior are approved.
- [x] The four-step mobile form is approved.
- [x] Required and optional customer fields are approved.
- [x] Missing customer contacts use an explicit explanation rather than fabricated data.
- [x] Customer timing does not change Action Required ranking.
- [x] Vague priority, unverified revenue sizing, attachments, and AI notes remain excluded.
- [x] Review & Send is required before final submission.
- [x] Duplicate warnings and idempotent submission are approved.
- [x] Real production drafts remain server-side and out of persistent browser storage.
- [x] The handoff saves before notification attempts.
- [x] In-app and SMS content follow the approved privacy boundary.
- [x] Routing, connection, authentication, save, and notification failures have safe recovery.
- [x] Create Another Department Handoff creates a distinct reviewed record.
- [x] Only fictional lead data is used in the prototype.
