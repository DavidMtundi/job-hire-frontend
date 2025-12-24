import apiClient from "~/lib/axios";
import { ILoginResponse, ISignupResponse, ISocialLoginResponse } from "./dto";
import { TLogin, TSignup, TSocialLogin } from "./schemas";

export const credentialLogin = async (body: TLogin) => {
  const { data } = await apiClient.post<ILoginResponse>('/auth/login', body);
  return data;
};

export const socialLogin = async (body: TSocialLogin) => {
  const { data } = await apiClient.post<ISocialLoginResponse>('/auth/login/google', body);
  return data;
};

export const signUp = async (body: TSignup) => {
  const { data } = await apiClient.post<ISignupResponse>('/auth/register', body);
  return data;
};
