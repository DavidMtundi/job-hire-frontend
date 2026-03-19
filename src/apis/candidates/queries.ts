import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "~/lib/axios";
import {
  ICandidateResponse,
  ICandidatesResponse,
  IGetCandidatesParams,
  IResumeResponse,
} from "./dto";
import { TCreateCandidate, TUpdateCandidate } from "./schema";


export const useGetCandidatesQuery = (filters: IGetCandidatesParams = {}) => {
  return useQuery<ICandidatesResponse, Error>({
    queryKey: ["candidates", filters],
    queryFn: async () => {
      const response = await apiClient.get<ICandidatesResponse>("/candidates/", {
        params: {
          page: 1,
          page_size: 100, // Get all candidates for now (frontend handles filtering)
          ...(filters.search ? { search: filters.search } : {}),
        },
      });
      return response.data;
    },
  });
};

export const useGetCandidateQuery = (candidateId: string) => {
  return useQuery<ICandidateResponse, Error>({
    queryKey: ["candidates", candidateId],
    enabled: !!candidateId,
    queryFn: async () => {
      const response = await apiClient.get<ICandidateResponse>(`/candidates/${candidateId}`);
      return response.data;
    },
  });
};

export const useGetCandidateByUserIdQuery = (userId: string) => {
  return useQuery<ICandidateResponse, Error>({
    queryKey: ["candidates", "by-user", userId],
    enabled: !!userId,
    queryFn: async () => {
      try {
        const response = await apiClient.get<ICandidateResponse>(`/candidates/by-user/${userId}`);
        return response.data;
      } catch (error: any) {
        // Handle 404 as "not found" (expected for new users) - return success=false
        // Check both axios error structure and ApiError structure
        const is404 = error?.response?.status === 404 || 
                     error?.status_code === 404 ||
                     error?.code === "404" || 
                     error?.code === 404 ||
                     (error?.name === "ApiError" && error?.status_code === 404);
        
        if (is404) {
          return {
            success: false,
            message: "Candidate not found",
            data: null
          } as unknown as ICandidateResponse;
        }
        throw error;
      }
    },
    retry: false, // Don't retry on 404
  });
};

export const useCreateCandidateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-candidate"],
    mutationFn: async (body: TCreateCandidate) => {
      const response = await apiClient.post<ICandidateResponse>("/candidates/", body);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
    onError: (error) => {
      console.error("Error creating candidate:", error);
    },
  });
};

export const useUpdateCandidateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-candidate"],
    mutationFn: async ({ id, ...patch }: TUpdateCandidate) => {
      const response = await apiClient.put<ICandidateResponse>(`/candidates/${id}`, patch);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate all candidate-related queries
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({ queryKey: ["get-auth-user-profile"] });
      // If we have the candidate ID, invalidate that specific query too
      if (data?.data?.id) {
        queryClient.invalidateQueries({ queryKey: ["candidates", data.data.id] });
      }
    },
    onError: (error) => {
      console.error("Error updating candidate:", error);
    },
  });
};

// move to resume queries
export function useUploadResumeMutation() {
    const queryClient = useQueryClient();
    return useMutation<IResumeResponse, Error, { userId: string, file: File }>({
    mutationKey: ["upload-resume"],
    mutationFn: async ({ userId, file }: { userId: string, file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiClient.post<IResumeResponse>(
        `/resume/upload-resume?user_id=${userId}`, 
        formData, 
        {
          timeout: 120000, // 2 minutes timeout for AI extraction
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Keep profile/resume reads fresh for onboarding resume-choice and apply flows.
      queryClient.invalidateQueries({ queryKey: ["get-auth-user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      queryClient.invalidateQueries({
        queryKey: ["candidates", "by-user", variables.userId],
      });
    },
  });
}


export const useDeleteCandidateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-candidate"],
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/candidates/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
    onError: (error) => {
      console.error("Error deleting candidate:", error);
    },
  });
};
