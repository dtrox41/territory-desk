# Reference Data Quality Report

Assessment date: 2026-08-22

Source project: `territory-lookup`

Source file: `index.html`

Source commit: `151e8ecd6053fdb53eadf84f48993f3fb65c4040`

Source commit date: 2026-08-21

Source-displayed update date: 2026-08-17

## Import results

| Measure | Result |
| --- | ---: |
| Source assignments | 6,509 |
| Normalized assignments | 6,509 |
| Exact duplicate assignments removed | 0 |
| Unique representatives | 72 |
| Unique ZIP codes | 2,244 |
| States | 5 |
| Divisions | 14 |
| Missing required fields | 0 |
| Invalid ZIP formats | 0 |
| Invalid phone formats | 0 |
| Invalid email formats | 0 |

## Findings requiring later review

1. Four ZIP-and-division routing groups contain more than one representative. These may be valid shared coverage or true ownership conflicts. The application must not choose silently; a data owner must confirm the intended routing rule before production.
2. One hundred forty-eight ZIP codes have more than one city label. Postal aliases and accepted city names can cause this legitimately. Search should recognize aliases while displaying a clear canonical result.
3. One representative display name appears with more than one contact record. The data owner must confirm whether this is a duplicate person, a contact update, or two different people sharing a name.
4. No email address is shared across different representative names.

## Readiness decision

The source is structurally strong enough for prototype lookup and workflow design, but it is not approved for unattended production routing.

Production use requires:

- Data-owner review of the four routing ambiguities.
- Confirmation of the one contact-record conflict.
- A rule for ZIP city aliases.
- A named territory-data owner and refresh schedule.
- Authentication and private deployment before employee contact data is served.

These findings do not block a fictional-data prototype.
