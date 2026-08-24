import {
  getNextBusinessDay,
  normalizeCompanyForDuplicateCheck,
  validateCustomerDraft,
  validateOpportunityDraft,
  validateRouteDraft,
} from "../../domain/lead-creation";
import type {
  TerritoryAssignment,
  TerritorySearchResult,
} from "../../domain/territory-result";
import type {
  ConfirmedLeadRoute,
  LeadRoutingResolution,
} from "../../domain/lead-creation";
import { normalizeTerritorySearch } from "../../domain/territory-search";
import type {
  LeadCreationService,
  LeadSubmissionCommand,
  LeadSubmissionResult,
} from "../lead-creation-service";
import { fictionalTerritoryLookupService } from "./territory-lookup";

const sourceVersion = "fictional-2026-08-20";

type FictionalLeadCreationOptions = {
  now?: () => Date;
};

function makeConfirmedRoute(
  assignment: TerritoryAssignment,
  result: TerritorySearchResult,
) {
  return makeConfirmedRouteFrom(assignment, result);
}

function makeConfirmedRouteFrom(
  assignment: TerritoryAssignment,
  result: TerritorySearchResult,
): ConfirmedLeadRoute {
  const representative = assignment.representatives[0];
  if (!representative) {
    throw new Error("A confirmed route requires one fictional representative.");
  }
  return {
    assignment,
    city: result.canonicalCity ?? "Location unavailable",
    department: assignment.departmentCode,
    representative,
    sourceUpdatedLabel: result.sourceUpdatedLabel,
    sourceVersion,
    state: result.canonicalState ?? "--",
    zip:
      result.search.kind === "zip"
        ? result.search.zip
        : (result.zipCodes[0] ?? ""),
  };
}

function formatResponseTarget(now: Date) {
  const businessDate = getNextBusinessDay(now);
  const target = new Date(
    Date.UTC(
      businessDate.getUTCFullYear(),
      businessDate.getUTCMonth(),
      businessDate.getUTCDate(),
      22,
      0,
      0,
    ),
  );
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "long",
    weekday: "long",
    year: "numeric",
    timeZone: "America/Chicago",
    timeZoneName: "short",
  }).format(target);
}

function hasErrors(errors: Record<string, string>) {
  return Object.keys(errors).length > 0;
}

export function createFictionalLeadCreationService(
  options: FictionalLeadCreationOptions = {},
): LeadCreationService {
  const receipts = new Map<string, LeadSubmissionResult>();
  let sequence = 1;
  const now = options.now ?? (() => new Date("2026-08-24T15:00:00.000Z"));

  return {
    checkForDuplicate({ customer, route }) {
      const sameFixture =
        normalizeCompanyForDuplicateCheck(customer.companyName) ===
          "northstar packaging" &&
        route.zip === "63101" &&
        route.department === "facility-services";

      return Promise.resolve(
        sameFixture
          ? {
              handoffId: "lead-demo-existing-1042",
              safeLabel:
                "A recent Facility Services handoff exists for this company and ZIP.",
            }
          : null,
      );
    },

    async resolveRoute(route): Promise<LeadRoutingResolution> {
      if (hasErrors(validateRouteDraft(route))) return { type: "not-found" };
      const search = normalizeTerritorySearch(route.zip);
      if (!search.ok) return { type: "not-found" };
      const result = await fictionalTerritoryLookupService.getResults(
        search.value,
      );
      if (!result) return { type: "not-found" };
      if (result.dataState === "stale") return { type: "stale" };

      const assignment = result.assignments.find(
        (candidate) => candidate.departmentCode === route.department,
      );
      if (!assignment) return { type: "not-found" };
      if (assignment.status === "needs-review") {
        return { assignment, type: "needs-review" };
      }
      if (
        assignment.status === "open" ||
        assignment.representatives.length === 0
      ) {
        return { assignment, type: "open" };
      }

      const currentRoute = makeConfirmedRoute(assignment, result);
      if (
        route.preferredRepresentativeId &&
        route.preferredRepresentativeId !== currentRoute.representative.id
      ) {
        return {
          currentRoute,
          preferredRepresentativeId: route.preferredRepresentativeId,
          type: "recipient-mismatch",
        };
      }
      return { route: currentRoute, type: "confirmed" };
    },

    async submit(command: LeadSubmissionCommand) {
      const existing = receipts.get(command.draft.idempotencyKey);
      if (existing) return existing;

      if (
        hasErrors(validateRouteDraft(command.draft.routing)) ||
        hasErrors(validateCustomerDraft(command.draft.customer)) ||
        hasErrors(validateOpportunityDraft(command.draft.opportunity))
      ) {
        throw new Error("validation-failed");
      }

      const revalidated = await this.resolveRoute({
        ...command.draft.routing,
        preferredRepresentativeId: undefined,
      });
      if (revalidated.type !== "confirmed") throw new Error("routing-changed");
      if (
        revalidated.route.assignment.id !==
          command.confirmedRoute.assignment.id ||
        revalidated.route.representative.id !==
          command.confirmedRoute.representative.id ||
        revalidated.route.sourceVersion !== command.confirmedRoute.sourceVersion
      ) {
        throw new Error("routing-changed");
      }
      if (command.senderId === revalidated.route.representative.id) {
        throw new Error("self-handoff");
      }

      const createdAt = now();
      const receipt: LeadSubmissionResult = {
        createdAtLabel: new Intl.DateTimeFormat("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "America/Chicago",
        }).format(createdAt),
        handoffId: `lead-demo-${String(sequence++).padStart(4, "0")}`,
        inAppNotificationState: "queued",
        recipientDepartment: revalidated.route.assignment.departmentLabel,
        recipientId: revalidated.route.representative.id,
        recipientName: revalidated.route.representative.displayName,
        responseTargetLabel: formatResponseTarget(createdAt),
        smsState:
          normalizeCompanyForDuplicateCheck(
            command.draft.customer.companyName,
          ) === "signal test labs"
            ? "failed"
            : "simulated",
        status: "pending_acceptance",
      };
      receipts.set(command.draft.idempotencyKey, receipt);
      return receipt;
    },
  };
}

export const fictionalLeadCreationService =
  createFictionalLeadCreationService();
