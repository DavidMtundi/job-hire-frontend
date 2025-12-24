export type TRecruiterSummary = {
  recruiter: string | null;
  total_applications: number;
  shortlisted: number;
  interview_scheduled: number;
  interviewed: number;
  hired: number;
  rejected: number;
  pending: number;
  reviewed: number;
}

export type TManagerOverviewSummary = {
  recruiters: TRecruiterSummary[];
  meta: {
    total_recruiters: number;
  };
}

export type TKPIItem = {
  recruiter: string;
  offers_sent: number;
  offers_accepted: number;
  offers_rejected: number;
  offer_acceptance_rate: number;
}

export type TKPIAnalytics = {
  kpis: TKPIItem[];
  meta: {
    total_recruiters: number;
  };
}

export type TJobAnalyticsItem = {
  title: string;
  applied_total: number;
  shortlisted: number;
  interview_scheduled: number;
  interviewed: number;
  hired: number;
  rejected: number;
  pending: number;
  reviewed: number;
}

export type TJobAnalytics = {
  jobs: TJobAnalyticsItem[];
  meta: {
    total_jobs: number;
  };
}

export type TRecruiterAnalyticsItem = {
  recruiter: string;
  total_applications: number;
  shortlisted: number;
  interview_scheduled: number;
  interviewed: number;
  hired: number;
  rejected: number;
  pending: number;
  reviewed: number;
}

export type TRecruiterAnalytics = {
  recruiters: TRecruiterAnalyticsItem[];
  meta: {
    total_recruiters: number;
  };
}

export interface IManagerOverviewSummaryResponse {
  success: boolean;
  message: string;
  status_code: number;
  data: TManagerOverviewSummary;
}

export interface IKPIAnalyticsResponse {
  success: boolean;
  message: string;
  status_code: number;
  data: TKPIAnalytics;
}

export interface IJobAnalyticsResponse {
  success: boolean;
  message: string;
  status_code: number;
  data: TJobAnalytics;
}

export interface IRecruiterAnalyticsResponse {
  success: boolean;
  message: string;
  status_code: number;
  data: TRecruiterAnalytics;
}

export type TRecruitmentAnalyticsItem = {
  job_id: string;
  role: string;
  requisition_request_date: string;
  date_filled: string | null;
  time_to_fill_days: number | null;
  total_offer_made: number;
  total_hired: number;
  offer_accepted: number;
  offer_rejected: number;
  tags: "active" | "closed" | "inactive";
}

export interface IRecruitmentAnalyticsResponse {
  success: boolean;
  message: string;
  status_code: number;
  data: TRecruitmentAnalyticsItem[];
}

export type TRecruiterPerformanceItem = {
  recruiter: string;
  no_of_leads: number;
  hr_screening: number;
  passed_assessment: number;
  technical_interview_stage: number;
  potential_for_future_roles: number;
  no_of_offer_sent: number;
  no_of_offer_acceptance: number;
  no_of_offer_rejected: number;
}

export type TRecruitersPerformance = {
  recruiters: TRecruiterPerformanceItem[];
  meta: {
    total_recruiters: number;
  };
}

export interface IRecruitersPerformanceResponse {
  success: boolean;
  message: string;
  status_code: number;
  data: TRecruitersPerformance;
}