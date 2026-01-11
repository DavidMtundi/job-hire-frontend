import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import apiClient from "~/lib/axios";
import { IGetInterviewsParams, IInterviewRemark, IAIInterviewScoresResponse } from "./dto";
import { TCreateInterview, TInterview, TUpdateInterview } from "./schemas";

type IInterviewStatusListItem = {
  id: number;
  status: string;
};

export const useGetInterviewsQuery = (filters: IGetInterviewsParams = {}) => {
  const { data: session } = useSession();

  return useQuery<TInterview[], Error>({
    queryKey: ["interviews", filters],
    queryFn: async () => {
      try {
        const response = await apiClient.get<TInterview[]>("/interviews", {
          params: {
            hr_id: filters.hr_id || session?.user?.id,
            limit: filters.limit || 50,
            offset: filters.offset || 0,
            ...filters,
          },
        });

        return response.data;
      } catch (error: any) {
        if (error?.response?.status === 404 || error?.response?.status === 422) {
          return [];
        }
        throw error;
      }
    },
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404 || error?.response?.status === 422) {
        return false;
      }
      return failureCount < 3;
    },
    enabled: !!session?.user?.id, 
  });
};

export const useGetInterviewQuery = (interviewId: string) => {
  return useQuery<TInterview, Error>({
    queryKey: ["interviews", interviewId],
    enabled: !!interviewId,
    queryFn: async () => {
      const response = await apiClient.get<TInterview>(`/interviews/${interviewId}`);
      return response.data;
    },
  });
};

export const useGetInterviewsByApplicationIdQuery = (applicationId: string) => {
  return useQuery<TInterview[], Error>({
    queryKey: ["interviews-by-application", applicationId],
    enabled: !!applicationId,
    queryFn: async () => {
      const response = await apiClient.get<TInterview[]>(`/interviews-by-id/${applicationId}`);
      return response.data;
    },
  });
};

export const useGetInterviewRemarksQuery = (interviewId: string) => {
  return useQuery<IInterviewRemark[], Error>({
    queryKey: ["interview-remarks", interviewId],
    enabled: !!interviewId,
    queryFn: async () => {
      const response = await apiClient.get<IInterviewRemark[]>(`/interviews/${interviewId}/remarks`);
      return response.data;
    },
  });
};

export const useCreateInterviewMutation = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationKey: ["create-interview"],
    mutationFn: async (body: any) => {
      // Use apiClient to directly call backend - token is automatically attached
      // If CORS issues occur, use the Next.js API route proxy instead
      try {
        const response = await apiClient.post<TInterview>("/interviews", body);
        // Handle different response structures
        return (response.data?.interview || response.data?.data?.interview || response.data?.data || response.data) as TInterview;
      } catch (error: any) {
        // If direct call fails (e.g., CORS), fallback to Next.js API route
        if (error?.code === "ERR_NETWORK" || error?.response?.status === 0) {
          const { authenticatedFetch } = await import("~/lib/api-helpers");
          const response = await authenticatedFetch("/api/interviews", {
            method: "POST",
            body: JSON.stringify(body),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || error.error || "Failed to create interview");
          }
          
          const data = await response.json();
          return (data?.interview || data?.data?.interview || data?.data || data) as TInterview;
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      queryClient.refetchQueries({ queryKey: ["interviews"] });
      if (data.application_id) {
        queryClient.invalidateQueries({ queryKey: ["application-status", data.application_id] });
        queryClient.refetchQueries({ queryKey: ["application-status", data.application_id] });
      }
    },
  });
};

export const useUpdateInterviewMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-interview"],
    mutationFn: async ({ id, ...patch }: TUpdateInterview & { id: string }) => {
      // Use apiClient to directly call backend - token is automatically attached
      try {
        const response = await apiClient.put(`/interviews/${id}`, patch);
        return response.data;
      } catch (error: any) {
        // If direct call fails (e.g., CORS), fallback to Next.js API route
        if (error?.code === "ERR_NETWORK" || error?.response?.status === 0) {
          const { authenticatedFetch } = await import("~/lib/api-helpers");
          const response = await authenticatedFetch(`/api/interviews/${id}`, {
            method: "PUT",
            body: JSON.stringify(patch),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || error.error || "Failed to update interview");
          }
          
          const data = await response.json();
          return data;
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      if (data?.application_id) {
        queryClient.invalidateQueries({ queryKey: ["application-status", data.application_id] });
        queryClient.refetchQueries({ queryKey: ["application-status", data.application_id] });
        queryClient.invalidateQueries({ queryKey: ["interviews-by-application", data.application_id] });
      }
    },
  });
};

export const useDeleteInterviewMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-interview"],
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/interviews/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
    },
  });
};

export const useSendInterviewInviteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["send-interview-invite"],
    mutationFn: async (interviewId: string) => {
      const response = await apiClient.post(`/interviews/${interviewId}/send-invite`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
    },
  });
};

export const useUpdateInterviewStatusMutation = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationKey: ["update-interview-status"],
    mutationFn: async ({ applicationId, status, remark }: { applicationId: string; status: string; remark?: string }) => {
      const requestBody = {
        user_id: session?.user?.id,
        remark: remark || `Interview status updated to ${status}`,
        status: status,
      };

      // Use apiClient to ensure token is attached
      const response = await apiClient.post(
        `/applications/${applicationId}/remarks`,
        requestBody
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      queryClient.refetchQueries({ queryKey: ["interviews"] });
      if (variables.applicationId) {
        queryClient.invalidateQueries({ queryKey: ["application-status", variables.applicationId] });
        queryClient.refetchQueries({ queryKey: ["application-status", variables.applicationId] });
      }
    },
  });
};

export const useGetInterviewStatusListQuery = () => {
  return useQuery<IInterviewStatusListItem[], Error>({
    queryKey: ["interview-status-list"],
    queryFn: async () => {
      const response = await apiClient.get<IInterviewStatusListItem[]>("/interviews/status-list");
      return response.data;
    },
    staleTime: 1000 * 60 * 60, 
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useCreateInterviewStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-interview-status"],
    mutationFn: async ({
      interviewId,
      status_id,
      remarks
    }: {
      interviewId: string;
      status_id: number;
      remarks: string;
    }) => {
      const response = await apiClient.post(
        `/interviews/${interviewId}/status`,
        {
          status_id,
          remarks,
        }
      );
      return response.data;
    },
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "interviews",
        refetchType: 'active'
      });
      await queryClient.refetchQueries({
        predicate: (query) => query.queryKey[0] === "interviews"
      });
    },
    onError: (error) => {
        // Error handled silently
    },
  });
};

export const useGetAIInterviewScoresQuery = (applicationId: string, interviewId: string) => {
  return useQuery<IAIInterviewScoresResponse | null, Error>({
    queryKey: ["ai-interview-scores", applicationId, interviewId],
    enabled: !!applicationId && !!interviewId,
    queryFn: async () => {
      try {
        const response = await apiClient.get<IAIInterviewScoresResponse>(
          `/ai-interview/scores/${applicationId}/${interviewId}`
        );
        return response.data;
      } catch (error: any) {
        if (error?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
};
