import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";

import { PageFrame } from "../../components/layout/PageFrame";
import type { HelpRequest } from "../../domain/help";
import type { HelpService } from "../../services/help-service";
import styles from "./HelpAndFeedback.module.css";

function commandKey() {
  return `help-request-action-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function HelpRequestDetail({ service }: { service: HelpService }) {
  const { requestId = "" } = useParams();
  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const actionKey = useRef(commandKey());

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      const access = await service.getAccess();
      if (access.type === "unauthorized") {
        setUnavailable(true);
        return;
      }
      const result = await service.getRequest(requestId);
      if (result.type === "unavailable") {
        setUnavailable(true);
        return;
      }
      setRequest(result.request);
    } catch {
      setLoadError(true);
    }
  }, [requestId, service]);

  useEffect(() => {
    // This detail route owns its reporter-authorized request lookup.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function withdraw() {
    if (!window.confirm("Withdraw this request and preserve its history?"))
      return;
    setPending(true);
    const result = await service.withdrawRequest(requestId);
    if (result.type === "found") {
      setRequest(result.request);
      setConfirmation("Request withdrawn. Existing history was preserved.");
    }
    setPending(false);
  }

  async function reopen() {
    setPending(true);
    const result = await service.reopenProblem(requestId, actionKey.current);
    if (result.type === "saved") {
      setConfirmation(
        `Linked reopen request created · ${result.request.id}. The original history was not rewritten.`,
      );
    } else {
      setConfirmation("The reopen result is unknown. Check My Requests.");
    }
    setPending(false);
  }

  if (unavailable)
    return (
      <PageFrame
        description="The request is unavailable or not reporter-visible to this account."
        eyebrow="Reporter authorization required"
        title="Help request unavailable"
      >
        <section className={styles.stateCard}>
          <h2>No request information was disclosed</h2>
          <p>
            Return to My Requests. This page does not confirm whether another
            request exists.
          </p>
          <Link className={styles.primaryButton} to="/help#my-requests">
            Return to My Requests
          </Link>
        </section>
      </PageFrame>
    );

  return (
    <PageFrame
      description="Review one fictional request and reporter-visible updates only."
      eyebrow="Demo support · Reporter-visible"
      title="Help Request"
    >
      {loadError ? (
        <section className={styles.errorCard} role="alert">
          <h2>Request could not be loaded</h2>
          <p>No request action was performed.</p>
          <button className={styles.primaryButton} onClick={() => void load()}>
            Retry Request
          </button>
        </section>
      ) : null}
      {confirmation ? (
        <div className={styles.confirmation} role="status">
          {confirmation}
        </div>
      ) : null}
      {request ? (
        <article className={styles.requestDetail}>
          <header>
            <div>
              <p>
                {request.type === "application-problem"
                  ? "Application problem"
                  : "Product suggestion"}
              </p>
              <h2>{request.summary}</h2>
            </div>
            <span className={styles.statusPill}>{request.status}</span>
          </header>
          {request.routingState === "Routing delayed" ? (
            <div className={styles.routingDelay} role="status">
              Request saved; support routing is delayed. Do not submit again.
            </div>
          ) : null}
          <dl className={styles.requestFacts}>
            <div>
              <dt>Tracking reference</dt>
              <dd>{request.id}</dd>
            </div>
            <div>
              <dt>Safe category</dt>
              <dd>{request.category}</dd>
            </div>
            <div>
              <dt>Submitted</dt>
              <dd>{request.submittedAt}</dd>
            </div>
            <div>
              <dt>Last update</dt>
              <dd>{request.lastUpdate}</dd>
            </div>
          </dl>
          <section className={styles.reporterUpdate}>
            <h3>Latest reporter-visible update</h3>
            <p>
              {request.reporterVisibleNote ??
                "No additional update is available."}
            </p>
          </section>
          <div className={styles.detailActions}>
            <Link className={styles.secondaryButton} to="/help#my-requests">
              Back to My Requests
            </Link>
            {["Submitted", "Acknowledged", "Under review"].includes(
              request.status,
            ) ? (
              <button
                className={styles.textButton}
                disabled={pending}
                onClick={() => void withdraw()}
                type="button"
              >
                Withdraw Request
              </button>
            ) : null}
            {request.type === "application-problem" &&
            ["Resolved", "Closed — no application change"].includes(
              request.status,
            ) ? (
              <button
                className={styles.primaryButton}
                disabled={pending}
                onClick={() => void reopen()}
                type="button"
              >
                Problem Still Occurring
              </button>
            ) : null}
          </div>
          <aside className={styles.exclusionNote}>
            Internal assignments, notes, prioritization, other reporters, and
            engineering details are intentionally excluded. This is not a chat.
          </aside>
        </article>
      ) : !loadError ? (
        <section className={styles.stateCard} aria-live="polite">
          <h2>Checking reporter authorization</h2>
        </section>
      ) : null}
    </PageFrame>
  );
}
