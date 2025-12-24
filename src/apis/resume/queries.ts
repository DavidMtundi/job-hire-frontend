import { useMutation } from "@tanstack/react-query";
import apiClient from "~/lib/axios";
import { IResumeResponse, ICompareResumeResponse } from "./dto";


export function useUploadResumeMutation() {
  return useMutation<IResumeResponse, Error, { userId: string, file: File }>({
    mutationKey: ["upload-resume"],
    mutationFn: async ({ userId, file }: { userId: string, file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiClient.post<IResumeResponse>(
        `/resume/upload-resume?user_id=${userId}`,
        formData,
        { timeout: 30000 }
      );
      return response.data;
    },
  });
}

export const useCompareResumeMutation = () => {
  return useMutation({
    mutationKey: ["compare-resume"],
    mutationFn: async (body: { job_id: string, resume_url: string }) => {
      const response = await apiClient.post<ICompareResumeResponse>(`/resume/compare-resume-with-job-description`, body);
      return response.data;
    },
    onSuccess: (data) => {
      // console.log("Resume compared:", data);
    },
    onError: (error) => {
      console.error("Error comparing resume:", error);
    },
  });
};

export function useDeleteResumeMutation() {
  return useMutation<IResumeResponse, Error, { userId: string }>({
    mutationKey: ["delete-resume"],
    mutationFn: async ({ userId }: { userId: string }) => {
      const response = await apiClient.delete(
        `/resume/delete-resume?user_id=${userId}`,
      );
      return response.data;
    },
  });
}