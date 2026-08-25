# Authentication and System Pages Implementation

Status: Implemented locally for Step 5.3.13

Implementation date: August 24, 2026

GitHub status: Not published. The repository has no configured remote, and this
step does not modify the original app.

## Delivered experience

The fictional public prototype now includes:

1. `/sign-in` — credential-free fictional demo entry.
2. `/auth/return` — pending-demo validation and safe return completion.
3. `/sign-in/help` — privacy-minimized sign-in recovery.
4. `/session-expired` — protected-write stop and reauthentication guidance.
5. `/access-required` — accepted identity without an approved application
   profile.
6. `/access-denied` — generic route, scope, record, or action denial.
7. `/account-unavailable` — non-enumerating account-unavailable state.
8. `/signed-out` — session-end confirmation and shared-device guidance.
9. `/offline` — canonical full-page connection recovery.
10. `/maintenance` — safe service-interruption guidance.
11. `/update-required` — incompatible-client write blocking and refresh
    guidance.
12. `/not-found` and the catch-all route — generic non-disclosing destination
    failure.
13. `/error` and the root error boundary — safe failed, succeeded, or
    unknown-result recovery.
14. `/access-changed` — removed-scope clearing and authorized reload guidance.
15. `/unsupported-browser` — capability guidance without device
    fingerprinting.
16. The neutral global startup fallback, which does not render prior identity,
    navigation, counts, or protected content while application state is
    unknown.

## Fictional demo access

The sign-in screen offers three visibly fictional personas:

- New Business Representative.
- Authorized Manager with limited Team Insights scope.
- Data-Exception Representative.

No email, password, one-time code, recovery code, token, self-registration,
Remember Me option, SSO claim, or biometric claim appears. Selecting a new
persona clears the prior fictional session before the pending persona is
completed.

The prototype requests no notification, location, camera, microphone, contacts,
or calendar permission at sign-in.

## Safe return and disclosure controls

- Only allowlisted relative application paths are accepted after fictional
  sign-in.
- External URLs, protocol-relative URLs, script schemes, encoded traversal,
  path traversal, unknown routes, query strings, and fragments fall back to
  Home.
- The authentication-return screen does not display a token, authorization
  code, claim, password, callback URL, or raw provider error.
- Access Required, Access Denied, Account Unavailable, Not Found, and direct
  authentication-return failure do not enumerate an employee, account, role,
  customer, lead, or protected-record existence.
- Authentication metadata contains only generic route and state descriptions.

## Session and recovery boundaries

- Session-expired state stops protected writes and does not create an offline or
  delayed command queue.
- Unsaved-work recovery is permitted only for the same identity, current
  authorization, compatible versions, deliberate review, and the original
  idempotency reference.
- The signed-out screen explains that browser Back must not restore protected
  content.
- Access-change state explains that removed-scope manager, employee, lead, and
  notification information has been cleared.
- Unexpected-error state distinguishes definite failure, definite success, and
  unknown outcome; the unknown route defaults to the safest unknown-result
  guidance.

## PWA route-collision correction

Visual route testing found that the static PWA `offline.html` asset intercepted
the canonical `/offline` application route through clean-URL resolution.

The static fallback was renamed to `offline-fallback.html`, the service worker
cache was advanced to `territory-desk-shell-v2`, and the PWA foundation test was
updated. The final verification confirms:

- `/offline` renders the canonical application system page while online.
- `offline-fallback.html` remains available to the service worker when the app
  shell cannot be retrieved.
- The service worker still creates no offline mutation queue.

## Verification completed

- Prettier formatting check: passed.
- ESLint: passed.
- TypeScript and React Router type generation: passed.
- Environment and PWA tests: 26 passed.
- Application tests: 217 passed across 42 test files.
- Focused authentication and system-page tests: 25 passed.
- Production build: passed with 218 transformed client modules.
- Phone browser QA at 390 × 844: no horizontal overflow and no interactive
  target below 44 × 44 CSS pixels.
- Laptop browser QA at 1440 × 900: centered 720-pixel authentication card, no
  horizontal overflow, and no undersized controls.
- Fictional representative/manager persona transition: passed.
- All canonical authentication and system routes: resolved with the expected
  non-sensitive heading.

The repeated `EMFILE` notices occur after successful compilation because of the
local environment's file-watcher limit. They do not fail or alter the generated
build.

## Production controls intentionally not faked

The GitHub Pages prototype is public and cannot provide production employee
authentication or record authorization. A production release remains blocked
until Cintas approves and implements:

1. Company identity provider and authentication method.
2. Protected backend or backend-for-frontend session service.
3. Server-side route, role, scope, record, and command authorization.
4. Secure cookie, CSRF, session-rotation, expiration, and revocation policy.
5. Multi-tab and concurrent phone/laptop session policy.
6. Identity-support owner and approved contact guidance.
7. Security headers, rate limiting, audit logging, incident response, privacy,
   retention, and deployment controls.
8. Production hosting separate from the public fictional GitHub Pages build.

No Azure service or paid identity provider was selected or provisioned during
this step.
