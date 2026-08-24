import type {
  LeadListCard,
  LeadListFilters,
  LeadsView,
} from "../domain/leads-list";

export type LeadViewCounts = Record<LeadsView, number>;

export type LeadsListQuery = {
  cursor?: string;
  filters: LeadListFilters;
  search: string;
  view: LeadsView;
};

export type LeadsListResult = {
  dataState: "current" | "stale";
  hasMore: boolean;
  items: LeadListCard[];
  lastUpdatedLabel: string;
  nextCursor?: string;
  resultTotal: number;
  viewTotal: number;
};

export interface LeadsListService {
  getCounts(): Promise<LeadViewCounts>;
  getLeads(query: LeadsListQuery): Promise<LeadsListResult>;
}
