import {
  defaultLeadListFilters,
  filterLeadListRecords,
  includesRecordInView,
  leadsViews,
  sortLeadListRecords,
  toLeadListCard,
  type LeadActionReason,
  type LeadAttentionState,
  type LeadListParticipant,
  type LeadListRecord,
  type LeadListStatus,
} from "../../domain/leads-list";
import type { LeadsListService, LeadViewCounts } from "../leads-list-service";

export const fictionalCurrentUserId = "rep-demo-user";

const participant = (
  id: string,
  displayName: string,
  department: string,
): LeadListParticipant => ({ department, displayName, id });

const currentUser = participant(
  fictionalCurrentUserId,
  "Taylor Morgan",
  "Uniform",
);
const jordan = participant("rep-jordan-lee", "Jordan Lee", "Facility Services");
const jamie = participant("rep-jamie-chen", "Jamie Chen", "Uniform");
const morgan = participant(
  "rep-morgan-davis",
  "Morgan Davis",
  "First Aid & Safety",
);
const casey = participant("rep-casey-rivera", "Casey Rivera", "Uniform");
const alex = participant("rep-alex-grant", "Alex Grant", "Facility Services");
const riley = participant("rep-riley-brooks", "Riley Brooks", "Uniform");
const quinn = participant(
  "rep-quinn-patel",
  "Quinn Patel",
  "First Aid & Safety",
);

function record(input: {
  actionReason?: LeadActionReason;
  attentionState?: LeadAttentionState;
  closedAt?: string;
  closureSummary?: string;
  companyName: string;
  createdAt: string;
  currentOwner?: LeadListParticipant;
  departmentCode?: LeadListRecord["departmentCode"];
  departmentLabel?: string;
  dueAt?: string;
  exactSourceDivision?: string;
  hasException?: boolean;
  id: string;
  latestFeedback: string;
  materialUpdatedAt: string;
  partialData?: boolean;
  primaryFollowUp?: string;
  reassignedAway?: boolean;
  requestedRecipient?: LeadListParticipant;
  requiredActionAt?: string;
  requiredActionOwnerId?: string;
  sender?: LeadListParticipant;
  sourceDivisionCode?: LeadListRecord["sourceDivisionCode"];
  status?: LeadListStatus;
}): LeadListRecord {
  return {
    attentionState: "up_to_date",
    currentOwner: currentUser,
    departmentCode: "facility-services",
    departmentLabel: "Facility Services",
    exactSourceDivision: "Facility Services",
    hasException: false,
    requestedRecipient: currentUser,
    sender: jordan,
    sourceDivisionCode: "facility-services",
    status: "pending_acceptance",
    ...input,
  };
}

const coreRecords: LeadListRecord[] = [
  record({
    actionReason: "response-target-missed",
    attentionState: "needs_attention",
    companyName: "Northstar Packaging",
    createdAt: "2026-08-20T16:15:00Z",
    dueAt: "2026-08-21T22:00:00Z",
    id: "demo-lead-1001",
    latestFeedback: "New peer handoff is still awaiting a meaningful response.",
    materialUpdatedAt: "2026-08-21T22:01:00Z",
    requiredActionAt: "2026-08-20T16:15:00Z",
    requiredActionOwnerId: fictionalCurrentUserId,
    sender: jamie,
  }),
  record({
    actionReason: "follow-up-overdue",
    attentionState: "needs_attention",
    companyName: "Blue River Pediatrics",
    createdAt: "2026-08-18T15:00:00Z",
    departmentCode: "first-aid-safety",
    departmentLabel: "First Aid & Safety",
    dueAt: "2026-08-21T21:00:00Z",
    exactSourceDivision: "First Aid & Safety",
    id: "demo-lead-1002",
    latestFeedback: "Recipient accepted; the primary follow-up is overdue.",
    materialUpdatedAt: "2026-08-21T21:01:00Z",
    primaryFollowUp: "Complete customer qualification call",
    requiredActionAt: "2026-08-21T21:01:00Z",
    requiredActionOwnerId: fictionalCurrentUserId,
    sender: morgan,
    sourceDivisionCode: "first-aid-safety",
    status: "accepted",
  }),
  record({
    actionReason: "information-received",
    attentionState: "action_required",
    companyName: "Summit Auto Group",
    createdAt: "2026-08-22T13:00:00Z",
    departmentCode: "uniform",
    departmentLabel: "Uniform",
    exactSourceDivision: "Uniform Rental",
    id: "demo-lead-1003",
    latestFeedback: "Casey supplied the qualification detail you requested.",
    materialUpdatedAt: "2026-08-24T13:10:00Z",
    requiredActionAt: "2026-08-24T13:10:00Z",
    requiredActionOwnerId: fictionalCurrentUserId,
    sender: casey,
    sourceDivisionCode: "uniform-rental",
  }),
  record({
    actionReason: "new-lead",
    attentionState: "action_required",
    companyName: "Lakeside Foods",
    createdAt: "2026-08-24T13:40:00Z",
    id: "demo-lead-1004",
    latestFeedback: "New peer handoff has not been opened.",
    materialUpdatedAt: "2026-08-24T13:40:00Z",
    requiredActionAt: "2026-08-24T13:40:00Z",
    requiredActionOwnerId: fictionalCurrentUserId,
    sender: alex,
  }),
  record({
    actionReason: "response-needed",
    attentionState: "action_required",
    companyName: "Harbor Tooling",
    createdAt: "2026-08-23T16:00:00Z",
    id: "demo-lead-1010",
    latestFeedback:
      "You viewed this handoff; Accept, Need Information, or Decline remains required.",
    materialUpdatedAt: "2026-08-24T12:30:00Z",
    requiredActionAt: "2026-08-23T16:05:00Z",
    requiredActionOwnerId: fictionalCurrentUserId,
    sender: jordan,
  }),
  record({
    attentionState: "needs_attention",
    companyName: "Cedar Point Fabrication",
    createdAt: "2026-08-22T20:05:00Z",
    currentOwner: currentUser,
    departmentCode: "uniform",
    departmentLabel: "Uniform",
    dueAt: "2026-08-24T13:00:00Z",
    exactSourceDivision: "Uniform Rental",
    id: "demo-lead-1005",
    latestFeedback: "Riley viewed the handoff but has not responded.",
    materialUpdatedAt: "2026-08-23T20:05:00Z",
    requestedRecipient: riley,
    requiredActionAt: "2026-08-22T20:05:00Z",
    requiredActionOwnerId: riley.id,
    sender: currentUser,
    sourceDivisionCode: "uniform-rental",
  }),
  record({
    attentionState: "waiting",
    companyName: "Meadow Lane Pharmacy",
    createdAt: "2026-08-19T18:30:00Z",
    currentOwner: quinn,
    departmentCode: "first-aid-safety",
    departmentLabel: "First Aid & Safety",
    dueAt: "2026-08-26T22:00:00Z",
    exactSourceDivision: "FAS Account Executive",
    id: "demo-lead-1006",
    latestFeedback: "Quinn accepted and is planning the next action.",
    materialUpdatedAt: "2026-08-21T18:30:00Z",
    primaryFollowUp: "Share proposed customer contact plan",
    requestedRecipient: quinn,
    requiredActionAt: "2026-08-21T18:30:00Z",
    requiredActionOwnerId: quinn.id,
    sender: currentUser,
    sourceDivisionCode: "fas-account-executive",
    status: "accepted",
  }),
  record({
    attentionState: "up_to_date",
    companyName: "Greenway Logistics",
    createdAt: "2026-08-15T15:00:00Z",
    currentOwner: currentUser,
    dueAt: "2026-08-27T15:00:00Z",
    id: "demo-lead-1007",
    latestFeedback: "Fictional appointment set for August 27.",
    materialUpdatedAt: "2026-08-24T13:35:00Z",
    primaryFollowUp: "Prepare for customer appointment",
    requiredActionOwnerId: fictionalCurrentUserId,
    sender: jordan,
    status: "appointment_set",
  }),
  record({
    attentionState: "up_to_date",
    companyName: "Metro Education Center",
    createdAt: "2026-08-12T16:00:00Z",
    currentOwner: currentUser,
    departmentCode: "strategic-specialty",
    departmentLabel: "Strategic & Specialty",
    exactSourceDivision: "Education Specialist",
    id: "demo-lead-1011",
    latestFeedback: "Discovery completed; next follow-up is scheduled.",
    materialUpdatedAt: "2026-08-23T16:00:00Z",
    primaryFollowUp: "Review site requirements",
    requiredActionOwnerId: fictionalCurrentUserId,
    sender: alex,
    sourceDivisionCode: "education-specialist",
    status: "in_progress",
  }),
  record({
    attentionState: "up_to_date",
    companyName: "Riverbend Medical",
    createdAt: "2026-08-11T16:00:00Z",
    currentOwner: quinn,
    departmentCode: "first-aid-safety",
    departmentLabel: "First Aid & Safety",
    exactSourceDivision: "First Aid & Safety",
    id: "demo-lead-1012",
    latestFeedback: "The handoff was reassigned after acceptance.",
    materialUpdatedAt: "2026-08-23T12:00:00Z",
    reassignedAway: true,
    requestedRecipient: currentUser,
    sender: morgan,
    sourceDivisionCode: "first-aid-safety",
    status: "in_progress",
  }),
  record({
    attentionState: "needs_attention",
    companyName: "Keystone Assembly",
    createdAt: "2026-08-20T17:00:00Z",
    hasException: true,
    id: "demo-lead-1013",
    latestFeedback: "Some routing context is unavailable and requires review.",
    materialUpdatedAt: "2026-08-22T17:00:00Z",
    partialData: true,
    requiredActionOwnerId: jordan.id,
    sender: alex,
  }),
];

const terminalStatuses: LeadListStatus[] = [
  "won",
  "lost",
  "closed_not_qualified",
  "declined",
  "withdrawn",
];
const demoCompanies = [
  "Oak Street Market",
  "Beacon Dental Group",
  "Maple Ridge Printing",
  "North County Foods",
  "Pioneer Office Supply",
  "Clearwater Fabrication",
  "Evergreen Childcare",
  "Sunrise Auto Parts",
  "Prairie Health Clinic",
  "Sterling Distribution",
  "Grand Avenue Bakery",
  "Westfield Contractors",
  "Parkview Senior Living",
  "Ironwood Manufacturing",
  "Lakeview Hospitality",
  "Crescent Machine Works",
  "Forest Lane Pharmacy",
  "Gateway Property Group",
  "Silverline Packaging",
  "Heritage Community Bank",
  "Valley Industrial Supply",
  "Midtown Service Center",
];

const historicalRecords = demoCompanies.map((companyName, index) => {
  const status = terminalStatuses[index % terminalStatuses.length]!;
  const day = String(23 - (index % 20)).padStart(2, "0");
  const recipient = index % 2 === 0 ? jordan : quinn;
  return record({
    attentionState: "closed",
    closedAt: `2026-08-${day}T17:00:00Z`,
    closureSummary:
      status === "won"
        ? "Fictional favorable outcome recorded in Territory Desk demo."
        : status === "declined"
          ? "Declined with an approved fictional reason."
          : "Fictional terminal outcome recorded with an approved reason.",
    companyName,
    createdAt: `2026-07-${String(28 - (index % 20)).padStart(2, "0")}T15:00:00Z`,
    currentOwner: recipient,
    departmentCode: index % 2 === 0 ? "facility-services" : "first-aid-safety",
    departmentLabel:
      index % 2 === 0 ? "Facility Services" : "First Aid & Safety",
    exactSourceDivision:
      index % 2 === 0 ? "Facility Services" : "First Aid & Safety",
    id: `demo-lead-${1100 + index}`,
    latestFeedback: "Fictional closing update is available in Lead Detail.",
    materialUpdatedAt: `2026-08-${day}T17:00:00Z`,
    requestedRecipient: recipient,
    sender: currentUser,
    sourceDivisionCode:
      index % 2 === 0 ? "facility-services" : "first-aid-safety",
    status,
  });
});

export const fictionalLeadListRecords = [...coreRecords, ...historicalRecords];

type FictionalLeadsListOptions = {
  failCounts?: boolean;
  failList?: boolean;
  stale?: boolean;
};

export function createFictionalLeadsListService(
  options: FictionalLeadsListOptions = {},
): LeadsListService {
  return {
    getCounts() {
      if (options.failCounts) return Promise.reject(new Error("count-failure"));
      const counts = Object.fromEntries(
        leadsViews.map(({ value }) => [
          value,
          fictionalLeadListRecords.filter((item) =>
            includesRecordInView(item, fictionalCurrentUserId, value),
          ).length,
        ]),
      ) as LeadViewCounts;
      return Promise.resolve(counts);
    },
    getLeads(query) {
      if (options.failList) return Promise.reject(new Error("list-failure"));
      const offset = Number.parseInt(query.cursor ?? "0", 10) || 0;
      const pageSize = 20;
      const viewRecords = fictionalLeadListRecords.filter((item) =>
        includesRecordInView(item, fictionalCurrentUserId, query.view),
      );
      const filtered = sortLeadListRecords(
        filterLeadListRecords(
          fictionalLeadListRecords,
          fictionalCurrentUserId,
          query.view,
          query.filters ?? defaultLeadListFilters,
          query.search,
        ),
        query.view,
      );
      const page = filtered.slice(offset, offset + pageSize);
      const nextOffset = offset + page.length;
      return Promise.resolve({
        dataState: options.stale ? "stale" : "current",
        hasMore: nextOffset < filtered.length,
        items: page.map((item) =>
          toLeadListCard(item, fictionalCurrentUserId, query.view),
        ),
        lastUpdatedLabel: "August 24, 2026 at 9:10 AM CT",
        nextCursor:
          nextOffset < filtered.length ? String(nextOffset) : undefined,
        resultTotal: filtered.length,
        viewTotal: viewRecords.length,
      });
    },
  };
}

export const fictionalLeadsListService = createFictionalLeadsListService();
