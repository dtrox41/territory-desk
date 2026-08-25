# Step 5.4 — Integration and Release Verification

Status: Implemented locally and awaiting user acceptance

Implementation date: August 24, 2026

GitHub status: Not published. This local repository has no configured remote,
and Step 5.4 does not modify the original application.

## Objective

Connect the accepted fictional screens into one coherent representative and
manager experience, then verify the static Preview boundary before any GitHub
publication decision.

## Pressure-test finding corrected

The individual product and system screens were complete, but two application
integration assumptions were false:

1. `AppLayout` still hard-coded the manager shell variation.
2. Protected routes could render without the fictional sign-in flow.

That combination would have shown Manager Insights navigation to every visitor,
allowed a representative to enter the manager route directly, and made the
signed-out and return-path specifications cosmetic. Step 5.4 corrects those
gaps rather than adding another feature.

## Implemented integration

### One fictional session boundary

- `FictionalSessionProvider` resolves the selected demo persona before any
  protected route renders.
- Session state has three explicit conditions: loading, signed out, and
  authenticated.
- The adapter exposes a cloned session snapshot and clears it on sign-out.
- Session state remains in memory only. No cookie, local storage, session
  storage, service-worker cache, URL token, credential, or identity claim is
  created.
- A full browser refresh deliberately requires demo-persona selection again.

### Safe protected-route return

- A signed-out protected route redirects to `/sign-in` with an allowlisted,
  path-only return destination.
- Query strings and fragments are not transferred across the sign-in boundary.
- External URLs, protocols, traversal, encoded traversal, unknown paths, and
  unrestricted values continue to fall back to Home.
- Protected content stays replaced by a neutral loading screen while session
  resolution is incomplete.

### Representative and manager separation

- The selected session—not a hard-coded UI flag—controls whether Manager
  Insights appears in the shell.
- `/insights` separately denies a representative or data-exception persona and
  never renders manager data for that session.
- The Profile service is created from the same session role, preventing the
  representative shell and profile from contradicting each other.
- A manager keeps personal My Work and receives only the separately scoped Team
  Insights destination.

### Sign-out behavior

- The signed-out route clears the shared fictional session even when entered
  directly.
- Profile sign-out clears profile-held demo state, navigates with replacement,
  and triggers the shared session refresh.
- Browser Back after sign-out returns to safe sign-in rather than restoring the
  protected manager or representative workspace.

## Integrated browser scenarios

The scripted browser suite now contains 24 scenarios across desktop Chromium,
mobile Chromium, and mobile WebKit. In addition to the existing dashboard,
territory, directory, lead-creation, and Leads checks, it now covers:

1. Representative denial of the manager route.
2. Sign-out and subsequent protected-route enforcement.
3. Safe manager sign-in return to Team Insights.
4. Protected-route refresh and return through fictional sign-in.

The local Playwright runner could list all 24 scenarios. Executing its browser
process locally remains unavailable because the matching Playwright browser
binary is not installed. No browser download was added to the project. These
same critical interactions were executed through the authorized local browser
preview; the installed Playwright matrix remains a required CI gate before
publication.

## Verification evidence

- Formatting: passed.
- ESLint: passed.
- React Router type generation and strict TypeScript: passed.
- Environment, contrast, and PWA tests: 26 passed.
- Application tests: 223 passed across 43 test files.
- New session-integration tests: loading privacy, safe return, representative
  shell, manager denial, manager authorization, sign-out, and Back behavior all
  passed.
- Production build: passed with 220 transformed client modules.
- Direct local route response sweep: 30 canonical and fallback paths returned
  the static application document.
- Smartphone browser QA: 390 × 844 representative dashboard and protected
  route return passed.
- Laptop browser QA: 1440 × 900 manager Team Insights and persona-matched
  Profile passed.
- Sign-out browser QA: protected content did not reopen through Back.
- GitHub Pages Preview environment: safety validation passed with exact
  `/territory-desk/` base path.
- Preview artifact: `index.html` and `404.html` match; base-path assets resolve;
  direct `/territory-desk/leads` returns through sign-in to Leads; browser
  warning/error log is clear.
- Artifact scan: supplied credentials, bearer markers, private-key markers,
  database configuration names, Dynamics secret names, and SMS provider-key
  names were absent from `build/client`.

The repeated `EMFILE` notices occur after successful compilation because the
local environment reaches its file-watcher limit. They did not fail or alter
the generated build.

## Remaining release gates

Step 5.4 does not authorize publication or employee use. Before the fictional
Preview is published:

1. The user must accept Step 5.4.
2. A separate GitHub repository under the confirmed account must be explicitly
   connected; the original repository remains read only.
3. The full 24-scenario installed-browser CI matrix must pass.
4. The final Preview artifact scan and GitHub Pages route-refresh smoke test
   must pass in the deployment workflow.

Before any protected employee pilot, Cintas must additionally approve identity,
authorization, hosting, data handling, SMS, support ownership, security,
accessibility evidence, physical-device testing, and Dynamics boundaries.

## Acceptance checklist

- [x] Step 5.3.13 was accepted before Step 5.4 began.
- [x] No protected route renders while fictional session state is unresolved.
- [x] Direct protected links use one safe, allowlisted return path.
- [x] Representative and manager navigation derive from the selected persona.
- [x] Representative access to Team Insights fails closed.
- [x] Profile role presentation matches the selected persona.
- [x] Sign-out clears the shared session and browser Back remains safe.
- [x] No persistent browser session or fake production authentication was added.
- [x] GitHub Pages base-path and 404-fallback artifacts were verified locally.
- [x] No GitHub remote, deployment, original-app change, or live integration was
      introduced.
- [ ] User accepts Step 5.4 before Preview publication setup begins.
