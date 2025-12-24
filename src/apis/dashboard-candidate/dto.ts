export type TApplicationStatus = "Pending" | "Screening" | "HR Interview" | "Technical Interview" | "Final Interview" | "Offer Sent" | "Hired" | "Rejected" | "Talent Pool";

export type TApplicationStatusSummary = {
  status_summary: {
    status: TApplicationStatus;
    count: number;
  }[],
  meta: {
    last_updated: string;
  }
}

export type TApplicationTrend = {
  trend: {
    month: string;
    applications: number;
  }[],
  meta: {
    period: "last_4_months" | "last_3_months" | "last_2_months" | "last_month";
    last_updated: string;
  }
}

export type TApplicationSummary = {
  total_applications: {
    count: number;
    change_percent: number | null;
    trend: "up" | "down";
    comparison_period: "last_month" | "last_week" | "last_day";
  };
  active_applications: {
    count: number;
    change_percent: number | null;
    trend: "up" | "down";
    comparison_period: "last_month" | "last_week" | "last_day";
  };
  interviews: {
    count: number;
    change_percent: number | null;
    trend: "up" | "down";
    comparison_period: "last_month" | "last_week" | "last_day";
  };
  response_rate: {
    value: number;
    change_percent: number | null;
    trend: "up" | "down";
    comparison_period: "last_month" | "last_week" | "last_day";
  };
  meta: {
    period: "monthly" | "weekly" | "daily";
    last_updated: string;
  };
}

export interface IApplicationSummaryResponse {
  success: boolean;
  message: string;
  status_code: number;
  data: TApplicationSummary;
}

export interface IApplicationStatusSummaryResponse {
  success: boolean;
  message: string;
  status_code: number;
  data: TApplicationStatusSummary;
}

export interface IApplicationTrendResponse {
  success: boolean;
  message: string;
  status_code: number;
  data: TApplicationTrend;
}