import { TCandidate, TResumeData } from "./schema";

export type StackType = "frontend" | "backend" | "fullstack" | "mobile" | "devops" | "qa" | "data" | "ai" | "ux" | "pm" | "other";
export type AvailabilityType = "full_time" | "part_time" | "contract" | "internship";

export interface IGetCandidatesParams {
  skip?: number;
  limit?: number;
  search?: string;
}

export interface ICandidatesResponse {
  success: boolean;
  message: string;
  data: TCandidate[];
}

export interface ICandidateResponse {
  success: boolean;
  message: string;
  data: TCandidate;
}

export interface IResumeResponse {
  success: boolean;
  message: string;
  data: TResumeData;
}