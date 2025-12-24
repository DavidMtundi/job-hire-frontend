import apiClient from "~/lib/axios";
import { IHiringFunnelResponse, IOverviewSummaryResponse, IRecentApplicationsResponse, ITopJobsResponse } from "./dto";

export const getOverviewSummary = async () => {
  const res = await apiClient.get<IOverviewSummaryResponse>("/hr-dashboard/stats");
  return res.data;
};

export const getTopJobs = async () => {
  const res = await apiClient.get<ITopJobsResponse>("/hr-dashboard/top-jobs");
  return res.data;
};

export const getHiringFunnel = async () => {
  const res = await apiClient.get<IHiringFunnelResponse>("/hr-dashboard/hiring-funnel");
  return res.data;
};

export const getRecentApplications = async () => {
  const res = await apiClient.get<IRecentApplicationsResponse>("/hr-dashboard/recent-applications");
  return res.data;
};  