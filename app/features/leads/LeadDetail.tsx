import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";

import { PageFrame } from "../../components/layout/PageFrame";
import {
  emptyLeadActivityDraft,
  emptyLeadResponseDraft,
  validateLeadActivityDraft,
  validateLeadResponseDraft,
  type LeadActivityDraft,
  type LeadActivityFilter,
  type LeadActivityResult,
  type LeadDetailCore,
  type LeadDetailSupplementary,
  type LeadResponseDecision,
  type LeadResponseDraft,
} from "../../domain/lead-detail";
import type { LeadDetailService } from "../../services/lead-detail-service";
import styles from "./LeadDetail.module.css";

type LeadDetailProps = {
  leadService: LeadDetailService;
  onAuthorizedLoad?: (leadId: string) => void;
};
type LoadState = "loading" | "ready" | "unavailable" | "error";
type Panel = "overview" | "activity";

const activityFilters: Array<{ label: string; value: LeadActivityFilter }> = [
  { label: "All", value: "all" },
  { label: "Responses", value: "responses" },
  { label: "Progress", value: "progress" },
  { label: "Follow-ups", value: "follow-ups" },
  { label: "Ownership & routing", value: "ownership-routing" },
  { label: "Notifications", value: "notifications" },
  { label: "Appointments & outcomes", value: "appointments-outcomes" },
];

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

function newKey(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function localInputNow() {
  const date = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000);
  return date.toISOString().slice(0, 16);
}

function FieldError({ children, id }: { children?: string; id: string }) {
  return children ? (
    <p className={styles.fieldError} id={id} role="alert">
      {children}
    </p>
  ) : null;
}

function ResponseDialog({
  core,
  disabled,
  onClose,
  onComplete,
  service,
}: {
  core: LeadDetailCore;
  disabled: boolean;
  onClose: () => void;
  onComplete: (core: LeadDetailCore, heading: string, message: string) => void;
  service: LeadDetailService;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<LeadResponseDraft>({
    ...emptyLeadResponseDraft,
    followUpDueAt: "2026-08-25T15:00",
  });
  const [errors, setErrors] = useState<
    ReturnType<typeof validateLeadResponseDraft>
  >({});
  const [stage, setStage] = useState<"edit" | "review">("edit");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => dialog.current?.showModal(), []);

  function update<K extends keyof LeadResponseDraft>(
    key: K,
    value: LeadResponseDraft[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function review(event: FormEvent) {
    event.preventDefault();
    const next = validateLeadResponseDraft(draft);
    setErrors(next);
    if (Object.keys(next).length === 0) setStage("review");
  }

  async function confirm() {
    setSubmitting(true);
    setSubmitError("");
    try {
      const result = await service.respond({
        draft,
        handoffId: core.id,
        idempotencyKey: newKey("respond"),
        reviewedVersion: core.version,
      });
      onComplete(result.core, result.resultHeading, result.resultMessage);
      dialog.current?.close();
    } catch (error) {
      const code = (error as { code?: string }).code;
      setSubmitError(
        code === "version-conflict"
          ? "This lead changed after you opened it. Close this window, reload the lead, and review the latest information before responding."
          : "The response could not be saved. Nothing was changed. Try again.",
      );
      setStage("edit");
    } finally {
      setSubmitting(false);
    }
  }

  const decisionLabel: Record<LeadResponseDecision, string> = {
    accept: "Accept",
    "need-information": "Need Information",
    decline: "Decline",
  };

  return (
    <dialog
      aria-labelledby="response-title"
      className={styles.dialog}
      onCancel={(event) => {
        event.preventDefault();
        dialog.current?.close();
      }}
      onClose={onClose}
      ref={dialog}
    >
      <div className={styles.dialogHeader}>
        <div>
          <p>Meaningful response</p>
          <h2 id="response-title">
            {stage === "edit" ? "Respond to lead" : "Review response"}
          </h2>
        </div>
        <button
          aria-label="Close response"
          onClick={() => dialog.current?.close()}
          type="button"
        >
          ×
        </button>
      </div>
      {stage === "edit" ? (
        <form className={styles.dialogBody} onSubmit={review}>
          <p className={styles.helper}>
            Viewing did not complete this response. Choose one explicit outcome.
          </p>
          {submitError ? (
            <div className={styles.errorBanner} role="alert">
              {submitError}
            </div>
          ) : null}
          <fieldset className={styles.choices}>
            <legend>
              Response <span aria-hidden="true">*</span>
            </legend>
            {(
              [
                "accept",
                "need-information",
                "decline",
              ] as LeadResponseDecision[]
            ).map((decision) => (
              <label key={decision}>
                <input
                  aria-label={decisionLabel[decision]}
                  checked={draft.decision === decision}
                  name="decision"
                  onChange={() => update("decision", decision)}
                  type="radio"
                />
                <span>
                  <strong>{decisionLabel[decision]}</strong>
                  <small>
                    {decision === "accept"
                      ? "Take ownership and define the next action."
                      : decision === "need-information"
                        ? "Return one specific question to the sender."
                        : "Close this handoff with an approved reason."}
                  </small>
                </span>
              </label>
            ))}
          </fieldset>
          <FieldError id="decision-error">{errors.decision}</FieldError>

          {draft.decision === "accept" ? (
            <fieldset className={styles.choices}>
              <legend>Next action</legend>
              <label>
                <input
                  aria-label="Create next action now"
                  checked={draft.followUpMode === "create"}
                  name="follow-mode"
                  onChange={() => update("followUpMode", "create")}
                  type="radio"
                />
                <span>
                  <strong>Create it now</strong>
                  <small>
                    Recommended so the handoff has a clear commitment.
                  </small>
                </span>
              </label>
              <label>
                <input
                  aria-label="Add next action later"
                  checked={draft.followUpMode === "add-later"}
                  name="follow-mode"
                  onChange={() => update("followUpMode", "add-later")}
                  type="radio"
                />
                <span>
                  <strong>Add later</strong>
                  <small>
                    The accepted lead will immediately appear as action
                    required.
                  </small>
                </span>
              </label>
            </fieldset>
          ) : null}
          {draft.decision === "accept" && draft.followUpMode === "create" ? (
            <div className={styles.fields}>
              <label>
                <span>Next-action type</span>
                <select
                  value={draft.followUpType}
                  onChange={(event) =>
                    update("followUpType", event.target.value)
                  }
                >
                  <option value="call-customer">Call customer</option>
                  <option value="email-customer">Email customer</option>
                  <option value="coordinate-rep">
                    Coordinate with sending rep
                  </option>
                  <option value="appointment">Customer appointment</option>
                </select>
                <FieldError id="follow-type-error">
                  {errors.followUpType}
                </FieldError>
              </label>
              <label>
                <span>Due date and time</span>
                <input
                  aria-describedby="follow-due-error"
                  aria-invalid={Boolean(errors.followUpDueAt)}
                  onChange={(event) =>
                    update("followUpDueAt", event.target.value)
                  }
                  type="datetime-local"
                  value={draft.followUpDueAt}
                />
                <FieldError id="follow-due-error">
                  {errors.followUpDueAt}
                </FieldError>
              </label>
              <label>
                <span>Shared next-action summary</span>
                <input
                  aria-describedby="follow-summary-error"
                  aria-invalid={Boolean(errors.followUpSummary)}
                  maxLength={240}
                  onChange={(event) =>
                    update("followUpSummary", event.target.value)
                  }
                  placeholder="Example: Call operations contact to confirm needs"
                  value={draft.followUpSummary}
                />
                <FieldError id="follow-summary-error">
                  {errors.followUpSummary}
                </FieldError>
              </label>
            </div>
          ) : null}
          {draft.decision === "need-information" ? (
            <label className={styles.field}>
              <span>Specific question for the sender</span>
              <textarea
                aria-describedby="question-error"
                aria-invalid={Boolean(errors.informationQuestion)}
                maxLength={500}
                onChange={(event) =>
                  update("informationQuestion", event.target.value)
                }
                placeholder="What exact information do you need to proceed?"
                value={draft.informationQuestion}
              />
              <FieldError id="question-error">
                {errors.informationQuestion}
              </FieldError>
            </label>
          ) : null}
          {draft.decision === "decline" ? (
            <div className={styles.fields}>
              <label>
                <span>Approved reason</span>
                <select
                  aria-describedby="decline-reason-error"
                  aria-invalid={Boolean(errors.declineReason)}
                  onChange={(event) =>
                    update("declineReason", event.target.value)
                  }
                  value={draft.declineReason}
                >
                  <option value="">Choose a reason</option>
                  <option value="wrong-territory">Wrong territory</option>
                  <option value="wrong-department">Wrong department</option>
                  <option value="insufficient-information">
                    Insufficient information
                  </option>
                  <option value="duplicate-handoff">Duplicate handoff</option>
                  <option value="service-not-offered">
                    Service not offered
                  </option>
                  <option value="other">Other</option>
                </select>
                <FieldError id="decline-reason-error">
                  {errors.declineReason}
                </FieldError>
              </label>
              {draft.declineReason === "other" ? (
                <label>
                  <span>Explanation</span>
                  <textarea
                    aria-describedby="decline-explanation-error"
                    aria-invalid={Boolean(errors.declineExplanation)}
                    maxLength={500}
                    onChange={(event) =>
                      update("declineExplanation", event.target.value)
                    }
                    value={draft.declineExplanation}
                  />
                  <FieldError id="decline-explanation-error">
                    {errors.declineExplanation}
                  </FieldError>
                </label>
              ) : null}
            </div>
          ) : null}
          <div className={styles.dialogActions}>
            <button
              className={styles.secondaryButton}
              onClick={() => dialog.current?.close()}
              type="button"
            >
              Cancel
            </button>
            <button
              className={styles.primaryButton}
              disabled={disabled}
              type="submit"
            >
              Review Response
            </button>
          </div>
        </form>
      ) : (
        <div className={styles.dialogBody}>
          <div className={styles.reviewCard}>
            <span>Response</span>
            <strong>
              {decisionLabel[draft.decision as LeadResponseDecision]}
            </strong>
          </div>
          {draft.decision === "accept" ? (
            <div className={styles.reviewCard}>
              <span>Next action</span>
              <strong>
                {draft.followUpMode === "create"
                  ? draft.followUpSummary
                  : "Add later — action required"}
              </strong>
            </div>
          ) : null}
          {draft.decision === "need-information" ? (
            <div className={styles.reviewCard}>
              <span>Question</span>
              <strong>{draft.informationQuestion}</strong>
            </div>
          ) : null}
          {draft.decision === "decline" ? (
            <div className={styles.reviewCard}>
              <span>Reason</span>
              <strong>{draft.declineReason.replaceAll("-", " ")}</strong>
            </div>
          ) : null}
          <p className={styles.confirmation}>
            Confirming records ownership/status and adds a permanent history
            entry. It does not update Dynamics in this fictional prototype.
          </p>
          <div className={styles.dialogActions}>
            <button
              className={styles.secondaryButton}
              disabled={submitting}
              onClick={() => setStage("edit")}
              type="button"
            >
              Back
            </button>
            <button
              className={styles.primaryButton}
              disabled={submitting || disabled}
              onClick={() => void confirm()}
              type="button"
            >
              {submitting ? "Saving…" : "Confirm Response"}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}

function ActivityDialog({
  core,
  disabled,
  onClose,
  onComplete,
  service,
}: {
  core: LeadDetailCore;
  disabled: boolean;
  onClose: () => void;
  onComplete: (core: LeadDetailCore, heading: string, message: string) => void;
  service: LeadDetailService;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<LeadActivityDraft>({
    ...emptyLeadActivityDraft,
    occurredAt: localInputNow(),
  });
  const [errors, setErrors] = useState<
    ReturnType<typeof validateLeadActivityDraft>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  useEffect(() => dialog.current?.showModal(), []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const next = validateLeadActivityDraft(draft, new Date());
    setErrors(next);
    if (Object.keys(next).length) return;
    setSubmitting(true);
    try {
      const result = await service.addActivity({
        draft,
        handoffId: core.id,
        idempotencyKey: newKey("activity"),
        reviewedVersion: core.version,
      });
      onComplete(result.core, result.resultHeading, result.resultMessage);
      dialog.current?.close();
    } catch (error) {
      setSubmitError(
        (error as { code?: string }).code === "version-conflict"
          ? "This lead changed. Close this window and reload before adding activity."
          : "Activity could not be saved. Nothing was changed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function update<K extends keyof LeadActivityDraft>(
    key: K,
    value: LeadActivityDraft[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }
  return (
    <dialog
      aria-labelledby="activity-title"
      className={styles.dialog}
      onCancel={(event) => {
        event.preventDefault();
        dialog.current?.close();
      }}
      onClose={onClose}
      ref={dialog}
    >
      <div className={styles.dialogHeader}>
        <div>
          <p>Append-only history</p>
          <h2 id="activity-title">Add activity</h2>
        </div>
        <button
          aria-label="Close activity"
          onClick={() => dialog.current?.close()}
          type="button"
        >
          ×
        </button>
      </div>
      <form
        className={styles.dialogBody}
        onSubmit={(event) => void submit(event)}
      >
        <p className={styles.helper}>
          Record work other representatives should know. This does not silently
          change status, ownership, or follow-up.
        </p>
        {submitError ? (
          <div className={styles.errorBanner} role="alert">
            {submitError}
          </div>
        ) : null}
        <div className={styles.fields}>
          <label>
            <span>Activity type</span>
            <select
              onChange={(event) => update("type", event.target.value)}
              value={draft.type}
            >
              <option value="customer-call">Customer call</option>
              <option value="customer-email">Customer email</option>
              <option value="rep-collaboration">Rep collaboration</option>
              <option value="site-visit">Site visit</option>
            </select>
          </label>
          <label>
            <span>When it happened</span>
            <input
              aria-describedby="activity-time-error"
              aria-invalid={Boolean(errors.occurredAt)}
              onChange={(event) => update("occurredAt", event.target.value)}
              type="datetime-local"
              value={draft.occurredAt}
            />
            <FieldError id="activity-time-error">
              {errors.occurredAt}
            </FieldError>
          </label>
          <label>
            <span>Shared summary</span>
            <input
              aria-describedby="activity-summary-error"
              aria-invalid={Boolean(errors.summary)}
              maxLength={240}
              onChange={(event) => update("summary", event.target.value)}
              value={draft.summary}
            />
            <FieldError id="activity-summary-error">
              {errors.summary}
            </FieldError>
          </label>
          <label>
            <span>Result</span>
            <select
              aria-describedby="activity-result-error"
              aria-invalid={Boolean(errors.result)}
              onChange={(event) => update("result", event.target.value)}
              value={draft.result}
            >
              <option value="">Choose a result</option>
              <option value="connected">Connected</option>
              <option value="left-message">Left message</option>
              <option value="no-answer">No answer</option>
              <option value="information-shared">Information shared</option>
              <option value="next-step-agreed">Next step agreed</option>
            </select>
            <FieldError id="activity-result-error">{errors.result}</FieldError>
          </label>
          <label>
            <span>Optional shared detail</span>
            <textarea
              maxLength={2000}
              onChange={(event) => update("detail", event.target.value)}
              value={draft.detail}
            />
          </label>
        </div>
        <div className={styles.dialogActions}>
          <button
            className={styles.secondaryButton}
            onClick={() => dialog.current?.close()}
            type="button"
          >
            Cancel
          </button>
          <button
            className={styles.primaryButton}
            disabled={submitting || disabled}
            type="submit"
          >
            {submitting ? "Saving…" : "Add Activity"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

function FollowUpDialog({
  core,
  disabled,
  onClose,
  onComplete,
  service,
}: {
  core: LeadDetailCore;
  disabled: boolean;
  onClose: () => void;
  onComplete: (core: LeadDetailCore, heading: string, message: string) => void;
  service: LeadDetailService;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const mode =
    core.action?.primary === "complete-follow-up" ? "complete" : "create";
  const [summary, setSummary] = useState("");
  const [result, setResult] = useState("");
  const [type, setType] = useState("call-customer");
  const [dueAt, setDueAt] = useState("2026-08-25T15:00");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => dialog.current?.showModal(), []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (summary.trim().length < 5) {
      setError("Enter a shared summary of at least 5 characters.");
      return;
    }
    if (mode === "complete" && !result) {
      setError("Choose the follow-up result.");
      return;
    }
    if (mode === "create" && Date.parse(dueAt) <= Date.now()) {
      setError("Choose a future due date and time.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await service.manageFollowUp({
        action: mode,
        dueAt: mode === "create" ? dueAt : undefined,
        handoffId: core.id,
        idempotencyKey: newKey("follow-up"),
        result: mode === "complete" ? result : undefined,
        reviewedVersion: core.version,
        summary,
        type: mode === "create" ? type : undefined,
      });
      onComplete(response.core, response.resultHeading, response.resultMessage);
      dialog.current?.close();
    } catch (caught) {
      setError(
        (caught as { code?: string }).code === "version-conflict"
          ? "This lead changed. Close this window and review the latest follow-up before saving."
          : "The follow-up could not be saved. Nothing was changed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <dialog
      aria-labelledby="follow-up-title"
      className={styles.dialog}
      onCancel={(event) => {
        event.preventDefault();
        dialog.current?.close();
      }}
      onClose={onClose}
      ref={dialog}
    >
      <div className={styles.dialogHeader}>
        <div>
          <p>Structured commitment</p>
          <h2 id="follow-up-title">
            {mode === "complete" ? "Complete follow-up" : "Add next action"}
          </h2>
        </div>
        <button
          aria-label="Close follow-up"
          onClick={() => dialog.current?.close()}
          type="button"
        >
          ×
        </button>
      </div>
      <form
        className={styles.dialogBody}
        onSubmit={(event) => void submit(event)}
      >
        <p className={styles.helper}>
          {mode === "complete"
            ? "Record what happened. Completion will immediately require a separate next action."
            : "Create one clear commitment with an owner and exact due time."}
        </p>
        {error ? (
          <div className={styles.errorBanner} role="alert">
            {error}
          </div>
        ) : null}
        <div className={styles.fields}>
          {mode === "create" ? (
            <>
              <label>
                <span>Next-action type</span>
                <select
                  onChange={(event) => setType(event.target.value)}
                  value={type}
                >
                  <option value="call-customer">Call customer</option>
                  <option value="email-customer">Email customer</option>
                  <option value="coordinate-rep">
                    Coordinate with sending rep
                  </option>
                  <option value="appointment">Customer appointment</option>
                </select>
              </label>
              <label>
                <span>Due date and time</span>
                <input
                  onChange={(event) => setDueAt(event.target.value)}
                  type="datetime-local"
                  value={dueAt}
                />
              </label>
            </>
          ) : (
            <label>
              <span>Follow-up result</span>
              <select
                onChange={(event) => setResult(event.target.value)}
                value={result}
              >
                <option value="">Choose a result</option>
                <option value="connected-next-step">
                  Connected — next step needed
                </option>
                <option value="left-message">Left message</option>
                <option value="no-answer">No answer</option>
                <option value="appointment-set">Appointment set</option>
              </select>
            </label>
          )}
          <label>
            <span>
              {mode === "complete"
                ? "Shared result summary"
                : "Shared next-action summary"}
            </span>
            <textarea
              maxLength={500}
              onChange={(event) => {
                setSummary(event.target.value);
                setError("");
              }}
              value={summary}
            />
          </label>
        </div>
        <div className={styles.dialogActions}>
          <button
            className={styles.secondaryButton}
            onClick={() => dialog.current?.close()}
            type="button"
          >
            Cancel
          </button>
          <button
            className={styles.primaryButton}
            disabled={submitting || disabled}
            type="submit"
          >
            {submitting
              ? "Saving…"
              : mode === "complete"
                ? "Complete Follow-Up"
                : "Add Next Action"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

function Unavailable() {
  return (
    <PageFrame
      description="This lead is unavailable or you do not have access."
      eyebrow="My Work"
      title="Lead unavailable"
    >
      <section className={styles.stateCard}>
        <h2>We can’t display this lead</h2>
        <p>
          The link may be invalid, the record may no longer be available, or
          your profile may not permit access. No customer details were
          disclosed.
        </p>
        <Link className={styles.primaryButton} to="/leads">
          Return to My Leads
        </Link>
      </section>
    </PageFrame>
  );
}

export function LeadDetail({ leadService, onAuthorizedLoad }: LeadDetailProps) {
  const { leadId = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const online = useOnline();
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [core, setCore] = useState<LeadDetailCore | null>(null);
  const [supplementary, setSupplementary] =
    useState<LeadDetailSupplementary | null>(null);
  const [supplementaryError, setSupplementaryError] = useState(false);
  const [activity, setActivity] = useState<LeadActivityResult | null>(null);
  const [activityError, setActivityError] = useState(false);
  const [activityFilter, setActivityFilter] =
    useState<LeadActivityFilter>("all");
  const [showResponse, setShowResponse] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [announcement, setAnnouncement] = useState<{
    heading: string;
    message: string;
  } | null>(null);
  const panel: Panel = location.hash === "#activity" ? "activity" : "overview";
  const navigationState = location.state as { insightsOrigin?: string } | null;
  const insightsOrigin =
    typeof navigationState?.insightsOrigin === "string" &&
    navigationState.insightsOrigin.startsWith("/insights")
      ? navigationState.insightsOrigin
      : undefined;
  const validId = /^demo-lead-[a-z0-9-]{1,40}$/.test(leadId);

  async function loadActivity(filter = activityFilter) {
    try {
      setActivityError(false);
      setActivity(await leadService.getActivity({ filter, handoffId: leadId }));
    } catch {
      setActivityError(true);
    }
  }

  useEffect(() => {
    let current = true;
    if (!validId) {
      void Promise.resolve().then(() => {
        if (current) setLoadState("unavailable");
      });
      return () => {
        current = false;
      };
    }
    leadService
      .getCore(leadId)
      .then(async (result) => {
        if (!current) return;
        if (result.type === "unavailable") {
          setLoadState("unavailable");
          return;
        }
        setCore(result.core);
        setLoadState("ready");
        onAuthorizedLoad?.(leadId);
        void leadService.recordAuthorizedView({
          handoffId: leadId,
          reviewedVersion: result.core.version,
        });
        try {
          const data = await leadService.getSupplementary(leadId);
          if (current) setSupplementary(data);
        } catch {
          if (current) setSupplementaryError(true);
        }
        try {
          const data = await leadService.getActivity({
            filter: "all",
            handoffId: leadId,
          });
          if (current) setActivity(data);
        } catch {
          if (current) setActivityError(true);
        }
      })
      .catch(() => {
        if (current) setLoadState("error");
      });
    return () => {
      current = false;
    };
  }, [leadId, leadService, onAuthorizedLoad, validId]);

  if (
    loadState === "loading" ||
    (loadState === "ready" && validId && core?.id !== leadId)
  )
    return (
      <PageFrame
        description="Loading the authorized handoff and its current ownership."
        eyebrow="My Work"
        title="Lead Detail"
      >
        <section aria-busy="true" className={styles.stateCard}>
          <h2>Loading lead…</h2>
          <p>Checking access and current record version.</p>
        </section>
      </PageFrame>
    );
  if (loadState === "unavailable") return <Unavailable />;
  if (loadState === "error" || !core)
    return (
      <PageFrame
        description="The lead could not be loaded."
        eyebrow="My Work"
        title="Lead Detail"
      >
        <section className={styles.stateCard} role="alert">
          <h2>Lead Detail is temporarily unavailable</h2>
          <p>No change was made. Return to your list and try again.</p>
          <Link className={styles.primaryButton} to="/leads">
            Return to My Leads
          </Link>
        </section>
      </PageFrame>
    );

  const writesDisabled = !online || core.dataState !== "current";
  const bannerTone =
    core.attentionState === "needs_attention"
      ? "danger"
      : core.attentionState === "action_required"
        ? "warning"
        : core.attentionState === "waiting"
          ? "information"
          : core.attentionState === "closed"
            ? "neutral"
            : "success";
  const complete = (
    nextCore: LeadDetailCore,
    heading: string,
    message: string,
  ) => {
    setCore(nextCore);
    setAnnouncement({ heading, message });
    void loadActivity(activityFilter);
    leadService
      .getSupplementary(leadId)
      .then(setSupplementary)
      .catch(() => setSupplementaryError(true));
  };

  return (
    <PageFrame
      description={`${core.departmentLabel} handoff · ${core.location.city}, ${core.location.state}`}
      eyebrow="My Work"
      title={core.companyName}
    >
      <button
        className={styles.backButton}
        onClick={() => {
          void (location.key === "default"
            ? navigate(insightsOrigin ?? "/leads")
            : navigate(-1));
        }}
        type="button"
      >
        ← Back to {insightsOrigin ? "Team Insights" : "My Leads"}
      </button>
      <p aria-live="polite" className={styles.srAnnouncement}>
        {announcement ? `${announcement.heading}. ${announcement.message}` : ""}
      </p>
      {!online ? (
        <div className={styles.warningBanner} role="status">
          <strong>You’re offline</strong>
          <span>
            Loaded information remains visible, but changes are disabled until
            connection returns.
          </span>
        </div>
      ) : null}
      {core.dataState !== "current" ? (
        <div className={styles.warningBanner} role="alert">
          <strong>Review-only mode</strong>
          <span>
            The record is {core.dataState.replaceAll("_", " ")}. Reload and
            reconcile it before making changes.
          </span>
        </div>
      ) : null}
      {announcement ? (
        <section
          className={styles.successBanner}
          aria-labelledby="result-heading"
        >
          <div>
            <h2 id="result-heading">{announcement.heading}</h2>
            <p>{announcement.message}</p>
          </div>
          <button onClick={() => setAnnouncement(null)} type="button">
            Dismiss
          </button>
        </section>
      ) : null}

      <section
        className={`${styles.actionBanner} ${styles[bannerTone]}`}
        aria-labelledby="next-action-heading"
      >
        <div>
          <p>{core.attentionState.replaceAll("_", " ")}</p>
          <h2 id="next-action-heading">
            {core.action?.label ??
              (core.attentionState === "waiting"
                ? `Waiting on ${core.requiredActionOwner?.displayName ?? "another representative"}`
                : core.attentionState === "closed"
                  ? "Handoff closed"
                  : "Work is up to date")}
          </h2>
          <span>
            {core.action?.explanation ??
              (core.attentionState === "waiting"
                ? "You will see new information here when the assigned person responds."
                : "No immediate action is required.")}
          </span>
          {core.action?.dueAt ? (
            <small>Target: {core.firstResponse.targetLabel}</small>
          ) : null}
        </div>
        {core.action?.primary === "respond" ||
        core.action?.primary === "review-information" ? (
          <button
            className={styles.primaryButton}
            disabled={writesDisabled || !core.capabilities.respond}
            onClick={() => setShowResponse(true)}
            type="button"
          >
            {core.action.label}
          </button>
        ) : null}
        {core.action?.primary === "complete-follow-up" ||
        core.action?.primary === "add-next-action" ? (
          <button
            className={styles.primaryButton}
            disabled={writesDisabled || !core.capabilities.manageFollowUp}
            onClick={() => setShowFollowUp(true)}
            type="button"
          >
            {core.action.label}
          </button>
        ) : null}
      </section>

      <section
        className={styles.statusStrip}
        aria-label="Lead status and ownership"
      >
        <div>
          <span>Status</span>
          <strong>{core.statusLabel}</strong>
        </div>
        <div>
          <span>Current owner</span>
          <strong>{core.currentOwner.displayName}</strong>
          <small>{core.currentOwner.department}</small>
        </div>
        <div>
          <span>Required action owner</span>
          <strong>{core.requiredActionOwner?.displayName ?? "None"}</strong>
          <small>{core.action?.timingLabel ?? "No action due"}</small>
        </div>
        <div>
          <span>Requested recipient</span>
          <strong>{core.requestedRecipient.displayName}</strong>
          <small>{core.requestedRecipient.department}</small>
        </div>
      </section>

      <div
        className={styles.tabs}
        role="tablist"
        aria-label="Lead detail panels"
      >
        <button
          aria-controls="overview-panel"
          aria-selected={panel === "overview"}
          id="overview-tab"
          onClick={() => void navigate({ hash: "overview" }, { replace: true })}
          role="tab"
          type="button"
        >
          Overview
        </button>
        <button
          aria-controls="activity-panel"
          aria-selected={panel === "activity"}
          id="activity-tab"
          onClick={() => void navigate({ hash: "activity" }, { replace: true })}
          role="tab"
          type="button"
        >
          Activity {activity ? `(${activity.total})` : ""}
        </button>
      </div>

      {panel === "overview" ? (
        <div
          aria-labelledby="overview-tab"
          className={styles.overviewGrid}
          id="overview-panel"
          role="tabpanel"
        >
          <div className={styles.mainColumn}>
            <section className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <p>Customer need</p>
                  <h2>Why this lead was shared</h2>
                </div>
                {core.capabilities.addActivity ? (
                  <button
                    className={styles.textButton}
                    disabled={writesDisabled}
                    onClick={() => setShowActivity(true)}
                    type="button"
                  >
                    Add Activity
                  </button>
                ) : null}
              </div>
              <dl className={styles.details}>
                <div>
                  <dt>Need summary</dt>
                  <dd>{core.needSummary}</dd>
                </div>
                <div>
                  <dt>Opportunity context</dt>
                  <dd>{core.opportunityContext}</dd>
                </div>
                <div>
                  <dt>Customer timing</dt>
                  <dd>{core.customerTimingLabel}</dd>
                </div>
                <div>
                  <dt>Shared information</dt>
                  <dd>{core.additionalSharedInformation}</dd>
                </div>
              </dl>
            </section>
            <section className={styles.card}>
              <p className={styles.cardEyebrow}>Contact and location</p>
              <h2>Fictional customer details</h2>
              <dl className={styles.details}>
                <div>
                  <dt>Contact</dt>
                  <dd>{core.contact.name ?? "Not provided"}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>
                    <a href={`tel:${core.contact.phone}`}>
                      {core.contact.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>
                    <a href={`mailto:${core.contact.email}`}>
                      {core.contact.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>Preferred contact</dt>
                  <dd>{core.customerRequestedContactLabel}</dd>
                </div>
                <div>
                  <dt>Service location</dt>
                  <dd>
                    {core.location.streetAddress}, {core.location.city},{" "}
                    {core.location.state} {core.location.zip}
                  </dd>
                </div>
              </dl>
              <p className={styles.demoNote}>
                {core.contact.availabilityExplanation}
              </p>
            </section>
            <section className={styles.card}>
              <p className={styles.cardEyebrow}>Response accountability</p>
              <h2>Response and viewing are tracked separately</h2>
              <dl className={styles.details}>
                <div>
                  <dt>Viewed</dt>
                  <dd>
                    {core.viewState === "viewed"
                      ? "Yes — viewing alone does not complete the response"
                      : "Not yet viewed"}
                  </dd>
                </div>
                <div>
                  <dt>First response</dt>
                  <dd>{core.firstResponse.resultLabel}</dd>
                </div>
                <div>
                  <dt>Response target</dt>
                  <dd>{core.firstResponse.targetLabel}</dd>
                </div>
                <div>
                  <dt>Alert delivery</dt>
                  <dd>
                    {core.notificationState === "failed"
                      ? "Failed — lead remains available in-app"
                      : "Simulated email and text alert"}
                  </dd>
                </div>
              </dl>
            </section>
          </div>
          <aside
            className={styles.sideColumn}
            aria-label="Follow-up and routing information"
          >
            <section className={styles.card}>
              <p className={styles.cardEyebrow}>Primary follow-up</p>
              <h2>
                {supplementary?.followUp?.summary ?? "No next action scheduled"}
              </h2>
              {supplementaryError ? (
                <div className={styles.localError} role="alert">
                  Follow-up information could not be loaded. Core lead details
                  are still available.
                </div>
              ) : supplementary?.followUp ? (
                <dl className={styles.compactDetails}>
                  <div>
                    <dt>Owner</dt>
                    <dd>{supplementary.followUp.owner.displayName}</dd>
                  </div>
                  <div>
                    <dt>Due</dt>
                    <dd>{supplementary.followUp.dueLabel}</dd>
                  </div>
                  <div>
                    <dt>Reminder</dt>
                    <dd>{supplementary.followUp.reminderLabel}</dd>
                  </div>
                </dl>
              ) : (
                <p className={styles.helper}>
                  Accepting without a next action keeps this lead in Action
                  Required.
                </p>
              )}
            </section>
            <section className={styles.card}>
              <p className={styles.cardEyebrow}>Routing</p>
              <h2>Who sent this and where it went</h2>
              <dl className={styles.compactDetails}>
                <div>
                  <dt>Sent by</dt>
                  <dd>
                    {core.sender.displayName}
                    <small>{core.sender.department}</small>
                  </dd>
                </div>
                <div>
                  <dt>Requested recipient</dt>
                  <dd>
                    {core.requestedRecipient.displayName}
                    <small>{core.requestedRecipient.department}</small>
                  </dd>
                </div>
                <div>
                  <dt>Destination</dt>
                  <dd>{core.exactSourceDivision}</dd>
                </div>
                <div>
                  <dt>Department</dt>
                  <dd>{core.departmentLabel}</dd>
                </div>
              </dl>
            </section>
            <section className={styles.card}>
              <p className={styles.cardEyebrow}>Source status</p>
              <h2>Prototype data lineage</h2>
              {supplementaryError ? (
                <div className={styles.localError} role="alert">
                  Source details are temporarily unavailable.
                </div>
              ) : supplementary ? (
                <dl className={styles.compactDetails}>
                  <div>
                    <dt>Lead source</dt>
                    <dd>{supplementary.sourceStatus.leadSourceLabel}</dd>
                  </div>
                  <div>
                    <dt>Dynamics</dt>
                    <dd>
                      {supplementary.sourceStatus.dynamicsState.replaceAll(
                        "_",
                        " ",
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Last refresh</dt>
                    <dd>{supplementary.sourceStatus.lastRefreshLabel}</dd>
                  </div>
                </dl>
              ) : (
                <p>Loading source details…</p>
              )}
            </section>
          </aside>
        </div>
      ) : (
        <section
          aria-labelledby="activity-tab"
          className={styles.card}
          id="activity-panel"
          role="tabpanel"
        >
          <div className={styles.activityHeader}>
            <div>
              <p className={styles.cardEyebrow}>
                Append-only collaboration record
              </p>
              <h2>Activity history</h2>
            </div>
            {core.capabilities.addActivity ? (
              <button
                className={styles.primaryButton}
                disabled={writesDisabled}
                onClick={() => setShowActivity(true)}
                type="button"
              >
                Add Activity
              </button>
            ) : null}
          </div>
          <div className={styles.filterScroller} aria-label="Filter activity">
            <div>
              {activityFilters.map((filter) => (
                <button
                  aria-pressed={activityFilter === filter.value}
                  key={filter.value}
                  onClick={() => {
                    setActivityFilter(filter.value);
                    void loadActivity(filter.value);
                  }}
                  type="button"
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          {activityError ? (
            <div className={styles.localError} role="alert">
              <strong>Activity could not be loaded.</strong>
              <button
                className={styles.textButton}
                onClick={() => void loadActivity()}
                type="button"
              >
                Try Again
              </button>
            </div>
          ) : activity?.events.length ? (
            <ol className={styles.timeline}>
              {activity.events.map((event) => (
                <li key={event.id}>
                  <div aria-hidden="true" className={styles.timelineDot} />
                  <article>
                    <div>
                      <strong>{event.title}</strong>
                      <time dateTime={event.occurredAt}>
                        {event.occurredLabel}
                      </time>
                    </div>
                    <p>{event.summary}</p>
                    <ul>
                      {event.details.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ul>
                    <small>
                      {event.actorLabel} · {event.sourceLabel}
                    </small>
                  </article>
                </li>
              ))}
            </ol>
          ) : (
            <div className={styles.emptyState}>
              <h3>No activity in this filter</h3>
              <p>Choose All or add a progress update.</p>
            </div>
          )}
          {activity?.hasMore ? (
            <button
              className={styles.secondaryButton}
              onClick={() => {
                void leadService
                  .getActivity({
                    cursor: activity.nextCursor,
                    filter: activityFilter,
                    handoffId: leadId,
                  })
                  .then((next) =>
                    setActivity((current) =>
                      current
                        ? {
                            ...next,
                            events: [...current.events, ...next.events],
                            total: current.total,
                          }
                        : next,
                    ),
                  )
                  .catch(() => setActivityError(true));
              }}
              type="button"
            >
              Load Earlier
            </button>
          ) : null}
        </section>
      )}
      {showResponse ? (
        <ResponseDialog
          core={core}
          disabled={writesDisabled}
          onClose={() => setShowResponse(false)}
          onComplete={complete}
          service={leadService}
        />
      ) : null}
      {showActivity ? (
        <ActivityDialog
          core={core}
          disabled={writesDisabled}
          onClose={() => setShowActivity(false)}
          onComplete={complete}
          service={leadService}
        />
      ) : null}
      {showFollowUp ? (
        <FollowUpDialog
          core={core}
          disabled={writesDisabled}
          onClose={() => setShowFollowUp(false)}
          onComplete={complete}
          service={leadService}
        />
      ) : null}
    </PageFrame>
  );
}
