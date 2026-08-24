import type {
  ConfirmedLeadRoute,
  LeadCustomerDraft,
  LeadDraft,
  LeadRoutingDraft,
  LeadRoutingResolution,
} from "../domain/lead-creation";

export type PossibleLeadDuplicate = {
  handoffId: string;
  safeLabel: string;
};

export type LeadSubmissionResult = {
  createdAtLabel: string;
  handoffId: string;
  inAppNotificationState: "queued";
  recipientDepartment: string;
  recipientId: string;
  recipientName: string;
  responseTargetLabel: string;
  smsState: "simulated" | "failed";
  status: "pending_acceptance";
};

export type LeadSubmissionCommand = {
  confirmedRoute: ConfirmedLeadRoute;
  draft: LeadDraft;
  senderDepartment: string;
  senderId: string;
  senderName: string;
};

export interface LeadCreationService {
  checkForDuplicate(input: {
    customer: LeadCustomerDraft;
    route: ConfirmedLeadRoute;
  }): Promise<PossibleLeadDuplicate | null>;
  resolveRoute(route: LeadRoutingDraft): Promise<LeadRoutingResolution>;
  submit(command: LeadSubmissionCommand): Promise<LeadSubmissionResult>;
}
