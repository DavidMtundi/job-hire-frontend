/**
 * Company Queries
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "~/lib/axios";
import {
  ICompanyResponse,
  ICreateCompanyRequest,
  IUpdateCompanyRequest,
  ICompanyUser,
  IInviteRecruiterRequest,
  ICompanySettingsResponse,
  ICompanySettingsRequest,
  IPublicCompanyRegistrationRequest,
} from "./dto";

/**
 * Get current user's company
 */
export const useGetMyCompanyQuery = () => {
  return useQuery({
    queryKey: ["companies", "me"],
    queryFn: async () => {
      const response = await apiClient.get<ICompanyResponse>("/companies/me");
      return response.data;
    },
    retry: false,
  });
};

/**
 * Get company by ID
 */
export const useGetCompanyQuery = (companyId: string) => {
  return useQuery({
    queryKey: ["companies", companyId],
    queryFn: async () => {
      const response = await apiClient.get<ICompanyResponse>(`/companies/${companyId}`);
      return response.data;
    },
    enabled: !!companyId,
  });
};

/**
 * Public company registration (creates company + owner account)
 */
export const usePublicRegisterCompanyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["public-register-company"],
    mutationFn: async (data: IPublicCompanyRegistrationRequest) => {
      const response = await apiClient.post<ICompanyResponse>("/companies/register", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
};

/**
 * Register a new company (requires authentication)
 */
export const useRegisterCompanyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["register-company"],
    mutationFn: async (data: ICreateCompanyRequest) => {
      const response = await apiClient.post<ICompanyResponse>("/companies/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
};

/**
 * Update company
 */
export const useUpdateCompanyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-company"],
    mutationFn: async ({ companyId, data }: { companyId: string; data: IUpdateCompanyRequest }) => {
      const response = await apiClient.put<ICompanyResponse>(`/companies/${companyId}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["companies", variables.companyId] });
      queryClient.invalidateQueries({ queryKey: ["companies", "me"] });
    },
  });
};

/**
 * Get company users
 */
export const useGetCompanyUsersQuery = (companyId: string) => {
  return useQuery({
    queryKey: ["companies", companyId, "users"],
    queryFn: async () => {
      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: ICompanyUser[];
      }>(`/companies/${companyId}/users`);
      return response.data;
    },
    enabled: !!companyId,
  });
};

/**
 * Invite recruiter to company
 */
export const useInviteRecruiterMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["invite-recruiter"],
    mutationFn: async ({
      companyId,
      data,
    }: {
      companyId: string;
      data: IInviteRecruiterRequest;
    }) => {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        data?: any;
      }>(`/companies/${companyId}/invite-recruiter`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["companies", variables.companyId, "users"] });
    },
  });
};

/**
 * Get company settings
 */
export const useGetCompanySettingsQuery = (companyId: string) => {
  return useQuery({
    queryKey: ["companies", companyId, "settings"],
    queryFn: async () => {
      const response = await apiClient.get<ICompanySettingsResponse>(
        `/companies/${companyId}/settings`
      );
      return response.data;
    },
    enabled: !!companyId,
  });
};

/**
 * Update company settings
 */
export const useUpdateCompanySettingsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-company-settings"],
    mutationFn: async ({
      companyId,
      data,
    }: {
      companyId: string;
      data: ICompanySettingsRequest;
    }) => {
      const response = await apiClient.put<ICompanySettingsResponse>(
        `/companies/${companyId}/settings`,
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["companies", variables.companyId, "settings"],
      });
    },
  });
};

