import apiClient from "~/lib/axios";
import { TCreateApplication, TUpdateApplication } from "./schemas";
import { IApplicationResponse, IApplicationsResponse } from "./dto";

export const getApplications = async () => {
  const res = await apiClient.get<IApplicationsResponse>("/applications/");
  return res.data;
};

export const getApplication = async (applicationId: string) => {
    const res = await apiClient.get<IApplicationResponse>(`/applications/${applicationId}`);
  return res.data;
};

export const createApplication = async (data: TCreateApplication) => {
  const res = await apiClient.post<IApplicationResponse>("/applications",
    data
  );
  return res.data;
};

export const updateApplication = async (applicationId: string, data: TUpdateApplication) => {
  const res = await apiClient.put<IApplicationResponse>(`/applications/${applicationId}`,
    data
  );
  return res.data;
};

export const deleteApplication = async (applicationId: string) => {
  const res = await apiClient.delete(`/applications/${applicationId}`);
  return res.data;
};
