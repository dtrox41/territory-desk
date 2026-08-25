import type { ReactNode } from "react";

import styles from "./PageFrame.module.css";

type PageFrameProps = {
  children: ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
};

export function PageFrame({
  children,
  description,
  eyebrow,
  title,
}: PageFrameProps) {
  return (
    <div className={styles.frame}>
      <header className={styles.header}>
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <h1 className={styles.heading} tabIndex={-1}>
          {title}
        </h1>
        {description ? (
          <p className={styles.description}>{description}</p>
        ) : null}
      </header>
      <div className={styles.content}>{children}</div>
    </div>
  );
}

type PlaceholderPageProps = {
  description: string;
  title: string;
};

export function PlaceholderPage({ description, title }: PlaceholderPageProps) {
  return (
    <PageFrame
      description={description}
      eyebrow="Application shell preview"
      title={title}
    >
      <section
        aria-labelledby="placeholder-status"
        className={styles.placeholderCard}
      >
        <p className={styles.placeholderStatus}>
          <span aria-hidden="true" className={styles.statusDot} />
          Route and navigation ready
        </p>
        <h2 id="placeholder-status">Screen implementation comes next</h2>
        <p>
          This route is intentionally a fictional placeholder. No employee,
          customer, lead, or Dynamics data is connected.
        </p>
      </section>
    </PageFrame>
  );
}
