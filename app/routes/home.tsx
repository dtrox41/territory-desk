import { useLoaderData } from "react-router";

import { pageMeta } from "../components/layout/page-meta";
import { HomeDashboard } from "../features/dashboard/HomeDashboard";
import { fictionalHomeDashboardService } from "../services/fictional/home-dashboard";

export function meta() {
  return pageMeta(
    "Home",
    "Fictional Territory Desk dashboard for cross-department lead actions, feedback, and follow-up.",
  );
}

export async function clientLoader() {
  return fictionalHomeDashboardService.getDashboard();
}

clientLoader.hydrate = true as const;

export default function Home() {
  const dashboard = useLoaderData<typeof clientLoader>();

  return <HomeDashboard dashboard={dashboard} />;
}
