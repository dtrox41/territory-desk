export const managerInsightPeriods = [7, 30, 90] as const;

export type ManagerInsightPeriod = (typeof managerInsightPeriods)[number];
export type ManagerInsightDirection = "both" | "received" | "sent";
export type ManagerInsightStatus =
  "accepted" | "all" | "completed" | "in_progress" | "pending";
export type InsightDepartment =
  "all" | "facility-services" | "first-aid-safety" | "uniform";
export type InsightExceptionType =
  | "all"
  | "closed-loop-support"
  | "incomplete-measurement"
  | "missing-next-action"
  | "missed-first-response"
  | "overdue-update"
  | "response-support"
  | "routing-exception";

export const insightDepartmentLabels: Record<InsightDepartment, string> = {
  all: "All authorized departments",
  "facility-services": "Facility Services",
  "first-aid-safety": "First Aid & Safety",
  uniform: "Uniform",
};

export const defaultManagerInsightFilters: ManagerInsightFilters = {
  direction: "both",
  period: 30,
  receivingDepartment: "all",
  sendingDepartment: "all",
  status: "all",
};

export type ManagerInsightFilters = {
  direction: ManagerInsightDirection;
  period: ManagerInsightPeriod;
  receivingDepartment: InsightDepartment;
  sendingDepartment: InsightDepartment;
  status: ManagerInsightStatus;
};

export type ManagerInsightRecord = {
  acceptedAt?: string;
  companyName: string;
  createdAt: string;
  currentOwnerName: string;
  direction: Exclude<ManagerInsightDirection, "both">;
  hasValidNextAction: boolean;
  id: string;
  measurementComplete: boolean;
  meaningfulResponseAt?: string;
  responseDisposition?: "accept" | "decline" | "need_information";
  responseTargetAt: string;
  receivingDepartment: Exclude<InsightDepartment, "all">;
  requiredActionOwnerName?: string;
  routingStatus: "ambiguous" | "missing" | "unique";
  sendingDepartment: Exclude<InsightDepartment, "all">;
  status: Exclude<ManagerInsightStatus, "all">;
  structuredUpdateAt?: string;
  updateDueAt?: string;
};

export type InsightMetric = {
  denominator: number;
  excluded: number;
  numerator: number;
  rate: number | null;
};

export type InsightAttentionGroup = {
  count: number;
  description: string;
  oldestLabel: string;
  type: Exclude<
    InsightExceptionType,
    "all" | "closed-loop-support" | "response-support"
  >;
};

export type InsightDepartmentPair = {
  closedLoop: InsightMetric;
  comparisonEligible: boolean;
  eligibleDenominator: number;
  exceptionCount: number;
  firstResponse: InsightMetric;
  oldestExceptionAt?: string;
  receivingDepartment: Exclude<InsightDepartment, "all">;
  sendingDepartment: Exclude<InsightDepartment, "all">;
  warning?: string;
};

export type ManagerInsightResult = {
  attentionGroups: InsightAttentionGroup[];
  closedLoop: InsightMetric;
  departmentPairs: InsightDepartmentPair[];
  disposition: {
    accept: number;
    decline: number;
    needInformation: number;
  };
  firstResponse: InsightMetric;
  generatedAt: string;
  measurement: {
    complete: number;
    completenessRate: number;
    excluded: number;
    total: number;
  };
  medianResponseHours: number | null;
  needsAttentionCount: number;
  nextActionCoverage: InsightMetric;
  openLoopAging: {
    missedLessThanDay: number;
    missedOneToThreeDays: number;
    missedOverThreeDays: number;
    withinTarget: number;
  };
  records: ManagerInsightRecord[];
  responseP75Hours: number | null;
  routing: InsightMetric;
};

const completedStatuses = new Set<ManagerInsightRecord["status"]>([
  "completed",
]);

function matchesFilters(
  record: ManagerInsightRecord,
  filters: ManagerInsightFilters,
  now: string,
) {
  const periodStart = Date.parse(now) - filters.period * 24 * 60 * 60 * 1_000;
  return (
    Date.parse(record.createdAt) >= periodStart &&
    (filters.sendingDepartment === "all" ||
      record.sendingDepartment === filters.sendingDepartment) &&
    (filters.receivingDepartment === "all" ||
      record.receivingDepartment === filters.receivingDepartment) &&
    (filters.direction === "both" || record.direction === filters.direction) &&
    (filters.status === "all" || record.status === filters.status)
  );
}

function firstResponseEligible(record: ManagerInsightRecord, now: string) {
  return (
    record.measurementComplete &&
    record.routingStatus === "unique" &&
    (Boolean(record.meaningfulResponseAt) ||
      Date.parse(record.responseTargetAt) <= Date.parse(now))
  );
}

function closedLoopEligible(record: ManagerInsightRecord, now: string) {
  return (
    record.measurementComplete &&
    record.routingStatus === "unique" &&
    Boolean(record.acceptedAt) &&
    Boolean(record.updateDueAt) &&
    (Boolean(record.structuredUpdateAt) ||
      Date.parse(record.updateDueAt!) <= Date.parse(now))
  );
}

export function exceptionTypesForRecord(
  record: ManagerInsightRecord,
  now: string,
) {
  const types: InsightExceptionType[] = [];
  if (
    record.routingStatus === "unique" &&
    !record.meaningfulResponseAt &&
    Date.parse(record.responseTargetAt) < Date.parse(now)
  )
    types.push("missed-first-response");
  if (
    record.acceptedAt &&
    record.updateDueAt &&
    !record.structuredUpdateAt &&
    Date.parse(record.updateDueAt) < Date.parse(now)
  )
    types.push("overdue-update");
  if (
    record.acceptedAt &&
    !completedStatuses.has(record.status) &&
    !record.hasValidNextAction
  )
    types.push("missing-next-action");
  if (record.routingStatus !== "unique") types.push("routing-exception");
  if (!record.measurementComplete) types.push("incomplete-measurement");
  return types;
}

function metric(
  eligible: ManagerInsightRecord[],
  numerator: (record: ManagerInsightRecord) => boolean,
  excluded: number,
): InsightMetric {
  const numeratorCount = eligible.filter(numerator).length;
  return {
    denominator: eligible.length,
    excluded,
    numerator: numeratorCount,
    rate: eligible.length ? numeratorCount / eligible.length : null,
  };
}

function percentile(values: number[], fraction: number) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(sorted.length * fraction) - 1),
  );
  return sorted[index] ?? null;
}

function oldestLabel(records: ManagerInsightRecord[], now: string) {
  if (!records.length) return "None in this view";
  const oldest = Math.min(
    ...records.map((record) => Date.parse(record.createdAt)),
  );
  const days = Math.max(
    1,
    Math.floor((Date.parse(now) - oldest) / (24 * 60 * 60 * 1_000)),
  );
  return `Oldest ${days} ${days === 1 ? "day" : "days"}`;
}

function buildDepartmentPairs(
  records: ManagerInsightRecord[],
  now: string,
): InsightDepartmentPair[] {
  const groups = new Map<string, ManagerInsightRecord[]>();
  for (const record of records) {
    const key = `${record.sendingDepartment}:${record.receivingDepartment}`;
    groups.set(key, [...(groups.get(key) ?? []), record]);
  }
  return [...groups.values()]
    .map((pairRecords) => {
      const firstEligible = pairRecords.filter((record) =>
        firstResponseEligible(record, now),
      );
      const loopEligible = pairRecords.filter((record) =>
        closedLoopEligible(record, now),
      );
      const exceptionRecords = pairRecords.filter(
        (record) => exceptionTypesForRecord(record, now).length,
      );
      const evidenceComplete = pairRecords.every(
        (record) =>
          record.measurementComplete && record.routingStatus === "unique",
      );
      const eligibleDenominator = firstEligible.length;
      return {
        closedLoop: metric(
          loopEligible,
          (record) =>
            Date.parse(record.structuredUpdateAt!) <=
            Date.parse(record.updateDueAt!),
          pairRecords.length - loopEligible.length,
        ),
        comparisonEligible: eligibleDenominator >= 10 && evidenceComplete,
        eligibleDenominator,
        exceptionCount: exceptionRecords.length,
        firstResponse: metric(
          firstEligible,
          (record) =>
            Date.parse(record.meaningfulResponseAt!) <=
            Date.parse(record.responseTargetAt),
          pairRecords.length - firstEligible.length,
        ),
        oldestExceptionAt: exceptionRecords
          .map((record) => record.createdAt)
          .sort()[0],
        receivingDepartment: pairRecords[0]!.receivingDepartment,
        sendingDepartment: pairRecords[0]!.sendingDepartment,
        warning: evidenceComplete
          ? eligibleDenominator < 10
            ? "Insufficient volume for comparison"
            : undefined
          : "Comparison unavailable — routing or completeness check",
      };
    })
    .sort((a, b) => {
      if (a.exceptionCount !== b.exceptionCount)
        return b.exceptionCount - a.exceptionCount;
      const oldestA = Date.parse(a.oldestExceptionAt ?? now);
      const oldestB = Date.parse(b.oldestExceptionAt ?? now);
      if (oldestA !== oldestB) return oldestA - oldestB;
      return `${a.sendingDepartment}:${a.receivingDepartment}`.localeCompare(
        `${b.sendingDepartment}:${b.receivingDepartment}`,
      );
    });
}

export function buildManagerInsightResult(
  allRecords: ManagerInsightRecord[],
  filters: ManagerInsightFilters,
  now = "2026-08-24T14:10:00Z",
): ManagerInsightResult {
  const records = allRecords.filter((record) =>
    matchesFilters(record, filters, now),
  );
  const firstEligible = records.filter((record) =>
    firstResponseEligible(record, now),
  );
  const loopEligible = records.filter((record) =>
    closedLoopEligible(record, now),
  );
  const firstResponse = metric(
    firstEligible,
    (record) =>
      Date.parse(record.meaningfulResponseAt!) <=
      Date.parse(record.responseTargetAt),
    records.length - firstEligible.length,
  );
  const closedLoop = metric(
    loopEligible,
    (record) =>
      Date.parse(record.structuredUpdateAt!) <= Date.parse(record.updateDueAt!),
    records.length - loopEligible.length,
  );
  const acceptedOpen = records.filter(
    (record) => record.acceptedAt && !completedStatuses.has(record.status),
  );
  const exceptionMap = new Map<InsightExceptionType, ManagerInsightRecord[]>();
  for (const record of records) {
    for (const type of exceptionTypesForRecord(record, now)) {
      exceptionMap.set(type, [...(exceptionMap.get(type) ?? []), record]);
    }
  }
  const attentionDefinitions: Array<{
    description: string;
    type: InsightAttentionGroup["type"];
  }> = [
    {
      description:
        "The one-business-day workflow deadline elapsed without Accept, Need Information, or Decline.",
      type: "missed-first-response",
    },
    {
      description:
        "An accepted handoff has not received its required structured progress update.",
      type: "overdue-update",
    },
    {
      description:
        "An open accepted handoff has no valid future structured next action.",
      type: "missing-next-action",
    },
    {
      description:
        "Missing or ambiguous routing requires approved resolution before attribution.",
      type: "routing-exception",
    },
  ];
  const attentionGroups = attentionDefinitions.map((definition) => {
    const matching = exceptionMap.get(definition.type) ?? [];
    return {
      count: matching.length,
      description: definition.description,
      oldestLabel: oldestLabel(matching, now),
      type: definition.type,
    };
  });
  const responseHours = firstEligible
    .filter((record) => record.meaningfulResponseAt)
    .map(
      (record) =>
        (Date.parse(record.meaningfulResponseAt!) -
          Date.parse(record.createdAt)) /
        (60 * 60 * 1_000),
    );
  const exceptionIds = new Set(
    records
      .filter((record) => exceptionTypesForRecord(record, now).length)
      .map((record) => record.id),
  );
  const disposition = records.reduce(
    (totals, record) => {
      if (record.responseDisposition === "accept") totals.accept += 1;
      if (record.responseDisposition === "decline") totals.decline += 1;
      if (record.responseDisposition === "need_information")
        totals.needInformation += 1;
      return totals;
    },
    { accept: 0, decline: 0, needInformation: 0 },
  );
  const attempted = records.length;
  const routingExceptions = records.filter(
    (record) => record.routingStatus !== "unique",
  ).length;
  const complete = records.filter(
    (record) => record.measurementComplete,
  ).length;
  const openLoopAging = {
    missedLessThanDay: 0,
    missedOneToThreeDays: 0,
    missedOverThreeDays: 0,
    withinTarget: 0,
  };
  for (const record of records.filter(
    (item) => !completedStatuses.has(item.status),
  )) {
    const dueAt = record.updateDueAt ?? record.responseTargetAt;
    const delta = Date.parse(now) - Date.parse(dueAt);
    if (delta <= 0) openLoopAging.withinTarget += 1;
    else if (delta < 24 * 60 * 60 * 1_000) openLoopAging.missedLessThanDay += 1;
    else if (delta <= 3 * 24 * 60 * 60 * 1_000)
      openLoopAging.missedOneToThreeDays += 1;
    else openLoopAging.missedOverThreeDays += 1;
  }
  return {
    attentionGroups,
    closedLoop,
    departmentPairs: buildDepartmentPairs(records, now),
    disposition,
    firstResponse,
    generatedAt: now,
    measurement: {
      complete,
      completenessRate: attempted ? complete / attempted : 0,
      excluded: attempted - complete,
      total: attempted,
    },
    medianResponseHours: percentile(responseHours, 0.5),
    needsAttentionCount: exceptionIds.size,
    nextActionCoverage: metric(
      acceptedOpen,
      (record) => record.hasValidNextAction,
      records.length - acceptedOpen.length,
    ),
    openLoopAging,
    records,
    responseP75Hours: percentile(responseHours, 0.75),
    routing: {
      denominator: attempted,
      excluded: 0,
      numerator: routingExceptions,
      rate: attempted ? routingExceptions / attempted : null,
    },
  };
}

export function recordsForDrilldown(
  result: ManagerInsightResult,
  type: InsightExceptionType,
  now = result.generatedAt,
) {
  if (type === "response-support") {
    return result.records.filter((record) =>
      firstResponseEligible(record, now),
    );
  }
  if (type === "closed-loop-support") {
    return result.records.filter((record) => closedLoopEligible(record, now));
  }
  if (type === "all") {
    return result.records.filter(
      (record) => exceptionTypesForRecord(record, now).length,
    );
  }
  return result.records.filter((record) =>
    exceptionTypesForRecord(record, now).includes(type),
  );
}

export function formatInsightRate(rate: number | null) {
  return rate === null ? "Metric unavailable" : `${Math.round(rate * 100)}%`;
}
