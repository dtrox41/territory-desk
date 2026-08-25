import type { IconName } from "./Icon";

export type NavigationItem = {
  icon: IconName;
  label: string;
  to: string;
};

export const primaryNavigation: NavigationItem[] = [
  { icon: "home", label: "Home", to: "/" },
  { icon: "territory", label: "Territory", to: "/territory" },
  { icon: "send", label: "Send Lead", to: "/leads/new" },
  { icon: "leads", label: "Leads", to: "/leads" },
  { icon: "directory", label: "Directory", to: "/directory" },
];

export const secondaryNavigation: NavigationItem[] = [
  { icon: "chart", label: "Manager Insights", to: "/insights" },
  { icon: "database", label: "Data Status", to: "/data-status" },
  { icon: "help", label: "Help and Feedback", to: "/help" },
  { icon: "profile", label: "My Profile", to: "/profile" },
];

export function isNavigationItemActive(pathname: string, to: string) {
  if (to === "/") {
    return pathname === "/";
  }

  if (to === "/leads/new") {
    return pathname === "/leads/new";
  }

  if (to === "/leads") {
    return pathname.startsWith("/leads") && pathname !== "/leads/new";
  }

  return pathname === to || pathname.startsWith(`${to}/`);
}

export function getPageTitle(pathname: string) {
  if (pathname === "/") return "Home";
  if (pathname === "/territory") return "Find Territory";
  if (pathname === "/leads/new") return "Send Lead";
  if (pathname.startsWith("/leads/")) return "Lead Detail";
  if (pathname.startsWith("/directory/")) return "Representative Detail";
  if (pathname.startsWith("/help/requests/")) return "Help Request";
  if (pathname.startsWith("/help/")) return "Help Topic";

  const matchingItem = [...primaryNavigation, ...secondaryNavigation].find(
    (item) => item.to === pathname,
  );

  if (matchingItem) return matchingItem.label;
  if (pathname === "/notifications") return "Notifications";
  return "Page not found";
}
