# Outlook, Email, and Calendar Architecture

Status: Approved for Step 3.4

Decision scope: Select the first-release Outlook, email, calendar, and notification-channel behavior for Territory Desk without creating a second collaboration workflow, exposing customer information on a personal smartphone, or depending on an unapproved Microsoft tenant integration.

This step does not select or connect a real SMS provider, email provider, Microsoft tenant, Power Automate environment, or production host. It defines the contract that later adapters must follow.

## Recommendation

Use three deliberately different mechanisms:

1. **Territory Desk in-app notifications and lead activity are authoritative.** Viewing, accepting, requesting information, supplying information, declining, assigning a follow-up, sharing progress, and recording an outcome occur only through authenticated Territory Desk commands.
2. **SMS is the attention signal for a new or reassigned peer handoff.** The fictional prototype simulates it. A real company-approved provider remains required before production SMS can be claimed.
3. **A user-initiated, privacy-safe `.ics` file is the first-release Outlook or device-calendar option for a saved follow-up.** It is optional, off by default, and is a snapshot rather than synchronization.

Do not send an automatic email for every workflow event in the first release. Repeating the same event across in-app, SMS, and email would increase alert fatigue, spread private context into more systems, and make it unclear where the employee must respond.

Direct Outlook calendar creation and automated email through Microsoft Graph are deferred until Cintas supplies an approved Microsoft Entra application registration, permissions, security owner, tenant owner, production host, and operating policy. An approved existing Power Automate flow may later implement the same adapter contract, but its licensing and company ownership cannot be assumed.

## Why this is the strongest first-release design

1. It keeps feedback inside the shared system, where both departments can see the same status, owner, next action, and history.
2. It preserves the accepted requirement for an in-app plus SMS alert on new peer handoffs.
3. It supports an Outlook reminder without requiring Microsoft Graph, an Azure resource, a browser-held Microsoft token, or company tenant access.
4. It limits customer information copied to a personally owned smartphone calendar or lock-screen notification.
5. It prevents email replies and calendar edits from becoming untracked shadow records.
6. It can later add Graph, Power Automate, or a real SMS provider behind the same server-side outbox without changing the core lead workflow.

## Option pressure test

| Option | Value | Main risk or dependency | Decision |
| --- | --- | --- | --- |
| Microsoft Graph now | Can create Outlook events and send work email directly | Requires Microsoft Entra app registration, approved permissions and consent, token handling, revocation, tenant ownership, and a protected backend | Defer |
| Power Automate now | May use an existing company Microsoft 365 pathway | Requires confirmed licensing, approved connectors, environment ownership, service account policy, monitoring, and support | Defer unless Cintas provides an approved existing capability |
| Privacy-safe `.ics` plus authoritative in-app workflow | Works with Outlook and many device calendars with no Microsoft API call | Snapshot can become outdated and import cannot be verified | Select for first release |
| Automatic email for every app event | Adds another visible alert | High duplication, privacy spread, reply fragmentation, and unclear source of truth | Reject for first release |
| Browser-only claims of email, SMS, or calendar delivery | Easy to demonstrate | Opening an external application does not prove send, delivery, import, view, or response | Reject |
| Store handoffs in email or calendar instead of the database | Familiar tools | No reliable lifecycle, ownership, idempotency, authorization, or shared audit trail | Reject |

## Channel responsibility matrix

| Business event | In-app | SMS | Email | Calendar |
| --- | --- | --- | --- | --- |
| New handoff assigned | Required unread alert and lead activity | Required path; simulated in prototype | Off by default | None |
| Handoff reassigned | Required alert to affected authorized users | Required path for the new assignee; simulated in prototype | Off by default | None |
| Lead opened by recipient | Record authenticated first view once; notify sender only through approved feedback behavior | None | None | None |
| Accept | Required sender-visible feedback | None by default | None by default | Offer follow-up export only after a follow-up is saved |
| Need Information | Required sender action and recipient-visible history | None by default | None by default | None |
| Information supplied | Required recipient action and sender-visible history | None by default | None by default | None |
| Decline | Required sender feedback with authorized reason | None by default | None by default | None |
| Material progress or outcome | Required participant-visible activity and notification | None by default | None by default | None |
| Follow-up reminder | Required app reminder and Action Required behavior | None by default | None by default | Optional user-initiated `.ics` snapshot |
| Routing or data issue | In-app or Data Status notice | None | None | None |
| Channel delivery problem | Safe in-app state when user action is possible; operational logging otherwise | No recursive SMS | No automatic fallback | No automatic fallback |

Adding more automatic channels later requires measured evidence that the current channel mix misses important handoffs. It is not justified merely because another channel is technically available.

## Authoritative workflow boundary

The following actions never occur through email, SMS, a calendar event, or a link preview:

1. Accept or decline a handoff.
2. Request or supply information.
3. Change ownership or recipient.
4. Complete, cancel, or reschedule the authoritative follow-up.
5. Record appointment, progress, win, loss, or qualification outcome.
6. Satisfy the one-business-day meaningful-response target.
7. Mark the lead as viewed.

Every external message or calendar entry may contain a link to the lead. The user must authenticate, remain authorized, load the current record version, and explicitly complete the action in Territory Desk.

## Committed-event and outbox flow

```text
Authenticated business command
          |
          v
Commit handoff/follow-up + activity + in-app notification + outbox work
          |
          v
Return the saved Territory Desk result to the user
          |
          v
Asynchronous channel worker or explicit calendar-export request
          |
          v
Record a privacy-safe attempt/result without changing the business result
```

Rules:

1. The database transaction succeeds before any external notification attempt begins.
2. One business command creates at most one outbox item per recipient, purpose, and channel.
3. The outbox item references the saved Territory Desk record by opaque ID and command correlation.
4. An external failure never deletes, rolls back, duplicates, or silently resubmits the handoff.
5. Retries use the original idempotency and correlation data.
6. Retryable, permanent, configuration, permission, throttling, and unknown results remain distinct.
7. A user sees a channel failure only when it changes a useful decision or requires user action.
8. Operational records exclude message bodies, customer details, credentials, tokens, and raw provider payloads.

## Delivery, view, and response vocabulary

These states are not interchangeable:

| State | What it proves | What it does not prove |
| --- | --- | --- |
| `queued` | Territory Desk recorded pending channel work | Provider accepted or delivered it |
| `attempted` | A channel adapter made an attempt | Provider accepted it |
| `accepted_by_provider` | Provider accepted responsibility for further processing | Recipient delivery, reading, or action |
| `delivered` | Provider supplied approved delivery evidence | Identity-authenticated app viewing or response |
| `failed` | Attempt has a classified failure | The underlying handoff failed |
| `unknown` | Final external result is not safely known | Success or failure |
| `in_app_read` | User read the in-app notification | Lead was successfully loaded or viewed |
| `lead_viewed` | Authorized recipient loaded the lead in Territory Desk | Meaningful response |
| `responded` | Recipient performed Accept, Need Information, or Decline | Follow-up completion or final outcome |
| `calendar_generated` | Territory Desk generated an `.ics` representation | Browser downloaded it |
| `calendar_download_started` | Browser began handling the file | Calendar imported, reminded, updated, or completed it |
| `email_draft_opened` | A draft action invoked the user's mail application | User sent or recipient received the email |

Microsoft Graph `sendMail` returns `202 Accepted`, which specifically does not prove that processing or delivery completed. Territory Desk must therefore never label a Graph acceptance as `Delivered`.

## SMS contract retained from prior decisions

1. New assignments and reassignments require an in-app alert plus the Territory Desk SMS path.
2. Prototype delivery is visibly labeled `Simulated` and uses fictional destinations only.
3. Production SMS remains disabled until a company-approved provider, sender identity, funding or existing enterprise capability, consent policy, opt-out handling, support owner, and retention policy are confirmed.
4. Lock-screen-visible SMS content is limited to a generic alert such as:

   `Territory Desk: You have a new peer lead from another sales department. Sign in to review.`

5. SMS excludes company name, customer name, contact details, address, service need, notes, value, outcome, and access tokens.
6. SMS delivery never marks the app notification read, the lead viewed, or the handoff responded.
7. Follow-up reminders do not send SMS by default.

The real SMS provider and its cost are a future provider-selection decision, not part of Step 3.4.

## First-release Outlook and calendar contract

### User workflow

1. The user saves an accepted-lead follow-up in Territory Desk.
2. Territory Desk confirms the authoritative follow-up is saved.
3. The confirmation screen offers **Add Privacy-Safe Calendar Reminder (.ics)** as a secondary action.
4. Before the first export on a personal smartphone, explain that the calendar copy is outside Territory Desk, may remain after sign-out, and may not update automatically.
5. The user confirms use of an approved calendar.
6. Territory Desk generates the file from the committed follow-up version.
7. The operating system or browser offers the file to Outlook or another calendar application.
8. Territory Desk records only `calendar_generated` and, when observable, `calendar_download_started`.
9. The user returns to Territory Desk for the authoritative current action and result.

No calendar permission is requested at sign-in or for `.ics` export.

### `.ics` content contract

Generate one standards-based `VEVENT` containing:

1. `PRODID` and `VERSION:2.0` on the calendar object.
2. A stable, opaque, globally unique `UID` for that follow-up.
3. `DTSTAMP` for the export creation time.
4. `DTSTART` and `DTEND` in UTC, calculated from the saved owner timezone and due time.
5. A bounded duration configured for a reminder block; it does not alter the authoritative due time.
6. `SEQUENCE` derived from the saved follow-up version and increased for a rescheduled export.
7. `SUMMARY:Territory Desk follow-up`.
8. A privacy-safe `DESCRIPTION` telling the user to open Territory Desk for details.
9. An authenticated HTTPS `URL` containing an opaque record ID and no token or customer data.
10. `TRANSP:TRANSPARENT` so a generic follow-up reminder does not falsely claim a customer appointment or block availability.
11. An optional display `VALARM` corresponding to the user's selected reminder lead time when supported.

Use correct escaping, CRLF line endings, UTF-8 encoding, and RFC line folding. A generated event contains no attendees and sends no invitations.

### Excluded calendar content

Do not place these values in the title, description, location, URL query, attachment, attendee list, or alarm text:

1. Customer or company name.
2. Customer contact name, phone, or email.
3. Street address.
4. Opportunity need, notes, value, or outcome.
5. Employee personal phone or email.
6. Credentials, access tokens, signed bearer links, or session identifiers.

### Reschedule, cancel, and stale-copy behavior

1. Territory Desk remains authoritative after export.
2. Rescheduling offers a newly generated file with the same `UID` and higher `SEQUENCE`.
3. Show: `Your calendar copy may be outdated. Download an updated reminder if needed.`
4. Do not claim that every calendar client will update the old event; some may create a duplicate.
5. Canceling a Territory Desk follow-up does not prove the external calendar copy was removed.
6. The app may remind the user to remove or update the external copy, but it cannot silently claim completion.
7. A calendar edit never changes Territory Desk in the first release.

### Calendar export state model

Persist an append-only privacy-safe export event only when product analytics or audit policy requires it:

1. Follow-up opaque ID.
2. Authenticated actor ID.
3. Follow-up record version.
4. Export event type.
5. Server timestamp.
6. Environment and safe correlation ID.

Do not persist the generated file, calendar account, target application, or calendar contents merely to count exports.

## Email contract

### First release

1. Do not automatically email every handoff, response, reminder, or outcome.
2. Do not accept replies as lead feedback.
3. Do not parse employee mailboxes.
4. Do not store email bodies, reply threads, or attachments.
5. Do not use personal email destinations.
6. Keep the app's existing direct work-email contact action separate from tracked peer-handoff collaboration.

If a user-initiated **Open Work Email Draft** action is retained for a fictional prototype or later approved support case:

1. Use only an approved work address.
2. Use a generic subject such as `Territory Desk follow-up`.
3. Include only a privacy-safe instruction and authenticated opaque link.
4. Label the result `Draft opened`, never `Sent`.
5. Do not count it in handoff, response, follow-up, or outcome KPIs.

This draft action is not required for the first release and must not compete with the in-app response controls.

### Future automated Microsoft Graph email

If Cintas later approves automated email:

1. Register a single-tenant application in the Cintas Microsoft Entra tenant through the company process.
2. Select delegated or application access based on the approved sender model.
3. Request the least-privileged `Mail.Send` permission required by the approved design.
4. Store certificates, federated credentials, or secrets only in approved server-side secret management; never in the browser or repository.
5. Restrict senders, recipients, templates, and environments through server configuration.
6. Send only from committed outbox records.
7. Store safe provider identifiers and result classes, not complete message content.
8. Treat Graph `202 Accepted` as provider acceptance, not delivery.
9. Define bounce, throttling, revocation, disabled-mailbox, service-account, support, retention, and incident behavior before production.

## Future direct Outlook calendar integration

Microsoft Graph can create an event in a user calendar with `Calendars.ReadWrite`. That capability is not free of governance simply because the API exists.

Before enabling it, Cintas must approve:

1. The Microsoft Entra application owner and single-tenant registration.
2. Delegated versus application permission mode.
3. Exact user and calendar scope.
4. Consent and administrator-approval requirements.
5. Production credential type, rotation, revocation, and incident response.
6. Event create, update, cancel, duplicate, conflict, timezone, attendee, and organizer rules.
7. Whether Territory Desk may write only its own events and how those events are identified.
8. Data classification for event subject, body, location, attendees, and links.
9. Audit, support, throttling, retry, and service-limit handling.
10. Offboarding and removal of orphaned events.

The Graph adapter runs server-side. No Microsoft Graph access token, client secret, certificate, or calendar-write capability is placed in the React bundle, browser storage, GitHub Pages, or public repository.

## No-Azure clarification

The selected first-release `.ics` approach creates no new Azure subscription, Azure resource, paid token service, Azure Communication Services resource, or Microsoft Graph connection.

Microsoft Graph itself is accessed through Microsoft identity and requires a Microsoft Entra application registration and permissions. App registration is not the same as provisioning an Azure-hosted workload, but it is still a company-controlled tenant and security dependency. Because the user has explicitly excluded an Azure-dependent build and no tenant approval exists, direct Graph automation remains deferred.

## Personal-smartphone safeguards

1. Calendar export is optional and off by default.
2. Warn that an exported event leaves Territory Desk and may remain in personal backups, calendar synchronization, notifications, and device history.
3. Export no customer-identifying information.
4. Do not request contacts, calendar, location, camera, microphone, or notification permissions merely to create the file.
5. Deep links require fresh authentication and authorization.
6. Sign-out clears app-held protected state but cannot erase an external calendar copy.
7. Do not show detailed customer information in lock-screen notifications.
8. Do not encourage reading, responding, or changing a lead while driving.

## Failure and recovery behavior

| Failure | User-facing result | System behavior |
| --- | --- | --- |
| Handoff commit fails | `Lead not sent` | No in-app or external notification is attempted |
| Handoff succeeds; simulated SMS fails | `Lead saved; text alert could not be confirmed` when useful | Keep lead and in-app notification; allow controlled retry |
| Handoff result is unknown after connection loss | `We could not confirm the result` | Look up by idempotency key before allowing another submission |
| `.ics` generation fails | `Follow-up saved; calendar reminder was not created` | Keep follow-up; allow export retry |
| Browser does not hand off `.ics` | Explain manual download/open option | Never claim import |
| Follow-up changes after export | Stale-copy warning | Offer updated file with same UID and higher sequence |
| Future Graph permission revoked | `Outlook connection unavailable` | Disable adapter, preserve app workflow, surface safe Data Status |
| Future provider throttles | No duplicate user submission | Retry through outbox using approved backoff and provider guidance |
| Deep link opens expired session | Safe sign-in then authorized return | Never expose record context before authorization |

## Measurement and alert-governance rules

Measure:

1. In-app notification creation success.
2. Simulated or future SMS attempt and approved delivery evidence separately.
3. Authenticated lead view.
4. Meaningful response within one business day.
5. Follow-up creation, due, completion, reschedule, and outcome.
6. Calendar export generation and retry rate only when useful.

Do not measure or claim:

1. Email open through tracking pixels.
2. Calendar import, reminder display, or calendar-event completion without a direct approved integration.
3. SMS delivery as lead view.
4. Calendar or email activity as a meaningful response.
5. Raw message count as collaboration quality.

## Step 3.4 acceptance checklist

- [x] In-app workflow and activity remain authoritative for collaboration.
- [x] New and reassigned handoffs retain the required in-app plus SMS path, with SMS simulated in the prototype.
- [x] Automatic email for every workflow event is rejected from the first release.
- [x] User-initiated privacy-safe `.ics` export is selected for the first-release Outlook/calendar path.
- [x] Calendar export occurs only after the authoritative follow-up is saved.
- [x] `.ics` content, stable UID, sequence, UTC time, privacy, and stale-copy rules are approved.
- [x] Calendar generation or download never claims import, reminder display, synchronization, or completion.
- [x] Email draft opening, provider acceptance, delivery, in-app reading, lead viewing, and meaningful response remain separate states.
- [x] External notification failure never rolls back or duplicates a committed handoff.
- [x] Customer and opportunity details are excluded from SMS, email preview, calendar content, URLs, logs, and lock-screen-visible text.
- [x] Direct links use opaque IDs and recheck authentication and authorization.
- [x] Microsoft Graph and Power Automate are deferred until company tenant, permission, licensing, security, hosting, and support requirements are approved.
- [x] No Microsoft or provider credential is stored in the browser, repository, GitHub Pages, or fictional prototype.
- [x] Personal-smartphone export warnings and external-copy limitations are approved.
- [x] Real SMS provider selection remains a separate future decision.

## Official references reviewed

1. Microsoft Graph application registration: https://learn.microsoft.com/en-us/graph/auth-register-app-v2
2. Microsoft Graph create event API and `Calendars.ReadWrite` permission: https://learn.microsoft.com/en-us/graph/api/calendar-post-events?view=graph-rest-1.0
3. Microsoft Graph `sendMail`, `Mail.Send`, and `202 Accepted` behavior: https://learn.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0
4. Microsoft Graph application-access authentication and administrator consent: https://learn.microsoft.com/en-us/graph/auth-v2-service
5. IETF RFC 5545 iCalendar object and `VEVENT` requirements: https://datatracker.ietf.org/doc/html/rfc5545
