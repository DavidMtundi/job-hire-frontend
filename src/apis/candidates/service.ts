import apiClient from "~/lib/axios";
import { ICandidateResponse,  ICandidatesResponse } from "./dto";
import { TCreateCandidate, TUpdateCandidate } from "./schema";

export const getCandidates = async () => {
  const res = await apiClient.get<ICandidatesResponse>("/candidates/");
  return res.data;
};

export const getCandidate = async (candidateId: string) => {
  const res = await apiClient.get<ICandidateResponse>(`/candidates/${candidateId}`);
  return res.data;
};

export const createCandidate = async (data: TCreateCandidate) => {
  const res = await apiClient.post<ICandidateResponse>("/candidates",
    data
  );
  return res.data;
};

export const updateCandidate = async (candidateId: string, data: TUpdateCandidate) => {
  const res = await apiClient.put<ICandidateResponse>(`/candidates/${candidateId}`,
    data
  );
  return res.data;
};

export const deleteCandidate = async (candidateId: string) => {
  const res = await apiClient.delete(`/candidates/${candidateId}`);
  return res.data;
};
