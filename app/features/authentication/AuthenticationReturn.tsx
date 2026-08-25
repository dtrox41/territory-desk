import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import type { AuthenticationService } from "../../services/authentication-service";
import { AuthenticationFrame } from "./AuthenticationFrame";
import styles from "./AuthenticationSystem.module.css";

export function AuthenticationReturn({
  service,
}: {
  service: AuthenticationService;
}) {
  const navigate = useNavigate();
  const [failedReference, setFailedReference] = useState("");

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      void service.completeAuthenticationReturn().then(async (result) => {
        if (!active) return;
        if (result.type === "failed") {
          setFailedReference(result.reference);
          return;
        }
        window.dispatchEvent(
          new CustomEvent("territory-desk:session-changed", {
            detail: { type: "fictional-sign-in" },
          }),
        );
        await navigate(result.destination, { replace: true });
      });
    }, 350);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [navigate, service]);

  return (
    <AuthenticationFrame
      description={
        failedReference
          ? "The fictional return could not be verified. No session was created and no identity details were displayed."
          : "Validating the fictional environment, persona, and safe return destination before opening the application."
      }
      eyebrow="Fictional authentication return"
      title={
        failedReference
          ? "Sign-in could not be completed"
          : "Completing sign-in"
      }
    >
      {failedReference ? (
        <>
          <div className={styles.error} role="alert">
            <strong>Safe reference</strong>
            <span>{failedReference}</span>
          </div>
          <Link className={styles.primaryLink} to="/sign-in">
            Return to Sign In
          </Link>
        </>
      ) : (
        <div aria-live="polite" className={styles.loadingState} role="status">
          <span aria-hidden="true" className={styles.spinner} />
          <strong>Completing fictional sign-in…</strong>
          <span>No token, code, claim, or full callback URL is displayed.</span>
        </div>
      )}
    </AuthenticationFrame>
  );
}
