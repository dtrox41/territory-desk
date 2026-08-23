import styles from "./BrandIdentity.module.css";

type BrandIdentityProps = {
  showDescriptor?: boolean;
  variant?: "compact" | "wordmark";
};

export function BrandIdentity({
  showDescriptor = false,
  variant = "wordmark",
}: BrandIdentityProps) {
  return (
    <span className={styles.identity}>
      {variant === "compact" ? (
        <span aria-hidden="true" className={styles.monogram}>
          TD
        </span>
      ) : null}
      <span className={styles.textGroup}>
        <span className={styles.wordmark}>Territory Desk</span>
        {showDescriptor ? (
          <span className={styles.descriptor}>
            Cross-Division Sales Command Center
          </span>
        ) : null}
      </span>
    </span>
  );
}
