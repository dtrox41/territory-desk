import {
  buildManagerInsightResult,
  recordsForDrilldown,
  type InsightDepartment,
  type ManagerInsightFilters,
  type ManagerInsightRecord,
} from "../../domain/manager-insights";
import type {
  ManagerInsightAccess,
  ManagerInsightsService,
} from "../manager-insights-service";
import { fictionalLeadListRecords } from "./leads-list";

type FictionalManagerInsightsOptions = {
  access?: "authorized" | "no-scope" | "unauthorized";
  failAccess?: boolean;
  failSnapshot?: boolean;
  failSupportingRecords?: boolean;
  mismatch?: boolean;
  partialSection?: "department-pairs" | "primary-metrics";
  stale?: boolean;
};

export type FictionalManagerInsightsService = ManagerInsightsService & {
  setAccess(access: FictionalManagerInsightsOptions["access"]): void;
};

const authorizedDepartments = [
  "uniform",
  "facility-services",
  "first-aid-safety",
] as const;
const generatedAt = "2026-08-24T14:10:00Z";

function addHours(value: string, hours: number) {
  return new Date(Date.parse(value) + hours * 60 * 60 * 1_000).toISOString();
}

function departmentPair(index: number): {
  receivingDepartment: Exclude<InsightDepartment, "all">;
  sendingDepartment: Exclude<InsightDepartment, "all">;
} {
  if (index < 12)
    return {
      receivingDepartment: "facility-services",
      sendingDepartment: "uniform",
    };
  if (index < 20)
    return {
      receivingDepartment: "first-aid-safety",
      sendingDepartment: "facility-services",
    };
  return {
    receivingDepartment: "uniform",
    sendingDepartment: "first-aid-safety",
  };
}

export const fictionalManagerInsightRecords: ManagerInsightRecord[] =
  fictionalLeadListRecords.slice(0, 26).map((lead, index) => {
    const createdAt = new Date(
      Date.parse(generatedAt) - (index + 2) * 24 * 60 * 60 * 1_000,
    ).toISOString();
    const responseTargetAt = addHours(createdAt, 24);
    const hasResponse = index % 6 !== 0;
    const responseDisposition = !hasResponse
      ? undefined
      : index % 4 === 0 || index % 4 === 2
        ? "accept"
        : index % 4 === 1
          ? "need_information"
          : "decline";
    const meaningfulResponseAt = !hasResponse
      ? undefined
      : addHours(responseTargetAt, index % 5 === 1 ? 2 : -3);
    const acceptedAt =
      responseDisposition === "accept" ? meaningfulResponseAt : undefined;
    const updateDueAt = acceptedAt ? addHours(acceptedAt, 48) : undefined;
    const structuredUpdateAt =
      acceptedAt && index % 4 !== 0
        ? addHours(updateDueAt!, index % 8 === 2 ? 2 : -4)
        : undefined;
    const status: ManagerInsightRecord["status"] = acceptedAt
      ? structuredUpdateAt
        ? index % 8 === 6
          ? "completed"
          : "in_progress"
        : "accepted"
      : responseDisposition === "decline"
        ? "completed"
        : "pending";
    const pair = departmentPair(index);
    return {
      acceptedAt,
      companyName: lead.companyName,
      createdAt,
      currentOwnerName: lead.currentOwner.displayName,
      direction: index % 2 ? "received" : "sent",
      hasValidNextAction: Boolean(acceptedAt) && index % 5 !== 0,
      id: lead.id,
      measurementComplete: index !== 14 && index !== 15,
      meaningfulResponseAt,
      responseDisposition,
      responseTargetAt,
      ...pair,
      requiredActionOwnerName:
        !hasResponse || (acceptedAt && !structuredUpdateAt)
          ? lead.currentOwner.displayName
          : undefined,
      routingStatus:
        index === 16 ? "ambiguous" : index === 18 ? "missing" : "unique",
      status,
      structuredUpdateAt,
      updateDueAt,
    };
  });

function safeAccess(type: FictionalManagerInsightsOptions["access"]) {
  if (type === "unauthorized")
    return { type: "unauthorized" as const } satisfies ManagerInsightAccess;
  if (type === "no-scope")
    return { type: "no-scope" as const } satisfies ManagerInsightAccess;
  return {
    authorizedDepartments: [...authorizedDepartments],
    scopeKey: "demo-north-cross-department",
    scopeLabel: "North Location · Uniform + Facility Services + First Aid",
    type: "authorized" as const,
  } satisfies ManagerInsightAccess;
}

function validatesAuthorizedFilters(filters: ManagerInsightFilters) {
  const valid = new Set<InsightDepartment>(["all", ...authorizedDepartments]);
  return (
    valid.has(filters.sendingDepartment) &&
    valid.has(filters.receivingDepartment)
  );
}

export function createFictionalManagerInsightsService(
  options: FictionalManagerInsightsOptions = {},
): FictionalManagerInsightsService {
  let access = options.access ?? "authorized";
  return {
    async getAccess() {
      await Promise.resolve();
      if (options.failAccess) throw new Error("access-unavailable");
      return safeAccess(access);
    },
    async getSnapshot(filters) {
      await Promise.resolve();
      if (access !== "authorized") throw new Error("not-authorized");
      if (!validatesAuthorizedFilters(filters))
        throw new Error("scope-filter-invalid");
      if (options.failSnapshot) throw new Error("snapshot-unavailable");
      if (options.mismatch) throw new Error("result-mismatch");
      return {
        dataState: options.stale
          ? ("stale" as const)
          : options.partialSection
            ? ("partial" as const)
            : ("current" as const),
        definitionVersion: "manager-insights-v1",
        lastUpdatedLabel: "August 24, 2026 at 9:10 AM CT",
        partialSection: options.partialSection,
        result: buildManagerInsightResult(
          fictionalManagerInsightRecords,
          filters,
          generatedAt,
        ),
        sourceVersion: "Territory Desk demo workflow v6",
      };
    },
    async getSupportingRecords({ cursor, filters, type }) {
      await Promise.resolve();
      if (access !== "authorized") throw new Error("not-authorized");
      if (!validatesAuthorizedFilters(filters))
        throw new Error("scope-filter-invalid");
      if (options.failSupportingRecords)
        throw new Error("supporting-records-unavailable");
      const result = buildManagerInsightResult(
        fictionalManagerInsightRecords,
        filters,
        generatedAt,
      );
      const all = recordsForDrilldown(result, type);
      const offset = Number.parseInt(cursor ?? "0", 10) || 0;
      const items = all.slice(offset, offset + 20);
      const nextOffset = offset + items.length;
      return {
        hasMore: nextOffset < all.length,
        items: structuredClone(items),
        nextCursor: nextOffset < all.length ? String(nextOffset) : undefined,
        total: all.length,
      };
    },
    setAccess(nextAccess) {
      access = nextAccess ?? "authorized";
    },
  };
}

export const fictionalManagerInsightsService =
  createFictionalManagerInsightsService();
