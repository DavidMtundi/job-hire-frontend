import { useQuery } from "@tanstack/react-query";
import apiClient from "~/lib/axios";
import { IHiringFunnelResponse, IOverviewSummaryResponse, IRecentApplicationsResponse, ITopJobsResponse } from "./dto";


export const useGetOverviewSummaryQuery = () => {
  return useQuery<IOverviewSummaryResponse, Error>({
    queryKey: ["overview-summary"],
    queryFn: async () => {
      const response = await apiClient.get<IOverviewSummaryResponse>("/hr-dashboard/stats");
      return response.data;
    },
  });
};

export const useGetTopJobsQuery = () => {
  return useQuery<ITopJobsResponse, Error>({
    queryKey: ["top-jobs"],
    queryFn: async () => {
      const response = await apiClient.get<ITopJobsResponse>("/hr-dashboard/top-jobs");
      return response.data;
    },
  });
};

export const useGetHiringFunnelQuery = () => {
  return useQuery<IHiringFunnelResponse, Error>({
    queryKey: ["hiring-funnel"],
    queryFn: async () => {
      const response = await apiClient.get<IHiringFunnelResponse>("/hr-dashboard/hiring-funnel");
      return response.data;
    },
  });
};

export const useGetRecentApplicationsQuery = () => {
  return useQuery<IRecentApplicationsResponse, Error>({
    queryKey: ["recent-applications"],
    queryFn: async () => {
      const response = await apiClient.get<IRecentApplicationsResponse>("/hr-dashboard/recent-applications");
      return response.data;
    },
  });
};