import { TResumeData } from "../candidates/schema";

export type TCompareResumeData = {
  score: number;
  matching_skills: string[];
  missing_skills: string[];
  recommendation: string;
}

export interface IResumeResponse {
  success: boolean;
  message: string;
  data: TResumeData;
}

export interface ICompareResumeResponse {
  success: boolean;
  message: string;
  data: TCompareResumeData;
}
