# Help and Feedback Screen Specification

Status: Approved for Step 2.11g

Primary route: `/help`

Topic route: `/help/:topicSlug`

Reporter-visible request route: `/help/requests/:requestId`

## Purpose

Help and Feedback gives representatives and managers concise instructions for completing Territory Desk workflows, routes problems to the correct process, and lets users submit privacy-safe application problems or product suggestions.

It is not a general IT help desk, emergency service, customer-service channel, employee discussion forum, or substitute for reporting incorrect territory and directory information through Data Status.

The first release uses approved, versioned help articles. It does not include an AI help chatbot, public forum, peer-to-peer support feed, or unrestricted support chat; those surfaces could invent workflow guidance or expose employee and customer information without the required governance.

Exact topic, request-detail, Data Status, authenticated access-help, sign-in-help, Back, and fallback destinations are approved in `docs/route-action-contract-spec.md` for Step 2.12.

## Primary user question

The default screen must answer:

> Do I need instructions, a data correction, access help, application support, or a product-feedback form—and what should I do next?

## Required routing decision

The screen starts with five clearly separated choices:

1. **Learn how Territory Desk works** — opens searchable help topics.
2. **Report incorrect territory or employee information** — opens the approved data-quality report flow.
3. **Get sign-in or access help** — opens the approved authentication-help path.
4. **Report an application problem** — creates a support request when a real support destination is configured.
5. **Suggest an improvement** — creates a product-feedback request when a real product owner and destination are configured.

The user should not need to understand internal team ownership to choose correctly.

## Safety and urgency boundary

Show a concise notice before support choices:

`Territory Desk is not monitored for emergencies, urgent customer service, workplace safety incidents, or confidential security reporting.`

Guidance:

1. If someone is in immediate danger, contact local emergency services.
2. For urgent company, customer, safety, compliance, or security concerns, follow the approved company process supplied by Cintas.
3. Do not invent company phone numbers, email addresses, response times, or escalation contacts.
4. Until approved company contacts are provided, show **Company escalation contact not configured** in the prototype.
5. Never promise that submitting feedback will produce an immediate response.

The approved one-business-day peer-lead response target does not apply to Help or Feedback.

## Ownership prerequisite

A functional production submission path requires:

1. Named application-support owner.
2. Named product-feedback owner.
3. Approved destination or ticket system.
4. Access rules.
5. Retention and deletion policy.
6. Reporter-visible status rules.
7. Escalation path.
8. Service expectation, if management chooses one.

Until those exist:

1. Development and preview simulate submissions using fictional content.
2. Production cannot display an enabled form that silently discards requests.
3. The screen shows submission unavailable and only approved alternative contact guidance.
4. No unapproved personal email address or generic mailbox is used as a hidden fallback.

## Audience and permissions

### Authenticated representative

May:

1. Read all representative help topics.
2. Read manager-independent policy and status explanations.
3. Submit their own support or product-feedback request when configured.
4. View their own reporter-visible requests.
5. Open approved data, profile, and access-correction flows.

### Authorized manager

Receives the same experience plus manager-specific help topics. Manager status does not expose another employee's support requests, feedback, narratives, or identity.

### Future support or product owner

Triage, assignment, internal notes, prioritization, resolution, and content publishing require a separate approved administrative workflow. They are excluded from the first-release employee Help screen.

### Unauthenticated visitor

The authenticated `/help` content and request history remain unavailable. The future authentication specification may expose a separate privacy-minimized sign-in-help page that reveals no employee, territory, system-status, or support-request information.

## Screen composition

Show sections in this order:

1. Header and search.
2. Five routing choices.
3. Recommended help topics.
4. Browse by task.
5. My Requests.
6. Safety, privacy, and company-contact guidance.
7. App version and safe diagnostic reference.

## Header and search

Show:

1. Page title: **Help and Feedback**.
2. Prompt: **What do you need help with?**
3. Search field labeled **Search Territory Desk help**.
4. Standard notification bell and profile control.
5. Persistent **Demo support** label in prototype environments.

The search covers approved help-topic titles, summaries, keywords, and task steps. It does not search leads, customers, representatives, support narratives, or the internet.

## Help search behavior

1. Search begins after two meaningful characters or explicit submission.
2. Matching ignores case and repeated spaces.
3. Exact title and keyword matches appear before partial matches.
4. Show at most eight initial results with **View all matching topics**.
5. Results identify representative, manager, or all-user audience when relevant.
6. An empty query returns recommended topics, not all content.
7. No results shows **No help topic matched** plus the routing choices.
8. Raw search text remains in active memory only and is excluded from URLs, analytics, logs, and persistent storage.
9. Browser Back restores the active-session query, result position, and focus.
10. Help search never guesses an answer from unapproved content.

## Initial help-topic library

### Start here

1. What Territory Desk does—and what remains in Dynamics 365.
2. Find the correct territory and representative.
3. Send a cross-department lead.
4. Respond with Accept, Need Information, or Decline.
5. Understand ownership, status, and Action Required.

### Collaborate on a handoff

1. Add a next action and follow-up.
2. Record progress without changing status accidentally.
3. Set an appointment or final outcome.
4. Understand activity history and corrections.
5. Copy an existing opportunity to another department safely.

### Notifications and reminders

1. Understand the notification bell versus the Leads badge.
2. Understand in-app alerts versus Territory Desk SMS.
3. Mark a notification read without changing the lead.
4. Choose an in-app follow-up reminder.
5. Add a privacy-safe calendar snapshot.

### Territory and people

1. Search by ZIP or city.
2. Handle an ambiguous or open territory.
3. Use Directory versus Territory Lookup.
4. Report incorrect territory or employee information.
5. Understand source updated, validated, verified, and refreshed dates.

### Managers

1. Understand My Work versus Team Insights.
2. Review missed responses and open loops.
3. Interpret workflow KPIs and denominators.
4. Reassign a handoff with a reason.
5. Understand authorized scope and small-sample safeguards.

### Account and privacy

1. Verify My Profile and work timezone.
2. Understand source-controlled versus editable information.
3. Protect customer information on a personal smartphone.
4. Sign out and clear session-held data.
5. Get sign-in or access help.

## Help topic structure

Every topic includes:

1. Task-oriented title.
2. One-sentence purpose.
3. Intended audience.
4. Prerequisites.
5. Numbered steps using the exact approved interface labels.
6. Expected result.
7. Common problems and safe recovery.
8. What the action does not do.
9. Related topics and destination actions.
10. Content version and **Last reviewed** date.

Topics do not include real customer names, employee contact details, credentials, internal screenshots, unapproved corporate branding, or instructions that bypass authorization.

## Contextual Help

Primary screens may link directly to a relevant help topic.

Rules:

1. The link uses a stable topic slug, not customer or employee context.
2. The source route may be represented by a safe route template such as `lead-detail`, never a record identifier.
3. Returning preserves active unsaved form input in memory when safe.
4. Help never submits, accepts, declines, closes, reassigns, or saves a lead.
5. If the topic is unavailable, return to the Help home with a clear message and related topics.
6. Direct links recheck authentication and topic permissions.

## Help content governance

Each published help topic requires:

1. Stable topic identifier and slug.
2. Content owner.
3. Audience.
4. Product-version applicability.
5. Review date.
6. Approved status.
7. Replacement or retirement relationship when obsolete.

Rules:

1. Unapproved drafts never appear in production search.
2. A topic older than its configured review interval shows **Content review due** to the content owner, not an alarming warning to ordinary users unless the instructions may be unsafe.
3. A product release that changes a labeled workflow must update the related topic before release.
4. Retired topic links redirect to the approved replacement or explain that the instruction is no longer available.
5. Static approved topics may be bundled for resilient reading; request forms and histories still require authentication and a connection.

## Report incorrect territory or employee information

This choice opens the shared Data Status reporting workflow with source context when available.

It does not create a generic application-support request because data owners need source version, affected record, and approved issue category to correct routing safely.

The Help screen explains:

1. A report does not immediately change the source.
2. The active validated version continues to control routing.
3. The reporter can follow the item in **My Submitted Reports**.
4. Customer information should not be included.

## Get sign-in or access help

Use this path for:

1. Cannot sign in.
2. Signed into the wrong identity.
3. Missing representative access.
4. Missing or incorrect manager access.
5. Account inactive or access changed unexpectedly.

Rules:

1. Do not collect a password, one-time code, authentication token, recovery code, or secret.
2. Do not let the user request a role or scope change through a generic suggestion form.
3. Incorrect source-controlled role or scope creates an access problem with the approved identity or access owner.
4. The final route and recovery behavior remain aligned with Step 2.11h authentication and system pages.

## Report an application problem

### Appropriate examples

1. A page does not load.
2. A control does not work.
3. A save result is unclear.
4. The app repeatedly loses entered data.
5. The layout or accessibility behavior prevents task completion.
6. A displayed count does not reconcile to its authorized list.

### Not appropriate

1. Wrong territory or representative data.
2. Requesting manager access.
3. Sending customer or opportunity information to support.
4. Reporting an emergency or urgent security event.
5. Asking support to change lead ownership outside the audited workflow.

### Form fields

Collect:

1. Category: page load, action, save, notification display, data display, accessibility, performance, or other.
2. Impact: blocked, limited, confusing, or minor.
3. Screen or workflow selected from approved labels.
4. Action the user was trying to complete.
5. Short summary, 10–160 characters.
6. Reproduction details, optional, maximum 1,000 characters.
7. Permission: **Support may contact me about this request**.
8. Review of safe diagnostic context before submission.

Do not collect a customer name, contact details, opportunity notes, password, token, full URL, raw log, or unrestricted employee information.

Attachments, screenshots, screen recordings, audio, and arbitrary files are excluded from the first release because they can capture customer, employee, authentication, and corporate information.

## Suggest an improvement

### Form fields

Collect:

1. Area: Home, Territory, Send Lead, Leads, Directory, Notifications, Manager Insights, Data Status, Profile, Help, or other.
2. Problem to solve, 10–500 characters.
3. Suggested improvement, optional, maximum 1,000 characters.
4. Frequency: first time, sometimes, often, or every time.
5. Impact: saves time, improves routing, improves collaboration, reduces mistakes, improves accessibility, or other.
6. Permission: **Product team may contact me about this idea**.

Do not ask users to estimate revenue, rank coworkers, include customer records, or design the technical implementation.

Product ideas are evidence, not automatic commitments. Submission confirmation says **Suggestion received**, never **Feature approved**.

## Safe diagnostic context

For an application-problem request, Territory Desk may attach only a previewed, approved set:

1. Application version.
2. Development, preview, or production environment class.
3. Safe route template, such as `lead-detail`, without record identifiers.
4. Timestamp and approved work timezone.
5. Smartphone or laptop browser category.
6. Online, reconnecting, or offline connection state.
7. Safe error class or correlation reference already shown to the user.
8. Fictional-demo state when applicable.

Exclude:

1. Full URL or query parameters.
2. Page contents or screenshots.
3. Customer and employee information.
4. Lead, notification, or activity payloads.
5. Browser history.
6. Clipboard contents.
7. Authentication claims, cookies, tokens, or secrets.
8. Precise device fingerprint or unrelated software inventory.
9. Raw console, network, provider, or Dynamics logs.

The user can review the safe diagnostic labels before submission. Removing optional diagnostics does not remove the minimum authenticated request ownership and server timestamp.

## Submission transaction

1. Revalidate authentication and permission.
2. Validate the selected request type and fields.
3. Scan or reject prohibited content patterns without logging the prohibited value.
4. Attach only the approved safe diagnostic context.
5. Generate an idempotency reference.
6. Save one request and initial reporter-visible event atomically.
7. Route to the configured approved destination.
8. Return a committed tracking reference and routing state.
9. Create one in-app confirmation for the reporter when appropriate.

If request storage succeeds but external routing fails, say **Request saved; support routing is delayed**. Do not duplicate the request during retry.

## My Requests

Show only requests submitted by the authenticated user and reporter-visible updates.

### Application-problem statuses

1. Submitted.
2. Acknowledged.
3. Under review.
4. Resolved.
5. Closed — no application change.

### Product-suggestion statuses

1. Submitted.
2. Under review.
3. Planned.
4. Not planned.
5. Delivered.

Rules:

1. Planned and Delivered appear only after an authorized product owner records them.
2. Status does not promise a response date.
3. Cards show safe category, summary, submitted time, current status, last update, and approved reporter-visible note.
4. Internal assignments, internal notes, other reporters, engineering details, and prioritization scores are excluded.
5. Selecting a request opens reporter-visible detail only.
6. Material status updates may create one in-app notification for the reporter; they do not send SMS by default.

The first release does not provide a support chat or unrestricted comment thread. If support requires more information, the reporter-visible update gives an approved follow-up path.

## Request correction and closure

1. A user may withdraw an unresolved suggestion or problem report with confirmation.
2. Withdrawal preserves the request and creates an audit event; it does not erase prior routing.
3. The user cannot edit a submitted narrative in place.
4. To correct material information, submit an approved linked clarification if that feature is implemented; otherwise use the provided follow-up path.
5. Resolved or closed status is controlled by the approved support or product owner, not the reporter.
6. A reporter may indicate **Problem still occurring**, which creates a linked reopen request without rewriting history.

## Mobile composition

1. Search and five routing choices appear first.
2. Recommended topics use compact task cards.
3. Browse-by-task groups use accessible accordions.
4. Forms use one question per visual section with a sticky review-and-submit action that does not cover content.
5. My Requests uses stacked cards.
6. Safety guidance remains visible but does not dominate ordinary help tasks.

## Laptop composition

1. Same content and action order as mobile.
2. Topic navigation may use a left contents rail.
3. Article and related topics may use a two-column layout.
4. My Requests may use an accessible table.
5. Wider layout does not expose support-administration controls or additional user data.

## Loading, empty, offline, and error states

### Help content loading

Render the header and search shell. Bundled approved topics may appear immediately. Do not show unapproved cached drafts.

### No matching topic

Show the five routing choices and suggested categories. Do not fabricate an answer or automatically submit feedback.

### No requests

Show **You have not submitted an application problem or suggestion**. Data-quality reports remain in Data Status and are not counted here.

### Content unavailable

Show bundled approved content if available. Otherwise provide safe navigation back to Home and the configured contact guidance.

### Submission unavailable

Explain whether support or product routing is not configured, offline, or temporarily unavailable. Never show a working-looking submit button that drops the request.

### Offline

1. Bundled approved help articles remain readable.
2. Search operates only over bundled topics.
3. Request history and new submissions remain unavailable.
4. An active fictional or production form remains in memory until reconnect or explicit discard but is not persisted in browser storage.
5. Reconnect allows deliberate review and submission.

### Save failure before commit

Show **Request was not submitted**, preserve in-memory input, and allow idempotent retry.

### Unknown save result

Recheck by idempotency reference before offering another submission. Do not create a duplicate ticket.

### External routing delay

Show the committed request and **Routing delayed**. The user does not need to submit again.

### Unauthorized or signed-out

Clear request content and route to the safe authentication state. Bundled public sign-in guidance, if later approved, remains separate from authenticated request history.

### Topic version changed

Offer the current approved topic and explain that the instructions were updated. Browser Back must not restore unsafe obsolete steps as current guidance.

## URL and navigation behavior

1. Topic URLs use approved slugs only.
2. Search text, request narratives, employee information, diagnostics, and record identifiers never appear in URLs.
3. `/help` Back behavior restores the prior screen, active-session search, topic position, and focus when safe.
4. Direct topic links require authentication unless explicitly approved for a public sign-in-help topic.
5. A request URL uses an opaque identifier and server-side reporter authorization.
6. Copying a request or topic link does not grant access.

## Privacy and security

1. Request ownership and status are enforced server-side.
2. Managers cannot inspect employee requests merely because they have manager access.
3. Customer data, employee contact details, passwords, tokens, and confidential company information are prohibited from narratives.
4. Prohibited-content validation does not echo sensitive values into logs.
5. Request text remains out of URLs, page metadata, analytics, notification previews, and error breadcrumbs.
6. Production personal phones do not persist request drafts or history without security approval.
7. Sign Out clears search text, active form input, request history, and loaded reporter-visible detail from the session.
8. Support destinations, credentials, webhook secrets, and internal ticket identifiers never appear in the client.
9. Retention, access, legal hold, deletion, and employee-notice requirements must be approved before production submissions.

## Accessibility

1. Search uses an accessible combobox or search pattern with announced result count.
2. Routing choices have descriptive text, not icons alone.
3. Topic headings and numbered steps use semantic structure.
4. Forms have persistent labels, instructions, character limits, and linked errors.
5. Error summaries link to invalid fields.
6. Status does not rely on color alone.
7. Accordions expose expanded state and retain focus.
8. Touch targets are at least 44 by 44 CSS pixels.
9. Help and forms remain usable at 200% zoom and large phone text sizes.
10. Save, retry, routing-delay, withdrawal, and status changes are announced without excessive repetition.

## Analytics boundary

Allowed events include:

1. `help_opened`.
2. `help_search_used` without raw query text.
3. `help_topic_opened` with approved topic identifier.
4. `help_route_selected` with safe route category.
5. `support_request_started` with safe type and entry point.
6. `support_request_submitted` with safe category and impact.
7. `support_request_status_viewed` with safe status.
8. `help_error_shown` with safe error class.

Never include search text, request narrative, customer or employee data, support reference, raw record identifier, role scope, contact permission, diagnostics beyond safe categories, credentials, or internal routing destination.

## Fictional prototype scenarios

Provide fictional scenarios for:

1. Representative recommended topics.
2. Manager-specific topics within the same Help experience.
3. Search exact match, partial match, and no result.
4. Contextual help from Send Lead and Lead Detail with safe return.
5. Data issue routed to Data Status.
6. Access issue routed to sign-in or access help.
7. Application problem with reviewed safe diagnostics.
8. Product suggestion with no implied commitment.
9. Support destination not configured.
10. Simulated successful submission.
11. Saved request with delayed external routing.
12. Save failure and unknown result.
13. My Requests empty and populated states.
14. Problem report resolved, closed, and reopened.
15. Suggestion under review, planned, not planned, and delivered.
16. Offline bundled help with submission disabled.
17. Unauthorized request direct link.
18. Updated or retired help topic.

All identities, summaries, diagnostic references, routes, and request histories are fictional.

## Validation checklist

1. Verify every routing choice opens the correct help, data, access, support, or product process.
2. Verify data and access issues cannot be silently converted into generic suggestions.
3. Verify no response-time promise is inferred from the lead response target.
4. Verify no enabled production submission exists without a configured owner and destination.
5. Verify topic search uses only approved content and stores no raw query outside memory.
6. Verify contextual help preserves unsaved work without putting record context in URLs.
7. Verify article steps match approved interface labels and current product version.
8. Verify problem and suggestion forms reject prohibited sensitive content safely.
9. Verify attachments and screenshots are absent.
10. Verify diagnostics contain only previewed safe fields.
11. Verify one submission produces one request under double tap, retry, and lost-response conditions.
12. Verify external routing failure preserves the committed request and does not ask for resubmission.
13. Verify My Requests and direct links expose only reporter-visible authorized content.
14. Verify managers cannot access employee request history through role or URL manipulation.
15. Verify bundled help works offline while submissions and request history remain unavailable.
16. Verify stale, unavailable, no-result, no-request, save-failure, unknown-result, routing-delay, and unauthorized states fail safely.
17. Verify URLs, analytics, logs, metadata, cache, notifications, and sign-out preserve privacy.
18. Verify mobile, laptop, keyboard, screen-reader, touch-target, contrast, zoom, and large-text behavior.

## Step 2.11g acceptance checklist

- [x] Help and Feedback is approved as guidance and correct request routing, not a general IT or emergency channel.
- [x] Learning, data correction, access help, application problem, and product suggestion remain separate.
- [x] Production submissions require approved owners, destinations, retention, permissions, and escalation.
- [x] Initial help-topic library, search behavior, article structure, contextual help, and content governance are approved.
- [x] Incorrect territory and employee information routes to Data Status.
- [x] Sign-in, role, and scope problems route to the approved access-help process.
- [x] Application-problem fields, impact levels, diagnostics, and prohibited-content rules are approved.
- [x] Product suggestions collect the problem and impact without implying approval or delivery.
- [x] Attachments, screenshots, support chat, public forum, and AI-generated help remain excluded.
- [x] My Requests statuses, reporter visibility, withdrawal, resolution, and reopen behavior are approved.
- [x] No support response target is borrowed from the one-business-day lead rule.
- [x] Smartphone, laptop, offline bundled help, and safe return behavior are approved.
- [x] Loading, no-result, no-request, unavailable, offline, save-failure, unknown-result, routing-delay, unauthorized, and topic-change states are approved.
- [x] Privacy, security, accessibility, analytics, URL, ownership, and fictional-data rules are approved.
