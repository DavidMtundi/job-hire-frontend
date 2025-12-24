import { TCandidate } from "../candidates/schema";
import { TUser } from "./schemas";

export type TUserRole = "candidate" | "admin" | "hr" | "recruiter" | "hiring_manager" | "hr_assistant";
export type TUserCandidate = TUser & { candidate_profile: TCandidate };

export interface IGetUsersParams {
  skip?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export interface IUsersResponse {
  success: boolean;
  message: string;
  data: TUser[];
}

export interface IUserResponse {
  success: boolean;
  message: string;
  data: TUser;
}

export interface IUserCandidateResponse {
  success: boolean;
  message: string;
  data: TUserCandidate;
}