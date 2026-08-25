import styles from "./ReleaseStamp.module.css";

type ReleaseStampProps = {
  buildId?: string;
  releasedAt?: string;
};

export function formatReleaseTimestamp(value: string) {
  const parsedTimestamp = new Date(value);

  if (Number.isNaN(parsedTimestamp.getTime())) {
    return null;
  }

  return parsedTimestamp
    .toISOString()
    .replace("T", " ")
    .replace(/\.\d{3}Z$/, " UTC");
}

export function ReleaseStamp({
  buildId = import.meta.env.VITE_PUBLIC_BUILD_ID,
  releasedAt = import.meta.env.VITE_PUBLIC_RELEASED_AT,
}: ReleaseStampProps) {
  const exactBuildId = buildId?.trim();
  const formattedTimestamp = releasedAt?.trim()
    ? formatReleaseTimestamp(releasedAt.trim())
    : null;

  if (!exactBuildId || !formattedTimestamp) {
    return null;
  }

  const visibleBuildId = exactBuildId.slice(0, 12);

  return (
    <span
      aria-label={`Exact source build ${exactBuildId}. Released ${formattedTimestamp}.`}
      className={styles.stamp}
      data-build-id={exactBuildId}
      data-released-at={releasedAt}
    >
      Build {visibleBuildId} · Released {formattedTimestamp}
    </span>
  );
}
