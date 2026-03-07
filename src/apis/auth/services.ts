import apiClient from "~/lib/axios";
import { ILoginResponse, ISignupResponse, ISocialLoginResponse } from "./dto";
import { TLogin, TSignup, TSocialLogin } from "./schemas";

export const credentialLogin = async (body: TLogin) => {
  try {
    console.log("[credentialLogin] Making login request with:", { email: body.email });
    console.log("[credentialLogin] Request URL will be:", `${apiClient.defaults.baseURL}/auth/login`);
    const { data } = await apiClient.post<ILoginResponse>('/auth/login', body);
    console.log("[credentialLogin] Login request successful:", { success: data?.success });
    return data;
  } catch (error: any) {
    console.error("[credentialLogin] Login request failed:", error);
    console.error("[credentialLogin] Error type:", error?.constructor?.name);
    console.error("[credentialLogin] Error details:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      code: error?.code,
      name: error?.name,
      status_code: error?.status_code,
      isApiError: error?.status_code !== undefined,
      // Check if it's a network error
      isNetworkError: !error?.response,
      requestUrl: error?.config?.url,
      requestMethod: error?.config?.method,
    });
    
    // If it's an ApiError, preserve the status_code
    if (error?.status_code) {
      const apiError = error;
      throw apiError;
    }
    
    // Re-throw with more context
    throw error;
  }
};

export const socialLogin = async (body: TSocialLogin) => {
  const { data } = await apiClient.post<ISocialLoginResponse>('/auth/login/google', body);
  return data;
};

export const signUp = async (body: TSignup) => {
  const { data } = await apiClient.post<ISignupResponse>('/auth/register', body);
  return data;
};
