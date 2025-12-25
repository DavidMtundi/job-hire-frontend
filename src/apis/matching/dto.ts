export interface IMatchingWeights {
  skills_weight: number;
  experience_weight: number;
  education_weight: number;
}

export interface IMatchingBreakdown {
  total_score: number;
  match_level: string;
  skills_score: number;
  experience_score: number;
  education_score: number;
  matched_skills: string[];
  missing_skills: string[];
  experience_gap: number | null;
  education_match: boolean;
  education_details: string;
  skills_contribution: number;
  experience_contribution: number;
  education_contribution: number;
  explanation: string;
  weights_used: IMatchingWeights;
}

export interface IMatchingScoreResponse {
  success: boolean;
  message: string;
  data: IMatchingBreakdown;
}

export interface IMatchingWeightsResponse {
  success: boolean;
  message: string;
  data: IMatchingWeights;
}

