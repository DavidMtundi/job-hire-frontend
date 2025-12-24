import apiClient from "~/lib/axios";
import { TCreateJob, TUpdateJob } from "./schemas";
import { IJobResponse, IJobsResponse, IAIGenerateJobRequest, IAIGenerateJobResponse } from "./dto";

export const getJobs = async () => {
  const res = await apiClient.get<IJobsResponse>("/jobs/get-jobs");
  return res.data;
};

export const getJob = async (jobId: string) => {
  const res = await apiClient.get<IJobResponse>(`/jobs/${jobId}`);
  return res.data;
};

export const createJob = async (data: TCreateJob) => {
  const res = await apiClient.post<IJobResponse>("/jobs",
    data
  );
  return res.data;
};

export const updateJob = async (jobId: string, data: TUpdateJob) => {
  const res = await apiClient.put<IJobResponse>(`/jobs/${jobId}`,
    data
  );
  return res.data;
};

export const deleteJob = async (jobId: string) => {
  const res = await apiClient.delete(`/jobs/${jobId}`);
  return res.data;
};

export const generateJobWithAI = async (data: IAIGenerateJobRequest) => {
  const res = await apiClient.post<IAIGenerateJobResponse>("/jobs/ai-generate", data);
  return res.data;
};
