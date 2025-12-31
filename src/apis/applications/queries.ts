import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "~/lib/axios";
import { IGetApplicationsParams, IApplicationResponse, IApplicationsResponse, IApplicationDetailResponse, IApplicationRemark, IApplicationStatus, IStatusListResponse } from "./dto";
import { TCreateApplication, TUpdateApplication } from "./schemas";
import { TInterview } from "~/apis/interviews/schemas";
import { toast } from "sonner";

export const useGetApplicationsQuery = (filters: IGetApplicationsParams = {}) => {
  return useQuery<IApplicationsResponse, Error>({
    queryKey: ["applications", filters],
    queryFn: async () => {
      const response = await apiClient.get<IApplicationsResponse>("/applications/", {
        params: {
          page: filters.page,
          page_size: filters.page_size,
          stage: filters.stage,
          ...(filters.search ? { search: filters.search } : {}),
        },
      });
      return response.data;
    },
  });
};

export const useGetApplicationQuery = (applicationId: string) => {
  return useQuery<IApplicationResponse, Error>({
    queryKey: ["applications", applicationId],
    enabled: !!applicationId,
    queryFn: async () => {
      const response = await apiClient.get<IApplicationResponse>(`/applications/${applicationId}`);
      return response.data;
    },
  });
};

export const useGetApplicationDetailQuery = (applicationId: string) => {
  return useQuery<IApplicationDetailResponse, Error>({
    queryKey: ["application-detail", applicationId],
    enabled: !!applicationId,
    queryFn: async () => {
      const response = await apiClient.get<IApplicationDetailResponse>(`/applications/${applicationId}`);
      return response.data;
    },
  });
};

export const useCreateApplicationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-application"],
    mutationFn: async (body: TCreateApplication) => {
      const response = await apiClient.post<IApplicationResponse>("/applications", body);
      return response.data;
    },
    onSuccess: async (data) => {

      const applicationId =
        data?.data?.id ||          
        data?.data?.id ||                
        (data as any)?.application_id || 
        (data as any)?.application?.id; 


      if (applicationId) {
        try {

          const putResponse = await apiClient.put(`/applications/${applicationId}`, {
            status_id: 1,
          });

          const postResponse = await apiClient.post(`/applications/${applicationId}/status`, {
            status_id: 1, 
            remark: "Application Received",
          });

          queryClient.invalidateQueries({
            queryKey: ["application-status", applicationId]
          });
          queryClient.refetchQueries({
            queryKey: ["application-status", applicationId]
          });

          queryClient.invalidateQueries({
            queryKey: ["application-status-history", applicationId]
          });
          queryClient.refetchQueries({
            queryKey: ["application-status-history", applicationId]
          });

          toast.success("Application created with initial status");
        } catch (error) {
          toast.error("Failed to set initial application status");
        }
      } else {

        toast.warning("Application created. Please ensure backend sets initial status.");
      }

      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["application-detail"] });

      await queryClient.refetchQueries({
        predicate: (query) => query.queryKey[0] === "applications"
      });
    },
    onError: (error) => {
      console.error("Error creating application:", error);
    },
  });
};

export const useUpdateApplicationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-application"],
    mutationFn: async ({ id, ...patch }: TUpdateApplication) => {
      const response = await apiClient.put<IApplicationResponse>(`/applications/${id}`, patch);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      // console.log("Job updated:", data);
    },
    onError: (error) => {
      console.error("Error updating application:", error);
    },
  });
};

export const useDeleteApplicationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-application"],
    mutationFn: async (id: string | number) => {
      const response = await apiClient.delete(`/applications/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      // console.log("Job deleted:", data);
    },
    onError: (error) => {
      console.error("Error deleting application:", error);
    },
  });
};

export const useUpdateApplicationStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-application-status"],
    mutationFn: async ({
      applicationId,
      status,
      stage,
      next_step,
      next_step_date,
      notes,
      priority,
      recruiter
    }: {
      applicationId: string;
      status?: string;
      stage?: string;
      next_step?: string;
      next_step_date?: string;
      notes?: string;
      priority?: string;
      recruiter?: number;
    }) => {
      const response = await apiClient.put<IApplicationResponse>(
        `/applications/${applicationId}`,
        {
          status,
          stage,
          next_step,
          next_step_date,
          notes,
          priority,
          recruiter,
        }
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["application-detail"] });
      if (variables.applicationId) {
        queryClient.invalidateQueries({ queryKey: ["application-status", variables.applicationId] });
        queryClient.refetchQueries({ queryKey: ["application-status", variables.applicationId] });
      }
    },
    onError: (error) => {
      console.error("Error updating application status:", error);
    },
  });
};

export const useGetApplicationRemarksQuery = (applicationId: string) => {
  return useQuery<IApplicationRemark[], Error>({
    queryKey: ["application-remarks", applicationId],
    enabled: !!applicationId,
    queryFn: async () => {
      const response = await fetch(`/api/applications/${applicationId}/remarks`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch application remarks");
      }

      const data = await response.json();
      return data;
    },
  });
};

export const useGetApplicationStatusQuery = (applicationId: string) => {
  return useQuery<IApplicationStatus[], Error>({
    queryKey: ["application-status", applicationId],
    enabled: !!applicationId,
    queryFn: async () => {
      const response = await apiClient.get(`/applications/${applicationId}/status-history`);
      return response.data;
    },
  });
};

export const useGetApplicationStatusHistoryQuery = (applicationId: string) => {
  return useQuery<IApplicationStatus[], Error>({
    queryKey: ["application-status-history", applicationId],
    enabled: !!applicationId,
    queryFn: async () => {
      const response = await apiClient.get<IApplicationStatus[]>(
        `/applications/${applicationId}/status-history`
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 5, 
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useCreateApplicationStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-application-status"],
    mutationFn: async ({ 
      applicationId, 
      remark, 
      status_id 
    }: { 
      applicationId: string; 
      remark: string; 
      status_id: number;
    }) => {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          remark,
          status_id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || "Failed to create application status");
      }

      const data = await response.json();
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["application-status", variables.applicationId] });
      queryClient.refetchQueries({ queryKey: ["application-status", variables.applicationId] });
      queryClient.invalidateQueries({ queryKey: ["application-status-history", variables.applicationId] });
      queryClient.refetchQueries({ queryKey: ["application-status-history", variables.applicationId] });
    },
    onError: (error) => {
      console.error("Error creating application status:", error);
    },
  });
};

export const useUpdateApplicationStatusByIdMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-application-status-by-id"],
    mutationFn: async ({ 
      applicationId, 
      remark, 
      status_id 
    }: { 
      applicationId: string; 
      remark: string; 
      status_id: number;
    }) => {
      const response = await apiClient.post<{ message: string }>(
        `/applications/${applicationId}/status`,
        {
          remark,
          status_id,
        }
      );
      return response.data;
    },
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "applications",
        refetchType: 'active'
      });
      await queryClient.refetchQueries({
        predicate: (query) => query.queryKey[0] === "applications"
      });

      queryClient.invalidateQueries({ queryKey: ["application-detail"] });

      queryClient.invalidateQueries({ queryKey: ["application-status", variables.applicationId] });
      queryClient.invalidateQueries({ queryKey: ["application-status-history", variables.applicationId] });
    },
    onError: (error) => {
      console.error("Error updating application status:", error);
    },
  });
};

export const useGetStatusListQuery = () => {
  return useQuery<IStatusListResponse, Error>({
    queryKey: ["status-list"],
    queryFn: async () => {
      const response = await apiClient.get<IStatusListResponse>("/status-list");
      return response.data;
    },
    staleTime: 1000 * 60 * 60, 
    retry: false,
    refetchOnWindowFocus: false,
  });
};
