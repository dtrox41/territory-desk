import { PageFrame } from "../components/layout/PageFrame";
import { pageMeta } from "../components/layout/page-meta";
import styles from "../components/layout/PageFrame.module.css";

export function meta() {
  return pageMeta(
    "Manager access required",
    "The representative demo profile cannot open Territory Desk Manager Insights.",
  );
}

export default function Insights() {
  return (
    <PageFrame
      description="The current representative demo profile does not include manager permissions."
      eyebrow="Access controlled"
      title="Manager access required"
    >
      <section
        aria-labelledby="manager-access"
        className={styles.placeholderCard}
      >
        <p className={styles.placeholderStatus}>
          <span aria-hidden="true" className={styles.statusDot} />
          Representative demo view
        </p>
        <h2 id="manager-access">Manager Insights remains protected</h2>
        <p>
          A future authorized manager demo profile will add the Manager Insights
          destination without changing representative navigation.
        </p>
      </section>
    </PageFrame>
  );
}
