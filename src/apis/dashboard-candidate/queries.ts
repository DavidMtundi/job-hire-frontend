import { useQuery } from "@tanstack/react-query";
import apiClient from "~/lib/axios";
import { IApplicationStatusSummaryResponse, IApplicationSummaryResponse, IApplicationTrendResponse } from "./dto";


export const useGetApplicationSummaryQuery = () => {
  return useQuery<IApplicationSummaryResponse, Error>({
    queryKey: ["application-summary"],
    queryFn: async () => {
      const response = await apiClient.get<IApplicationSummaryResponse>("/candidate-dashboard/overview");
      return response.data;
    },
  });
};  

export const useGetApplicationStatusSummaryQuery = () => {
  return useQuery<IApplicationStatusSummaryResponse, Error>({
    queryKey: ["application-status-summary"],
    queryFn: async () => {
      const response = await apiClient.get<IApplicationStatusSummaryResponse>("/candidate-dashboard/application-status");
      return response.data;
    },
  });
};

export const useGetApplicationTrendQuery = () => {
  return useQuery<IApplicationTrendResponse, Error>({
    queryKey: ["application-trend"],
    queryFn: async () => {
      const response = await apiClient.get<IApplicationTrendResponse>("/candidate-dashboard/application-trend");
      return response.data;
    },
  });
};