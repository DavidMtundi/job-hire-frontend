/**
 * Communication Hub API DTOs
 */
import { TEmailTemplate, TCommunicationTimeline } from "./schemas";

export interface IEmailTemplatesResponse {
  success: boolean;
  message: string;
  data: TEmailTemplate[];
}

export interface IEmailTemplateResponse {
  success: boolean;
  message: string;
  data: TEmailTemplate;
}

export interface ICommunicationTimelineResponse {
  success: boolean;
  message: string;
  data: TCommunicationTimeline[];
}

export interface IPreviewTemplateResponse {
  success: boolean;
  message: string;
  data: {
    subject: string;
    body: string;
  };
}

