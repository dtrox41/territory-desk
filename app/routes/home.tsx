import styles from "./home.module.css";

export function meta() {
  return [
    { title: "Territory Desk — Fictional Prototype" },
    {
      name: "description",
      content:
        "A fictional prototype foundation for cross-division sales collaboration.",
    },
  ];
}

export default function Home() {
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>
      <header className={styles.header}>
        <span className={styles.wordmark}>Territory Desk</span>
        <span className={styles.prototypeBadge}>Fictional prototype</span>
      </header>
      <main className={styles.main} id="main-content" tabIndex={-1}>
        <p className={styles.eyebrow}>Cross-Division Sales Command Center</p>
        <h1>The application foundation is ready.</h1>
        <p className={styles.summary}>
          This separate prototype contains no real employee, customer, lead, or
          Dynamics data. The approved application shell is the next build step.
        </p>
        <section aria-labelledby="foundation-status" className={styles.card}>
          <h2 id="foundation-status">Foundation status</h2>
          <ul>
            <li>React Router Framework Mode with SPA rendering</li>
            <li>Strict TypeScript and centralized design tokens</li>
            <li>
              Automated formatting, lint, unit, accessibility, and build checks
            </li>
            <li>
              Smartphone-first and laptop-responsive implementation boundary
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
