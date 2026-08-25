import type { ReactNode } from "react";

import { BrandIdentity } from "../../components/foundation/BrandIdentity";
import { ReleaseStamp } from "../../components/foundation/ReleaseStamp";
import styles from "./AuthenticationSystem.module.css";

export function AuthenticationFrame({
  children,
  description,
  eyebrow,
  title,
}: {
  children?: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <main className={styles.page} id="main-content">
      <div className={styles.environmentBanner} role="note">
        <span>
          Fictional prototype — not connected to Cintas systems or production
          data.
        </span>
        <ReleaseStamp />
      </div>
      <section className={styles.card}>
        <BrandIdentity showDescriptor variant="compact" />
        <header className={styles.header}>
          <p>{eyebrow}</p>
          <h1 tabIndex={-1}>{title}</h1>
          <div>{description}</div>
        </header>
        {children}
      </section>
    </main>
  );
}
