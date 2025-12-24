import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "~/lib/axios";
import { IGetJobsParams, IJobResponse, IJobsResponse, IAIGenerateJobRequest, IAIGenerateJobResponse } from "./dto";
import { TCreateJob, TUpdateJob } from "./schemas";


export const useGetJobsQuery = (filters: IGetJobsParams = {}) => {
  const page = filters.page ?? 1;
  const pageSize = filters.page_size ?? 10;
  
  return useQuery<IJobsResponse, Error>({
    queryKey: [
      "jobs",
      page,
      pageSize,
      filters.status,
      filters.search,
      filters.job_type,
      filters.category,
      filters.is_trending,
      filters.is_featured,
    ],
    queryFn: async () => {
      const params: Record<string, any> = {
        page,
        page_size: pageSize,
        ...(filters.search ? { search: filters.search } : {}),
        ...(filters.status && filters.status !== "all" ? { job_status: filters.status } : {}),
        ...(filters.job_type ? { job_type: filters.job_type } : {}),
        ...(filters.category ? { category: filters.category } : {}),
      };

      if (filters.is_trending !== undefined) {
        params.is_trending = filters.is_trending;
      }
      if (filters.is_featured !== undefined) {
        params.is_featured = filters.is_featured;
      }

      const response = await apiClient.get<IJobsResponse>("/jobs/get-jobs", {
        params,
      });
      return response.data;
    },
  });
};
export const useGetJobQuery = (jobId: string) => {
  return useQuery<IJobResponse, Error>({
    queryKey: ["jobs", jobId],
    enabled: !!jobId,
    queryFn: async () => {
      const response = await apiClient.get<IJobResponse>(`/jobs/${jobId}`);
      return response.data;
    },
  });
};

export const useCreateJobMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-job"],
    mutationFn: async (body: TCreateJob) => {
      const response = await apiClient.post<IJobResponse>("/jobs", body);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      // console.log("Job created:", data);
    },
    onError: (error) => {
      console.error("Error creating job:", error);
    },
  });
};

export const useUpdateJobMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-job"],
    mutationFn: async ({ id, ...patch }: TUpdateJob) => {
      const response = await apiClient.put<IJobResponse>(`/jobs/${id}`, patch);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      // console.log("Job updated:", data);
    },
    onError: (error) => {
      console.error("Error updating job:", error);
    },
  });
};

export const useDeleteJobMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-job"],
    mutationFn: async (id: string | number) => {
      const response = await apiClient.delete(`/jobs/${id}`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      // console.log("Job deleted:", data);
    },
    onError: (error) => {
      console.error("Error deleting job:", error);
    },
  });
};

export const useGenerateJobWithAIMutation = () => {
  return useMutation({
    mutationKey: ["generate-job-ai"],
    mutationFn: async (data: IAIGenerateJobRequest) => {
      const response = await apiClient.post<IAIGenerateJobResponse>("/jobs/ai-generate", data);
      return response.data;
    },
    onError: (error) => {
      console.error("Error generating job with AI:", error);
    },
  });
};
