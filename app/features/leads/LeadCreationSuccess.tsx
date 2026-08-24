import { Link } from "react-router";

import type { LeadEntryContext } from "../../domain/lead-creation";
import type { LeadSubmissionResult } from "../../services/lead-creation-service";
import { PageFrame } from "../../components/layout/PageFrame";
import styles from "./LeadCreationSuccess.module.css";

type LeadCreationSuccessProps = {
  anotherDepartmentContext: Extract<
    LeadEntryContext,
    { source: "another-department" }
  >;
  receipt: LeadSubmissionResult;
};

export function LeadCreationSuccess({
  anotherDepartmentContext,
  receipt,
}: LeadCreationSuccessProps) {
  return (
    <PageFrame
      description="The fictional handoff was saved before its notification attempts began."
      eyebrow="Lead saved"
      title={`Lead sent to ${receipt.recipientName}`}
    >
      <section aria-labelledby="creation-result" className={styles.successCard}>
        <div className={styles.statusLine}>
          <span>Pending Acceptance</span>
          <span>Fictional prototype</span>
        </div>
        <h2 id="creation-result">Response requested</h2>
        <p className={styles.target}>{receipt.responseTargetLabel}</p>
        <p>
          The recipient is asked to provide a meaningful response by this exact
          date and local time.
        </p>
        <dl>
          <div>
            <dt>Handoff reference</dt>
            <dd>{receipt.handoffId}</dd>
          </div>
          <div>
            <dt>Recipient</dt>
            <dd>
              {receipt.recipientName} · {receipt.recipientDepartment}
            </dd>
          </div>
          <div>
            <dt>In-app alert</dt>
            <dd>Queued</dd>
          </div>
          <div>
            <dt>SMS alert</dt>
            <dd>
              {receipt.smsState === "failed"
                ? "Could not be completed"
                : "Simulated"}
            </dd>
          </div>
          <div>
            <dt>Saved</dt>
            <dd>{receipt.createdAtLabel}</dd>
          </div>
        </dl>
        {receipt.smsState === "failed" ? (
          <p className={styles.warning} role="status">
            Lead saved; SMS alert could not be completed. Do not submit the lead
            again. Notification retry remains separate from the handoff.
          </p>
        ) : null}
        <div className={styles.actions}>
          <Link
            className={styles.primaryAction}
            to={`/leads/${receipt.handoffId}#overview`}
          >
            View Lead
          </Link>
          <Link
            className={styles.secondaryAction}
            state={{ leadEntryContext: anotherDepartmentContext }}
            to="/leads/new"
          >
            Create Another Department Handoff
          </Link>
          <Link className={styles.textAction} to="/">
            Return Home
          </Link>
        </div>
      </section>
    </PageFrame>
  );
}
