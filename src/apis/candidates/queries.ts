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
          // skip: filters.skip ?? 0,
          // limit: filters.limit ?? 10,
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
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
    onError: (error) => {
      console.error("Error updating candidate:", error);
    },
  });
};

// move to resume queries
export function useUploadResumeMutation() {
    return useMutation<IResumeResponse, Error, { userId: string, file: File }>({
    mutationKey: ["upload-resume"],
    mutationFn: async ({ userId, file }: { userId: string, file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiClient.post<IResumeResponse>(
        `/resume/upload-resume?user_id=${userId}`, 
        formData, 
        {timeout: 30000}
      );
      return response.data;
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
