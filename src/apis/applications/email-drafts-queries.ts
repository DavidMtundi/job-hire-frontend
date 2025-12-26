/**
 * Email Drafts Queries
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "~/lib/axios";
import {
  IEmailDraftRequest,
  IEmailDraftResponse,
  ISendEmailRequest,
  ISendEmailResponse,
} from "./email-drafts-dto";

/**
 * Generate shortlist email draft
 */
export const useGenerateShortlistDraftMutation = () => {
  return useMutation({
    mutationKey: ["generate-shortlist-draft"],
    mutationFn: async ({
      applicationId,
      request,
    }: {
      applicationId: string;
      request: IEmailDraftRequest;
    }) => {
      const response = await apiClient.post<IEmailDraftResponse>(
        `/applications/${applicationId}/email-drafts/shortlist`,
        request
      );
      return response.data;
    },
    onError: (error) => {
      console.error("Error generating shortlist draft:", error);
    },
  });
};

/**
 * Generate rejection email draft
 */
export const useGenerateRejectionDraftMutation = () => {
  return useMutation({
    mutationKey: ["generate-rejection-draft"],
    mutationFn: async ({
      applicationId,
      request,
    }: {
      applicationId: string;
      request: IEmailDraftRequest;
    }) => {
      const response = await apiClient.post<IEmailDraftResponse>(
        `/applications/${applicationId}/email-drafts/rejection`,
        request
      );
      return response.data;
    },
    onError: (error) => {
      console.error("Error generating rejection draft:", error);
    },
  });
};

/**
 * Send email to candidate
 */
export const useSendApplicationEmailMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["send-application-email"],
    mutationFn: async ({
      applicationId,
      request,
    }: {
      applicationId: string;
      request: ISendEmailRequest;
    }) => {
      const response = await apiClient.post<ISendEmailResponse>(
        `/applications/${applicationId}/send-email`,
        request
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate applications to refresh data
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["application-detail"] });
    },
    onError: (error) => {
      console.error("Error sending email:", error);
    },
  });
};

