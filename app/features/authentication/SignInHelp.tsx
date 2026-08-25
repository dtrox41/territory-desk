import { Link } from "react-router";

import { AuthenticationFrame } from "./AuthenticationFrame";
import styles from "./AuthenticationSystem.module.css";

export function SignInHelp() {
  return (
    <AuthenticationFrame
      description="Use these privacy-minimized checks without entering or sharing an identity, password, verification code, recovery code, token, or secret."
      eyebrow="Public recovery guidance"
      title="Get sign-in help"
    >
      <ol className={styles.helpSteps}>
        <li>Confirm that the smartphone or laptop has a network connection.</li>
        <li>Return to Sign In and retry the fictional demo.</li>
        <li>
          In a future production version, verify the expected company account
          only through the approved identity-provider experience.
        </li>
        <li>
          Do not send a password, one-time code, authentication token, or
          recovery code to Territory Desk.
        </li>
      </ol>
      <div className={styles.warning} role="note">
        <strong>Identity support contact not configured</strong>
        <span>
          No company phone number, email address, response time, account status,
          role, location, or department is invented in this prototype.
        </span>
      </div>
      <div className={styles.actionGroup}>
        <Link className={styles.primaryLink} to="/sign-in">
          Return to Sign In
        </Link>
      </div>
    </AuthenticationFrame>
  );
}
