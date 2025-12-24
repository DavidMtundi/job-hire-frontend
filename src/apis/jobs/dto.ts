import { TJob } from "./schemas";

export type TJobType = "full_time" | "part_time" | "contract" | "internship";
export type TExperienceLevel = "entry" | "mid" | "senior";
export type TJobStatus = "active" | "inactive" | "draft";


export interface IGetJobsParams {
  page?: number;
  page_size?: number;
  search?: string;
  type?: string;
  status?: string;
  is_trending?: boolean;
  is_featured?: boolean;
  job_type?: string;
  category?: string;
}

export interface IPagination {
  page: number;
  page_size: number;
  total_counts: number;
  total_pages: number;
}

export interface IJobsResponse {
  success: boolean;
  message: string;
  data: TJob[];
  pagination?: IPagination;
}

export interface IJobResponse {
  success: boolean;
  message: string;
  data: TJob;
}

export interface IAIGenerateJobRequest {
  text: string;
  language: string;
  save: boolean;
}

export interface IAIGeneratedJobData {
  job_title: string;
  description: string;
  department: string;
  responsibilities: string[];
  required_skills: string[];
  preferred_qualifications: string[];
  education_requirements: string[];
  experience: string;
  location: string;
}

export interface IAIGenerateJobResponse {
  success: boolean;
  message: string;
  status_code: number;
  data: IAIGeneratedJobData;
}
