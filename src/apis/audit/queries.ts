import { useQuery } from "@tanstack/react-query";
import apiClient from "~/lib/axios";
import { IAuditLogsResponse, IAIUsageStatsResponse, IAuditLog } from "./dto";

export interface IGetAuditLogsParams {
  entity_type?: string;
  entity_id?: string;
  action_type?: string;
  ai_used?: boolean;
  page?: number;
  page_size?: number;
}

export const useGetAuditLogsQuery = (params: IGetAuditLogsParams = {}) => {
  return useQuery<IAuditLogsResponse["data"], Error>({
    queryKey: ["audit-logs", params],
    queryFn: async () => {
      const response = await apiClient.get<IAuditLogsResponse>("/audit/logs", {
        params: {
          page: params.page ?? 1,
          page_size: params.page_size ?? 50,
          ...(params.entity_type ? { entity_type: params.entity_type } : {}),
          ...(params.entity_id ? { entity_id: params.entity_id } : {}),
          ...(params.action_type ? { action_type: params.action_type } : {}),
          ...(params.ai_used !== undefined ? { ai_used: params.ai_used } : {}),
        },
      });
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch audit logs");
    },
  });
};

export const useGetAuditLogsByEntityQuery = (entityType: string, entityId: string) => {
  return useQuery<IAuditLog[], Error>({
    queryKey: ["audit-logs", entityType, entityId],
    enabled: !!entityType && !!entityId,
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; message: string; data: IAuditLog[] }>(
        `/audit/logs/${entityType}/${entityId}`
      );
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch audit logs");
    },
  });
};

export const useGetAIUsageStatsQuery = (dateFrom?: string, dateTo?: string) => {
  return useQuery<IAIUsageStatsResponse["data"], Error>({
    queryKey: ["ai-usage-stats", dateFrom, dateTo],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      
      const response = await apiClient.get<IAIUsageStatsResponse>("/audit/ai-usage", { params });
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch AI usage statistics");
    },
  });
};

