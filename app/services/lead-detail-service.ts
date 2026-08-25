import type {
  LeadActivityDraft,
  LeadActivityFilter,
  LeadActivityResult,
  LeadDetailCore,
  LeadDetailSupplementary,
  LeadResponseDraft,
} from "../domain/lead-detail";

export type LeadDetailLoadResult =
  { core: LeadDetailCore; type: "authorized" } | { type: "unavailable" };

export type LeadCommandResult = {
  core: LeadDetailCore;
  notificationState: "available" | "failed";
  resultHeading: string;
  resultMessage: string;
};

export type LeadResponseCommand = {
  draft: LeadResponseDraft;
  handoffId: string;
  idempotencyKey: string;
  reviewedVersion: number;
};

export type AddLeadActivityCommand = {
  draft: LeadActivityDraft;
  handoffId: string;
  idempotencyKey: string;
  reviewedVersion: number;
};

export type ManageLeadFollowUpCommand = {
  action: "complete" | "create";
  dueAt?: string;
  handoffId: string;
  idempotencyKey: string;
  result?: string;
  reviewedVersion: number;
  summary: string;
  type?: string;
};

export interface LeadDetailService {
  addActivity(command: AddLeadActivityCommand): Promise<LeadCommandResult>;
  getActivity(input: {
    cursor?: string;
    filter: LeadActivityFilter;
    handoffId: string;
  }): Promise<LeadActivityResult>;
  getCore(handoffId: string): Promise<LeadDetailLoadResult>;
  getSupplementary(handoffId: string): Promise<LeadDetailSupplementary>;
  manageFollowUp(
    command: ManageLeadFollowUpCommand,
  ): Promise<LeadCommandResult>;
  recordAuthorizedView(input: {
    handoffId: string;
    reviewedVersion: number;
  }): Promise<{ recorded: boolean }>;
  respond(command: LeadResponseCommand): Promise<LeadCommandResult>;
}
