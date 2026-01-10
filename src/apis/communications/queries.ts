/**
 * Communication Hub API Queries
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "~/lib/axios";
import {
  IEmailTemplatesResponse,
  IEmailTemplateResponse,
  ICommunicationTimelineResponse,
  IPreviewTemplateResponse,
} from "./dto";
import {
  TCreateEmailTemplate,
  TUpdateEmailTemplate,
  TSendEmailRequest,
} from "./schemas";

// Email Templates Queries
export const useGetEmailTemplatesQuery = (companyId?: string) => {
  return useQuery<IEmailTemplatesResponse, Error>({
    queryKey: ["email-templates", companyId],
    queryFn: async () => {
      const params = companyId ? { company_id: companyId } : {};
      const response = await apiClient.get<IEmailTemplatesResponse>(
        "/communications/templates",
        { params }
      );
      return response.data;
    },
  });
};

export const useGetEmailTemplateQuery = (templateId: string) => {
  return useQuery<IEmailTemplateResponse, Error>({
    queryKey: ["email-template", templateId],
    queryFn: async () => {
      const response = await apiClient.get<IEmailTemplateResponse>(
        `/communications/templates/${templateId}`
      );
      return response.data;
    },
    enabled: !!templateId,
  });
};

export const useCreateEmailTemplateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-email-template"],
    mutationFn: async (data: TCreateEmailTemplate) => {
      const response = await apiClient.post<IEmailTemplateResponse>(
        "/communications/templates",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
    },
  });
};

export const useUpdateEmailTemplateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-email-template"],
    mutationFn: async ({
      templateId,
      data,
    }: {
      templateId: string;
      data: TUpdateEmailTemplate;
    }) => {
      const response = await apiClient.put<IEmailTemplateResponse>(
        `/communications/templates/${templateId}`,
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      queryClient.invalidateQueries({
        queryKey: ["email-template", variables.templateId],
      });
    },
  });
};

export const useDeleteEmailTemplateMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-email-template"],
    mutationFn: async (templateId: string) => {
      const response = await apiClient.delete<IEmailTemplateResponse>(
        `/communications/templates/${templateId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
    },
  });
};

// Communication Timeline Queries
export const useGetCommunicationTimelineQuery = (applicationId: string) => {
  return useQuery<ICommunicationTimelineResponse, Error>({
    queryKey: ["communication-timeline", applicationId],
    queryFn: async () => {
      const response = await apiClient.get<ICommunicationTimelineResponse>(
        `/communications/timeline/${applicationId}`
      );
      return response.data;
    },
    enabled: !!applicationId,
  });
};

// Email Sending Mutations
export const useSendEmailMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["send-email"],
    mutationFn: async (data: TSendEmailRequest) => {
      const response = await apiClient.post<IEmailTemplateResponse>(
        "/communications/send-email",
        data
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["communication-timeline", variables.application_id],
      });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });
};

export const usePreviewTemplateMutation = () => {
  return useMutation({
    mutationKey: ["preview-template"],
    mutationFn: async ({
      templateId,
      applicationId,
      customVariables,
    }: {
      templateId: string;
      applicationId: string;
      customVariables?: Record<string, any>;
    }) => {
      const response = await apiClient.post<IPreviewTemplateResponse>(
        "/communications/preview-template",
        customVariables || {},
        {
          params: {
            template_id: templateId,
            application_id: applicationId,
          },
        }
      );
      return response.data;
    },
  });
};

// AI Email Generation Mutation
export const useGenerateAIEmailMutation = () => {
  return useMutation({
    mutationKey: ["generate-ai-email"],
    mutationFn: async ({
      applicationId,
      userPrompt,
      tone = "professional",
    }: {
      applicationId: string;
      userPrompt: string;
      tone?: string;
    }) => {
      const response = await apiClient.post<IPreviewTemplateResponse>(
        "/communications/generate-ai-email",
        {
          application_id: applicationId,
          user_prompt: userPrompt,
          tone: tone,
        }
      );
      return response.data;
    },
  });
};

