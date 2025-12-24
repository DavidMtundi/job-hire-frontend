import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "~/lib/axios";
import { TAIQuestion, TAIQuestionsResponse, TMarkAIInterviewResponse, TAIInterviewLinkResponse, TSubmitAnswerResponse } from "./schemas";

export const useGetAIInterviewQuestionsQuery = (jobId: string | null) => {
  return useQuery<TAIQuestion[], Error>({
    queryKey: ["ai-interview-questions", jobId],
    enabled: !!jobId,
    queryFn: async () => {
      const response = await apiClient.get<TAIQuestionsResponse>(
        `/ai-interview/${jobId}/random-questions`
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(response.data.message || "Failed to fetch questions");
    },
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404 || error?.response?.status === 422) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useMarkAIInterviewMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
      interviewId,
      isAiInterview,
    }: {
      applicationId: string;
      interviewId: string;
      isAiInterview: boolean;
    }) => {
      const response = await apiClient.post<TMarkAIInterviewResponse>(
        `/ai-interview/mark-ai-interview?application_id=${applicationId}&interview_id=${interviewId}&is_ai_interview=${isAiInterview}`
      );

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message || "Failed to mark AI interview");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
    },
  });
};

export const useGetAIInterviewLinkMutation = () => {
  return useMutation({
    mutationFn: async ({
      applicationId,
      interviewId,
      jobId,
    }: {
      applicationId: string;
      interviewId: string;
      jobId: string;
    }) => {
      const response = await apiClient.get<TAIInterviewLinkResponse>(
        `/ai-interview/ai-interview-link?application_id=${applicationId}&interview_id=${interviewId}&job_id=${jobId}`
      );

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message || "Failed to get AI interview link");
    },
  });
};

export const useSubmitAnswerMutation = () => {
  return useMutation({
    mutationFn: async ({
      applicationId,
      interviewId,
      question,
      difficulty,
      audioFile,
    }: {
      applicationId: string;
      interviewId: string;
      question: string;
      difficulty: string;
      audioFile: Blob;
    }) => {
      const formData = new FormData();
      formData.append("application_id", applicationId);
      formData.append("interview_id", interviewId);
      formData.append("question", question);
      formData.append("difficulty", difficulty);
      formData.append("audio_file", audioFile, "answer.webm");

      const response = await apiClient.post<TSubmitAnswerResponse>(
        `/ai-interview/submit_answer`,
        formData
      );

      if (response.data.success) {
        return response.data;
      }

      throw new Error(response.data.message || "Failed to submit answer");
    },
  });
};
