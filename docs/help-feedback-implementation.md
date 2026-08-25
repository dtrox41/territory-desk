# Help and Feedback Implementation

Status: Implemented locally for Step 5.3.12

Implementation date: August 24, 2026

GitHub status: Not published. The repository has no configured remote, and this
step does not modify the original app.

## Delivered experience

The fictional prototype now provides:

1. An authenticated `/help` hub with an in-memory search over 30 approved demo
   topics.
2. Five separate routing choices for instructions, data corrections, access
   help, application problems, and product suggestions.
3. Manager-specific topics that appear only for an authorized manager profile.
4. Task-group accordions, recommended topics, and complete topic articles at
   `/help/:topicSlug`.
5. Privacy-safe simulated application-problem and product-suggestion forms.
6. Previewed safe diagnostics with removable optional fields and fixed minimum
   ownership context.
7. Reporter-visible My Requests and reporter-authorized detail at
   `/help/requests/:requestId`.
8. Withdrawal and linked Problem Still Occurring flows that preserve history.
9. Offline bundled help with request history and submission disabled.
10. Loading, no-result, content failure, save failure, unknown result, routing
    delay, unauthorized, unavailable-topic, and unavailable-request states.

## Pressure-test decisions

### Kept separate

- Incorrect territory or employee information routes to Data Status. It is not
  converted into generic support feedback.
- Signed-in role or scope problems use the `account-access` topic. The separate
  unauthenticated sign-in recovery route remains part of the next
  authentication-system-pages build.
- Application problems and product suggestions use different fields, statuses,
  confirmations, and expectations.

### Privacy and ownership

- Request text and search text remain out of URLs.
- Managers receive manager guidance but cannot inspect another reporter's
  requests.
- A missing, unauthorized, or other-reporter request returns the same
  unavailable state and does not confirm that a request exists.
- The forms do not offer attachments, screenshots, recordings, or unrestricted
  files.
- Known credential, URL, token, and customer-contact patterns are rejected
  without repeating the entered value in an error.
- Internal support assignment, notes, prioritization, and engineering details
  are excluded from employee request detail.

### Transaction safety

- Fictional submissions use an idempotency key, so double submit or retry does
  not create a duplicate request.
- A definite failure preserves the in-memory form.
- An unknown result directs the reporter to My Requests before retrying.
- A saved request with external routing delay remains committed and explicitly
  says not to submit again.

### Emergency and response boundary

- Help is not presented as an emergency, urgent company, customer, safety,
  compliance, or security channel.
- No invented phone number, mailbox, service promise, or escalation contact is
  displayed.
- The one-business-day lead-response target does not apply to Help or Feedback.

## Verification completed

- Prettier formatting check: passed.
- ESLint: passed.
- TypeScript and React Router type generation: passed.
- Environment and PWA tests: 26 passed.
- Application tests: 192 passed across 39 test files.
- Production build: passed with 184 transformed client modules.
- Phone browser QA at 390 × 844: passed with no horizontal overflow and no
  visible interactive target below 44 × 44 CSS pixels.
- Laptop browser QA at 1440 × 900: passed with the desktop navigation rail,
  two-column routing choices, topic contents rail, reporter request detail, and
  no horizontal overflow.
- Visual QA identified and corrected compressed accordion link targets and the
  dialog close target before acceptance.

The repeated `EMFILE` watcher notices are an environment file-watcher limit
after successful builds; they did not fail or alter the generated build.

## Production gates intentionally not faked

Production submission must remain disabled until Cintas approves and configures:

1. Application-support owner.
2. Product-feedback owner.
3. Ticket or request destination.
4. Authentication and server-side reporter authorization.
5. Retention, deletion, legal-hold, and employee-notice rules.
6. Reporter-visible status policy and escalation path.
7. A real idempotent persistence and routing transaction.

The next approved implementation step is Step 5.3.13 — Authentication and
System Pages. It will build the separate sign-in, sign-in-help, access-required,
account-unavailable, loading, error, not-found, offline, and session-end states
without connecting a real identity provider.
