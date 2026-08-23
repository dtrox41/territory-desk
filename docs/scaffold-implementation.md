# Step 5.1 — Application Scaffold Implementation

Status: Implementation complete locally; awaiting user approval

Date: 2026-08-22

## Outcome

Territory Desk now has a separate, runnable application foundation. It does not modify, import code from, or share Git history with the original `territory-lookup` application.

The scaffold is deliberately small. It establishes the framework, safety boundary, design tokens, test layers, and GitHub Pages build path without prematurely implementing the approved application shell or product screens.

## Locked foundation

| Area | Implementation |
| --- | --- |
| Runtime | React 19.2.8 and React DOM 19.2.8 |
| Routing | React Router 8.3.0 Framework Mode |
| Rendering | SPA mode with `ssr: false` |
| Build | Vite 8.2.2 |
| Language | TypeScript 5.9.3 with strict checks |
| Package manager | pnpm 11.19.0 with exact dependency versions |
| Unit/component testing | Vitest 4.1.11 and Testing Library |
| Browser testing | Playwright 1.62.1 with desktop Chromium, Pixel 7 Chromium, and iPhone 15 WebKit projects |
| Accessibility automation | `eslint-plugin-jsx-a11y`, Axe Playwright, semantic component tests, and token-contrast tests |
| Formatting | Prettier 3.9.6 |
| Static analysis | ESLint 9.39.5 and TypeScript ESLint 8.67.0 |

`eslint-plugin-jsx-a11y` 6.10.2 currently declares ESLint compatibility through major version 9, so ESLint is intentionally pinned to the latest compatible 9.x release instead of combining the plugin with an unsupported ESLint 10 configuration. This is development tooling only. Recheck the compatibility range before the protected pilot.

## Implemented structure

```text
app/
  root.tsx                 document shell and global system boundaries
  routes.ts                typed route manifest
  routes/
    home.tsx               temporary fictional foundation route
    home.module.css        route-local presentation
    home.test.tsx          semantic component test
  styles/
    tokens.css             approved Step 4.3 CSS tokens
  app.css                  global reset, focus, system, and reduced-motion rules
  test/setup.ts            shared component-test setup
e2e/
  scaffold.spec.ts         responsive render and automated Axe smoke test
scripts/
  check-environment.mjs    exact environment safety gate
  prepare-static-preview.mjs
tests/
  check-design-token-contrast.test.mjs
```

Root-level configuration covers React Router, Vite, Vitest, Playwright, TypeScript, ESLint, Prettier, pnpm, and Git ignore behavior.

## Safety behavior

1. The temporary screen identifies itself as a fictional prototype.
2. No employee, customer, lead, Dynamics, provider, or production data is present.
3. No web font, analytics script, external image, corporate logo, or third-party runtime asset is loaded.
4. No local-storage, session-storage, cookie, service-worker, database, or API persistence is implemented.
5. No authentication claim, real SMS, email, calendar, Dynamics, or production integration is implemented.
6. Environment validation fails closed when Preview is combined with real data, live services, production persistence, or unapproved client-visible settings.

## GitHub Pages behavior

Preview builds use both:

- Vite base path `/territory-desk/` for assets.
- React Router basename `/territory-desk/` for navigation.

The trailing slash is intentional. React Router 8.3 checks that its basename begins with the Vite base during the SPA fallback build.

After React Router generates `build/client/index.html`, `scripts/prepare-static-preview.mjs` copies it to `build/client/404.html`. GitHub Pages supports a custom `404.html`; using the SPA document as that fallback allows a direct project-route request to hydrate through React Router instead of showing an unrelated GitHub 404 page. Canonical route-by-route refresh testing remains a Step 5.4 and deployment gate after those routes exist.

Only `build/client` is eligible for a future fictional Preview deployment. `build/server`, source files, local caches, reports, traces, and environment files are not deployment artifacts.

## Quality commands

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

`pnpm check` combines format, lint, type checking, Node safety/contrast tests, component tests, and the production build.

## Verification evidence

- Formatting: passed.
- ESLint: passed.
- Strict TypeScript and React Router type generation: passed.
- Environment safety and design-token tests: 24 passed.
- Component tests: 1 passed.
- Production SPA build: passed.
- Preview environment safety matrix: passed.
- Preview base-path build: passed and generated both `index.html` and `404.html`.
- Built asset references: correctly rooted at `/territory-desk/assets/`.
- Browser inspection at `/territory-desk/`: correct title, heading, prototype disclosure, and no browser console warnings or errors.
- Responsive inspection: no horizontal overflow at 320 or 390 CSS pixels; content is bounded on a 1440-pixel laptop viewport.
- External runtime assets: none.
- Credential and prohibited-data string scan: passed for project source and built first-party content.

The three-project Playwright suite is defined and discoverable. This Codex macOS execution sandbox blocked standalone Chromium and WebKit processes before the application opened, so it could not provide a valid browser-test result here. That is an execution-environment limitation, not a passed test. Equivalent read-only smoke, console, subpath, and responsive checks were completed in the authorized in-app browser. The Playwright suite must run successfully in the future GitHub workflow before a Preview release is accepted.

## Deliberately excluded

- Application shell navigation and icons — Step 5.2.
- Product screens and fictional workflow data — Step 5.3.
- GitHub workflow, Pages configuration, remote repository creation, push, or deployment — requires a separate approved repository connection step.
- Real authentication, employee access, production hosting, database, SMS, Outlook/Graph, or Dynamics — blocked by the approved architecture gates.
- Tailwind, a component library, state-management package, icon package, analytics SDK, service worker, or web font — no current requirement justifies them.

## Step 5.1 acceptance checklist

- [x] Separate React/TypeScript/Vite application created.
- [x] React Router Framework Mode configured as a static SPA.
- [x] Required dependencies installed with exact versions.
- [x] Formatting, linting, strict type checking, unit/component testing, browser-test configuration, and contrast testing added.
- [x] Approved design tokens implemented centrally.
- [x] Global semantic document, focus, fallback, and error boundaries implemented.
- [x] Fictional-data and environment safety boundaries preserved.
- [x] Local root build and `/territory-desk/` Preview build succeed.
- [x] GitHub Pages asset and 404 fallback artifacts are generated correctly.
- [x] Original repository and GitHub remain unchanged.
- [x] Step 5.2 has not started.

## Next decision

Approve Step 5.1 before implementation proceeds to Step 5.2, the responsive application shell.

## Primary references

- React Router SPA Mode: https://reactrouter.com/how-to/spa
- React Router framework configuration: https://reactrouter.com/api/framework-conventions/react-router.config.ts
- Vite guide: https://vite.dev/guide/
- GitHub Pages custom 404 page: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site
