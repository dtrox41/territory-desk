# Reference Data Import Process

## Approved source

- Reference project: `territory-lookup`
- Reference file: `index.html`
- Source use: read-only
- Approved content: territory routing assignments and the representative roster needed to interpret those assignments
- Excluded content: login credentials, interface code, deployment configuration, and unrelated source content

## Privacy boundary

The reference dataset contains employee names, work phone numbers, and work email addresses. Even though the reference site exposed them, Territory Desk will not automatically commit or republish that contact data.

The import process creates:

1. A local audit copy containing the original data values.
2. A local normalized dataset for validation and future secure integration.
3. A trackable metadata file containing no representative names, phone numbers, or email addresses.

The audit and normalized files are ignored by Git. The first prototype continues to use fictional records.

## Reproducible import

Run `scripts/import-reference-data.mjs` with the reference `index.html` path and the Territory Desk project root. Provide source commit and copy date through non-secret environment variables.

The script:

1. Locates the `ZIP_DATA` array without executing the reference application.
2. Parses and validates every record.
3. Preserves an exact logical copy of the source values.
4. Normalizes ZIP, city, state, division, location, representative ID, email, and phone formats.
5. Separates representative contact details from territory assignments.
6. Removes exact duplicate normalized assignments while counting them.
7. Writes non-sensitive counts, checksums, and validation results.

## Release rule

Do not move local imported contact data into trackable application files until all of the following are confirmed:

- The GitHub repository is private.
- Employee-data use is approved.
- Authentication and authorization are implemented.
- Public deployment cannot serve the private files.
- A data owner confirms the roster and territories.
- A correction and refresh process exists.
