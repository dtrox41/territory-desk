# Representative Directory Specification

Status: Approved for Step 2.6

Route: `/directory`

## Objective

The Directory helps New Business Sales Representatives and managers find the correct cross-department teammate, understand that person's approved service and territory context, contact them when appropriate, and begin a structured lead handoff.

The Directory is a people-discovery tool. Territory Lookup remains the routing authority. A name match alone never proves that a person owns a customer's ZIP and requested service.

## Findings carried forward from the original directory

Preserve:

1. Fast representative-name search.
2. Visible service divisions.
3. Call, text, email, and lead actions.
4. A compact mobile-friendly result list.

Correct:

1. Do not merge records only because their display names match.
2. Do not select the first available phone or email when contacts conflict.
3. Do not expose real employee contacts in a public client bundle.
4. Do not allow a directory-selected person to bypass ZIP-and-service validation.
5. Do not treat opening Mail or Messages as a submitted or trackable lead.

## Identity model

1. Every representative uses a stable internal or approved source identifier.
2. `displayName` is for presentation and search, never the database key.
3. Name, phone, and email changes do not create a new identity when the authoritative identifier remains the same.
4. Two people with the same display name remain separate records.
5. One display name with conflicting contacts creates an identity exception until an approved data owner resolves it.
6. Historical handoffs preserve the representative identifier and display snapshot used at the time.
7. Prototype people use fictional stable identifiers and fictional contact details.

## Population and access boundary

1. The 72 representative records normalized from the original app define the initial prototype population shape.
2. Real production population comes from an approved authenticated source, not a public static file.
3. Representatives see only directory records needed for approved cross-department collaboration.
4. Managers do not gain organization-wide employee access merely from having a manager role.
5. Manager scope remains limited to approved locations, departments, and teams.
6. Inactive representatives are excluded from ordinary discovery but remain identifiable on authorized historical handoffs.
7. Contacts, reporting relationships, and territory details follow least-privilege access.

## Mobile directory screen

Display in this order:

1. Page title: `Representative Directory`.
2. Helper text: `Find a teammate by name, department, or location.`
3. Search field labeled `Search representatives`.
4. Department or service filter.
5. Collapsed `More filters` control.
6. Result count and active-filter summary.
7. Representative cards.

Do not render all representatives in a long unbounded list on first load. Show recently used fictional prototype people only during the active session, or a short alphabetical first page with a clear result count.

## Laptop directory screen

Use the same search, filter labels, permissions, and card actions. Laptop may show a filter sidebar and denser rows. Selecting a row may open a detail panel, but the canonical representative route and browser history must still work.

## Search inputs

Search approved directory fields:

1. Representative display name.
2. Department display group.
3. Exact source division.
4. Location number.
5. State or approved region derived from active territory assignments.

Do not search customer information, private notes, performance metrics, or reporting relationships in the general directory field.

### Matching order

1. Exact normalized display name.
2. Display name beginning with the query.
3. Display name containing the query.
4. Exact department, division, location, or state match.
5. Prefix department, division, or location match.

Within the same match tier, sort active representatives alphabetically by display name, then stable identifier. Never sort by leads sent, outcomes, response time, seniority, customer value, or contact-data completeness.

### Search behavior

1. Ignore leading, trailing, and repeated spaces.
2. Match case-insensitively and accent-insensitively where supported.
3. Preserve punctuation and preferred capitalization in displayed names.
4. Begin suggestions after two meaningful characters.
5. Debounce remote search requests.
6. Cancel or ignore obsolete responses so a slow prior search cannot replace newer results.
7. Limit suggestions to eight and paginate or progressively reveal full results.
8. Escape search input before display.
9. Do not log raw search text when it may contain personal or customer information.

## Filters

### Visible primary filter

**Department or service** uses the provisional display groups approved for Territory Lookup:

1. Uniform.
2. Facility Services.
3. First Aid & Safety.
4. Fire Protection.
5. Strategic & Specialty.

The exact source divisions remain available and visible.

### More filters

1. Exact source division.
2. Location number.
3. State or approved region.
4. Assignment status: active or needs review.
5. Contact availability: call, email, or text.

Contact availability is a utility filter, not an indicator of quality or routing eligibility. An app handoff depends on a stable application identity, not a phone number or email address.

Filters are encoded in the URL only when non-sensitive. Browser Back restores the query, filters, result position, and selected profile for the active session.

## Result card

Each representative card shows the minimum information required to choose the next action:

1. Display name.
2. Department or service display groups.
3. Up to three exact source divisions, followed by `View all` when necessary.
4. Primary location number or approved location summary.
5. State or territory summary, when trustworthy.
6. Directory status: `Active` or `Needs Review`.
7. Contact-method availability without showing raw details before authorization.
8. Primary action: **View Representative**.
9. Secondary action: **Send Lead**.
10. **Report Incorrect Information**.

Do not place several equally prominent Call, Text, Email, View, and Send buttons on every list card. That produces crowded mobile cards and increases accidental contact. Full authorized contact actions belong on the representative detail screen or in one labeled contact menu.

## Representative detail

Canonical route: `/directory/:representativeId`

Show:

1. Display name.
2. Active or needs-review status.
3. Department display groups.
4. Exact source divisions.
5. Location number or numbers.
6. Concise territory summary by state and ZIP count.
7. **View Territory Coverage**.
8. Authorized phone and email information.
9. Call, Text, and Email utilities when available.
10. Primary **Send Lead** action.
11. Source update date.
12. Actual last-verified date only when available.
13. **Report Incorrect Information**.

Do not show a huge uncollapsed ZIP list. Territory Coverage opens a searchable view grouped by state, city, and division. Coverage is derived from versioned assignments and never inferred from the representative's contact record.

## Send Lead from Directory

Selecting **Send Lead** from a card or detail page opens `/leads/new` with only the representative identifier preselected. The app then requires:

1. Requested department or service.
2. Customer five-digit ZIP.
3. Territory validation against the current assignment version.

### Valid match

If the chosen representative uniquely owns that ZIP and service, show `Territory confirmed` and retain the representative.

### Different assigned representative

Do not silently replace the user's selection. Show:

1. `This representative is not currently listed for that ZIP and service.`
2. The uniquely assigned representative, when authorized.
3. **Use Assigned Representative**.
4. **Return to Directory**.
5. **Request Routing Help**.

### Ambiguous or open assignment

Apply the Territory Lookup exception rules. Representatives request routing help; authorized managers may choose a handoff recipient with a required reason and audit event.

### Important distinction

Call, Text, and Email are contact utilities only. They do not create a handoff, assign ownership, satisfy a response target, generate the application SMS notification, or appear in collaboration insights.

## Identity and contact exceptions

### Duplicate display name

Show separate cards with department, location, and stable disambiguating context. Do not expose raw internal identifiers to ordinary users.

### Conflicting contacts for one apparent person

1. Mark `Needs Review`.
2. Do not choose a phone or email automatically.
3. Disable affected direct-contact utilities.
4. Allow tracked **Send Lead** only if a stable approved representative identity and routing assignment exist.
5. Provide **Report Incorrect Information**.

### Missing contacts

Show `Direct contact unavailable`. The representative can still receive an in-app handoff if their stable authenticated application identity is active. SMS simulation records `unavailable` without blocking the in-app handoff.

### Inactive representative

1. Exclude from ordinary search results.
2. Preserve on historical activity.
3. Prevent new lead assignment.
4. Offer Territory Lookup or routing help to find the current owner.

### No results

Show:

1. `No representatives match this search.`
2. Clear filters.
3. Search Territory by ZIP or city.
4. Report a missing representative.

Do not suggest a similar person as the recipient without territory validation.

## Report incorrect information

The directory report form includes:

1. Stable representative record identifier.
2. Displayed department and location context.
3. User-selected reason.
4. Optional explanation.

Approved reasons:

1. Wrong or outdated contact information.
2. Wrong department or division.
3. Wrong location.
4. Wrong territory coverage.
5. Representative is inactive or has changed roles.
6. Duplicate or mistaken identity.
7. Missing representative.
8. Other.

Submission creates an auditable data-quality item. It never edits the source record immediately.

## Manager behavior

Managers use the same Directory experience. Additional manager permissions do not turn the Directory into a performance screen.

Authorized managers may:

1. See team-scope context needed for routing.
2. Open routing exceptions affecting their approved scope.
3. Select a recipient for an individual ambiguous handoff with a required reason.
4. Navigate to Team Insights separately.

Managers may not:

1. Access unrestricted organization-wide contact information.
2. Change historical events from the Directory.
3. Edit source territory or employee records directly unless a separate approved data-owner role grants it.
4. View performance rankings in representative cards or profiles.

## Data freshness and source behavior

1. Show `Source updated` using the current territory or directory dataset date.
2. Show `Last verified` only for a real, separate verification event.
3. Link to `/data-status` for dataset version, known exceptions, and refresh information.
4. A data refresh may update the active profile but cannot rewrite historical handoff snapshots.
5. If directory and assignment data versions differ, disable new handoff routing and show `Data versions do not match`.
6. Production contact retrieval requires authentication and permission checks on every direct profile load.

## Connection interruption behavior

Territory Desk remains online-first:

1. Keep an already loaded authorized profile visible with its last-updated timestamp and stale label.
2. Do not expose profiles that were never loaded and authorized during the session.
3. Disable new production searches and handoff submission when identity or routing cannot be revalidated.
4. Direct Call, Text, and Email utilities on an already loaded profile follow the final security policy; default to disabled while the session cannot be revalidated.
5. Retry preserves the search and filters.
6. Never persist real employee contact details in browser local storage on a personal phone.

## URL, sharing, and privacy

1. Profile URLs use opaque stable identifiers, not names or email addresses.
2. Direct links require authentication and current authorization.
3. Page titles, previews, and metadata do not expose phone numbers or email addresses.
4. Copying a profile link does not grant access.
5. Search analytics store approved event names and non-sensitive normalized filters, not raw names, phones, emails, or queries.
6. Sign Out clears session-only directory details and recent fictional selections.

## Accessibility requirements

1. Search uses a visible persistent label.
2. Suggestions implement the accessible combobox and listbox pattern.
3. Result count changes are announced without moving focus.
4. Filters have programmatic names and selected-state announcements.
5. Duplicate names include accessible department and location context.
6. Status never relies on color alone.
7. Cards follow a logical heading structure.
8. Controls meet the 44-by-44 CSS-pixel minimum target.
9. The interface works by keyboard and at 200% text zoom.
10. Back returns focus to the originating card or row.

## Performance requirements

1. Render the app shell before results.
2. Debounce search and cancel obsolete requests.
3. Paginate or progressively reveal large result sets.
4. Do not ship the real 72-person contact dataset inside a public JavaScript bundle.
5. A block-level search error leaves navigation and current authorized content usable.
6. Search and filter changes do not cause unexpected focus or scroll jumps.

## Required fictional prototype states

1. Exact name match.
2. Partial name with several matches.
3. Department-only search.
4. Location and state filters.
5. One person with several divisions and locations.
6. Two different people sharing a display name.
7. One apparent identity with conflicting contacts.
8. Missing phone, missing email, and both missing.
9. Inactive representative on a historical handoff.
10. Directory-selected representative whose territory matches the lead ZIP.
11. Directory-selected representative whose territory does not match.
12. Ambiguous and open territory validation.
13. No results, loading, error, stale, and offline states.

## Step 2.6 acceptance checklist

- [x] The Directory is approved as people discovery, while Territory remains routing authority.
- [x] Stable representative identifiers are required; display names are not identity keys.
- [x] Search fields, matching order, filters, and result ordering are approved.
- [x] Representative cards remain compact and action-focused on mobile.
- [x] Full contact actions appear only after authorization and are separate from tracked handoffs.
- [x] Send Lead from Directory requires department, ZIP, and current territory validation.
- [x] Mismatched, ambiguous, open, inactive, and conflicting records fail safely.
- [x] Managers receive routing context but no directory performance view or unrestricted contacts.
- [x] Source updated and Last verified remain distinct.
- [x] Reports create auditable data-quality items without immediately editing source records.
- [x] Offline, privacy, URL, accessibility, and performance rules are approved.
- [x] Public prototype data remains fictional.
