import type { HomeDashboardData } from "../domain/home-dashboard";

export interface HomeDashboardService {
  getDashboard(): Promise<HomeDashboardData>;
}
