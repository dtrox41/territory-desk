# Data Layers

## Trackable project data

- `import-metadata.json` contains non-sensitive provenance, counts, checksums, and validation results.
- Future fictional prototype fixtures may be committed after review.

## Local-only data

- `import-source/` contains the extracted source values used for audit comparison.
- `private/` contains normalized territory assignments and representative contact details.

Both local-only directories are excluded by `.gitignore`. They must not be pushed to GitHub, included in a public deployment bundle, or used as production storage.

The application will use fictional fixtures until repository visibility, identity, access control, hosting, privacy, and production data handling are approved.
