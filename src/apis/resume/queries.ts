import { useMutation } from "@tanstack/react-query";
import apiClient from "~/lib/axios";
import { IResumeResponse, ICompareResumeResponse } from "./dto";


export function useUploadResumeMutation() {
  return useMutation<IResumeResponse, Error, { userId: string, file: File }>({
    mutationKey: ["upload-resume"],
    mutationFn: async ({ userId, file }: { userId: string, file: File }) => {
      if (process.env.NODE_ENV === "development") {
        console.log("[Resume Upload] Starting upload for file:", {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          userId: userId,
        });
      }
      
      const formData = new FormData();
      formData.append("file", file);
      
      try {
        const response = await apiClient.post<IResumeResponse>(
          `/resume/upload-resume?user_id=${userId}`,
          formData,
          {
            timeout: 60000, // Increased timeout for file uploads
            headers: {
              // DO NOT set Content-Type - let the browser/Axios handle FormData with boundary
              // Setting it manually breaks the multipart boundary
            }
          }
        );
        
        if (process.env.NODE_ENV === "development") {
          console.log("[Resume Upload] ✅ Upload successful:", {
            message: response.data?.message,
            hasData: !!response.data?.data,
            dataKeys: response.data?.data ? Object.keys(response.data.data) : [],
          });
        }
        
        return response.data;
      } catch (error: any) {
        if (process.env.NODE_ENV === "development") {
          console.error("[Resume Upload] ❌ Upload failed:", {
            errorMessage: error?.message,
            errorCode: error?.code,
            errorStatus: error?.response?.status,
            errorData: error?.response?.data,
            errorType: error?.constructor?.name,
            fileName: file.name,
            userId: userId,
          });
        }
        throw error;
      }
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