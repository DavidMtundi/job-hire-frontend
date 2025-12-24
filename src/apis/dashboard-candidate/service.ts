import apiClient from "~/lib/axios";
import { IApplicationSummaryResponse, IApplicationStatusSummaryResponse, IApplicationTrendResponse } from "./dto";

export const getApplicationSummary = async () => {
  const res = await apiClient.get<IApplicationSummaryResponse>("/candidate-dashboard/overview");
  return res.data;
};

export const getApplicationStatusSummary = async () => {
  const res = await apiClient.get<IApplicationStatusSummaryResponse>("/candidate-dashboard/application-status");
  return res.data;
};

export const getApplicationTrend = async () => {
  const res = await apiClient.get<IApplicationTrendResponse>("/candidate-dashboard/application-trend");
  return res.data;
};
