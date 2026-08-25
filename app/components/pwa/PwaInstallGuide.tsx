import { useEffect, useState } from "react";

import { Icon } from "../foundation/Icon";
import styles from "./PwaInstallGuide.module.css";

type InstallChoice = {
  outcome: "accepted" | "dismissed";
  platform: string;
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
};

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

const dismissedForSessionKey = "territory-desk-install-guide-dismissed";

function isRunningStandalone() {
  const navigatorWithStandalone = navigator as NavigatorWithStandalone;
  const standaloneDisplayMode =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(display-mode: standalone)").matches;

  return standaloneDisplayMode || navigatorWithStandalone.standalone === true;
}

export function PwaInstallGuide() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<"android" | "ios" | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const registerServiceWorker = () => {
      if ("serviceWorker" in navigator) {
        void navigator.serviceWorker
          .register(`${import.meta.env.BASE_URL}sw.js`, {
            scope: import.meta.env.BASE_URL,
          })
          .catch(() => undefined);
      }
    };

    if ("serviceWorker" in navigator && import.meta.env.PROD) {
      if (document.readyState === "complete") {
        registerServiceWorker();
      } else {
        window.addEventListener("load", registerServiceWorker, { once: true });
      }
    }

    const initializePlatformTimer = window.setTimeout(() => {
      const alreadyDismissed =
        window.sessionStorage.getItem(dismissedForSessionKey) === "true";
      const userAgent = navigator.userAgent.toLowerCase();
      const iosDevice =
        /iphone|ipad|ipod/.test(userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      const runningStandalone = isRunningStandalone();

      setDismissed(alreadyDismissed || runningStandalone);

      if (!alreadyDismissed && !runningStandalone && iosDevice) {
        setPlatform("ios");
      }
    }, 0);

    const captureInstallPrompt = (event: Event) => {
      const installPromptEvent = event as BeforeInstallPromptEvent;
      event.preventDefault();
      setDeferredPrompt(installPromptEvent);

      if (/android/.test(navigator.userAgent.toLowerCase())) {
        setPlatform("android");
        setDismissed(false);
      }
    };

    const hideAfterInstallation = () => {
      setDeferredPrompt(null);
      setPlatform(null);
      setDismissed(true);
    };

    window.addEventListener("beforeinstallprompt", captureInstallPrompt);
    window.addEventListener("appinstalled", hideAfterInstallation);

    return () => {
      window.clearTimeout(initializePlatformTimer);
      window.removeEventListener("load", registerServiceWorker);
      window.removeEventListener("beforeinstallprompt", captureInstallPrompt);
      window.removeEventListener("appinstalled", hideAfterInstallation);
    };
  }, []);

  if (dismissed || platform === null) {
    return null;
  }

  const dismissGuide = () => {
    window.sessionStorage.setItem(dismissedForSessionKey, "true");
    setDismissed(true);
  };

  const requestAndroidInstallation = async () => {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismissGuide();
  };

  return (
    <aside aria-label="Install Territory Desk" className={styles.installGuide}>
      <span aria-hidden="true" className={styles.installIcon}>
        <Icon name="download" size="large" />
      </span>
      <div className={styles.installCopy}>
        <p className={styles.installTitle}>Use Territory Desk like an app</p>
        <p className={styles.installDescription}>
          {platform === "ios"
            ? "In Safari, tap Share, then Add to Home Screen."
            : "Install it on this Android phone for faster Home Screen access."}
        </p>
      </div>
      {platform === "android" ? (
        <button
          className={styles.installButton}
          onClick={() => void requestAndroidInstallation()}
          type="button"
        >
          Install
        </button>
      ) : null}
      <button
        aria-label="Dismiss installation guidance"
        className={styles.dismissButton}
        onClick={dismissGuide}
        type="button"
      >
        <Icon name="close" />
      </button>
    </aside>
  );
}
