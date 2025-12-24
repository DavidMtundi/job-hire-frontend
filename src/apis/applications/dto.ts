import { TApplication, TApplicationStatus } from "./schemas";

export interface IGetApplicationsParams {
  page?: number;
  page_size?: number;
  search?: string;
  stage?: TApplicationStatus;
}

export interface IPagination {
  page: number;
  page_size: number;
  total_counts: number;
  total_pages: number;
}

export interface IApplicationsResponse {
  success: boolean;
  message: string;
  data: TApplication[];
  pagination?: IPagination;
}

export interface IApplicationResponse {
  success: boolean;
  message: string;
  data: TApplication;
}

export interface IApplicationDetailResponse {
  success: boolean;
  message: string;
  status_code: number;
  data: IApplicationDetail;
}

export interface IApplicationRemark {
  id: string;
  application_id: string;
  user_id: string;
  remark: string;
  status: string;
  created_at: string;
}

export interface IStatusListItem {
  id: number;
  status: string;
}

export type IStatusListResponse = IStatusListItem[];

export interface IApplicationStatus {
  id: string;
  app_id: string;
  remark: string;
  status_id: string;
  created_by: string;
  created_at: string;
}

export interface IApplicationDetail {
  id: string;
  job_id: string;
  remarks: string | null;
  cover_letter: string;
  notes: string | null;
  score: number | null;
  created_at: string;
  updated_at: string;
  applied_at: string;
  next_step: string | null;
  next_step_date: string | null;
  progress: number | null;
  priority: string;
  stage: string;
  match_level: string | null;
  matching_skills: string[];
  missing_skills: string[];
  recommendation: string | null;
  interview_title: string | null;
  interview_datetime: string | null;
  interview_id: string | null;
  interview_date: string | null;
  duration: number | null;
  meeting_link: string | null;
  selected_time_slot: string | null;
  available_time_slots: string | null;
  interview_type: string | null;
  hr_remarks: string | null;
  user_id: string;
  candidate_id: string;
  recruiter: string | null;

  // User fields
  username: string;
  email: string;
  password: string;
  role: string;
  is_active: boolean;
  is_email_verified: boolean;
  is_profile_complete: boolean;
  role_id: number;

  // Candidate fields
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  current_position: string;
  years_experience: string;
  stack: string[];
  skills: string[];
  linkedin_url: string;
  summary: string;
  expected_salary: string;
  last_education: string;
  joining_availability: string;
  resume_url: string;
  metadata: any | null;

  // Job fields
  title: string;
  description: string;
  responsibilities: string[];
  benefits: string[];
  required_skills: string[];
  education_requirements: string;
  location: string;
  job_type: string;
  experience_level: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  status: string;
  is_remote: boolean;
  application_deadline: string | null;
  max_applications: number | null;
  created_by: string;
  updated_by: string;
  department_id: string | null;
  category_id: string | null;
  is_featured: boolean;
  posted_date: string | null;
  hired_date: string | null;
}
