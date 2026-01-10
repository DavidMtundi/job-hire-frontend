/**
 * Bulk Operations API Queries
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "~/lib/axios";
import {
  IBulkActionResponse,
  TBulkUpdateStatus,
  TBulkAssignRecruiter,
  TBulkSendEmail,
} from "./schemas";
import { toast } from "sonner";

export const useBulkUpdateStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["bulk-update-status"],
    mutationFn: async (data: TBulkUpdateStatus) => {
      const response = await apiClient.post<IBulkActionResponse>(
        "/bulk-operations/applications/update-status",
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      if (data.data.processed_count > 0) {
        toast.success(
          `Successfully updated ${data.data.processed_count} application(s)`
        );
      }
      if (data.data.failed_count > 0) {
        toast.error(
          `Failed to update ${data.data.failed_count} application(s)`
        );
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update applications");
    },
  });
};

export const useBulkAssignRecruiterMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["bulk-assign-recruiter"],
    mutationFn: async (data: TBulkAssignRecruiter) => {
      const response = await apiClient.post<IBulkActionResponse>(
        "/bulk-operations/applications/assign-recruiter",
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      if (data.data.processed_count > 0) {
        toast.success(
          `Successfully assigned recruiter to ${data.data.processed_count} application(s)`
        );
      }
      if (data.data.failed_count > 0) {
        toast.error(
          `Failed to assign recruiter to ${data.data.failed_count} application(s)`
        );
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to assign recruiter");
    },
  });
};

export const useBulkSendEmailMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["bulk-send-email"],
    mutationFn: async (data: TBulkSendEmail) => {
      const response = await apiClient.post<IBulkActionResponse>(
        "/bulk-operations/applications/send-email",
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["communication-timeline"] });
      if (data.data.processed_count > 0) {
        toast.success(
          `Successfully sent ${data.data.processed_count} email(s)`
        );
      }
      if (data.data.failed_count > 0) {
        toast.error(
          `Failed to send ${data.data.failed_count} email(s)`
        );
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to send emails");
    },
  });
};

