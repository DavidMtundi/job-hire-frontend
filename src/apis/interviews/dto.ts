export interface IGetInterviewsParams {
  hr_id?: string;
  candidate_id?: string;
  job_id?: string;
  application_id?: string;
  status?: string;
  interview_type?: string;
  limit?: number;
  offset?: number;
  interview_date?: string;
}

export interface IPagination {
  page: number;
  page_size: number;
  total: number;
}

export interface IInterviewRemark {
  id: string;
  interview_id: string;
  user_id: string;
  remark: string;
  created_at: string;
}

export interface IAIInterviewAnswer {
  id: string;
  question: string;
  difficulty: string;
  answer_transcription: string;
  answer_url: string;
  answer_score: number | null;
  weighted_score: number;
  communication_score: number | null;
}

export interface IAIInterviewScoresResponse {
  success: boolean;
  message: string;
  status_code: number;
  data: {
    total_weighted_score: number;
    communication_score: number;
    weighted_percentage_out_of_90: number;
    communication_percentage_out_of_10: number;
    total_percentage_out_of_100: number;
    answers: IAIInterviewAnswer[];
  };
}
