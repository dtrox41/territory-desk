# Territory Lookup Specification

Status: Approved for Step 2.5

Route: `/territory`

## Objective

Territory Lookup helps a New Business Sales Representative identify the correct receiving department and representative, verify the routing evidence, and begin a tracked cross-department lead handoff.

It is not merely a contact list. The primary successful outcome is a correctly routed **Send Lead** action with the selected territory context carried into the lead form.

## Findings carried forward from the original lookup

Preserve these useful behaviors:

1. One prominent ZIP-or-city search field.
2. Search suggestions for known ZIP codes and cities.
3. Results organized by division or service line.
4. Visible location number and representative identity.
5. Contact and lead actions.

Correct these risks:

1. A partial numeric query must not be padded with leading zeros and treated as a complete ZIP.
2. A city may contain several ZIP codes with different assignments; city alone must not silently choose a recipient.
3. A city name may occur in multiple states and requires disambiguation.
4. Multiple representatives in the same ZIP-and-division routing group must create an exception instead of an arbitrary choice.
5. Direct call, email, or text actions do not create a tracked lead handoff.
6. A source update date must not be mislabeled as a human verification date.

## Initial-release scope

### Supported search inputs

1. Five-digit ZIP code.
2. ZIP+4, normalized to its first five digits after user confirmation in the result label.
3. City name.
4. City and two-letter state, such as `Columbia, MO`.
5. City and full state name when the state dictionary supports it.

### Deferred input

Full street-address search is deferred. The current source assigns by ZIP and city, and production address search would require an approved geocoding source, privacy review, error policy, and possibly a paid service. The lead form can still collect an address after routing.

## Mobile search screen

Display in this order:

1. Page title: `Find Territory`.
2. Helper text: `Search a ZIP code or city to find the right department and representative.`
3. Search field labeled `ZIP code or city`.
4. Search button labeled `Find Territory`.
5. Department or service filter, default `All departments`.
6. Collapsed `More filters` control.
7. Data-status line with source update date and a link to `/data-status`.
8. Search suggestions or results.

The search field and button remain easy to reach with one hand, but the results must not be hidden behind the on-screen keyboard after submission.

## Laptop search screen

Use the same wording, rules, and result order as mobile. The search field and filters may share one row. Results may use a wider two-column layout only when reading order and keyboard order remain logical.

## Filters

### Primary filter

**Department or service** is visible by default because it directly narrows the receiving team. `All departments` remains available for discovery.

Until a business owner approves a normalized department taxonomy, the interface must preserve the 14 source division labels and may place them under clearly marked provisional display groups. It must not merge distinct roles solely because their names look similar.

Recommended fictional-prototype grouping:

| Display group | Preserved source divisions |
| --- | --- |
| Uniform | Uniform Rental; SRIT Uniform Rental |
| Facility Services | Facility Services; SRIT Facility Services; Sanis Ambassador |
| First Aid & Safety | First Aid & Safety; FAS Account Executive |
| Fire Protection | Fire Protection; Fire Protection Specialist |
| Strategic & Specialty | Corp Account MAM; Education MAM; HC Non Acute Rep; Key Account Manager; Product Specialist |

This grouping improves scanning but remains provisional. An approved territory-data owner must validate it before real routing, and the original source division remains visible and stored on every result.

### More filters

1. State.
2. Location number.
3. Assignment status: `Assigned`, `Open`, or `Needs Review`.

Representative-name filtering belongs primarily in Directory. On laptop it may be offered as an advanced territory filter, but it should not crowd the mobile lookup.

Filters apply to the current result and are encoded in the URL so Back restores them. Changing a filter must not silently change a selected lead recipient.

## Input normalization and validation

### ZIP rules

1. Preserve leading zeros typed by the user.
2. A complete ZIP contains exactly five digits.
3. Accept formatted ZIP+4 input such as `12345-6789`, but search the five-digit routing key and label the normalization.
4. Do not submit one to four digits as a complete ZIP.
5. Partial ZIP digits may produce suggestions after two digits.
6. More than nine ZIP digits or invalid punctuation produces a clear validation message.

### City rules

1. Ignore leading, trailing, and repeated internal spaces for matching.
2. Match case-insensitively.
3. Preserve meaningful punctuation in the displayed city name.
4. Prefer exact city matches, then prefix matches, then clearly labeled contains matches.
5. Do not silently fuzzy-match a misspelling to a routing result.
6. Suggestions begin after two meaningful characters and show city, state, and number of known ZIP codes.
7. Limit the initial suggestion list to eight and provide `View more matches` when needed.

### Safety and privacy rules

1. Escape search text before rendering it.
2. Do not place customer names, street addresses, phone numbers, or notes in the search URL.
3. Do not log raw free-form search strings when they may contain customer information.
4. A search is read-only and never changes assignment ownership.

## Search resolution logic

### Exact ZIP result

1. Resolve the five-digit ZIP.
2. Gather active assignments for the selected department filter.
3. Group results by source division or approved service group.
4. Evaluate each ZIP-and-division group as `Assigned`, `Open`, or `Needs Review`.
5. Never infer a missing assignment from a neighboring ZIP.

### City result

1. If the city exists in multiple states and no state was supplied, show state choices before assignments.
2. Show every known ZIP associated with the selected city and state.
3. If all ZIPs in a division resolve to the same unique representative, summarize that coverage while still listing the ZIPs.
4. If ZIPs resolve to different representatives, require the user to select the customer's actual ZIP before starting a handoff.
5. The lead form requires an exact ZIP even when lookup began with a city.

### No exact result

Do not guess. Show:

1. `No territory assignment found for this search.`
2. Check the ZIP or spelling.
3. Clear filters.
4. Try a city-and-state search.
5. Open Directory.
6. Report missing territory data.

## Result header

Show:

1. Exact searched or selected location.
2. Canonical city, state, and five-digit ZIP when available.
3. Recognized city aliases in a secondary disclosure when relevant.
4. Count of matching service assignments.
5. Active department and other filters.
6. Data source update date.

Use `Source updated` for the imported file date. Show `Last verified` only when a separate human or authoritative-system verification timestamp actually exists.

## Result grouping and order

1. Results are grouped by approved department or service group.
2. Preserve the source division label inside each group.
3. Within a group, show `Needs Review` first, then `Open`, then uniquely `Assigned` results in alphabetical division order.
4. Results are never ranked by lead volume, customer value, or representative performance.
5. Collapsed groups show assignment count and exception count.
6. The user's selected department may appear first, but no other matching department is hidden without a visible filter indicator.

## Representative assignment card

Each uniquely assigned result shows:

1. Department or service group.
2. Exact source division.
3. Location number.
4. Representative display name.
5. Assignment status: `Assigned`.
6. ZIP or ZIP range covered by the displayed result.
7. Contact availability without exposing contact details until authorized.
8. Source update date and optional verified date.
9. Primary action: **Send Lead**.
10. Secondary action: **View Representative**.
11. Tertiary actions in an accessible contact menu: Call, Email, and Text when authorized and available.
12. **Report Incorrect Information**.

### Action distinction

**Send Lead** opens `/leads/new` and prefills the exact ZIP, city, state, division, location, and selected representative identifiers. It does not submit anything automatically.

Call, Email, and Text are contact utilities only. They display `This contact is not a tracked lead handoff` before opening the device action. The app-generated SMS notification is triggered only after a structured handoff is submitted; it is not the same as the manual Text action.

## Routing exception cards

### Multiple representatives for one ZIP and division

Show status `Needs Review`, every conflicting assignment, source context, and the message:

`More than one representative is assigned. Territory Desk will not choose automatically.`

Representative actions:

1. **Request Routing Help**.
2. **Report Incorrect Information**.
3. View the listed representatives when authorized.

Authorized manager actions:

1. Select the recipient for this handoff with a required reason.
2. Reassign or resolve the underlying territory exception only through the approved data-maintenance workflow.

A representative cannot bypass the conflict and silently create a tracked handoff to an arbitrary recipient.

### Open territory

Show `Open Territory` instead of a fabricated representative. **Send Lead** is replaced by **Request Routing Help** until an approved manager or location queue exists.

### Missing or conflicting contact data

The territory assignment may still be displayed, but unavailable contact utilities are disabled with an explanation. **Send Lead** remains available only when the application has a stable recipient identifier; it must not depend on a phone number or email address.

### Missing city or state

Show the known ZIP and assignment with `Location label incomplete`. Do not invent a city or state. Provide **Report Incorrect Information** and exclude the record from city-based routing until corrected.

## Report incorrect information

The report form prefills only approved record identifiers and the displayed assignment context. The user selects a reason:

1. Wrong representative.
2. Wrong division or department.
3. Wrong location number.
4. Territory appears open.
5. Contact information is unavailable or outdated.
6. City, state, or ZIP issue.
7. Other, with a required explanation.

Submitting creates an auditable data-quality item for the approved owner. It does not immediately edit production territory data.

## Data-source and refresh behavior

1. Prototype searches use fictional fixtures shaped like the normalized source.
2. Real employee contact data remains excluded from a public repository and public client bundle.
3. Production lookup requires authenticated, permission-filtered data delivery.
4. The current source contains 6,509 assignments, 2,244 ZIP codes, 72 representative names, 14 division labels, and eight location labels.
5. Known unresolved findings include four ZIP-and-division groups with multiple representatives, 148 ZIPs with multiple city labels, one representative name with multiple contact records, and at least one missing state label.
6. The Data Status view identifies the source version, refresh date, known exceptions, and named data owner when approved.
7. A refresh must be versioned and must not silently rewrite the routing context stored on an existing handoff.

## Connection interruption behavior

Territory Desk is online-first.

1. Keep the last successful result visible with `Last updated` and `Offline` or `Connection interrupted`.
2. Do not execute a new production lookup against stale or incomplete data unless an approved offline dataset exists.
3. Allow copying or viewing already loaded, authorized context.
4. Disable **Send Lead** submission while offline, but allow the user to reopen the prefilled fictional prototype form during the active session.
5. Retry restores the same query and filters.
6. Do not persist real representative contact data or customer search details in browser local storage on a personal phone.

## URL and state behavior

1. Use query parameters only for normalized location and non-sensitive filter values.
2. Example: `/territory?zip=63101&department=facility-services`.
3. Browser Back restores query, filters, expanded groups, and scroll position for the active session.
4. A directly opened result re-runs permission and data-version checks.
5. A saved link never bypasses authentication or expose private contact data in page metadata.

## Accessibility requirements

1. The input has a persistent visible label; placeholder text is supplemental.
2. Suggestions use an accessible combobox and listbox pattern.
3. Arrow keys move through suggestions; Enter selects; Escape closes.
4. Search completion announces result count without moving focus unexpectedly.
5. Validation and no-result messages are programmatically associated with the input.
6. Status is communicated by text and icon, not color alone.
7. All actions meet the minimum 44-by-44 CSS-pixel touch target.
8. Contact menus, disclosures, and filters are keyboard operable.
9. The layout remains usable at 200% text zoom.
10. Search and results meet WCAG AA contrast requirements outdoors and indoors.

## Performance requirements

1. Debounce suggestion updates so typing does not trigger excessive requests.
2. Cancel or ignore obsolete search responses.
3. Show a stable loading state without replacing the entire app shell.
4. Prevent a slow prior request from overwriting a newer result.
5. Paginate or progressively reveal large city results.
6. Measure search success, no-result, ambiguity, and error events using fictional or non-sensitive normalized identifiers only.

## Required prototype states

Build fictional examples for:

1. Unique ZIP assignment across several departments.
2. City in one state with several ZIPs and the same representative.
3. City with several ZIPs and different representatives.
4. Same city name in multiple states.
5. Multiple representatives in one ZIP-and-division group.
6. Open territory.
7. Missing contact method.
8. Missing city or state label.
9. No result.
10. Loading, service error, stale result, and offline result.
11. Large text, keyboard navigation, and screen-reader announcements.

## Step 2.5 acceptance checklist

- [x] ZIP, ZIP+4, city, and city-state inputs are approved.
- [x] Full-address lookup remains deferred pending an approved source and privacy review.
- [x] Department or service is the primary filter.
- [x] Partial ZIP values cannot be submitted as complete ZIPs.
- [x] City search cannot silently choose across different ZIP assignments.
- [x] Ambiguous assignments fail safely and request routing help.
- [x] Send Lead is the primary result action and carries verified routing context.
- [x] Direct contact actions are clearly separated from tracked handoffs.
- [x] Source update and human verification dates are labeled differently.
- [x] Open, missing, stale, and conflicting data states are explicit.
- [x] Back, offline, accessibility, and performance behavior are defined.
- [x] Only fictional prototype data may enter the public client bundle.
