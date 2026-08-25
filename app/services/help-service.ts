import type { HelpRequest, HelpSnapshot, HelpTopic } from "../domain/help";

export type HelpAccess =
  | { type: "unauthorized" }
  | { manager: boolean; reporterId: string; type: "authorized" };

export type SubmitApplicationProblemCommand = {
  action: string;
  category: string;
  contactAllowed: boolean;
  details: string;
  diagnosticLabels: string[];
  idempotencyKey: string;
  impact: string;
  screen: string;
  summary: string;
};

export type SubmitSuggestionCommand = {
  area: string;
  contactAllowed: boolean;
  frequency: string;
  idempotencyKey: string;
  impact: string;
  problem: string;
  suggestion: string;
};

export type SubmitHelpRequestResult =
  { request: HelpRequest; type: "saved" } | { type: "unknown" };

export type HelpRequestLookup =
  { request: HelpRequest; type: "found" } | { type: "unavailable" };

export type HelpTopicLookup =
  | { topic: HelpTopic; type: "found" }
  | { replacementSlugs: string[]; type: "unavailable" };

export interface HelpService {
  getAccess(): Promise<HelpAccess>;
  getRequest(requestId: string): Promise<HelpRequestLookup>;
  getSnapshot(): Promise<HelpSnapshot>;
  getTopic(topicSlug: string): Promise<HelpTopicLookup>;
  reopenProblem(
    requestId: string,
    idempotencyKey: string,
  ): Promise<SubmitHelpRequestResult>;
  submitApplicationProblem(
    command: SubmitApplicationProblemCommand,
  ): Promise<SubmitHelpRequestResult>;
  submitSuggestion(
    command: SubmitSuggestionCommand,
  ): Promise<SubmitHelpRequestResult>;
  withdrawRequest(requestId: string): Promise<HelpRequestLookup>;
}
