import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "~/lib/axios";
import { IForgotPasswordInput, IResetPasswordInput, ISignupResponse, IVerifyEmailInput } from "./dto";
import { TInviteHrEmail, TSignup } from "./schemas";
import { IUserCandidateResponse } from "../users/dto";
import { useSession } from "next-auth/react";

export const useSignupMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["signup"],
    mutationFn: async (body: TSignup) => {
      const { data } = await apiClient.post<ISignupResponse>("/auth/register", body);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["signup"] });
      console.log("Signup successful:", data);
    },
    onError: (error) => {
      console.error("Error signing up:", error);
    },
  });
};

export const useVerifyEmailMutation = () => {
  return useMutation({
    mutationKey: ["verify-email"],
    mutationFn: async (body: IVerifyEmailInput) => {
      const { data } = await apiClient.post("/auth/verify-email", body);
      return data;
    },
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationKey: ["forgot-password"],
    mutationFn: async (params: IForgotPasswordInput) => {
      const { data } = await apiClient.post("/auth/forgot-password", null, { 
        params: { email: params.email } 
      });
      return data;
    },
  });
};

export const useResetPasswordMutation = () => {
  return useMutation({
    mutationKey: ["reset-password"],
    mutationFn: async (params: IResetPasswordInput) => {
      const { data } = await apiClient.post("/auth/reset-password", null, { 
        params: { 
          token: params.token,
          new_password: params.new_password 
        } 
      });
      return data;
    },
  });
};

// HR
export const useInviteHrEmailMutation = () => {
  return useMutation({
    mutationKey: ["invite-hr-email"],
    mutationFn: async (params: TInviteHrEmail) => {
      const { data } = await apiClient.post("/auth/send-email-hr-invitation", {}, { params });
      return data;
    },
  });
};

export const useGetAuthUserProfileQuery = () => {
  const { status } = useSession();
  return useQuery({
    queryKey: ["get-auth-user-profile"],
    // Avoid hitting `/auth/get-user` while unauthenticated; otherwise we
    // reliably get 401s and noisy Axios errors during login/initial page loads.
    enabled: status === "authenticated",
    queryFn: async () => {
      const { data } = await apiClient.get<IUserCandidateResponse>("/auth/get-user");
      return data;
    },
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403 errors (authentication issues)
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: 1000,
  });
};
