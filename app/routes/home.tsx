import { PageFrame } from "../components/layout/PageFrame";
import { pageMeta } from "../components/layout/page-meta";
import styles from "./home.module.css";

export function meta() {
  return pageMeta(
    "Home",
    "Fictional Territory Desk application-shell preview for cross-division sales collaboration.",
  );
}

export default function Home() {
  return (
    <PageFrame
      description="The responsive navigation foundation is ready for the fictional cross-division lead workflow."
      eyebrow="Cross-Division Sales Command Center"
      title="Home"
    >
      <div className={styles.grid}>
        <section aria-labelledby="shell-status" className={styles.card}>
          <p className={styles.status}>Step 5.2 shell preview</p>
          <h2 id="shell-status">Consistent access on phone and laptop</h2>
          <p>
            Use the primary navigation to verify Home, Territory, Send Lead,
            Leads, and Directory without entering any real information.
          </p>
        </section>
        <aside
          aria-labelledby="current-boundary"
          className={styles.boundaryCard}
        >
          <h2 id="current-boundary">Current safety boundary</h2>
          <ul>
            <li>Fictional route placeholders only</li>
            <li>No employee or customer records</li>
            <li>No live messages or integrations</li>
            <li>No browser data persistence</li>
          </ul>
        </aside>
      </div>
    </PageFrame>
  );
}
