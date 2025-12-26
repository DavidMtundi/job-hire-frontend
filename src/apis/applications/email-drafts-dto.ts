/**
 * Email Drafts DTOs
 */

export interface IEmailDraft {
  subject: string;
  greeting: string;
  body: string;
  closing: string;
  signature: string;
}

export interface IEmailDraftRequest {
  next_steps?: string;
  rejection_reason?: string;
}

export interface IEmailDraftResponse {
  success: boolean;
  message: string;
  data: IEmailDraft;
}

export interface ISendEmailRequest {
  subject: string;
  greeting: string;
  body: string;
  closing: string;
  signature: string;
}

export interface ISendEmailResponse {
  success: boolean;
  message: string;
  data?: {
    sent_to: string;
  };
}

