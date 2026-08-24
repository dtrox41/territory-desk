import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";
import { Link, useNavigate } from "react-router";

import {
  leadDepartmentOptions,
  leadTimingLabels,
  validateCustomerDraft,
  validateOpportunityDraft,
  validateRouteDraft,
  type ConfirmedLeadRoute,
  type LeadCreationStep,
  type LeadDraft,
  type LeadEntryContext,
  type LeadFieldErrors,
  type LeadRoutingResolution,
} from "../../domain/lead-creation";
import type { LeadCreationService } from "../../services/lead-creation-service";
import { PageFrame } from "../../components/layout/PageFrame";
import styles from "./LeadCreation.module.css";

type LeadCreationProps = {
  entryContext: LeadEntryContext;
  leadService: LeadCreationService;
};

const steps: Array<{ id: LeadCreationStep; label: string }> = [
  { id: "route", label: "Route" },
  { id: "customer", label: "Customer" },
  { id: "opportunity", label: "Opportunity" },
  { id: "review", label: "Review & Send" },
];

const emptyDraft = (entryContext: LeadEntryContext): LeadDraft => {
  const copiedCustomer =
    entryContext.source === "another-department"
      ? entryContext.copiedCustomer
      : undefined;
  const routingSnapshot =
    entryContext.source === "territory"
      ? entryContext.routingSnapshot
      : undefined;

  return {
    customer: copiedCustomer ?? {
      city: routingSnapshot?.city ?? "",
      companyName: "",
      contactAvailability: "",
      contactName: "",
      email: "",
      noContactReason: "",
      phone: "",
      state: routingSnapshot?.state ?? "",
      streetAddress: "",
      zip: routingSnapshot?.zip ?? "",
    },
    duplicateOverrideReason: "",
    idempotencyKey:
      globalThis.crypto?.randomUUID?.() ??
      `fictional-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    opportunity: {
      additionalNotes: "",
      customerRequestedContactAt: "",
      customerTiming: "",
      customerTimingReason: "",
      needSummary: "",
      opportunityContext: "",
    },
    routing: {
      department: routingSnapshot?.department ?? "",
      preferredRepresentativeId:
        entryContext.source === "directory"
          ? entryContext.representativeId
          : routingSnapshot?.representativeId,
      zip: routingSnapshot?.zip ?? copiedCustomer?.zip ?? "",
    },
  };
};

function subscribeToConnection(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function useOnline() {
  return useSyncExternalStore(
    subscribeToConnection,
    () => navigator.onLine,
    () => true,
  );
}

function FieldError({ error, id }: { error?: string; id: string }) {
  return error ? (
    <p className={styles.fieldError} id={id}>
      {error}
    </p>
  ) : null;
}

function RouteEvidence({ route }: { route: ConfirmedLeadRoute }) {
  return (
    <section
      aria-labelledby="confirmed-routing"
      className={styles.routeEvidence}
    >
      <div className={styles.routeEvidenceHeader}>
        <div>
          <p>Current fictional assignment</p>
          <h3 id="confirmed-routing">{route.representative.displayName}</h3>
        </div>
        <span>Confirmed</span>
      </div>
      <dl>
        <div>
          <dt>Department</dt>
          <dd>{route.assignment.departmentLabel}</dd>
        </div>
        <div>
          <dt>Exact division</dt>
          <dd>{route.assignment.sourceDivision}</dd>
        </div>
        <div>
          <dt>Customer location</dt>
          <dd>
            {route.city}, {route.state} {route.zip}
          </dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>
            {route.assignment.locationNumber.replace("demo-", "Demo Location ")}
          </dd>
        </div>
        <div>
          <dt>Source updated</dt>
          <dd>{route.sourceUpdatedLabel}</dd>
        </div>
      </dl>
      <p>
        This assignment will be checked again when the fictional handoff is
        sent.
      </p>
    </section>
  );
}

function ErrorSummary({
  errors,
  summaryRef,
}: {
  errors: LeadFieldErrors;
  summaryRef: RefObject<HTMLDivElement | null>;
}) {
  const items = Object.entries(errors);
  if (items.length === 0) return null;
  return (
    <div
      className={styles.errorSummary}
      ref={summaryRef}
      role="alert"
      tabIndex={-1}
    >
      <h3>Check the highlighted information</h3>
      <ul>
        {items.map(([field, message]) => (
          <li key={field}>
            <a href={`#${field}`}>{message}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LeadCreation({ entryContext, leadService }: LeadCreationProps) {
  const [draft, setDraft] = useState(() => emptyDraft(entryContext));
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors] = useState<LeadFieldErrors>({});
  const [routingResolution, setRoutingResolution] =
    useState<LeadRoutingResolution | null>(null);
  const [confirmedRoute, setConfirmedRoute] =
    useState<ConfirmedLeadRoute | null>(null);
  const [possibleDuplicate, setPossibleDuplicate] =
    useState<Awaited<ReturnType<LeadCreationService["checkForDuplicate"]>>>(
      null,
    );
  const [working, setWorking] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [submitError, setSubmitError] = useState("");
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const online = useOnline();
  const currentStep = steps[stepIndex]!;
  const excludedDepartment =
    entryContext.source === "another-department"
      ? entryContext.excludedDepartment
      : undefined;

  const changed = useMemo(
    () =>
      Boolean(
        draft.routing.department ||
        draft.routing.zip ||
        draft.customer.companyName ||
        draft.opportunity.needSummary,
      ),
    [draft],
  );

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!changed) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [changed]);

  useEffect(() => {
    stepHeading.current?.focus();
  }, [stepIndex]);

  useEffect(() => {
    if (Object.keys(errors).length > 0) errorSummary.current?.focus();
  }, [errors]);

  async function validateRouting() {
    const nextErrors = validateRouteDraft(draft.routing);
    if (excludedDepartment && draft.routing.department === excludedDepartment) {
      nextErrors.department =
        "Choose a different department for this additional handoff.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !online) return;

    setWorking(true);
    setRoutingResolution(null);
    setConfirmedRoute(null);
    setAnnouncement("Checking the current fictional assignment.");
    try {
      const resolution = await leadService.resolveRoute(draft.routing);
      setRoutingResolution(resolution);
      if (resolution.type === "confirmed") {
        setConfirmedRoute(resolution.route);
        setDraft((current) => ({
          ...current,
          customer: {
            ...current.customer,
            city: resolution.route.city,
            state: resolution.route.state,
            zip: resolution.route.zip,
          },
        }));
        setAnnouncement(
          `Route confirmed for ${resolution.route.representative.displayName}.`,
        );
      } else {
        setAnnouncement("The requested route requires review.");
      }
    } catch {
      setSubmitError("Routing could not be checked. No lead was created.");
    } finally {
      setWorking(false);
    }
  }

  function updateRoute(field: "department" | "zip", value: string) {
    setDraft((current) => ({
      ...current,
      routing: { ...current.routing, [field]: value },
    }));
    setConfirmedRoute(null);
    setRoutingResolution(null);
    setPossibleDuplicate(null);
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function acceptCurrentAssignment(route: ConfirmedLeadRoute) {
    setConfirmedRoute(route);
    setRoutingResolution({ route, type: "confirmed" });
    setDraft((current) => ({
      ...current,
      customer: {
        ...current.customer,
        city: route.city,
        state: route.state,
        zip: route.zip,
      },
      routing: {
        ...current.routing,
        preferredRepresentativeId: route.representative.id,
      },
    }));
    setAnnouncement(
      `Current assignment selected: ${route.representative.displayName}.`,
    );
  }

  async function continueForward() {
    let nextErrors: LeadFieldErrors = {};
    if (currentStep.id === "route") {
      nextErrors = validateRouteDraft(draft.routing);
      if (!confirmedRoute && Object.keys(nextErrors).length === 0) {
        nextErrors.assignment =
          "Confirm the current territory assignment before continuing.";
      }
    } else if (currentStep.id === "customer") {
      nextErrors = validateCustomerDraft(draft.customer);
    } else if (currentStep.id === "opportunity") {
      nextErrors = validateOpportunityDraft(draft.opportunity);
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !confirmedRoute) return;

    if (currentStep.id === "opportunity") {
      setWorking(true);
      try {
        setPossibleDuplicate(
          await leadService.checkForDuplicate({
            customer: draft.customer,
            route: confirmedRoute,
          }),
        );
      } finally {
        setWorking(false);
      }
    }

    setErrors({});
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  }

  function goBack() {
    setErrors({});
    setSubmitError("");
    setStepIndex((current) => Math.max(0, current - 1));
  }

  async function sendLead() {
    if (!confirmedRoute || !online || working) return;
    if (possibleDuplicate && draft.duplicateOverrideReason.trim().length < 5) {
      setErrors({
        duplicateOverrideReason:
          "Explain why a separate handoff is still needed.",
      });
      return;
    }

    setWorking(true);
    setSubmitError("");
    setAnnouncement(
      "Saving the fictional handoff before notification attempts.",
    );
    try {
      const receipt = await leadService.submit({
        confirmedRoute,
        draft,
        senderDepartment: "Uniform — Fictional Demo",
        senderId: "rep-demo-sender",
        senderName: "Demo Sender",
      });
      await navigate(`/leads/${receipt.handoffId}`, {
        state: {
          anotherDepartmentContext: {
            copiedCustomer: draft.customer,
            excludedDepartment: confirmedRoute.department,
            source: "another-department",
          } satisfies LeadEntryContext,
          creationReceipt: receipt,
        },
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : "unknown";
      setSubmitError(
        reason === "routing-changed"
          ? "Routing changed before save. Return to Route and confirm the current assignment. Nothing was sent."
          : reason === "self-handoff"
            ? "A sender cannot submit a handoff to themself. Nothing was sent."
            : "The fictional handoff could not be saved. Nothing was sent; retry uses the same submission key.",
      );
      if (reason === "routing-changed") {
        setConfirmedRoute(null);
        setStepIndex(0);
      }
    } finally {
      setWorking(false);
    }
  }

  const routeIssue = routingResolution?.type;
  const mismatchResolution =
    routingResolution?.type === "recipient-mismatch" ? routingResolution : null;

  return (
    <PageFrame
      description="Create one structured, attributable cross-department handoff. Complete details only when safely parked or using your company laptop."
      eyebrow="Fictional peer-lead prototype"
      title="Send Lead"
    >
      <div aria-live="polite" className={styles.srAnnouncement}>
        {announcement}
      </div>

      {!online ? (
        <div className={styles.offlineBanner} role="status">
          <strong>You are offline.</strong>
          <span>
            Your active fictional form remains visible, but routing and sending
            are disabled.
          </span>
        </div>
      ) : null}

      <nav aria-label="Lead creation progress" className={styles.progress}>
        <ol>
          {steps.map((step, index) => (
            <li
              aria-current={index === stepIndex ? "step" : undefined}
              key={step.id}
            >
              <span>{index + 1}</span>
              <span>{step.label}</span>
            </li>
          ))}
        </ol>
      </nav>

      <div className={styles.workspace}>
        <form
          className={styles.formCard}
          noValidate
          onSubmit={(event) => event.preventDefault()}
        >
          <div className={styles.stepHeader}>
            <p>Step {stepIndex + 1} of 4</p>
            <h2 ref={stepHeading} tabIndex={-1}>
              {currentStep.label}
            </h2>
          </div>

          <ErrorSummary errors={errors} summaryRef={errorSummary} />
          {submitError ? (
            <p className={styles.submitError} role="alert">
              {submitError}
            </p>
          ) : null}

          {currentStep.id === "route" ? (
            <div className={styles.fields}>
              <div className={styles.field}>
                <label htmlFor="department">
                  Requested department or service
                </label>
                <span>Required. One department per handoff.</span>
                <select
                  aria-describedby={
                    errors.department ? "department-error" : undefined
                  }
                  aria-invalid={Boolean(errors.department)}
                  id="department"
                  onChange={(event) =>
                    updateRoute("department", event.target.value)
                  }
                  value={draft.routing.department}
                >
                  <option value="">Select a department</option>
                  {leadDepartmentOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                      {excludedDepartment === option.value
                        ? " — already used"
                        : ""}
                    </option>
                  ))}
                </select>
                <FieldError error={errors.department} id="department-error" />
              </div>

              <div className={styles.field}>
                <label htmlFor="zip">Customer ZIP code</label>
                <span>
                  Required. Enter the customer's exact five-digit ZIP.
                </span>
                <input
                  aria-describedby={errors.zip ? "zip-error" : undefined}
                  aria-invalid={Boolean(errors.zip)}
                  autoComplete="postal-code"
                  id="zip"
                  inputMode="numeric"
                  maxLength={5}
                  onChange={(event) =>
                    updateRoute(
                      "zip",
                      event.target.value.replace(/\D/g, "").slice(0, 5),
                    )
                  }
                  value={draft.routing.zip}
                />
                <FieldError error={errors.zip} id="zip-error" />
              </div>

              <button
                className={styles.secondaryButton}
                disabled={!online || working}
                onClick={() => void validateRouting()}
                type="button"
              >
                {working ? "Checking Assignment…" : "Check Current Assignment"}
              </button>

              {confirmedRoute ? <RouteEvidence route={confirmedRoute} /> : null}

              {mismatchResolution ? (
                <div className={styles.warningPanel} role="alert">
                  <h3>Directory selection does not match current territory</h3>
                  <p>
                    The selected directory representative is not the current
                    owner for this ZIP and service. Territory Desk will not
                    route to them automatically.
                  </p>
                  <RouteEvidence route={mismatchResolution.currentRoute} />
                  <div className={styles.inlineActions}>
                    <button
                      className={styles.primaryButton}
                      onClick={() =>
                        acceptCurrentAssignment(mismatchResolution.currentRoute)
                      }
                      type="button"
                    >
                      Use Current Assignment
                    </button>
                    <Link to="/data-status?source=territory#known-issues">
                      Request Routing Help
                    </Link>
                  </div>
                </div>
              ) : null}

              {routeIssue === "needs-review" || routeIssue === "open" ? (
                <div className={styles.warningPanel} role="alert">
                  <h3>
                    {routeIssue === "open"
                      ? "Open territory"
                      : "Routing needs review"}
                  </h3>
                  <p>
                    {routeIssue === "open"
                      ? "No approved recipient is assigned. Territory Desk will not fabricate one."
                      : "More than one representative is assigned. Territory Desk will not choose automatically."}
                  </p>
                  <Link
                    to={`/data-status?source=territory&issue=${routeIssue === "open" ? "open-territory" : "assignment-conflict"}#known-issues`}
                  >
                    Request Routing Help
                  </Link>
                </div>
              ) : null}

              {routeIssue === "not-found" || routeIssue === "stale" ? (
                <div className={styles.warningPanel} role="alert">
                  <h3>
                    {routeIssue === "stale"
                      ? "Routing data refresh needed"
                      : "No assignment found"}
                  </h3>
                  <p>
                    {routeIssue === "stale"
                      ? "The assignment remains visible elsewhere, but a handoff cannot use stale routing data."
                      : "Check the ZIP and service. Territory Desk will not guess a neighboring assignment."}
                  </p>
                  <Link to="/territory">Open Territory Lookup</Link>
                </div>
              ) : null}
              <FieldError error={errors.assignment} id="assignment-error" />
            </div>
          ) : null}

          {currentStep.id === "customer" ? (
            <div className={styles.fields}>
              <div className={styles.field}>
                <label htmlFor="companyName">
                  Company or organization name
                </label>
                <span>Required. 2–120 characters.</span>
                <input
                  aria-invalid={Boolean(errors.companyName)}
                  autoComplete="organization"
                  id="companyName"
                  maxLength={120}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      customer: {
                        ...current.customer,
                        companyName: event.target.value,
                      },
                    }))
                  }
                  value={draft.customer.companyName}
                />
                <FieldError error={errors.companyName} id="companyName-error" />
              </div>
              <div className={styles.field}>
                <label htmlFor="streetAddress">Street address</label>
                <span>Optional. Do not invent missing information.</span>
                <input
                  autoComplete="street-address"
                  id="streetAddress"
                  maxLength={160}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      customer: {
                        ...current.customer,
                        streetAddress: event.target.value,
                      },
                    }))
                  }
                  value={draft.customer.streetAddress}
                />
                <FieldError
                  error={errors.streetAddress}
                  id="streetAddress-error"
                />
              </div>
              <div className={styles.locationGrid}>
                <div className={styles.field}>
                  <label htmlFor="customerCity">City</label>
                  <input
                    id="customerCity"
                    readOnly
                    value={draft.customer.city}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="customerState">State</label>
                  <input
                    id="customerState"
                    readOnly
                    value={draft.customer.state}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="customerZip">ZIP</label>
                  <input id="customerZip" readOnly value={draft.customer.zip} />
                </div>
              </div>
              <p className={styles.locationNote}>
                Change the ZIP or service through Route so the recipient is
                revalidated.
              </p>
              <fieldset className={styles.choiceGroup}>
                <legend>Customer contact availability</legend>
                <p>Required. Choose the information actually available.</p>
                {[
                  ["phone", "Phone available"],
                  ["email", "Email available"],
                  ["both", "Phone and email available"],
                  ["none", "Contact information not yet available"],
                ].map(([value, label]) => (
                  <label key={value}>
                    <input
                      checked={draft.customer.contactAvailability === value}
                      name="contactAvailability"
                      onChange={() =>
                        setDraft((current) => ({
                          ...current,
                          customer: {
                            ...current.customer,
                            contactAvailability:
                              value as LeadDraft["customer"]["contactAvailability"],
                          },
                        }))
                      }
                      type="radio"
                    />
                    <span>{label}</span>
                  </label>
                ))}
                <FieldError
                  error={errors.contactAvailability}
                  id="contactAvailability-error"
                />
              </fieldset>
              <div className={styles.field}>
                <label htmlFor="contactName">Customer contact name</label>
                <span>Optional.</span>
                <input
                  autoComplete="name"
                  id="contactName"
                  maxLength={100}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      customer: {
                        ...current.customer,
                        contactName: event.target.value,
                      },
                    }))
                  }
                  value={draft.customer.contactName}
                />
                <FieldError error={errors.contactName} id="contactName-error" />
              </div>
              {draft.customer.contactAvailability === "phone" ||
              draft.customer.contactAvailability === "both" ? (
                <div className={styles.field}>
                  <label htmlFor="phone">Customer phone</label>
                  <span>Required for the selected availability.</span>
                  <input
                    autoComplete="tel"
                    id="phone"
                    inputMode="tel"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        customer: {
                          ...current.customer,
                          phone: event.target.value,
                        },
                      }))
                    }
                    value={draft.customer.phone}
                  />
                  <FieldError error={errors.phone} id="phone-error" />
                </div>
              ) : null}
              {draft.customer.contactAvailability === "email" ||
              draft.customer.contactAvailability === "both" ? (
                <div className={styles.field}>
                  <label htmlFor="email">Customer email</label>
                  <span>Required for the selected availability.</span>
                  <input
                    autoComplete="email"
                    id="email"
                    inputMode="email"
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        customer: {
                          ...current.customer,
                          email: event.target.value,
                        },
                      }))
                    }
                    type="email"
                    value={draft.customer.email}
                  />
                  <FieldError error={errors.email} id="email-error" />
                </div>
              ) : null}
              {draft.customer.contactAvailability === "none" ? (
                <div className={styles.field}>
                  <label htmlFor="noContactReason">
                    Why is contact information not available?
                  </label>
                  <span>Required. Do not enter invented contact details.</span>
                  <textarea
                    id="noContactReason"
                    maxLength={240}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        customer: {
                          ...current.customer,
                          noContactReason: event.target.value,
                        },
                      }))
                    }
                    value={draft.customer.noContactReason}
                  />
                  <FieldError
                    error={errors.noContactReason}
                    id="noContactReason-error"
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {currentStep.id === "opportunity" ? (
            <div className={styles.fields}>
              <div className={styles.field}>
                <label htmlFor="needSummary">
                  What does the customer need?
                </label>
                <span>
                  Required. Describe the service, what you learned, and the most
                  useful next step.
                </span>
                <textarea
                  aria-invalid={Boolean(errors.needSummary)}
                  id="needSummary"
                  maxLength={1000}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      opportunity: {
                        ...current.opportunity,
                        needSummary: event.target.value,
                      },
                    }))
                  }
                  rows={5}
                  value={draft.opportunity.needSummary}
                />
                <FieldError error={errors.needSummary} id="needSummary-error" />
              </div>
              <fieldset className={styles.choiceGroup}>
                <legend>Customer timing</legend>
                <p>Required. Timing does not change Action Required ranking.</p>
                {Object.entries(leadTimingLabels).map(([value, label]) => (
                  <label key={value}>
                    <input
                      checked={draft.opportunity.customerTiming === value}
                      name="customerTiming"
                      onChange={() =>
                        setDraft((current) => ({
                          ...current,
                          opportunity: {
                            ...current.opportunity,
                            customerTiming:
                              value as LeadDraft["opportunity"]["customerTiming"],
                          },
                        }))
                      }
                      type="radio"
                    />
                    <span>{label}</span>
                  </label>
                ))}
                <FieldError
                  error={errors.customerTiming}
                  id="customerTiming-error"
                />
              </fieldset>
              {draft.opportunity.customerTiming === "asap" ? (
                <div className={styles.field}>
                  <label htmlFor="customerTimingReason">
                    Why is ASAP requested?
                  </label>
                  <span>
                    Required context; it does not increase queue priority.
                  </span>
                  <textarea
                    id="customerTimingReason"
                    maxLength={300}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        opportunity: {
                          ...current.opportunity,
                          customerTimingReason: event.target.value,
                        },
                      }))
                    }
                    value={draft.opportunity.customerTimingReason}
                  />
                  <FieldError
                    error={errors.customerTimingReason}
                    id="customerTimingReason-error"
                  />
                </div>
              ) : null}
              <div className={styles.field}>
                <label htmlFor="customerRequestedContactAt">
                  Customer-requested contact date and time
                </label>
                <span>
                  Optional. This does not replace the response target.
                </span>
                <input
                  id="customerRequestedContactAt"
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      opportunity: {
                        ...current.opportunity,
                        customerRequestedContactAt: event.target.value,
                      },
                    }))
                  }
                  type="datetime-local"
                  value={draft.opportunity.customerRequestedContactAt}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="opportunityContext">Opportunity context</label>
                <span>Optional. Up to 1,000 characters.</span>
                <textarea
                  id="opportunityContext"
                  maxLength={1000}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      opportunity: {
                        ...current.opportunity,
                        opportunityContext: event.target.value,
                      },
                    }))
                  }
                  value={draft.opportunity.opportunityContext}
                />
                <FieldError
                  error={errors.opportunityContext}
                  id="opportunityContext-error"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="additionalNotes">
                  Additional internal notes
                </label>
                <span>
                  Optional. Up to 2,000 characters. Do not include attachments.
                </span>
                <textarea
                  id="additionalNotes"
                  maxLength={2000}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      opportunity: {
                        ...current.opportunity,
                        additionalNotes: event.target.value,
                      },
                    }))
                  }
                  value={draft.opportunity.additionalNotes}
                />
                <FieldError
                  error={errors.additionalNotes}
                  id="additionalNotes-error"
                />
              </div>
            </div>
          ) : null}

          {currentStep.id === "review" && confirmedRoute ? (
            <div className={styles.review}>
              {possibleDuplicate ? (
                <section
                  aria-labelledby="duplicate-warning"
                  className={styles.warningPanel}
                >
                  <h3 id="duplicate-warning">
                    A similar handoff may already exist
                  </h3>
                  <p>{possibleDuplicate.safeLabel}</p>
                  <Link to={`/leads/${possibleDuplicate.handoffId}`}>
                    View Existing Lead
                  </Link>
                  <div className={styles.field}>
                    <label htmlFor="duplicateOverrideReason">
                      Why is a separate handoff needed?
                    </label>
                    <span>
                      Required to continue with a new fictional handoff.
                    </span>
                    <textarea
                      id="duplicateOverrideReason"
                      maxLength={300}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          duplicateOverrideReason: event.target.value,
                        }))
                      }
                      value={draft.duplicateOverrideReason}
                    />
                    <FieldError
                      error={errors.duplicateOverrideReason}
                      id="duplicateOverrideReason-error"
                    />
                  </div>
                </section>
              ) : null}
              <section
                aria-labelledby="review-route"
                className={styles.reviewSection}
              >
                <h3 id="review-route">Send to</h3>
                <dl>
                  <div>
                    <dt>Recipient</dt>
                    <dd>{confirmedRoute.representative.displayName}</dd>
                  </div>
                  <div>
                    <dt>Department</dt>
                    <dd>{confirmedRoute.assignment.departmentLabel}</dd>
                  </div>
                  <div>
                    <dt>Division and location</dt>
                    <dd>
                      {confirmedRoute.assignment.sourceDivision} ·{" "}
                      {confirmedRoute.assignment.locationNumber.replace(
                        "demo-",
                        "Demo Location ",
                      )}
                    </dd>
                  </div>
                </dl>
              </section>
              <section
                aria-labelledby="review-customer"
                className={styles.reviewSection}
              >
                <h3 id="review-customer">Customer</h3>
                <dl>
                  <div>
                    <dt>Company</dt>
                    <dd>{draft.customer.companyName}</dd>
                  </div>
                  <div>
                    <dt>Location</dt>
                    <dd>
                      {draft.customer.city}, {draft.customer.state}{" "}
                      {draft.customer.zip}
                    </dd>
                  </div>
                  <div>
                    <dt>Contact</dt>
                    <dd>
                      {draft.customer.contactName || "Name not provided"} ·{" "}
                      {draft.customer.contactAvailability === "none"
                        ? "Contact details not yet available"
                        : draft.customer.contactAvailability}
                    </dd>
                  </div>
                </dl>
              </section>
              <section
                aria-labelledby="review-opportunity"
                className={styles.reviewSection}
              >
                <h3 id="review-opportunity">Opportunity</h3>
                <p>{draft.opportunity.needSummary}</p>
                <dl>
                  <div>
                    <dt>Customer timing</dt>
                    <dd>
                      {draft.opportunity.customerTiming
                        ? leadTimingLabels[draft.opportunity.customerTiming]
                        : "Not selected"}
                    </dd>
                  </div>
                  <div>
                    <dt>Requested contact</dt>
                    <dd>
                      {draft.opportunity.customerRequestedContactAt ||
                        "Not provided"}
                    </dd>
                  </div>
                  <div>
                    <dt>Sender</dt>
                    <dd>Demo Sender · Uniform — Fictional Demo</dd>
                  </div>
                </dl>
              </section>
              <div className={styles.expectation}>
                <p>
                  The recipient will be asked to respond by the end of the next
                  business day.
                </p>
                <p>
                  Territory Desk will create an in-app alert and a simulated SMS
                  event for this prototype.
                </p>
              </div>
            </div>
          ) : null}

          <div className={styles.formActions}>
            {stepIndex > 0 ? (
              <button
                className={styles.secondaryButton}
                disabled={working}
                onClick={goBack}
                type="button"
              >
                Back to Edit
              </button>
            ) : (
              <Link className={styles.cancelLink} to="/">
                Cancel
              </Link>
            )}
            {currentStep.id === "review" ? (
              <button
                className={styles.primaryButton}
                disabled={!online || working}
                onClick={() => void sendLead()}
                type="button"
              >
                {working ? "Saving Lead…" : "Send Lead"}
              </button>
            ) : (
              <button
                className={styles.primaryButton}
                disabled={!online || working}
                onClick={() => void continueForward()}
                type="button"
              >
                Continue to{" "}
                {steps[Math.min(stepIndex + 1, steps.length - 1)]!.label}
              </button>
            )}
          </div>
          <p className={styles.draftNote}>
            Fictional draft remains only in this active browser session. It is
            not stored on this device.
          </p>
        </form>

        <aside className={styles.safetyCard}>
          <h2>Before you send</h2>
          <ul>
            <li>One requested department and one accountable recipient.</li>
            <li>Territory is revalidated when you send.</li>
            <li>The handoff saves before alerts are attempted.</li>
            <li>No customer details are included in the SMS simulation.</li>
          </ul>
          <Link to="/territory">Recheck Territory</Link>
        </aside>
      </div>
    </PageFrame>
  );
}
