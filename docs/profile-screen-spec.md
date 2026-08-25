# My Profile Screen Specification

Status: Approved for Step 2.11f

Route: `/profile`

## Purpose

My Profile lets an authenticated employee verify which identity, department, location, territory, role, manager scope, work timezone, contact destination, and notification rules Territory Desk is using. It also provides the small set of personal preferences the employee is actually allowed to control.

It is not an employee-directory editor, territory editor, role-administration screen, password manager, or place to impersonate another user.

Exact Directory, Territory Coverage, Notification, Data Status, manager, correction, access-help, sign-in-help, Back, and fallback destinations are approved in `docs/route-action-contract-spec.md` for Step 2.12.

## Primary user question

The default screen must answer:

> Is Territory Desk using the correct identity and work context for me, and which preferences can I safely change?

## Critical separation

Profile values belong to one of three classes:

1. **Source controlled** — displayed for verification but not editable in Territory Desk.
2. **User preference** — editable by the authenticated user and affects only approved personal defaults.
3. **System state** — displayed to explain availability but changed only by the authentication, directory, notification, or environment service.

The interface labels every value with its class through plain language such as **Managed by company directory**, **You can change this**, or **System status**. A value never appears editable unless saving it is fully supported.

## Source-controlled values

The first release treats these as read only:

1. Stable employee identity.
2. Display name.
3. Active or needs-review directory status.
4. Representative or manager role.
5. Department and approved service group.
6. Exact source divisions.
7. Location assignment.
8. Territory assignments and routing eligibility.
9. Manager relationship.
10. Authorized manager scope.
11. Approved work timezone.
12. Work email used by the directory.
13. Phone number or destination used for a future Territory Desk SMS.
14. Authentication method and account status.

Users correct these through **Report incorrect profile information**. The report is auditable and does not immediately mutate the directory or permissions.

## Editable first-release preferences

Keep the editable set deliberately small:

1. **Default in-app follow-up reminder**:
   - At due time.
   - 15 minutes before.
   - One hour before.
   - One day before.
   - No extra reminder.
2. **Expanded or compact lead-card density on laptop**, if and only if both modes are implemented and accessible.

Recommendation: use **One day before** as the initial reminder default for date-only follow-ups. The user may override it on each follow-up.

Do not add theme, language, dashboard arrangement, landing-page, sound, vibration, or other low-value settings to the first release. Settings that are not functional must not appear.

If compact laptop density is not implemented in the first prototype, omit that preference completely rather than showing a disabled control.

## Notification policy versus preference

### Required in-app events

The user cannot disable in-app notifications for:

1. New peer-lead assignment.
2. Reassignment requiring acknowledgment.
3. Need Information directed to the user.
4. First-response or information-review target missed.
5. Owned follow-up becoming due or overdue.
6. Material manager action affecting the user's handoff.
7. Data or channel issue that requires the user's action.

These are workflow records, not optional marketing messages. Reading a notification remains separate from responding to the lead.

### Required assignment SMS

New assignment and reassignment retain the approved in-app plus Territory Desk SMS rule. The profile shows:

1. Channel status.
2. Masked destination such as `••• ••• 4821` when authorized.
3. **Simulation only** in development and prototype environments.
4. **Not configured**, **Needs verification**, **Available**, or **Unavailable** in a future approved production environment.
5. **Report incorrect number** or **Get help**.

The first-release prototype provides no SMS on/off toggle. A real required SMS channel cannot be activated until company policy, approved provider, employee-notice or consent requirements, destination ownership, cost, security, and accommodation or exception handling are approved.

Territory Desk never sends customer details to the personal SMS inbox.

### Follow-up reminders

Follow-up reminders are in-app by default. The personal default only preselects a lead time for future follow-ups:

1. It does not change existing follow-ups.
2. It does not change the actual due time.
3. It does not hide overdue work.
4. It does not send SMS.
5. It may be overridden during each authorized follow-up flow.

### Channels excluded from Profile

Do not show user controls for:

1. Peer-lead email, because no approved first-release peer-email delivery exists.
2. Operating-system or browser push, because closed-app push is not promised.
3. Outlook synchronization, because Microsoft Graph integration is excluded.
4. Customer texting, because consent and device policy are not approved.
5. General sales or corporate Dynamics alert preferences, because Territory Desk does not own them.

## Screen composition

Show sections in this order:

1. Profile header and account state.
2. Identity and work information.
3. Role and access.
4. Territory and directory context.
5. Notification delivery.
6. Personal preferences.
7. Device and session information.
8. Help, corrections, and sign out.

## Profile header

Show:

1. Page title: **My Profile**.
2. Display name.
3. Primary department or service group.
4. Representative, manager, or approved combined role label.
5. Active, Needs Review, Inactive, or Access Changed state.
6. Standard notification bell.
7. Persistent **Demo profile** label in the fictional prototype.

Use a neutral generated initials avatar if useful. Do not require or upload employee photos in the first release.

## Identity and work information

Show source-controlled fields:

1. Display name.
2. Work email, masked by default when shown on a personal phone.
3. SMS destination, masked to the final four digits.
4. Primary department.
5. Exact source divisions.
6. Location number or approved location name.
7. Approved work timezone.
8. Directory status.
9. Source updated and Last verified timestamps using their distinct definitions.

Actions:

1. **View my Directory profile**.
2. **Report incorrect profile information**.
3. **View Data Status**.

No inline pencil or edit icon appears beside a source-controlled value.

## Role and access

### Representative

Show:

1. **Representative access**.
2. Departments and routing contexts in which the user may send or receive handoffs.
3. Personal My Work access.
4. No Manager Insights permission.

### Authorized manager

Show:

1. **Representative access** for the manager's personal handoffs.
2. **Manager access** as an additional role.
3. Plain-language authorized scope summary by location and department.
4. **Open Team Insights**.

Do not list every supervised employee on Profile. Detailed authorized results belong in Team Insights or Directory and remain permission checked.

### Multiple roles

Display every active role and explain that role selection does not change identity. The user does not switch into or impersonate a representative account.

### No role editor

Users and managers cannot:

1. Grant themselves manager access.
2. Expand manager scope.
3. Change department or location.
4. Activate an inactive account.
5. Select a production demo persona.

Incorrect role or scope uses **Report access problem** and the Help route.

## Territory and routing context

Show a concise read-only summary:

1. Number of active territory assignments visible for the user's own directory record.
2. States or approved regions covered.
3. Department or division context.
4. Current territory source version.
5. Any Needs Review or version-mismatch condition.

Primary action: **View my Territory Coverage**.

Do not render thousands of ZIP codes inside Profile. Territory Coverage uses the approved searchable, grouped Directory behavior.

If the directory identity and territory assignment versions do not match, show **Routing profile needs review** and link to Data Status. Do not let Profile override the mismatch.

## Work timezone

The work timezone controls:

1. Date-only follow-up due time.
2. Display of response deadlines.
3. Business-day calculations when the approved workflow rule uses the recipient's work context.
4. Operational timestamps shown to the user.

Rules:

1. Store and display a full approved timezone identifier, not only a UTC offset.
2. The timezone is source controlled in the first release.
3. Device timezone never silently changes a deadline.
4. When device and work timezone differ, show **Times are shown in [work timezone]**.
5. A user reports an incorrect timezone rather than editing it directly.
6. Daylight-saving changes use the stored timezone rules for the relevant date.

## Notification delivery section

Show a clear channel table or mobile card list:

### In-app notifications

1. Status: Available, Delayed, Unavailable, or Status unavailable.
2. Required workflow categories summary.
3. **Open Notification Center**.

### Territory Desk SMS

1. Status: Simulation only, Not configured, Needs verification, Available, or Unavailable.
2. Masked destination when authorized.
3. New assignment and reassignment use only.
4. Customer details excluded.
5. **Report incorrect number** or **Get help**.

Channel state comes from Data Status or the approved notification service. Profile does not infer delivery from the presence of a phone number.

## Personal preferences form

### Default follow-up reminder

Use a labeled single-select control with the five approved choices. Explain:

`This is the starting choice for new follow-ups. You can change it before saving each follow-up.`

### Save behavior

1. The page opens in view mode.
2. **Edit preferences** exposes only implemented user-controlled fields.
3. **Save preferences** is disabled until a valid change exists.
4. **Cancel** restores the last committed values.
5. Save sends the current preference version for concurrency protection.
6. A successful save returns the committed version and shows **Preferences saved**.
7. Retry uses the same idempotency reference.
8. Source-controlled values are never included in the preference-save command.
9. A successful preference save creates a safe audit event without storing sensitive values in analytics.

### Leaving with unsaved changes

Show:

1. **Stay and Continue**.
2. **Discard Changes** with confirmation.

There is no server-side draft for profile preferences. Active edits remain only in memory and are cleared at sign out.

### Changed elsewhere

If the preference version changed in another session:

1. Do not overwrite silently.
2. Show the current saved value and the user's unsaved selection.
3. Offer **Use Current Saved Value** or **Review and Save My Selection**.

## Device and session section

Show only information the first-release authentication system can verify:

1. Current signed-in identity.
2. Current session state.
3. Last successful authentication time when approved.
4. Current device category, such as smartphone browser or laptop browser, without invasive fingerprinting.
5. Statement: **Territory Desk clears session-held business data when you sign out.**

Actions:

1. **Sign Out**.
2. **Get sign-in help**.

Do not show password-change, multifactor, recovery-code, remembered-device, or all-session controls unless the selected identity provider supports them and the action routes to the provider's approved experience.

The first release does not invent **Sign out all devices** without a server-enforced session-revocation capability.

## Sign Out

Sign Out:

1. Requires no confirmation when no form has unsaved changes.
2. Prompts about unsaved profile or lead-form changes before proceeding.
3. Revokes or ends the current application session through the selected authentication architecture.
4. Clears session-only fictional drafts, loaded profile details, notification counts, list filters, and cached sensitive views.
5. Returns to the approved sign-in screen.
6. Never displays a password, token, session identifier, or secret in the URL or confirmation.

Signing out does not delete the employee profile, leads, activity, preferences, or submitted reports.

## Prototype persona behavior

A development or preview environment may provide a separate **Demo persona switcher** for testing representative and manager states.

Rules:

1. It is visibly labeled **Demo tools**.
2. It uses fictional identities only.
3. It does not appear inside the production Profile screen.
4. It cannot change a real authenticated user's role or scope.
5. Switching persona clears prior persona state before loading the next fictional scope.

## Source refresh and access changes

### Source profile updated

When a new compatible directory version changes a read-only value:

1. Show **Profile information updated**.
2. Display the new committed source value.
3. Preserve historical handoff snapshots.
4. Do not treat the source update as a user preference change.

### Role or scope changed

1. Stop exposing removed destinations and data immediately.
2. Clear client-held results from the removed scope.
3. Announce **Your access changed. Territory Desk has refreshed your profile.**
4. Route away from an unauthorized current screen to Home or another safe destination.
5. Preserve an audit record without exposing administrative details.

### Account inactive

End access according to the approved authentication policy and show a safe message with **Get sign-in help**. Do not reveal whether another employee account exists.

## Loading, empty, stale, offline, and error states

### Initial loading

Render the page title and stable section placeholders. Do not briefly show the prior user's identity, role, preferences, or contact destination.

### Missing optional profile information

Show **Not provided** or omit optional detail. Do not invent a location, manager, contact method, territory, or verification date.

### Required identity field missing

Show **Profile needs review** and identify the affected capability. Disable new routing or other actions that require the missing field, and offer **Report access problem**.

### Partial source failure

Keep independently validated sections visible. Label the failed section and prevent changes that require an unavailable preference or identity version.

### Stale profile

Show last successful refresh and source version. Read-only context may remain visible if still authorized, but new routing and preference saves revalidate first.

### Offline

1. The fictional prototype may show the last in-memory demo profile with **Offline demo profile**.
2. Production does not persist real employee profile details for offline browsing on a personal phone without security approval.
3. Preference editing and saving are unavailable because identity and version cannot be revalidated.
4. Sign Out remains available and clears local session state.

### Preference load failure

Show identity context when safely available, label preferences unavailable, and provide **Try again**. Do not substitute guessed defaults and then save them as user choices.

### Save failure before commit

Show **Preferences were not saved**, preserve active in-memory input, and allow retry.

### Unknown save result

Recheck the preference version using the same idempotency reference before offering another save. Do not create conflicting preference versions.

### Authorization failure

Clear profile data and route to the safe sign-in or access-required state.

## URL and navigation behavior

1. `/profile` contains no employee name, email, phone, role, department, or preference in the URL.
2. Browser Back returns to the screen that opened Profile when safe.
3. A direct link requires current authentication and loads only the current user's profile.
4. The route accepts no user identifier and cannot be changed to inspect another employee.
5. Closing the mobile secondary menu restores focus to its opener.

## Privacy and security

1. Identity, role, scope, contact destination, and preferences come from authenticated server-authorized responses.
2. The client cannot grant a role or broaden scope by changing a field or request.
3. Work email and SMS destination are masked where full display is unnecessary.
4. Customer information never appears in Profile.
5. Passwords, MFA codes, tokens, provider identifiers, and authentication claims are never displayed or logged.
6. URLs, metadata, analytics, logs, and error breadcrumbs exclude employee contact details and permission scope.
7. Persistent browser storage does not retain real profile details or preference drafts on a personal smartphone without approval.
8. Preference writes are authenticated, authorized, version checked, idempotent, validated, and auditable.
9. Sign Out clears current-session sensitive views.
10. Profile data retention, employee notice, SMS policy, and access review require company approval before production.

## Accessibility

1. Read-only and editable values are programmatically distinguishable.
2. Status and source control do not rely on color alone.
3. Every form control has a persistent label, help text, and error association.
4. Masked contact values have understandable screen-reader labels.
5. Role and scope summaries use lists and headings rather than dense paragraphs.
6. Save results, conflicts, access changes, and errors are announced without moving focus unexpectedly.
7. Touch targets are at least 44 by 44 CSS pixels.
8. The screen remains usable at 200% zoom and large phone text settings.
9. Keyboard order follows identity, access, territory, notifications, preferences, session, and help.
10. Focus returns to Edit preferences or the originating control after dialogs close.

## Analytics boundary

Allowed events include:

1. `profile_opened`.
2. `profile_section_expanded` with safe section category.
3. `profile_preferences_edit_started`.
4. `profile_preferences_saved` with safe preference category, not value.
5. `profile_correction_started` with safe category.
6. `profile_sign_out_selected`.
7. `profile_error_shown` with safe error class.

Never include employee name, email, phone, role scope, exact location, territory list, preference value, source payload, authentication claim, token, or free-text correction narrative.

## Fictional prototype scenarios

Provide fictional scenarios for:

1. Active representative.
2. Authorized manager with personal and manager access.
3. Multiple-role user without impersonation.
4. Source-controlled identity and editable preference distinction.
5. SMS simulation with masked fictional destination.
6. Missing or unverified SMS destination.
7. Work and device timezone difference.
8. Territory or directory mismatch.
9. Preference saved successfully.
10. Concurrent preference change.
11. Save failure and unknown result.
12. Missing required identity field.
13. Partial source failure.
14. Stale and offline state.
15. Mid-session role or scope removal.
16. Inactive account.
17. Sign out with and without unsaved changes.
18. Separate development-only Demo persona switcher.

All displayed identities, contact destinations, locations, roles, territories, and session information are fictional.

## Validation checklist

1. Verify `/profile` can load only the current authenticated user's profile.
2. Verify source-controlled values have no edit control or preference-write path.
3. Verify changing client fields cannot alter identity, role, scope, department, location, timezone, or SMS destination.
4. Verify managers retain personal My Work while receiving only authorized Team Insights scope.
5. Verify in-app required categories cannot be disabled.
6. Verify assignment SMS is simulation-only in prototype and contains no customer data.
7. Verify the default reminder affects only newly created follow-ups and remains overridable.
8. Verify email, push, Outlook sync, customer texting, and unfinished settings do not appear.
9. Verify preference save uses authorization, version, validation, idempotency, and committed-result handling.
10. Verify concurrent changes never overwrite silently.
11. Verify source refresh preserves historical handoff snapshots.
12. Verify role removal clears unauthorized data and navigation immediately.
13. Verify stale, offline, partial, missing-field, unauthorized, save-failure, and unknown-result states fail safely.
14. Verify sign out clears active-session data without deleting server records.
15. Verify URLs, analytics, logs, metadata, cache, and errors preserve profile and authentication privacy.
16. Verify smartphone, laptop, keyboard, screen-reader, touch-target, contrast, zoom, and large-text behavior.
17. Verify production cannot expose the Demo persona switcher.

## Step 2.11f acceptance checklist

- [x] Profile is approved as identity verification and limited personal preferences, not a source-data editor.
- [x] Source-controlled, user-preference, and system-state value classes are approved.
- [x] Identity, role, department, division, location, territory, manager scope, timezone, contact destination, and authentication remain source controlled.
- [x] Default in-app follow-up reminder is approved as the primary editable preference.
- [x] Unimplemented low-value settings remain absent.
- [x] Required in-app events cannot be disabled.
- [x] New-assignment and reassignment SMS remains required in principle, simulated in prototype, and gated by production approval.
- [x] Email, push, Outlook sync, customer texting, and corporate Dynamics alert preferences remain excluded.
- [x] Representative, manager, multiple-role, inactive, and changed-access behavior is approved.
- [x] Territory context, work-timezone, contact masking, and correction paths are approved.
- [x] Preference editing, save, conflict, idempotency, unsaved-change, and failure behavior is approved.
- [x] Current-session and Sign Out behavior is approved without inventing unsupported authentication controls.
- [x] Demo persona switching remains development-only and separate from production Profile.
- [x] Loading, missing, partial, stale, offline, unauthorized, save-failure, and unknown-result states are approved.
- [x] Privacy, security, accessibility, analytics, URL, and fictional-data boundaries are approved.
