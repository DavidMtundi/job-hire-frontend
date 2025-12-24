export type TApplicationStatus = "Pending" | "Screening" | "HR Interview" | "Technical Interview" | "Final Interview" | "Offer Sent" | "Hired" | "Rejected" | "Talent Pool";

export type TOverviewSummary = {
  total_applicants: {
    count: number;
    change_percent: number | null;
    trend: "up" | "down";
    comparison_period: "last_month" | "last_week" | "last_day";
  },
  active_jobs: {
    count: number;
    status: string;
  },
  total_applications: {
    count: number;
    change_percent: number | null;
    trend: "up" | "down";
    comparison_period: "last_month" | "last_week" | "last_day";
  },
  hired_this_month: {
    count: number;
    change_percent: number | null;
    trend: "up" | "down";
    comparison_period: "last_month" | "last_week" | "last_day";
  }
}

export type THiringFunnel = {
  stage: string;
  count: number;
  percentage: number;
}[]

export type TTopJobs = {
  id: string;
  title: string;
  department: string;
  applications: number;
  interviews: number;
  offers: number;
  hired: number;
}[]

export type TRecentApplications = Array<{
  id: string;
  applicant_name: string;
  applicant_email: string;
  experience: string;
  job_title: string;
  job_department: string;
  applied_at: string;
  score: number;
  match_level: string;
  status: TApplicationStatus;
}>


export interface IOverviewSummaryResponse {
  success: boolean;
  message: string;
  status_code: number;
  data: TOverviewSummary;
}

export interface IHiringFunnelResponse {
  success: boolean;
  message: string;
  status_code: number;
  data: THiringFunnel;
}

export interface ITopJobsResponse {
  success: boolean;
  message: string;
  status_code: number;
  data: TTopJobs;
}

export interface IRecentApplicationsResponse {
  success: boolean;
  message: string;
  status_code: number;
  data: TRecentApplications;
}