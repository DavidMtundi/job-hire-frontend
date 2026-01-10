import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "~/lib/axios";
import { IForgotPasswordInput, IResetPasswordInput, ISignupResponse, IVerifyEmailInput } from "./dto";
import { TInviteHrEmail, TSignup } from "./schemas";
import { IUserCandidateResponse } from "../users/dto";

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
  return useQuery({
    queryKey: ["get-auth-user-profile"],
    queryFn: async () => {
      const { data } = await apiClient.get<IUserCandidateResponse>("/auth/get-user");
      return data;
    },
  });
};
