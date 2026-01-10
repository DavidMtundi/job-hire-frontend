/**
 * Calendar Integration API Queries
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "~/lib/axios";
import { toast } from "sonner";
import {
  TCalendarIntegration,
  TInterviewerAvailability,
  TSchedulingLink,
  TCalendarType,
} from "./schemas";

export const useGetCalendarIntegrationsQuery = () => {
  return useQuery<{ success: boolean; message: string; data: TCalendarIntegration[] }, Error>({
    queryKey: ["calendar-integrations"],
    queryFn: async () => {
      const response = await apiClient.get("/calendar/integrations");
      return response.data;
    },
  });
};

export const useCreateCalendarIntegrationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-calendar-integration"],
    mutationFn: async (data: {
      calendar_type: TCalendarType;
      calendar_id: string;
      access_token: string;
      refresh_token?: string;
      token_expires_at?: string;
      sync_enabled?: boolean;
    }) => {
      const response = await apiClient.post("/calendar/integrations", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-integrations"] });
      toast.success("Calendar integration created successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create calendar integration");
    },
  });
};

export const useGetInterviewerAvailabilityQuery = () => {
  return useQuery<{ success: boolean; message: string; data: TInterviewerAvailability[] }, Error>({
    queryKey: ["interviewer-availability"],
    queryFn: async () => {
      const response = await apiClient.get("/calendar/availability");
      return response.data;
    },
  });
};

export const useCreateInterviewerAvailabilityMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-interviewer-availability"],
    mutationFn: async (data: {
      day_of_week: number;
      start_time: string;
      end_time: string;
      timezone?: string;
    }) => {
      const response = await apiClient.post("/calendar/availability", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviewer-availability"] });
      toast.success("Availability slot created successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create availability slot");
    },
  });
};

export const useCreateSchedulingLinkMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-scheduling-link"],
    mutationFn: async (data: { interview_id: string; expires_at?: string }) => {
      const response = await apiClient.post<{ success: boolean; message: string; data: TSchedulingLink }>(
        "/calendar/scheduling-links",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      toast.success("Scheduling link created successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create scheduling link");
    },
  });
};

