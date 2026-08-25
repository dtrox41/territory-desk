# Tests

Automated tests will cover territory normalization, routing exceptions, lead status transitions, ownership, notification simulation, retry idempotency, response targeting, accessibility, and responsive behavior.

No real customer or employee-sensitive data may appear in fixtures.

Run the environment compatibility safety suite with:

```text
node --test tests/check-environment.test.mjs
```

The suite uses fictional placeholder values and verifies that Development,
Preview, Production safe-start, and Production go-live modes fail closed when
data, identity, persistence, SMS, email, calendar, Dynamics, client metadata,
or server configuration crosses the approved boundary.
