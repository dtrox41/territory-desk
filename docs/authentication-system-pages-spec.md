# Authentication and System Pages Specification

Status: Approved for Step 2.11h

## Purpose

Define every screen and recovery path that appears before authentication, when a session or permission changes, when a destination cannot be reached safely, or when the application cannot establish trustworthy state.

This package is provider neutral. It establishes the product and security requirements before Phase 3 selects a no-new-Azure architecture and authentication service.

## Non-negotiable security boundary

1. A production employee application cannot rely on a password embedded in HTML, JavaScript, a GitHub repository, or a downloadable client bundle.
2. Hiding a page or checking a role only in browser code is not authentication or authorization.
3. Every protected data read and write requires server-side authentication and authorization.
4. GitHub Pages may host only the public fictional prototype because it publishes a static, publicly reachable site.
5. Real employee contacts, customer information, lead records, manager insights, sessions, and credentials must never be embedded in a GitHub Pages build.
6. The new app never copies a real login credential from the original app, conversation, documentation, or browser into code, fixtures, commits, logs, or screenshots.
7. Production hosting and identity remain unselected until Phase 3; this step does not provision Azure or any paid service.

## Authentication versus authorization

### Authentication

Answers: **Who is signed in?**

It verifies an identity and establishes a protected session.

### Authorization

Answers: **What may this identity see or do right now?**

It uses current approved role, location, department, manager scope, record participation, and workflow permissions.

Rules:

1. Successful sign-in never implies manager access.
2. Knowing or copying a record URL never grants access.
3. The server rechecks authorization for each protected request and consequential command.
4. Client navigation omission improves usability but is not the security control.
5. Role, scope, and record access may change during an active session.

## Environments and identity modes

### Development

1. Fictional identities only.
2. Simulated sign-in and notifications.
3. Clearly labeled **Development demo**.
4. No production identity provider, employee data, carrier SMS, or Dynamics connection.

### Preview

1. Fictional identities or separately approved test identities only.
2. Clearly labeled **Prototype — fictional data**.
3. Demo persona selection may be enabled.
4. External writes remain simulated by default.

### Production

1. Uses a company-approved identity method and protected backend session.
2. Demo personas and bypass controls are absent from the build and disabled server-side.
3. Real data loads only after authentication, authorization, environment, and source checks succeed.
4. Production activation requires security, privacy, identity, retention, incident, and deployment approval.

No environment is selected from a URL parameter or user-controlled browser value.

## Route inventory

| Screen | Recommended route | Purpose |
| --- | --- | --- |
| Sign in | `/sign-in` | Start approved authentication or fictional demo access |
| Authentication return | `/auth/return` | Complete provider return without displaying tokens or claims |
| Sign-in help | `/sign-in/help` | Privacy-minimized recovery and approved contact guidance |
| Session expired | `/session-expired` | Reauthenticate safely and explain unsaved-work limits |
| Access required | `/access-required` | Valid identity lacks application access or required profile mapping |
| Access denied | `/access-denied` | Valid user lacks permission for a specific destination |
| Account unavailable | `/account-unavailable` | Inactive, disabled, or unusable mapped account |
| Signed out | `/signed-out` | Confirm current session ended |
| Offline | `/offline` | Explain connection-dependent limitations and retry |
| Maintenance | `/maintenance` | Approved planned or emergency service interruption |
| Update required | `/update-required` | Client and server versions cannot safely work together |
| Not found | `/not-found` | Unknown or unavailable safe route |
| Unexpected error | `/error` | Recover from non-sensitive application failure |

The final router may render some states in place rather than change the URL, but the user-facing content, security, recovery, and testing requirements remain the same.

## Sign-in screen

### Header and identity

Show:

1. Text product name: **Territory Desk**.
2. Subtitle: **Cross-Division Sales Command Center**.
3. Neutral text-only branding until corporate branding is authorized.
4. Environment label for Development or Prototype.
5. No customer, territory, employee, lead, notification, or status information.

### Production action

Recommended primary action:

**Continue with company sign-in**

Rules:

1. The action routes to the company-approved identity experience selected in Phase 3.
2. Territory Desk does not collect or store the company password itself when external company authentication is used.
3. Do not show a local email-and-password form unless a later approved architecture genuinely owns secure credential registration, verification, recovery, storage, rate limiting, and monitoring.
4. Do not provide self-registration or public account creation.
5. Do not show **Remember me** on a personal smartphone unless company policy and the selected session service approve it.
6. Do not claim SSO, MFA, passwordless, or biometric support before it is implemented and tested.

### Prototype action

Recommended primary action:

**Enter Fictional Demo**

The prototype then offers fictional personas:

1. New Business Representative.
2. Authorized Manager with personal My Work and limited Team Insights scope.
3. Optional data-exception persona.

Rules:

1. No email address or password is required.
2. Every persona is visibly fictional.
3. Demo selection never contacts a production identity or data source.
4. Switching personas clears prior persona data first.
5. Production build and server reject demo-session creation.

### Secondary actions

1. **Get sign-in help**.
2. Approved privacy notice when available.
3. Approved terms or employee notice when required.

Do not show an internal Data Status link before authentication because it could disclose source condition or operational details.

## Safe return after sign-in

A protected deep link may preserve an intended in-app destination.

Rules:

1. Accept only an allowlisted relative application path.
2. Reject external URLs, protocol-relative URLs, scripts, encoded traversal, and unrecognized routes.
3. Remove customer names, employee names, emails, phones, free text, tokens, session identifiers, and sensitive query values.
4. After authentication, recheck destination authorization and record access.
5. Unauthorized return destinations open Access Denied with safe Home and My Work actions.
6. A missing or unsafe destination returns Home.
7. Authentication return URLs never expose provider tokens, authorization codes after processing, or error payloads to analytics and page metadata.

## Authentication-return state

The `/auth/return` experience:

1. Shows **Completing sign-in** and a progress indicator.
2. Validates the provider response through the approved server-side or backend-for-frontend flow.
3. Confirms request correlation, anti-forgery state, intended environment, and allowed return destination.
4. Establishes a new protected application session and rotates any pre-authentication session identifier.
5. Retrieves current identity, role, scope, and source-profile state.
6. Redirects only after every required check succeeds.

It never displays or logs a token, authorization code, password, authentication claim, full callback URL, or raw provider error.

## Session requirements

### Storage and transport

1. Use HTTPS for the entire production session.
2. Prefer a server-managed, meaningless session identifier in a `Secure`, `HttpOnly`, appropriately `SameSite` cookie.
3. Do not store authentication tokens, session identifiers, refresh tokens, or credentials in `localStorage` or `sessionStorage`.
4. Do not place session identifiers in URLs.
5. Do not expose production credentials or tokens to application JavaScript when a backend-for-frontend pattern can avoid it.
6. Generate, validate, rotate, expire, and revoke sessions server-side through a proven library or provider rather than a home-built browser mechanism.

Exact cookie attributes, cross-origin rules, CSRF controls, and provider flow are finalized during architecture and threat review.

### Lifetime

1. Idle and absolute session timeouts are configured and enforced server-side.
2. Timeout values require company security approval; the prototype does not invent production durations.
3. Client countdown text is informative only and cannot extend a server-expired session.
4. Sessions rotate after sign-in, reauthentication, and material privilege change.
5. Sign Out invalidates the current session server-side when the architecture supports real sessions.
6. Concurrent phone and laptop sessions follow future company policy; the UI does not promise they are allowed or blocked before approval.

### Personal smartphone

1. Use non-persistent session behavior by default until company policy approves otherwise.
2. Do not persist real customer, employee, lead, profile, request, or insight data for offline browsing.
3. Browser autofill is not used for customer or authentication secrets collected by Territory Desk.
4. Sign Out clears session-held application state.
5. Closing the browser is not treated as proof that the server session was revoked unless the selected session model guarantees it.

## Session-expiration experience

### Warning

If the system can determine an approaching server expiration reliably, show:

`Your Territory Desk session will expire soon.`

Actions:

1. **Continue Session** — requires an approved server renewal or reauthentication flow.
2. **Sign Out**.

Do not reset the timeout through client activity alone.

### Expired

Show:

1. **Your session expired**.
2. Plain-language reason without technical details.
3. **Sign In Again**.
4. **Discard Unsaved Work and Sign Out**, when unsaved in-memory content exists.

### Unsaved work

1. Stop every protected write immediately.
2. Do not queue commands for later silent submission.
3. Keep active input hidden in memory only when the current tab can do so safely.
4. Explain that unsaved work may be lost during redirect-based authentication.
5. After reauthentication, restore input only if the same stable identity returned, the user remains authorized, the source versions remain compatible, and the content never left protected memory.
6. If a different identity returns, clear the prior user's input before rendering anything.
7. Require review before resubmitting a restored command and reuse its idempotency reference.

## Sign-in help

The privacy-minimized help page may explain:

1. Confirm network connection.
2. Retry company sign-in.
3. Verify the expected company account through the approved identity-provider experience.
4. Return to the original sign-in screen.
5. Use the approved company identity-support contact when configured.

Rules:

1. Never request or display a password, MFA code, recovery code, token, or secret.
2. Do not confirm whether an email address or employee identity exists.
3. Do not expose manager role, location, department, or account status.
4. Do not invent a company phone number, email, or service expectation.
5. Prototype shows **Identity support contact not configured**.
6. Sign-in failures use generic language plus a safe reference when useful.

## Access Required

Use when authentication succeeded but the identity lacks an approved Territory Desk application profile or required mapping.

Show:

1. **Territory Desk access is not set up for this account**.
2. Safe explanation that company identity was accepted but application access is not available.
3. **Get access help**.
4. **Sign Out**.

Do not show internal role names, missing database keys, employee lookup candidates, or another account's information. Do not create access automatically.

## Access Denied

Use when the identity has application access but not the requested route, record, scope, or action.

Show:

1. **You do not have access to this page or record**.
2. Safe reason category when appropriate: manager permission required, outside authorized scope, no longer a participant, or action not allowed in current state.
3. **Return Home**.
4. **Open My Work**.
5. **Get access help** when a correction may be needed.

Rules:

1. Do not reveal whether a protected customer, lead, employee, or manager record exists.
2. Do not include the protected record name in the title, URL, analytics, or error reference.
3. Browser Back cannot reveal previously cached unauthorized content.

## Account Unavailable

Use when the mapped Territory Desk account is inactive, disabled, conflicted, or no longer usable.

Show generic language:

`This account cannot use Territory Desk right now.`

Actions:

1. **Get sign-in help**.
2. **Sign Out**.

Do not state employment status, disciplinary information, another identity match, or internal administrator notes.

## Role or access changes during a session

1. Server authorization takes effect immediately for subsequent requests.
2. Remove unauthorized navigation and clear affected client data.
3. Rotate or refresh the session when privilege changes require it.
4. Announce **Your access changed. Territory Desk has refreshed.**
5. Route to Home, My Work, Access Required, or Account Unavailable as appropriate.
6. Do not retain manager aggregates, employee lists, lead details, or notification previews from removed scope.
7. An increase in access still requires a fresh server-authorized load; cached hidden data is never revealed.

## Sign Out and Signed Out

### Sign Out command

1. Warn about unsaved in-memory forms.
2. Send the approved session invalidation request.
3. Clear identity, roles, scopes, notification count, cached protected responses, form memory, filters, fictional drafts, and support-request detail.
4. Clear tabs through an approved same-origin session-change signal without placing secrets in browser messaging.
5. Navigate to `/signed-out`.

### Signed Out page

Show:

1. **You are signed out**.
2. **Sign In Again**.
3. Instruction to close the browser on a shared device.

Do not use browser Back to restore protected content. History restoration and browser cache behavior must be tested explicitly.

## Multi-tab behavior

1. Sign Out in one tab causes other tabs to clear protected state and require sign-in.
2. Role removal in one tab invalidates unauthorized views in other tabs on their next server check or approved session signal.
3. One tab cannot restore another user's unsaved content.
4. Conflicting writes still use record versions and idempotency protections.
5. Notification and Leads counts refresh after session or scope change without marking anything read.

## Global startup state

On application start:

1. Render neutral branded shell only.
2. Determine environment from protected deployment configuration.
3. Check whether an application session exists through the approved server path.
4. Load identity, role, and minimum navigation authorization.
5. Load protected page data only after those checks.

Never briefly render the previous user's name, role, navigation, counts, or cached page while authentication is unknown.

## Offline and reconnecting

### Before authentication

Show **Connection required to sign in** with **Try again**. Demo access may remain available only when the preview's fictional bundle is intentionally configured for it.

### During an authenticated session

1. Show persistent **Offline** or **Reconnecting** status.
2. Keep only already rendered, still-authorized in-memory content where approved.
3. Disable new searches, protected reads not already loaded, and every state-changing command that requires revalidation.
4. Do not create a background offline write queue.
5. Reconnect rechecks session, role, scope, record version, and source version before enabling actions.
6. If the session expired while offline, open Session Expired rather than silently resuming.

## Maintenance page

Show:

1. **Territory Desk is temporarily unavailable**.
2. Approved plain-language maintenance or incident message.
3. Status checked time when trustworthy.
4. **Try again**.
5. Approved support guidance when configured.

Optional planned return time must be clearly labeled as an estimate and removed when no longer trustworthy. Do not display infrastructure, database, deployment, provider, or security-incident details.

Maintenance mode:

1. Is controlled server-side or at the protected edge.
2. Cannot be bypassed with a URL or client flag.
3. May allow sign out.
4. Never claims that a pending write succeeded.

## Update Required

Use when the loaded client cannot safely communicate with the current server or data contract.

Show:

1. **Territory Desk needs to refresh before you continue**.
2. **Refresh Now**.
3. Warning about unsaved in-memory work.

Rules:

1. Block incompatible writes.
2. Do not force-refresh while unsaved work is visible without warning.
3. Reauthentication may be required after refresh.
4. Service workers or caches must not keep an incompatible client active indefinitely.
5. A build version appears only in safe diagnostics, not as a security claim.

## Not Found

Show:

1. **Page not found**.
2. **Return Home**.
3. **Open My Work** when authenticated.

Use the same generic page for unknown routes and protected resources whose existence must not be disclosed. Do not echo the full requested URL or record identifier.

## Unexpected Error

Show:

1. **Territory Desk could not complete this page**.
2. Whether the attempted command definitely failed, definitely succeeded, or has an unknown result.
3. Safe recovery appropriate to that state.
4. **Try again**, **Return Home**, or **Open My Work**.
5. Optional safe reference with **Copy reference**.

Rules:

1. Never display stack traces, provider messages, SQL, payloads, tokens, customer data, employee contacts, or internal identifiers.
2. A lost success response is reconciled by idempotency reference before another write.
3. One failing block does not blank independently validated content.
4. Error reporting receives only the approved safe route template, error class, environment class, app version, time, and correlation reference.

## Loading behavior

1. Loading indicators have a visible label when delay may be noticeable.
2. Skeletons approximate stable layout and never imply data values.
3. A zero, empty list, signed-out state, or Access Denied state never appears temporarily while authorization is unknown.
4. After a reasonable approved threshold, offer a safe status message and retry.
5. Repeated retries use backoff where appropriate and do not duplicate commands.

## Browser, device, and installation boundary

1. Support current company-approved browsers identified during pilot planning.
2. An unsupported browser state explains the missing capability and approved alternative without exposing device details.
3. Do not require installation as a native or home-screen app.
4. Do not request notification, location, camera, microphone, contacts, or calendar permissions at sign-in.
5. Request a future browser capability only at the moment an approved feature needs it and after explaining why.
6. The first release is a responsive web application, not a device-management tool.

## GitHub Pages boundary

GitHub Pages is suitable only for the fictional public prototype because:

1. It publishes static HTML, CSS, and JavaScript.
2. Published Pages sites are publicly reachable even when a source repository may be private under supported plans.
3. It cannot make embedded employee or customer data private through a client-side password gate.
4. It cannot by itself enforce server-side sessions, record permissions, write auditing, notification delivery, or protected database access.

The prototype must display:

`Fictional prototype — not connected to Cintas systems or production data.`

Production hosting is chosen separately after the backend, identity, authorization, data, audit, and deployment architecture is approved.

## Privacy and security

1. Use generic authentication and access errors that do not enumerate accounts or protected records.
2. Apply server-side rate limiting, abuse detection, and audit logging appropriate to the selected identity flow.
3. Log successful and failed security events with privacy-minimized identifiers and no credentials.
4. Protect against open redirects, session fixation, cross-site request forgery, cross-site scripting, clickjacking, cache leakage, and unsafe cross-origin configuration through architecture and testing.
5. Apply secure response headers and prevent protected pages from being indexed or cached improperly.
6. Never put identity, role, scope, customer data, record identifiers, tokens, codes, or error payloads in page metadata or analytics.
7. Authorization denials and privilege changes are auditable.
8. Authentication and session configuration is environment-specific and secret-managed.
9. Development and preview credentials cannot reach production resources.
10. Incident response and session revocation ownership must be approved before production.

## Accessibility

1. Authentication and system pages work without relying on color, animation, or icons.
2. Page titles and main headings identify the state clearly.
3. Focus moves to the state heading after navigation and returns appropriately after recoverable dialogs.
4. Loading, expiration, access change, offline, maintenance, update, and error states are announced without repeated noise.
5. Sign-in and retry controls have persistent text labels and 44-by-44 CSS-pixel targets.
6. Countdown or time-sensitive notices provide a nonvisual equivalent and do not expire before screen-reader users can act.
7. Content works at 200% zoom and large mobile text.
8. Keyboard users can complete sign-in initiation, recovery, retry, and sign out.
9. Motion is reduced according to user preference.
10. Error references are selectable and copyable without forcing a mouse interaction.

## Analytics boundary

Allowed events include:

1. `sign_in_started` with environment and approved method category.
2. `sign_in_completed` without identity details.
3. `sign_in_failed` with safe failure class.
4. `session_expired`.
5. `access_required_shown`.
6. `access_denied_shown` with safe destination category.
7. `sign_out_completed`.
8. `offline_state_shown`.
9. `maintenance_state_shown`.
10. `update_required_shown`.
11. `system_error_shown` with safe error class.

Never include email, name, phone, employee ID, manager scope, location, customer data, requested full URL, record identifier, token, authorization code, authentication claim, session ID, provider payload, or unsaved form data.

## Fictional prototype scenarios

Provide fictional scenarios for:

1. Sign-in screen with prototype label.
2. Representative demo persona.
3. Authorized manager demo persona with limited scope.
4. Authentication completion.
5. Unsafe return destination rejected.
6. Signed-in identity with no application profile.
7. Representative denied Manager Insights.
8. Manager denied out-of-scope record.
9. Account unavailable.
10. Session warning and successful continuation simulation.
11. Session expiration with no unsaved work.
12. Session expiration with unsaved in-memory form.
13. Different identity returns after expiration and prior input clears.
14. Sign out across multiple tabs.
15. Role removed during session.
16. Offline before sign-in.
17. Offline during authenticated reading and blocked write.
18. Maintenance with and without estimated return.
19. Update required with unsaved input warning.
20. Unknown route and protected-record-not-disclosed behavior.
21. Known failed, known successful, and unknown-result errors.
22. Unsupported browser state.
23. Production build rejects demo session.

All personas, roles, scopes, references, and protected content are fictional.

## Validation checklist

1. Verify no production credential or real identity is present in source, bundle, fixtures, documentation, logs, screenshots, or repository history.
2. Verify GitHub Pages build contains fictional public data only.
3. Verify protected requests enforce server-side authentication and authorization.
4. Verify client role or route manipulation cannot broaden access.
5. Verify production cannot create a demo session or switch persona.
6. Verify authentication return rejects missing correlation, unsafe state, wrong environment, replay, and open redirect attempts.
7. Verify tokens, codes, sessions, and claims never appear in URLs, analytics, logs, metadata, or client storage.
8. Verify the approved session uses HTTPS and protected cookie or equivalent server-managed handling.
9. Verify idle and absolute expiration are enforced server-side.
10. Verify sign-in and privilege changes rotate the session where required.
11. Verify Session Expired never queues a protected command silently.
12. Verify restored unsaved input requires the same identity, current authorization, compatible versions, and user review.
13. Verify a different returning identity sees none of the prior user's data or input.
14. Verify Access Required, Access Denied, Account Unavailable, and Not Found reveal no protected record or employee existence.
15. Verify role removal clears unauthorized data and navigation in every open tab.
16. Verify Sign Out invalidates the current server session and prevents browser Back from restoring protected content.
17. Verify offline and reconnect behavior rechecks session, role, scope, record, and source versions before writes.
18. Verify maintenance and update-required modes cannot be bypassed client-side.
19. Verify error pages distinguish failed, succeeded, and unknown command results without leaking diagnostics.
20. Verify protected content never flashes while startup authorization is unknown.
21. Verify caches, service workers, and browser storage do not retain real protected content on a personal phone without approval.
22. Verify security headers, cross-origin policy, CSRF, XSS, clickjacking, rate limiting, and cache controls through the later architecture test plan.
23. Verify smartphone, laptop, keyboard, screen-reader, focus, touch-target, contrast, motion, zoom, and large-text behavior.

## Official implementation references

1. OWASP Authentication Cheat Sheet: `https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html`
2. OWASP Session Management Cheat Sheet: `https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html`
3. OWASP HTML5 Security Cheat Sheet: `https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html`
4. GitHub Docs — What is GitHub Pages: `https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages`
5. GitHub Docs — Configuring a publishing source: `https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site`

These sources establish security and hosting boundaries. The selected provider's official documentation must be reviewed after Phase 3 chooses the architecture.

## Step 2.11h acceptance checklist

- [x] Authentication and authorization remain distinct and server enforced in production.
- [x] GitHub Pages is limited to a public fictional prototype and never treated as a secure employee-data host.
- [x] Development, preview, and production identity modes are approved.
- [x] Provider-neutral sign-in, demo persona, authentication-return, and safe-return behavior are approved.
- [x] No self-registration, embedded password, client-only gate, or production demo bypass is allowed.
- [x] Session storage, HTTPS, cookie, timeout, rotation, personal-phone, and multi-tab boundaries are approved.
- [x] Session expiration and unsaved-work recovery require same identity, current authorization, compatible versions, and review.
- [x] Sign-in Help, Access Required, Access Denied, Account Unavailable, and access-change behavior are approved.
- [x] Sign Out, Signed Out, startup, offline, reconnect, maintenance, update-required, not-found, and unexpected-error behavior are approved.
- [x] Errors distinguish failed, succeeded, and unknown results without exposing sensitive diagnostics.
- [x] The first release requests no unnecessary browser or device permissions.
- [x] Authentication provider, production timeout values, company contacts, concurrent-session policy, and hosting remain Phase 3 or company decisions.
- [x] Privacy, security, accessibility, analytics, URL, cache, storage, and fictional-data boundaries are approved.
