/**
 * Compliance Management API Queries
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "~/lib/axios";
import { toast } from "sonner";
import {
  TEEOTracking,
  TComplianceDocument,
  TComplianceReport,
  TEEOSummaryItem,
} from "./schemas";

export const useGetEEOTrackingQuery = (filters?: {
  start_date?: string;
  end_date?: string;
  department_id?: string;
}) => {
  return useQuery<{ success: boolean; message: string; data: TEEOTracking[] }, Error>({
    queryKey: ["eeo-tracking", filters],
    queryFn: async () => {
      const response = await apiClient.get("/compliance/eeo-tracking", { params: filters });
      return response.data;
    },
  });
};

export const useGetEEOSummaryQuery = (filters?: { start_date?: string; end_date?: string }) => {
  return useQuery<
    {
      success: boolean;
      message: string;
      data: {
        summary: TEEOSummaryItem[];
        total_applications: number;
        total_hired: number;
        overall_hire_rate: number;
      };
    },
    Error
  >({
    queryKey: ["eeo-summary", filters],
    queryFn: async () => {
      const response = await apiClient.get("/compliance/eeo-summary", { params: filters });
      return response.data;
    },
  });
};

export const useCreateEEOTrackingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-eeo-tracking"],
    mutationFn: async (data: {
      application_id: string;
      candidate_id: string;
      gender?: string;
      race_ethnicity?: string;
      veteran_status?: boolean;
      disability_status?: boolean;
      age_range?: string;
    }) => {
      const response = await apiClient.post("/compliance/eeo-tracking", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eeo-tracking"] });
      queryClient.invalidateQueries({ queryKey: ["eeo-summary"] });
      toast.success("EEO tracking record created successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create EEO tracking record");
    },
  });
};

export const useGetComplianceDocumentsQuery = (filters?: {
  entity_type?: string;
  entity_id?: string;
  document_type?: string;
}) => {
  return useQuery<{ success: boolean; message: string; data: TComplianceDocument[] }, Error>({
    queryKey: ["compliance-documents", filters],
    queryFn: async () => {
      const response = await apiClient.get("/compliance/documents", { params: filters });
      return response.data;
    },
  });
};

export const useCreateComplianceDocumentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-compliance-document"],
    mutationFn: async (data: {
      document_type: string;
      entity_type: string;
      entity_id: string;
      file_name: string;
      file_url: string;
      file_size?: number;
      mime_type?: string;
      description?: string;
      expires_at?: string;
    }) => {
      const response = await apiClient.post("/compliance/documents", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-documents"] });
      toast.success("Compliance document uploaded successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to upload compliance document");
    },
  });
};

export const useGetComplianceReportsQuery = (filters?: {
  report_type?: string;
  start_date?: string;
  end_date?: string;
}) => {
  return useQuery<{ success: boolean; message: string; data: TComplianceReport[] }, Error>({
    queryKey: ["compliance-reports", filters],
    queryFn: async () => {
      const response = await apiClient.get("/compliance/reports", { params: filters });
      return response.data;
    },
  });
};

export const useCreateComplianceReportMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-compliance-report"],
    mutationFn: async (data: {
      report_type: string;
      report_name: string;
      report_period_start: string;
      report_period_end: string;
      report_data?: Record<string, any>;
    }) => {
      const response = await apiClient.post("/compliance/reports", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-reports"] });
      toast.success("Compliance report generated successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to generate compliance report");
    },
  });
};

