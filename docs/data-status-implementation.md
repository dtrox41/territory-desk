# Step 5.3.10 — Data Status Implementation

Status: Complete locally and ready for user acceptance

Route: `/data-status`

## Outcome

Data Status now answers the operational question **What can I safely do now?** before a representative or manager searches, chooses a representative, sends or updates a peer handoff, relies on notifications, or expects Dynamics-backed information.

The implementation uses fictional records only. It does not connect to Dynamics 365, Azure, an SMS carrier, employee data, customer data, GitHub, or the original Territory Lookup application.

## Trust model

The screen evaluates action safety from visible source evidence instead of presenting a generic system-health light. It separates:

1. Territory routing.
2. Representative directory.
3. Territory Desk workflow data.
4. In-app notification and SMS channel behavior.
5. Dynamics 365 connection status.

Every source states its use, status, freshness rule, available version, timestamp meanings, validation evidence, known limitations, and safe action. The overall result is derived from the most consequential core restriction:

1. A version mismatch blocks new lead sends.
2. An unavailable core source prevents a false Available result.
3. A stale core source keeps affected writes from appearing safe.
4. Record-level exceptions produce Attention needed without labeling unrelated actions unavailable.
5. Dynamics being disconnected does not block the separate peer-handoff workflow.
6. SMS remains explicitly **Simulation only — no carrier text is sent**.

## Implemented workflows

### Action-safety summary

Seven checks appear before source detail:

1. Search territories.
2. Choose a representative.
3. Send a lead.
4. Update an existing lead.
5. Receive in-app alerts.
6. Send Territory Desk SMS alerts.
7. Use Dynamics-backed outcomes.

### Source evidence

Five expandable, mobile-first source cards expose only scope-safe evidence. Allowlisted `source` URLs open the relevant source and restrict the known-issue list to that source. Unknown URL parameters do not appear in the screen or broaden access.

The visible timestamp labels preserve their approved distinct meanings: Source updated, Imported, Validated, Last verified, Last refreshed, and Status checked.

### Known issues

Fictional issues are ordered by operational impact and show:

1. Affected capability.
2. Scope-safe context.
3. First detected time.
4. Most recently confirmed time.
5. Reporter-visible status.
6. Safe workaround.

No customer name, employee contact information, source payload, reporter identity, or engineering diagnostic is displayed.

### Report incorrect information

The in-place dialog:

1. Preserves only approved display context.
2. Requires a category and factual description.
3. Warns the user not to enter customer information.
4. States that submission does not immediately change routing.
5. Uses a stable idempotency key.
6. Preserves the draft after a definite failure.
7. Blocks submission while offline.
8. Adds a reporter-visible fictional tracking record after success.

Submitting a report does not change a source, remove an exception, or enable blocked routing.

### My submitted reports

The first-release prototype displays only the current fictional user's reports and reporter-visible status updates. Reviewer identities and other reporters remain excluded.

## Failure and access states

Automated scenarios cover:

1. Unauthorized direct access without source or issue disclosure.
2. Full snapshot-load failure without a false Available result.
3. Territory-directory version mismatch.
4. Stale territory routing.
5. Independently unavailable core sources.
6. Offline read-only behavior.
7. Report submission failure with preserved input.
8. Duplicate report retry without duplicate creation.

## Responsive and accessibility verification

Browser QA completed at:

1. Smartphone: 390 × 844 CSS pixels.
2. Laptop: 1440 × 900 CSS pixels.

Verified results:

1. No horizontal overflow at either size.
2. Phone cards stack and source details remain collapsible.
3. Laptop action and report areas use two columns.
4. Source controls and report-dialog actions meet or exceed the 44-pixel target.
5. The final Help link was raised from 24 pixels to the approved 44-pixel minimum during QA.
6. The report dialog fits the phone viewport and retains explicit labels.
7. Status meaning is expressed with text, not color alone.
8. Production output renders without the application error boundary.

## Automated verification

The final local verification includes:

1. 154 application tests across 33 test files.
2. 26 environment, security-matrix, contrast, and PWA tests.
3. ESLint and TypeScript validation.
4. Prettier format validation.
5. A successful production build transforming 172 client modules.
6. Static preview generation with the GitHub Pages fallback.

## Data-quality design influence

The data-quality review framework materially shaped the screen around completeness, validity, consistency, integrity, timeliness, and safe operational use. Evidence is shown as rates with denominators where appropriate, issue severity is expressed through action impact and workaround, and limitations remain explicit. Fictional percentages are prototype fixtures, not claims about live Cintas data.

## Deferred by design

The following remain excluded until separately approved and connected:

1. Live employee, territory, customer, lead, or manager data.
2. Dynamics 365 reconciliation.
3. Azure configuration.
4. Real SMS sending or delivery confirmation.
5. Data-owner administration, source upload, correction, approval, rollback, and bulk export.
6. Public deployment or GitHub changes.
