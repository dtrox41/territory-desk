import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import { PageFrame } from "../../components/layout/PageFrame";
import type { HelpTopic as HelpTopicData } from "../../domain/help";
import type { HelpService } from "../../services/help-service";
import styles from "./HelpAndFeedback.module.css";

export function HelpTopic({ service }: { service: HelpService }) {
  const { topicSlug = "" } = useParams();
  const [topic, setTopic] = useState<HelpTopicData | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      const access = await service.getAccess();
      if (access.type === "unauthorized") {
        setUnauthorized(true);
        return;
      }
      const result = await service.getTopic(topicSlug);
      if (result.type === "unavailable") {
        setUnavailable(true);
        return;
      }
      setTopic(result.topic);
    } catch {
      setLoadError(true);
    }
  }, [service, topicSlug]);

  useEffect(() => {
    // This detail route owns the permission-aware topic lookup.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  if (unauthorized)
    return (
      <PageFrame
        description="This authenticated topic was not loaded."
        eyebrow="Access controlled"
        title="Help topic access required"
      >
        <Link className={styles.primaryButton} to="/">
          Return Home
        </Link>
      </PageFrame>
    );

  if (unavailable)
    return (
      <PageFrame
        description="The requested topic is unavailable or no longer approved for this profile."
        eyebrow="Current guidance only"
        title="Help topic unavailable"
      >
        <section className={styles.stateCard}>
          <h2>No obsolete instructions were shown</h2>
          <p>Return to Help to search the current approved topic library.</p>
          <Link className={styles.primaryButton} to="/help">
            Return to Help
          </Link>
        </section>
      </PageFrame>
    );

  return (
    <PageFrame
      description={topic?.summary ?? "Loading one approved help topic."}
      eyebrow="Approved demo guidance"
      title={topic?.title ?? "Help Topic"}
    >
      {loadError ? (
        <section className={styles.errorCard} role="alert">
          <h2>Topic could not be loaded</h2>
          <p>No workflow action was performed.</p>
          <button className={styles.primaryButton} onClick={() => void load()}>
            Retry Topic
          </button>
        </section>
      ) : null}
      {topic ? (
        <div className={styles.articleLayout}>
          <nav aria-label="Topic contents" className={styles.contentsRail}>
            <Link to="/help">← Help and Feedback</Link>
            <strong>On this page</strong>
            <a href="#prerequisites">Prerequisites</a>
            <a href="#steps">Steps</a>
            <a href="#result">Expected result</a>
            <a href="#problems">Common problems</a>
            <a href="#related">Related topics</a>
          </nav>
          <article className={styles.article}>
            <div className={styles.articleMeta}>
              <span>{topic.audience}</span>
              <span>{topic.group}</span>
            </div>
            <section>
              <h2>Purpose</h2>
              <p>{topic.purpose}</p>
            </section>
            <section id="prerequisites">
              <h2>Prerequisites</h2>
              <ul>
                {topic.prerequisites.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            <section id="steps">
              <h2>Steps</h2>
              <ol className={styles.steps}>
                {topic.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>
            <section id="result">
              <h2>Expected result</h2>
              <p>{topic.expectedResult}</p>
            </section>
            <section id="problems">
              <h2>Common problems and safe recovery</h2>
              <ul>
                {topic.problems.map((problem) => (
                  <li key={problem}>{problem}</li>
                ))}
              </ul>
              <div className={styles.notDo}>
                <strong>What this does not do</strong>
                <p>{topic.notDo}</p>
              </div>
            </section>
            <section id="related">
              <h2>Related topics</h2>
              <ul className={styles.relatedLinks}>
                {topic.relatedSlugs.map((slug) => (
                  <li key={slug}>
                    <Link to={`/help/${slug}`}>
                      Open related approved topic
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
            <footer className={styles.articleFooter}>
              <span>Content version: {topic.version}</span>
              <span>Last reviewed: {topic.lastReviewed}</span>
            </footer>
          </article>
        </div>
      ) : !loadError ? (
        <section className={styles.stateCard} aria-live="polite">
          <h2>Loading approved topic</h2>
        </section>
      ) : null}
    </PageFrame>
  );
}
