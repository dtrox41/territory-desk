# Frontend Architecture

Status: Approved for Step 3.1

Decision scope: Frontend only. This step does not select the production backend, database, identity provider, SMS provider, Dynamics integration, or deployment host.

## Recommended architecture

Build Territory Desk as one responsive web application using:

1. React.
2. TypeScript in strict mode.
3. React Router Framework Mode.
4. Vite through the React Router build pipeline.
5. SPA Mode for the fictional prototype.
6. Semantic HTML, CSS Modules, and shared CSS custom-property design tokens.
7. Typed service interfaces with a fictional in-memory adapter first and a protected HTTP adapter later.
8. Vitest and React Testing Library for logic and component tests.
9. Playwright for full-route, smartphone, laptop, browser, and accessibility-structure tests.

The repository will pin exact compatible package versions in the lockfile when implementation begins. Architecture approval does not hard-code a floating `latest` version into production.

## Why this is the strongest fit

### One application for both devices

The product requirements define one workflow and one route model across smartphone and laptop. A responsive web application preserves that model without building and maintaining separate iOS, Android, and laptop applications.

### Route contract becomes executable structure

React Router Framework Mode supports route modules, typed route parameters, nested layouts, pending states, error boundaries, and route-level code splitting. It can represent the approved canonical routes without duplicating routing logic across screens.

### Prototype and production do not require a frontend rewrite

The fictional prototype can run in SPA Mode with client loaders and client actions. Later, the same route and component structure can call a protected HTTP service or adopt server rendering if an approved production architecture needs it.

### TypeScript protects workflow rules

Strict domain types will represent statuses, ownership, action owners, source versions, notification states, and permission-derived views. Invalid state names and missing required fields should fail during development instead of becoming silent runtime behavior.

### Vite keeps iteration fast without choosing a production vendor

The frontend build remains portable. Vite creates optimized static client assets and does not force the project to use Vercel, Cloudflare, Azure, GitHub Pages, or another host.

## Pressure-tested alternatives

| Option | Advantage | Material weakness for Territory Desk | Decision |
| --- | --- | --- | --- |
| Plain HTML, CSS, and JavaScript | Few dependencies | Screen-state, workflow, route, permission, and component duplication would grow quickly and become difficult to test | Reject |
| React plus manually configured Vite and basic routing | Simple initial setup | We would have to assemble route typing, loading, mutation, error, and code-splitting conventions ourselves | Reject in favor of React Router Framework Mode |
| Next.js | Strong full-stack capabilities | Selects more server and hosting architecture than Step 3.1 needs and adds features this internal workflow does not yet require | Defer unless Phase 3 reveals a server-specific need |
| React Native or Expo | Native mobile capability | Adds native distribution and a separate laptop-web strategy even though one responsive workflow is required | Reject for the first release |
| No-code or Power Apps | Fast basic forms and possible enterprise integration | Tenant permissions, licensing, design control, testability, route contract, and long-term portability are unresolved | Reject as the core implementation path |
| Progressive Web App immediately | Installable shell and offline capabilities | Service-worker caching introduces update, stale-data, and protected-data risks before the core workflow is stable | Defer PWA behavior |

## Rendering and hosting boundary

### Prototype mode

1. Use React Router SPA Mode.
2. Use fictional personas and fictional business records only.
3. Use client loaders and client actions against the fictional adapter.
4. Do not embed production credentials or protected data.
5. Do not claim browser-only demo identity is secure authentication.

### Production-ready frontend mode

1. The browser calls a protected same-origin or explicitly approved API.
2. The server enforces authentication, authorization, session, record access, transitions, and idempotency.
3. The browser never receives unauthorized employee, customer, lead, or manager data.
4. The frontend does not contain provider secrets or Dynamics credentials.
5. Production identity and data delivery remain blocked until later Phase 3 decisions and company approval.

### Direct-link hosting requirement

The approved route contract uses normal paths such as `/leads/:leadId`, not hash routes such as `/#/leads/...`. The preview and production hosts must therefore direct valid application paths to the SPA entry document while preserving the visible path.

GitHub Pages does not provide a general SPA rewrite rule. It may be used only with a tested fictional-prototype fallback technique, and it remains disallowed as the production security boundary. The permanent preview and production hosting choice belongs to Step 3.5.

## Frontend state ownership

Use the narrowest correct owner for each kind of state:

| State | Owner | Examples |
| --- | --- | --- |
| Safe shareable navigation state | Approved URL path, fragment, or allowlisted query parameter | lead ID, Help topic, Action Required view, Data Status source |
| Route data and route mutation state | React Router route module | list loading, lead detail, form submission, revalidation, route error |
| Short-lived screen interaction | Component state | open disclosure, selected tab before navigation, confirmation dialog |
| Current authenticated shell context | Root route context after server verification | authorized profile summary, role capabilities, environment label |
| Business records | Service adapter and later server | handoffs, activity, follow-ups, notifications, territory assignments |

Rules:

1. Do not add Redux, Zustand, or another global store unless implementation evidence demonstrates a state problem that route and component state cannot solve.
2. Do not place customer data, contact information, lead drafts, tokens, sessions, roles, or permissions in `localStorage` or `sessionStorage`.
3. Do not infer authorization from hidden controls or client state.
4. URL state must follow the approved allowlist and privacy contract.
5. Browser Back, focus restoration, and direct-link behavior must come from the canonical route contract.

## Data and service boundary

Frontend screens depend on TypeScript service interfaces rather than importing mock arrays or vendor SDKs directly.

Initial adapters:

1. `fictional` — deterministic in-memory data, simulated latency, safe failure scenarios, and no network writes.
2. `http` — placeholder contract for a later protected application API; not implemented or connected in Step 3.1.

Every route must receive its data through the service boundary. Replacing fictional data later should not require rewriting page composition or workflow components.

The client may validate input for immediate feedback, but later production commands must always repeat validation and permission checks on the server.

## Component architecture

Use four layers:

1. **Application shell** — authenticated layout, top bar, mobile bottom navigation, laptop navigation, notification access, profile access, route boundaries, and global system state.
2. **Route screens** — one module for each canonical route or approved route family.
3. **Feature components** — territory results, lead cards, action queue, activity timeline, follow-up editor, collaboration insights, and notification cards.
4. **Foundation components** — button, link, input, select, text area, field error, card, status badge, dialog, sheet, toast, skeleton, empty state, and error state.

Foundation rules:

1. Prefer native semantic controls.
2. Preserve visible focus and full keyboard operation.
3. Use a narrowly selected accessible headless primitive only when a complex pattern cannot be implemented safely with native controls.
4. Do not adopt a pre-styled component library that forces a generic visual identity before Phase 4 defines the design system.
5. Icons supplement visible text and never replace required navigation labels.

## CSS and responsive architecture

1. Use shared CSS custom properties for color, typography, spacing, radius, shadow, border, motion, layer, and control-size tokens.
2. Use CSS Modules beside route and feature components for bounded styles.
3. Start with the smartphone composition and enhance layout through content-driven media queries.
4. Keep the same labels, information hierarchy, permissions, and commands on smartphone and laptop.
5. Use grid or flex layout without fixed device-specific pixel positioning.
6. Support browser zoom, dynamic text, safe areas, touch input, keyboard input, reduced motion, forced colors, and high contrast.
7. Do not introduce Tailwind or a large design-system package unless Phase 4 demonstrates a measurable advantage.

## Forms and workflow commands

1. Use real HTML forms and labeled controls.
2. Keep lead-creation draft data in active memory only for the prototype.
3. Warn before abandoning a changed form.
4. Send commands through route actions or the typed service interface.
5. Include an idempotency identifier on create and transition commands once a real API exists.
6. Separate client validation, server validation, authorization, and recorded business outcome.
7. Never treat opening an external email, telephone, text, or calendar application as proof that an action completed.

## PWA and weak-connection strategy

PWA configuration is deferred until the core routed UI and update behavior are stable.

When introduced:

1. The manifest may make the application installable.
2. The service worker may cache versioned application-shell assets and the privacy-safe offline page.
3. It must not cache protected API responses, customer records, employee contacts, lead details, manager insights, or unsent drafts in the first release.
4. The application remains online-first and displays freshness and connection state.
5. Mutations fail safely with retry and idempotency; the service worker must not invent an offline write queue.
6. Update Required prevents incompatible old client code from mutating newer server data.

## Test architecture

### Required automated layers

1. TypeScript type-checking in strict mode.
2. ESLint for React, accessibility-safe conventions, imports, and unsafe code patterns.
3. Vitest for deterministic domain rules, ranking, dates, permissions, and adapter behavior.
4. React Testing Library for user-visible component behavior, labels, focus, validation, loading, and error states.
5. Playwright for full workflows, canonical routes, Back behavior, direct links, smartphone composition, laptop composition, Chromium, WebKit, and company-browser targets once confirmed.

### Required continuous checks

Run these before accepting a build increment:

1. Format check.
2. Lint.
3. Type-check.
4. Unit and component tests.
5. Production build.
6. Targeted end-to-end smoke tests.
7. No-secret and fictional-data checks.

## Proposed source structure

```text
app/
  components/
    foundation/
  features/
    activity/
    directory/
    follow-ups/
    insights/
    leads/
    notifications/
    territory/
  domain/
  routes/
  services/
    fictional/
    http/
  styles/
  test/
  root.tsx
  routes.ts
public/
docs/
```

Feature folders may contain components and feature-specific tests, but shared business definitions remain in `domain`, and vendor access remains behind `services`.

## Dependency restraint

The initial scaffold should not include:

1. Redux or another global state library.
2. A charting library before approved insights require a chart.
3. A date library before native `Intl` and explicit timezone rules are evaluated.
4. A full UI theme package.
5. A real authentication SDK.
6. A Dynamics SDK.
7. An SMS SDK.
8. A service worker or offline database.

This keeps the prototype understandable and avoids selecting production vendors through frontend dependencies.

## Risks and controls

| Risk | Control |
| --- | --- |
| Framework complexity | Use documented Framework Mode conventions; do not add custom routing abstractions |
| Static-host direct-link failures | Require SPA path rewriting or a tested fictional-only fallback before deployment |
| Mock implementation leaks into production | Enforce environment modes and separate fictional and HTTP adapters |
| Sensitive browser persistence | Prohibit protected records, drafts, sessions, and tokens from browser storage and service-worker caches |
| Inconsistent mobile and laptop behavior | Use one route/component model and test both compositions |
| Dependency sprawl | Add packages only for an approved requirement and record why |
| Client-side rule bypass | Repeat every consequential rule and permission check on the future server |
| Stale installed client | Add version compatibility and Update Required before PWA release |

## Step 3.1 acceptance checklist

- [x] React, TypeScript strict mode, React Router Framework Mode, and its Vite pipeline are approved.
- [x] SPA Mode is approved for the fictional prototype.
- [x] One responsive web application is approved for smartphone and laptop.
- [x] Semantic HTML, CSS Modules, and design tokens are approved.
- [x] Typed fictional and future HTTP service-adapter boundaries are approved.
- [x] Route, component, and business-record state ownership is approved.
- [x] No general global-state library is added initially.
- [x] Vitest, React Testing Library, and Playwright are approved.
- [x] PWA configuration is deferred until the routed UI is stable.
- [x] Future service-worker caching excludes protected records and offline writes.
- [x] Normal canonical paths are preserved; hash routing is rejected.
- [x] Preview hosting must support SPA direct-link fallback or use a tested fictional-only workaround.
- [x] Production backend, database, identity, SMS, Dynamics, and host decisions remain outside this step.
- [x] No application scaffold is created until Step 3.1 is approved.

## Official references reviewed

1. React, Creating a React App: https://react.dev/learn/creating-a-react-app
2. React, Build a React App from Scratch: https://react.dev/learn/build-a-react-app-from-scratch
3. React, Using TypeScript: https://react.dev/learn/typescript
4. React Router, Picking a Mode: https://reactrouter.com/start/modes
5. React Router, Single Page App Mode: https://reactrouter.com/how-to/spa
6. Vite, Getting Started: https://vite.dev/guide/
7. Vitest, Getting Started: https://vitest.dev/guide/
8. React Testing Library: https://testing-library.com/docs/react-testing-library/intro/
9. Playwright, Installation and Browser Coverage: https://playwright.dev/docs/intro
10. Playwright, Device Emulation: https://playwright.dev/docs/emulation
11. MDN, Service Worker API: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
