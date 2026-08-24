# Step 5.3.3a — Apple and Android PWA Foundation

Status: implemented locally in the separate Territory Desk repository.

## Outcome

Territory Desk now has a production-only Progressive Web App foundation that
can be installed from supported iPhone and Android browsers while retaining the
existing responsive laptop workspace.

## Included

- A base-path-safe web app manifest for GitHub Pages project URLs.
- 180, 192, and 512 pixel application icons plus a maskable Android icon.
- Standalone display, application name, theme, and Apple Home Screen metadata.
- Android install prompting when the browser confirms installability.
- iPhone Safari instructions for Share → Add to Home Screen.
- Safe-area-aware mobile shell behavior already established in Step 5.2.
- A production-only service worker with an offline fallback.
- A strict no-API-cache rule so future `/api/` requests are not stored.
- Home Screen shortcuts for Send Lead, My Leads, and Territory Lookup.
- Automated manifest and required-asset checks.

## Deliberate boundaries

- This is an installable PWA, not an Apple App Store or Google Play binary.
- The service worker caches the static application shell only. It does not make
  lead submission work offline and must not cache future employee, customer, or
  Dynamics payloads.
- GitHub Pages remains a fictional-data preview environment. Production
  authentication, SMS, push delivery, and Dynamics integration still require a
  company-approved secure backend and governance review.
- No Azure dependency or paid package was added.

## Installation checks

### iPhone

1. Open the deployed HTTPS URL in Safari.
2. Tap Share.
3. Tap Add to Home Screen.
4. Confirm the Territory Desk icon and name.
5. Launch from the Home Screen and confirm standalone display.

### Android

1. Open the deployed HTTPS URL in Chrome.
2. Use the in-app Install action when offered, or Chrome’s Install app menu.
3. Confirm the Territory Desk icon and name.
4. Launch from the Home Screen and confirm standalone display.

### Laptop

1. Open the same URL at 1024 pixels or wider.
2. Confirm the permanent navigation rail and laptop workspace remain intact.
3. Confirm the smartphone install guide is not displayed.

## Completion gate

Before public testing, run the full project check and test the production build
at both the GitHub Pages base path and the repository root path. Physical-device
installation remains a release verification task because browser emulation
cannot prove Home Screen installation behavior.
