# Step 5.5 — Separate Repository and Fictional Preview Deployment

Status: Prepared locally; GitHub publication and live verification pending

Implementation date: August 24, 2026

## Release boundary

- Target repository: `dtrox41/territory-desk`.
- Target URL: `https://dtrox41.github.io/territory-desk/`.
- Repository and site are public because GitHub Free supports Pages for public
  repositories and this artifact contains fictional prototype content only.
- The original `territory-lookup` repository, history, Pages configuration, and
  website remain out of scope and must not be modified.
- No Azure, database, protected API, real sign-in, Dynamics connection, email,
  or live SMS provider is present.

## Deployment gate

Every push to `main`, plus an explicitly requested manual run, must finish the
following sequence before the deploy job becomes eligible:

1. Check out the exact source revision without retaining Git credentials.
2. Install the exact Node.js and pnpm versions and the frozen lockfile.
3. Pass format, lint, strict type, environment, component, and unit checks.
4. Install Chromium and WebKit in CI and pass the laptop, Android-size, and
   iPhone-size Playwright matrix.
5. Inject the exact source commit and UTC release timestamp as public metadata.
6. Validate the exact fictional Preview environment contract.
7. Build for the `/territory-desk/` repository subpath.
8. Reject artifacts with a mismatched SPA fallback, source maps, private or
   secret-like paths, credential markers, server-only configuration names,
   non-fictional email domains, missing disclosure, missing release metadata,
   or unexpected size.
9. Upload only `build/client`; source, environment files, test output, local
   imports, and dependency directories are never part of the Pages artifact.
10. Deploy through the protected `github-pages` environment only after the
    verification job succeeds.

The GitHub-owned actions are pinned to immutable full commit SHAs. Their release
tags remain in comments for maintenance review.

## Local verification evidence

- Formatting, ESLint, React Router type generation, and strict TypeScript pass.
- 32 environment, contrast, PWA, and artifact checks pass.
- 226 application tests pass across 44 files.
- The Preview environment contract and production build pass with 222 client
  modules.
- The generated Preview contains 86 files totaling 967,923 bytes and passes the
  artifact scanner.
- Playwright defines 24 scenarios across desktop Chromium, mobile Chromium, and
  mobile WebKit. The matching browser binaries were downloaded, but this local
  macOS workspace denied browser process registration before test code could
  run (`MachPortRendezvousServer: Permission denied`). The Ubuntu GitHub Actions
  run is therefore a mandatory release gate, not an optional duplicate check.

## One-time GitHub configuration

1. Create a new public repository named `territory-desk` in the `dtrox41`
   account without importing, forking, templating, or renaming the original.
2. Push this repository's independent `main` history to the new empty remote.
3. In the new repository only, open **Settings → Pages** and select **GitHub
   Actions** as the publishing source.
4. Do not add repository secrets for this fictional Preview. The workflow uses
   only GitHub's short-lived workflow identity and public build metadata.
5. Allow the first workflow run to complete before opening the site.

## Required live verification

Publication is incomplete until all of the following pass at the live URL:

- GitHub Actions shows both `Verify public artifact` and `Deploy verified
  Preview` as successful for the same source commit.
- The visible build stamp matches the deployed commit and contains a release
  timestamp.
- Home and every canonical route load under `/territory-desk/`.
- Direct opening and refresh of a protected route return safely through the
  fictional sign-in flow.
- Browser Back after sign-out does not restore protected content.
- A non-existent route renders the app's safe Page Not Found state through the
  matching `404.html` fallback.
- Manifest, icons, service worker, JavaScript, and CSS resolve under the
  repository subpath without console errors.
- A 390 × 844 smartphone viewport and a 1440 × 900 laptop viewport have no
  horizontal overflow or obstructed primary actions.
- The public repository, workflow logs, downloaded Pages artifact, and site
  contain no real employee/customer information or supplied credentials.

## Rollback

GitHub retains the source commit and workflow run for every deployment. If a
Preview regression is found, fix or revert it in this new repository and let
the same gates deploy the corrected commit. Never roll back by publishing files
from the original application or bypassing the verification job.
