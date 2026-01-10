/**
 * Analytics API Queries
 */
import { useQuery } from "@tanstack/react-query";
import apiClient from "~/lib/axios";
import { IAnalyticsSummary } from "./schemas";

interface AnalyticsFilters {
  start_date?: string;
  end_date?: string;
  department_id?: string;
  recruiter_id?: string;
  job_id?: string;
}

export const useGetTimeToFillQuery = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ["analytics", "time-to-fill", filters],
    queryFn: async () => {
      const response = await apiClient.get("/analytics/time-to-fill", { params: filters });
      return response.data;
    },
  });
};

export const useGetSourceOfHireQuery = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ["analytics", "source-of-hire", filters],
    queryFn: async () => {
      const response = await apiClient.get("/analytics/source-of-hire", { params: filters });
      return response.data;
    },
  });
};

export const useGetCostPerHireQuery = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ["analytics", "cost-per-hire", filters],
    queryFn: async () => {
      const response = await apiClient.get("/analytics/cost-per-hire", { params: filters });
      return response.data;
    },
  });
};

export const useGetPipelineHealthQuery = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ["analytics", "pipeline-health", filters],
    queryFn: async () => {
      const response = await apiClient.get("/analytics/pipeline-health", { params: filters });
      return response.data;
    },
  });
};

export const useGetRecruiterPerformanceQuery = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ["analytics", "recruiter-performance", filters],
    queryFn: async () => {
      const response = await apiClient.get("/analytics/recruiter-performance", { params: filters });
      return response.data;
    },
  });
};

export const useGetConversionFunnelQuery = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ["analytics", "conversion-funnel", filters],
    queryFn: async () => {
      const response = await apiClient.get("/analytics/conversion-funnel", { params: filters });
      return response.data;
    },
  });
};

export const useGetAnalyticsSummaryQuery = (filters?: AnalyticsFilters) => {
  return useQuery<{ success: boolean; message: string; data: IAnalyticsSummary }, Error>({
    queryKey: ["analytics", "summary", filters],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; message: string; data: IAnalyticsSummary }>(
        "/analytics/summary",
        { params: filters }
      );
      return response.data;
    },
    retry: false, // Don't retry on 403 errors
  });
};

