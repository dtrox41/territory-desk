# Step 5.2 — Responsive Application Shell Implementation

Status: Implementation complete locally; awaiting user approval

Date: 2026-08-23

## Outcome

Territory Desk now has one representative-first application shell that adapts from a 320-pixel smartphone to a laptop without changing route meaning, navigation order, or access rules. The implementation remains inside the separate local `territory-desk` repository. It does not change the original application or GitHub.

All current business content is deliberately labeled as fictional shell-preview content. Product screens and workflow fixtures remain Step 5.3 work.

## Implemented shell

| Surface | Smartphone | Laptop |
| --- | --- | --- |
| Prototype disclosure | Sticky full-width warning | Sticky full-width warning |
| Product identity | Compact text identity in the top bar | Full text identity and descriptor in the rail |
| Primary navigation | Five labeled bottom destinations | Five labeled rail destinations in the same order |
| Secondary navigation | Native dialog drawer | Persistent rail links |
| Notifications | 44-pixel bell target with fictional count | Labeled top-bar action with fictional count |
| Current location | Text, icon, and `aria-current="page"` | Text, icon, indicator, and `aria-current="page"` |
| Content | Single-column, safe-area-aware canvas | Bounded content canvas beside a 256-pixel rail |

The five primary destinations are Home, Territory, Send Lead, Leads, and Directory. Send Lead is visually emphasized without changing its navigation semantics. Notification and lead-action counts are distinct.

## Shared components

- `AppShell` owns the responsive frame, navigation, disclosure, notification entry, drawer, and route-focus behavior.
- `BrandIdentity` owns the approved real-text Territory Desk identity. It uses no copied or placeholder corporate logo.
- `Icon` provides an original, code-native outline family with consistent geometry. Decorative icons are hidden from assistive technology because adjacent text supplies each control name.
- `PageFrame` owns each route's title, description, and content boundary.
- `PlaceholderPage` provides an explicit fictional Step 5.2 preview state rather than invented business data.
- `SystemPage` owns loading, application error, and not-found recovery surfaces outside the authenticated-style shell.
- Central navigation and page metadata files provide one source for labels, paths, icons, active state, and document titles.

No UI framework, icon package, web font, external image, analytics code, service worker, API client, storage mechanism, or integration dependency was added.

## Route registry

The typed route manifest now covers:

- `/`
- `/territory`
- `/leads/new`
- `/leads`
- `/leads/:leadId`
- `/directory`
- `/directory/:representativeId`
- `/notifications`
- `/insights`
- `/data-status`
- `/profile`
- `/help`
- `/help/requests/:requestId`
- `/help/:topicSlug`
- `/not-found`
- unmatched paths through the catch-all recovery route

Static routes are declared before dynamic routes so values such as `new` and `requests` cannot be consumed as record identifiers.

## Manager-access boundary

The default shell is representative-first. Manager Insights is omitted from representative navigation. Directly entering `/insights` does not grant access; the route displays `Manager access required` instead of manager data.

`AppShell` has a tested manager-view variation so an authorized manager shell can later expose Manager Insights. That presentation switch is not treated as authorization. Real role resolution and server enforcement remain blocked until the protected authentication and API architecture is implemented.

## Accessibility behavior

1. A visible-on-focus Skip Link targets the main content.
2. Every implemented route has a unique document title, one main landmark, and one descriptive `h1`.
3. Primary navigation uses real links, visible text, and `aria-current="page"`.
4. Mobile menu and notification controls meet the 44 × 44-pixel minimum target.
5. The mobile drawer uses the native dialog element, opens on its Close control, closes with its control or Escape, and restores focus to the menu opener.
6. Forward route navigation moves focus to the new `h1` without stealing focus during the initial page load.
7. Sticky navigation reserves content space and respects safe-area insets.
8. Reduced-motion and forced-color styles preserve state and focus behavior.
9. The 320-pixel layout does not scroll horizontally.

Browser pressure testing initially found that focus remained on the bottom-navigation link after a route changed. The route-specific page component was remounting before it could manage focus. Focus management was moved to the persistent `AppShell`, then retested successfully with focus on the destination heading.

## Loading, error, and not-found behavior

- The hydration fallback uses the shared product identity and reports loading status.
- Unexpected application errors show a safe recovery surface without exposing a stack trace or internal details.
- Unknown paths show `Page not found`, one main landmark, no application navigation, and a Return to Home action.
- The explicit `/not-found` route and wildcard route share the same system treatment.

## Verification evidence

- Prettier: passed.
- ESLint and JSX accessibility rules: passed.
- React Router type generation and strict TypeScript: passed.
- Environment and token-contrast tests: 24 passed.
- Component and navigation tests: 8 passed across four files.
- Total automated non-browser tests: 32 passed.
- Production SPA build: passed.
- Desktop Chromium, mobile Chromium, and mobile WebKit Playwright/Axe workflows: six tests are defined and discoverable.
- Smartphone browser inspection: passed at 320 × 800 and 390 × 844 with no horizontal overflow and 44-pixel-or-larger tested controls.
- Laptop browser inspection: passed at 1440 × 900 with one visible navigation model and the expected 256-pixel rail.
- Drawer open, close, Escape-ready native behavior, manager-link omission, active navigation, route title, focus transfer, protected route, and not-found recovery: passed in the in-app browser.
- External runtime assets: none.
- Original repository changes: none.
- Git remote, push, workflow, Pages, or deployment changes: none.

The standalone Playwright browser processes remain blocked by the current macOS execution sandbox before they can open the application. This is not reported as a passed end-to-end result. The six-test suite remains a future GitHub workflow release gate, while equivalent local browser checks were completed through the authorized in-app browser.

## Deliberately deferred

- Real home cards, territory results, representative records, leads, activity, notifications, follow-ups, and metrics — Step 5.3.
- Real authentication and role claims — protected production architecture.
- Database, SMS provider, Outlook/Graph, Dynamics, email, and calendar integrations — their approved future gates.
- GitHub repository creation, remote connection, workflow, push, Pages configuration, or deployment — only after explicit user authorization.

## Step 5.2 acceptance checklist

- [x] Representative-first mobile and laptop shell implemented.
- [x] Approved text identity and original icon family implemented.
- [x] Mobile menu, notifications, five-item bottom navigation, and laptop rail implemented.
- [x] Typed route registry and fictional placeholder routes implemented.
- [x] Loading, global error, explicit not-found, and catch-all recovery implemented.
- [x] Navigation current state, drawer focus return, and forward-route focus implemented.
- [x] Manager navigation is omitted by default and direct route entry does not grant access.
- [x] Mobile and laptop pressure checks completed with no observed shell overflow or overlap.
- [x] Non-browser automated quality checks and production build pass.
- [x] Original application and GitHub remain unchanged.

## Next decision

Approve Step 5.2 before implementation proceeds to Step 5.3, where the Home dashboard is the first product screen built with fictional data.
