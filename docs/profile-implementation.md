# Step 5.3.11 — Profile Implementation

Status: Complete locally and ready for user acceptance

Primary route: `/profile`

Required dependency route: `/signed-out`

## Outcome

My Profile now lets the current fictional user verify the identity, work context, routing context, notification delivery, access roles, and session state Territory Desk is using. It exposes only one implemented user-controlled setting: the default in-app reminder lead time for newly created follow-ups.

The screen does not edit employee identity, role, department, location, manager scope, territory assignment, timezone, email, SMS destination, or authentication state. It does not connect to a company directory, Dynamics 365, Azure, an SMS carrier, or a real identity provider.

## Visible value classes

The interface keeps the approved classes explicit:

1. **Source controlled** — every identity and work field says **Managed by company directory** and has no edit control.
2. **You can change this** — only the implemented default follow-up reminder is editable.
3. **System status** — notification delivery, device category, and session state explain availability without pretending to be preferences.

## Fictional manager and representative profile

The default fictional Avery Morgan profile has one identity with two additive roles:

1. Representative access for personal peer handoffs and My Work.
2. Manager access for aggregate collaboration insights inside the authorized North Location scope.

The user never switches personas, impersonates another representative, grants a role, expands a manager scope, or edits a department or location. A representative-only fixture removes Manager Insights without changing the underlying identity model.

## Identity and routing verification

The screen provides masked, read-only identity and work information plus concise routing context:

1. Masked work email and SMS destination.
2. Department, division, and location.
3. Full work-timezone identifier.
4. Directory status.
5. Distinct Source updated and Last verified timestamps.
6. Active territory-assignment count, region, department context, and compatible source versions.

Directory and territory version mismatch produces **Routing profile needs review**, links to Data Status, and provides no override.

## Notification delivery

The screen separates channels:

1. In-app notifications are Available and required workflow categories cannot be disabled.
2. Territory Desk SMS is **Simulation only** with a masked fictional destination.
3. SMS is limited to assignment and reassignment intent.
4. Customer details are explicitly excluded.
5. No SMS, email, push, Outlook, customer-texting, or Dynamics preference toggle appears.

## Personal preference workflow

The reminder preference supports:

1. View mode before editing.
2. The five approved reminder choices.
3. Save disabled until a valid change exists.
4. Cancel restoring the committed value.
5. Version-checked saves.
6. Stable idempotency references for retry.
7. Persistent success confirmation.
8. Definite failure with the unsaved selection preserved.
9. Unknown-result locking and recheck.
10. Concurrent-change comparison without silent overwrite.

The save command contains only the reminder preference, record version, and idempotency reference. Source-controlled values have no preference-write path.

## Unsaved changes and Sign Out

1. Internal navigation is blocked while a reminder change is unsaved.
2. **Stay and Continue** returns to the form.
3. **Discard Changes** proceeds to the requested destination.
4. Sign Out is immediate when nothing is unsaved.
5. Sign Out with unsaved work requires **Discard Changes and Sign Out**.
6. The fictional session service clears in-memory command state and navigates to `/signed-out`.
7. A minimal safe signed-out route was registered so Profile never lands on Page Not Found.

Real server session invalidation, Back-cache enforcement, multi-tab revocation, and provider-backed sign-in remain part of the later authentication/system-pages implementation.

## Failure and privacy states

Automated scenarios cover:

1. Unauthorized direct access with no identity, contact, or role disclosure.
2. Whole-profile loading failure without prior identity reuse.
3. Preference-only loading failure without guessed defaults.
4. Representative-only and manager access.
5. Routing-version mismatch.
6. Save failure, conflict, unknown result, and idempotent success.
7. Offline read-only behavior with editing disabled and Sign Out retained.
8. Sign Out with and without unsaved changes.

The `/profile` URL accepts no employee identifier or profile values. Customer information, passwords, tokens, provider claims, full contact information, employee lists, and source payloads are excluded.

## Responsive and accessibility verification

Browser QA completed at:

1. Smartphone: 390 × 844 CSS pixels.
2. Laptop: 1440 × 900 CSS pixels.

Verified results:

1. No horizontal overflow at either size.
2. Smartphone composition uses one stacked reading order.
3. Laptop composition uses a 725-pixel primary column and 374-pixel secondary column within the app shell.
4. No visible Profile button or link falls below the approved 44-pixel target.
5. The unsaved-change dialog fits the phone viewport and its controls are 44 to 50 pixels high.
6. Manager scope stays summarized and does not list individual employees.
7. Status meanings use visible text rather than color alone.
8. The masked SMS value has an understandable accessible label.
9. Browser QA identified and corrected a stale device-category label; it now changes from Smartphone browser to Laptop browser when the viewport changes.

## Final verification

1. 174 application tests across 36 test files.
2. 26 environment, security-matrix, contrast, and PWA tests.
3. ESLint and TypeScript validation.
4. Prettier format validation.
5. Successful production build transforming 178 client modules.
6. Static preview generation with the GitHub Pages fallback.

## Deferred by design

1. Real employee profile and authentication data.
2. Real company-directory corrections.
3. Provider-backed session invalidation and sign-in.
4. SMS provider activation or delivery confirmation.
5. Email, browser push, Outlook, customer texting, Dynamics, theme, language, layout, sound, and vibration settings.
6. Production demo-persona switching.
7. GitHub publication or modification of the original application.
