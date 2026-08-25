import { Link } from "react-router";

import {
  errorOutcomeMessage,
  type SystemErrorOutcome,
} from "../../domain/authentication";
import { AuthenticationFrame } from "./AuthenticationFrame";
import styles from "./AuthenticationSystem.module.css";

export type SystemState =
  | "access-changed"
  | "access-denied"
  | "access-required"
  | "account-unavailable"
  | "maintenance"
  | "not-found"
  | "offline"
  | "session-expired"
  | "signed-out"
  | "unexpected-error"
  | "unsupported-browser"
  | "update-required";

type StateConfig = {
  actions: { label: string; to?: string; type?: "reload" }[];
  description: string;
  eyebrow: string;
  note?: string;
  title: string;
};

const configs: Record<Exclude<SystemState, "unexpected-error">, StateConfig> = {
  "access-changed": {
    actions: [
      { label: "Return Home", to: "/" },
      { label: "Open My Work", to: "/leads" },
    ],
    description:
      "Territory Desk cleared information outside your current fictional scope and requires a new authorized load.",
    eyebrow: "Authorization refreshed",
    note: "Removed manager, employee, lead, and notification information cannot be restored from browser history.",
    title: "Your access changed. Territory Desk has refreshed.",
  },
  "access-denied": {
    actions: [
      { label: "Return Home", to: "/" },
      { label: "Open My Work", to: "/leads" },
      { label: "Get Access Help", to: "/help/account-access" },
    ],
    description:
      "Your fictional profile does not have permission for this destination. This page does not confirm whether a protected page or record exists.",
    eyebrow: "Authorization required",
    note: "Possible safe categories include manager permission required, outside authorized scope, no longer a participant, or an action unavailable in the current state.",
    title: "You do not have access to this page or record",
  },
  "access-required": {
    actions: [
      { label: "Get Access Help", to: "/sign-in/help" },
      { label: "Sign Out", to: "/signed-out" },
    ],
    description:
      "A fictional identity was accepted, but an approved Territory Desk application profile is not available.",
    eyebrow: "Application profile required",
    note: "No role name, employee match, missing key, or other account information is displayed, and access is not created automatically.",
    title: "Territory Desk access is not set up for this account",
  },
  "account-unavailable": {
    actions: [
      { label: "Get Sign-In Help", to: "/sign-in/help" },
      { label: "Sign Out", to: "/signed-out" },
    ],
    description:
      "Use sign-in help for a safe next step. This page does not display employment, account, identity-match, or administrator details.",
    eyebrow: "Account state",
    title: "This account cannot use Territory Desk right now",
  },
  maintenance: {
    actions: [
      { label: "Try Again", type: "reload" },
      { label: "Sign Out", to: "/signed-out" },
    ],
    description:
      "The fictional service is not ready for protected work. A pending action has not been reported as successful.",
    eyebrow: "Service interruption",
    note: "Status checked: August 24, 2026 at 10:15 PM CT · No estimated return time is configured.",
    title: "Territory Desk is temporarily unavailable",
  },
  "not-found": {
    actions: [
      { label: "Return Home", to: "/" },
      { label: "Open My Work", to: "/leads" },
    ],
    description:
      "The page may have moved, may be unavailable, or may not exist. No requested URL, record identifier, or protected information is displayed.",
    eyebrow: "Safe destination",
    title: "Page not found",
  },
  offline: {
    actions: [
      { label: "Try Again", type: "reload" },
      { label: "Return to Sign In", to: "/sign-in" },
    ],
    description:
      "A connection is required to sign in, load uncached protected information, or complete a state-changing action.",
    eyebrow: "Connection state",
    note: "Territory Desk does not queue protected work for silent submission. Reconnection must recheck the session, permission, record, and source version.",
    title: "Connection required to continue",
  },
  "session-expired": {
    actions: [
      { label: "Sign In Again", to: "/sign-in" },
      { label: "Sign Out", to: "/signed-out" },
    ],
    description:
      "The protected session is no longer valid. Territory Desk stopped protected writes and will recheck identity and authorization after sign-in.",
    eyebrow: "Session ended",
    note: "Unsaved in-memory work may be lost during sign-in and is never queued for automatic submission.",
    title: "Your session expired",
  },
  "signed-out": {
    actions: [{ label: "Sign In Again", to: "/sign-in" }],
    description:
      "This fictional session ended and session-held demo information was cleared. Existing fictional records were not deleted.",
    eyebrow: "Session ended",
    note: "Close the browser if this were a shared device. Browser Back must not restore protected content.",
    title: "You are signed out",
  },
  "unsupported-browser": {
    actions: [
      { label: "Try Again", type: "reload" },
      { label: "Get Sign-In Help", to: "/sign-in/help" },
    ],
    description:
      "This browser is missing a capability required for safe Territory Desk operation. No device inventory or fingerprint was collected.",
    eyebrow: "Browser support",
    note: "Use a current company-approved browser on the company laptop or reimbursed smartphone when pilot requirements are published.",
    title: "This browser cannot run Territory Desk safely",
  },
  "update-required": {
    actions: [
      { label: "Refresh Now", type: "reload" },
      { label: "Sign Out", to: "/signed-out" },
    ],
    description:
      "The loaded client and current service or data contract cannot safely work together. Incompatible writes are blocked.",
    eyebrow: "Update required",
    note: "Review or copy any permitted unsaved information before refreshing. Reauthentication may be required.",
    title: "Territory Desk needs to refresh before you continue",
  },
};

export function SystemStatePage({
  errorOutcome = "unknown",
  state,
  unsavedWork = false,
}: {
  errorOutcome?: SystemErrorOutcome;
  state: SystemState;
  unsavedWork?: boolean;
}) {
  const config: StateConfig =
    state === "unexpected-error"
      ? {
          actions: [
            { label: "Try Again", type: "reload" },
            { label: "Return Home", to: "/" },
            { label: "Open My Work", to: "/leads" },
          ],
          description: errorOutcomeMessage(errorOutcome),
          eyebrow: "Safe recovery",
          note: "Safe reference: TD-DEMO-PAGE · No stack trace, provider message, payload, credential, customer data, or employee contact is displayed.",
          title: "Territory Desk could not complete this page",
        }
      : configs[state];

  const actions =
    state === "session-expired" && unsavedWork
      ? [
          config.actions[0]!,
          {
            label: "Discard Unsaved Work and Sign Out",
            to: "/signed-out",
          },
        ]
      : config.actions;

  return (
    <AuthenticationFrame
      description={config.description}
      eyebrow={config.eyebrow}
      title={config.title}
    >
      {state === "session-expired" && unsavedWork ? (
        <div className={styles.warning} role="alert">
          <strong>Unsaved work is held in this tab only</strong>
          <span>
            It can be restored only for the same identity with current
            authorization and compatible source versions, followed by review.
          </span>
        </div>
      ) : null}
      {config.note ? (
        <div className={styles.stateNote} role="status">
          {config.note}
        </div>
      ) : null}
      <div className={styles.actionGroup}>
        {actions.map((action, index) =>
          action.type === "reload" ? (
            <button
              className={
                index === 0 ? styles.primaryButton : styles.secondaryButton
              }
              key={action.label}
              onClick={() => window.location.reload()}
              type="button"
            >
              {action.label}
            </button>
          ) : (
            <Link
              className={
                index === 0 ? styles.primaryLink : styles.secondaryLink
              }
              key={action.label}
              to={action.to ?? "/"}
            >
              {action.label}
            </Link>
          ),
        )}
      </div>
      <p className={styles.systemBoundary}>
        This public prototype contains fictional data only. Production
        authentication, authorization, session invalidation, maintenance
        control, and protected recovery must be enforced by approved server-side
        services.
      </p>
    </AuthenticationFrame>
  );
}
