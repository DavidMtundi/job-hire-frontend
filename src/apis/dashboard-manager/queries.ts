import { useQuery } from "@tanstack/react-query";
import apiClient from "~/lib/axios";
import { IKPIAnalyticsResponse, IJobAnalyticsResponse, IRecruiterAnalyticsResponse, IManagerOverviewSummaryResponse, IRecruitmentAnalyticsResponse, IRecruitersPerformanceResponse } from "./dto";


export const useGetManagerOverviewSummaryQuery = () => {
  return useQuery<IManagerOverviewSummaryResponse, Error>({
    queryKey: ["manager-overview-summary"],
    queryFn: async () => {
      const response = await apiClient.get<IManagerOverviewSummaryResponse>("/Manager-dashboard/summary");
      return response.data;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useGetKPIAnalyticsQuery = () => {
  return useQuery<IKPIAnalyticsResponse, Error>({
    queryKey: ["kpi-analytics"],
    queryFn: async () => {
      const response = await apiClient.get<IKPIAnalyticsResponse>("/Manager-dashboard/kpis");
      return response.data;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useGetJobAnalyticsQuery = () => {
  return useQuery<IJobAnalyticsResponse, Error>({
    queryKey: ["job-analytics"],
    queryFn: async () => {
      const response = await apiClient.get<IJobAnalyticsResponse>("/Manager-dashboard/jobWise");
      return response.data;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useGetRecruiterAnalyticsQuery = () => {
  return useQuery<IRecruiterAnalyticsResponse, Error>({
    queryKey: ["recruiter-analytics"],
    queryFn: async () => {
      const response = await apiClient.get<IRecruiterAnalyticsResponse>("/Manager-dashboard/recruiters");
      return response.data;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useGetRecruitmentAnalyticsQuery = () => {
  return useQuery<IRecruitmentAnalyticsResponse, Error>({
    queryKey: ["recruitment-analytics"],
    queryFn: async () => {
      const response = await apiClient.get<IRecruitmentAnalyticsResponse>("/Manager-dashboard/recruitment-analytics");
      return response.data;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useGetRecruitersPerformanceQuery = () => {
  return useQuery<IRecruitersPerformanceResponse, Error>({
    queryKey: ["recruiters-performance"],
    queryFn: async () => {
      const response = await apiClient.get<IRecruitersPerformanceResponse>("/Manager-dashboard/recruiters/performance");
      return response.data;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
};
