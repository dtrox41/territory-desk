import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

import type { DemoPersona, DemoPersonaId } from "../../domain/authentication";
import type { AuthenticationService } from "../../services/authentication-service";
import { AuthenticationFrame } from "./AuthenticationFrame";
import styles from "./AuthenticationSystem.module.css";

function useOnline() {
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}

export function SignIn({ service }: { service: AuthenticationService }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const online = useOnline();
  const [personas, setPersonas] = useState<DemoPersona[]>([]);
  const [selecting, setSelecting] = useState(false);
  const [pending, setPending] = useState<DemoPersonaId | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void service.getDemoPersonas().then(setPersonas);
  }, [service]);

  async function choosePersona(personaId: DemoPersonaId) {
    setPending(personaId);
    setError("");
    try {
      await service.beginDemoSignIn(personaId, searchParams.get("returnTo"));
      await navigate("/auth/return", { replace: true });
    } catch {
      setError(
        "Fictional demo access could not start. No account information was used.",
      );
      setPending(null);
    }
  }

  return (
    <AuthenticationFrame
      description="Use a visibly fictional persona to review the public prototype. No email address, password, or company identity is required."
      eyebrow="Prototype access"
      title="Sign in to Territory Desk"
    >
      {!online ? (
        <div className={styles.warning} role="status">
          <strong>Connection required for production sign-in</strong>
          <span>
            This intentionally bundled fictional demo remains available offline.
            No protected service will be contacted.
          </span>
        </div>
      ) : null}
      <div className={styles.boundary} role="note">
        <strong>Public fictional demonstration</strong>
        <span>
          This is not company authentication. A production version will require
          a company-approved identity service and server-protected session.
        </span>
      </div>
      {!selecting ? (
        <button
          className={styles.primaryButton}
          onClick={() => setSelecting(true)}
          type="button"
        >
          Enter Fictional Demo
        </button>
      ) : (
        <section
          aria-labelledby="persona-title"
          className={styles.personaSection}
        >
          <div className={styles.sectionHeading}>
            <p>Fictional identities</p>
            <h2 id="persona-title">Choose a demo persona</h2>
          </div>
          <ul className={styles.personaList}>
            {personas.map((persona) => (
              <li key={persona.id}>
                <div>
                  <h3>{persona.label}</h3>
                  <p>{persona.description}</p>
                  <span>{persona.scope}</span>
                </div>
                <button
                  className={styles.secondaryButton}
                  disabled={pending !== null}
                  onClick={() => void choosePersona(persona.id)}
                  type="button"
                >
                  {pending === persona.id
                    ? "Starting Fictional Demo…"
                    : `Use ${persona.label} Demo`}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <div className={styles.secondaryActions}>
        <Link to="/sign-in/help">Get Sign-In Help</Link>
      </div>
      <div className={styles.securityNote}>
        <h2>Security boundary</h2>
        <p>
          Territory Desk does not collect a password in this prototype, offer
          public registration, or request notification, location, camera,
          microphone, contacts, or calendar permission at sign-in.
        </p>
      </div>
    </AuthenticationFrame>
  );
}
