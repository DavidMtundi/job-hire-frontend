import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "~/lib/axios";
import { IMatchingWeightsResponse, IMatchingScoreResponse, IMatchingWeights, IMatchingBreakdown } from "./dto";

export const useGetMatchingWeightsQuery = () => {
  return useQuery<IMatchingWeights, Error>({
    queryKey: ["matching-weights"],
    queryFn: async () => {
      const response = await apiClient.get<IMatchingWeightsResponse>("/matching/weights");
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch matching weights");
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useUpdateMatchingWeightsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-matching-weights"],
    mutationFn: async (weights: IMatchingWeights) => {
      const response = await apiClient.put<IMatchingWeightsResponse>("/matching/weights", weights);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to update matching weights");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matching-weights"] });
    },
  });
};

export const useCalculateMatchingScoreMutation = () => {
  return useMutation({
    mutationKey: ["calculate-matching-score"],
    mutationFn: async ({ jobId, candidateId }: { jobId: string; candidateId?: string }) => {
      const params = candidateId ? { candidate_id: candidateId } : {};
      const response = await apiClient.post<IMatchingScoreResponse>(
        `/matching/calculate/${jobId}`,
        {},
        { params }
      );
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to calculate matching score");
    },
  });
};

