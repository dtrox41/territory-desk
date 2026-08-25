export type DashboardTone =
  "danger" | "information" | "neutral" | "success" | "warning";

export type DashboardSummaryItem = {
  count: number;
  description: string;
  href: string;
  label: string;
  tone: DashboardTone;
};

export type DashboardActionItem = {
  company: string;
  department: string;
  exactTime: string;
  handoffId: string;
  primaryAction: string;
  rankReason: string;
  relativeTime: string;
  sender: string;
  status: string;
  tone: DashboardTone;
  visibleReason: string;
};

export type DashboardWaitingItem = {
  company: string;
  department: string;
  exactTime: string;
  handoffId: string;
  lastActivity: string;
  recipient: string;
  relativeTime: string;
  status: string;
  tone: DashboardTone;
};

export type DashboardFeedbackItem = {
  actor: string;
  company: string;
  department: string;
  event: string;
  exactTime: string;
  handoffId: string;
  relativeTime: string;
  tone: DashboardTone;
};

export type DashboardInsightItem = {
  detail: string;
  href: string;
  label: string;
  tone: DashboardTone;
  value: string;
};

export type HomeDashboardData = {
  actionRequired: {
    items: DashboardActionItem[];
    total: number;
  };
  dateLabel: string;
  feedback: {
    items: DashboardFeedbackItem[];
    total: number;
  };
  greeting: string;
  insights: DashboardInsightItem[];
  lastUpdatedLabel: string;
  statusMessage: string;
  summary: DashboardSummaryItem[];
  waiting: {
    items: DashboardWaitingItem[];
    total: number;
  };
};
