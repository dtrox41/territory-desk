import type {
  InsightExceptionType,
  ManagerInsightFilters,
  ManagerInsightRecord,
  ManagerInsightResult,
} from "../domain/manager-insights";

export type ManagerInsightAccess =
  | { type: "no-scope" }
  | { type: "unauthorized" }
  | {
      authorizedDepartments: Array<
        Exclude<ManagerInsightFilters["sendingDepartment"], "all">
      >;
      scopeLabel: string;
      scopeKey: string;
      type: "authorized";
    };

export type ManagerInsightSnapshot = {
  dataState: "current" | "partial" | "stale";
  definitionVersion: string;
  lastUpdatedLabel: string;
  partialSection?: "department-pairs" | "primary-metrics";
  result: ManagerInsightResult;
  sourceVersion: string;
};

export type ManagerInsightRecordPage = {
  hasMore: boolean;
  items: ManagerInsightRecord[];
  nextCursor?: string;
  total: number;
};

export interface ManagerInsightsService {
  getAccess(): Promise<ManagerInsightAccess>;
  getSnapshot(filters: ManagerInsightFilters): Promise<ManagerInsightSnapshot>;
  getSupportingRecords(input: {
    cursor?: string;
    filters: ManagerInsightFilters;
    type: InsightExceptionType;
  }): Promise<ManagerInsightRecordPage>;
}
