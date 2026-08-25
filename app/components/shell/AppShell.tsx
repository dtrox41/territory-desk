import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, Outlet, useLocation } from "react-router";

import { BrandIdentity } from "../foundation/BrandIdentity";
import { Icon } from "../foundation/Icon";
import { ReleaseStamp } from "../foundation/ReleaseStamp";
import {
  getPageTitle,
  isNavigationItemActive,
  primaryNavigation,
  secondaryNavigation,
  type NavigationItem,
} from "../foundation/navigation";
import { PwaInstallGuide } from "../pwa/PwaInstallGuide";
import styles from "./AppShell.module.css";

type AppShellProps = {
  children?: ReactNode;
  managerView?: boolean;
};

type ShellNavigationLinkProps = {
  item: NavigationItem;
  leadsActionCount: number;
  onNavigate?: () => void;
  placement: "drawer" | "mobile" | "rail";
};

const initialLeadsRequiringActionCount = 5;
const initialUnreadNotificationCount = 3;

function getNavigationAccessibleName(
  item: NavigationItem,
  leadsActionCount: number,
) {
  if (item.to === "/leads") {
    return `${item.label}, ${leadsActionCount} leads require action`;
  }

  return item.label;
}

function ShellNavigationLink({
  item,
  leadsActionCount,
  onNavigate,
  placement,
}: ShellNavigationLinkProps) {
  const { pathname } = useLocation();
  const isActive = isNavigationItemActive(pathname, item.to);
  const isSendLead = item.to === "/leads/new";
  const isLeads = item.to === "/leads";

  const className =
    placement === "mobile"
      ? [
          styles.navigationLink,
          isActive ? styles.currentNavigationLink : "",
          isSendLead ? styles.primaryNavigationLink : "",
        ]
          .filter(Boolean)
          .join(" ")
      : [
          placement === "rail"
            ? styles.railNavigationLink
            : styles.drawerNavigationLink,
          placement === "rail" && isSendLead ? styles.railPrimaryAction : "",
        ]
          .filter(Boolean)
          .join(" ");

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      aria-label={getNavigationAccessibleName(item, leadsActionCount)}
      className={className}
      onClick={onNavigate}
      to={item.to}
    >
      <Icon
        name={item.icon}
        size={placement === "mobile" ? "medium" : "large"}
      />
      <span className={styles.navigationLabel}>{item.label}</span>
      {isLeads ? (
        <span
          aria-hidden="true"
          className={
            placement === "rail"
              ? `${styles.navActionBadge} ${styles.railActionBadge}`
              : styles.navActionBadge
          }
        >
          {leadsActionCount}
        </span>
      ) : null}
    </Link>
  );
}

function EnvironmentBanner() {
  return (
    <aside
      aria-label="Fictional prototype status"
      className={styles.environmentBanner}
    >
      <span>
        Fictional Prototype — Do not enter real employee or customer information
      </span>
      <ReleaseStamp />
    </aside>
  );
}

function NotificationLink({
  count,
  countAvailable,
}: {
  count: number;
  countAvailable: boolean;
}) {
  const accessibleName = countAvailable
    ? count
      ? `Notifications, ${count} unread notifications`
      : "Notifications, no unread notifications"
    : "Notifications, notification count unavailable";
  return (
    <Link
      aria-label={accessibleName}
      className={styles.notificationLink}
      to="/notifications"
    >
      <Icon name="bell" size="large" />
      {countAvailable && count > 0 ? (
        <span aria-hidden="true" className={styles.countBadge}>
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}

export function AppShell({ children, managerView = false }: AppShellProps) {
  const { pathname } = useLocation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const previousPathnameRef = useRef(pathname);
  const [isSecondaryNavigationOpen, setIsSecondaryNavigationOpen] =
    useState(false);
  const [leadsActionCount, setLeadsActionCount] = useState(
    initialLeadsRequiringActionCount,
  );
  const [notificationCount, setNotificationCount] = useState(
    initialUnreadNotificationCount,
  );
  const [notificationCountAvailable, setNotificationCountAvailable] =
    useState(true);
  const visibleSecondaryNavigation = secondaryNavigation.filter(
    (item) => item.to !== "/insights" || managerView,
  );

  useEffect(() => {
    if (previousPathnameRef.current !== pathname) {
      document.querySelector<HTMLElement>("#main-content h1")?.focus();
      previousPathnameRef.current = pathname;
    }
  }, [pathname]);

  useEffect(() => {
    const receiveLeadUpdate = (event: Event) => {
      const count = (event as CustomEvent<{ actionCount?: number }>).detail
        ?.actionCount;
      if (typeof count === "number" && Number.isInteger(count) && count >= 0) {
        setLeadsActionCount(count);
      }
    };
    window.addEventListener("territory-desk:leads-updated", receiveLeadUpdate);
    return () =>
      window.removeEventListener(
        "territory-desk:leads-updated",
        receiveLeadUpdate,
      );
  }, []);

  useEffect(() => {
    const receiveNotificationUpdate = (event: Event) => {
      const detail = (
        event as CustomEvent<{ count?: number; countAvailable?: boolean }>
      ).detail;
      if (detail?.countAvailable === false) {
        setNotificationCountAvailable(false);
      } else if (
        detail?.countAvailable === true &&
        typeof detail.count === "number" &&
        Number.isInteger(detail.count) &&
        detail.count >= 0
      ) {
        setNotificationCount(detail.count);
        setNotificationCountAvailable(true);
      }
    };
    window.addEventListener(
      "territory-desk:notifications-updated",
      receiveNotificationUpdate,
    );
    return () =>
      window.removeEventListener(
        "territory-desk:notifications-updated",
        receiveNotificationUpdate,
      );
  }, []);

  useEffect(() => {
    const markNotificationCountUnavailable = () =>
      setNotificationCountAvailable(false);
    window.addEventListener("offline", markNotificationCountUnavailable);
    return () =>
      window.removeEventListener("offline", markNotificationCountUnavailable);
  }, []);

  const openSecondaryNavigation = () => {
    const dialog = dialogRef.current;

    if (dialog && !dialog.open) {
      dialog.showModal();
      setIsSecondaryNavigationOpen(true);
    }
  };

  const closeSecondaryNavigation = () => {
    const dialog = dialogRef.current;

    if (dialog?.open) {
      dialog.close();
    }
  };

  return (
    <div className={styles.shell}>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <aside aria-label="Application navigation" className={styles.desktopRail}>
        <div className={styles.railBrand}>
          <BrandIdentity showDescriptor variant="compact" />
        </div>
        <nav aria-label="Primary navigation">
          <ul className={styles.railNavigationList}>
            {primaryNavigation.map((item) => (
              <li key={item.to}>
                <ShellNavigationLink
                  item={item}
                  leadsActionCount={leadsActionCount}
                  placement="rail"
                />
              </li>
            ))}
          </ul>
        </nav>
        <hr className={styles.railDivider} />
        <nav aria-label="Secondary navigation">
          <ul className={styles.railNavigationList}>
            {visibleSecondaryNavigation
              .filter((item) => item.to !== "/profile")
              .map((item) => (
                <li key={item.to}>
                  <ShellNavigationLink
                    item={item}
                    leadsActionCount={leadsActionCount}
                    placement="rail"
                  />
                </li>
              ))}
          </ul>
        </nav>
        <div className={styles.railBottom}>
          <ShellNavigationLink
            item={{ icon: "profile", label: "My Profile", to: "/profile" }}
            leadsActionCount={leadsActionCount}
            placement="rail"
          />
        </div>
      </aside>

      <div className={styles.workspace}>
        <div className={styles.headerStack}>
          <EnvironmentBanner />

          <header className={styles.mobileTopBar}>
            <button
              aria-controls="secondary-navigation-drawer"
              aria-expanded={isSecondaryNavigationOpen}
              aria-label="Open profile and secondary navigation"
              className={styles.iconButton}
              onClick={openSecondaryNavigation}
              ref={menuButtonRef}
              type="button"
            >
              <Icon name="menu" size="large" />
            </button>
            <div className={styles.mobileBrand}>
              <BrandIdentity />
            </div>
            <NotificationLink
              count={notificationCount}
              countAvailable={notificationCountAvailable}
            />
          </header>

          <header className={styles.desktopTopBar}>
            <p className={styles.desktopPageTitle}>{getPageTitle(pathname)}</p>
            <div className={styles.desktopUtilities}>
              <NotificationLink
                count={notificationCount}
                countAvailable={notificationCountAvailable}
              />
              <Link
                aria-label="Open My Profile"
                className={styles.profileLink}
                to="/profile"
              >
                <Icon name="profile" />
                <span>Profile</span>
              </Link>
            </div>
          </header>
        </div>

        <PwaInstallGuide />

        <main className={styles.main} id="main-content" tabIndex={-1}>
          <div className={styles.contentCanvas}>{children ?? <Outlet />}</div>
        </main>

        <nav
          aria-label="Primary navigation"
          className={styles.bottomNavigation}
        >
          <ul className={styles.navigationList}>
            {primaryNavigation.map((item) => (
              <li className={styles.navigationListItem} key={item.to}>
                <ShellNavigationLink
                  item={item}
                  leadsActionCount={leadsActionCount}
                  placement="mobile"
                />
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <dialog
        aria-labelledby="secondary-navigation-title"
        className={styles.drawer}
        id="secondary-navigation-drawer"
        onClose={() => {
          setIsSecondaryNavigationOpen(false);
          menuButtonRef.current?.focus();
        }}
        ref={dialogRef}
      >
        <div className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle} id="secondary-navigation-title">
            Profile and more
          </h2>
          <button
            aria-label="Close secondary navigation"
            className={styles.iconButton}
            onClick={closeSecondaryNavigation}
            type="button"
          >
            <Icon name="close" size="large" />
          </button>
        </div>
        <div className={styles.drawerBody}>
          <p className={styles.drawerContext}>
            {managerView
              ? "Authorized manager demo view. My Work remains personal; Team Insights uses a separate fictional team scope."
              : "Representative demo view. Manager Insights appears only for an authorized manager profile."}
          </p>
          <nav aria-label="Secondary navigation">
            <ul className={styles.drawerNavigationList}>
              {visibleSecondaryNavigation.map((item) => (
                <li key={item.to}>
                  <ShellNavigationLink
                    item={item}
                    leadsActionCount={leadsActionCount}
                    onNavigate={closeSecondaryNavigation}
                    placement="drawer"
                  />
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </dialog>
    </div>
  );
}
