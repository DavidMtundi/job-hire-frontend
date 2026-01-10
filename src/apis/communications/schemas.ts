/**
 * Communication Hub API Schemas
 */
import * as z from "zod";

export const EmailTemplateCategorySchema = z.enum([
  "application_acknowledgment",
  "screening_rejection",
  "interview_invitation",
  "offer_letter",
  "rejection_after_interview",
  "reference_check_request",
  "shortlist_notification",
  "custom",
]);

export const CommunicationTypeSchema = z.enum([
  "email",
  "sms",
  "call",
  "note",
  "interview",
  "status_change",
]);

export const CommunicationStatusSchema = z.enum([
  "sent",
  "delivered",
  "opened",
  "clicked",
  "failed",
  "bounced",
]);

export const EmailTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: EmailTemplateCategorySchema,
  subject: z.string(),
  body: z.string(),
  variables: z.array(z.string()),
  is_default: z.boolean(),
  company_id: z.string().nullable().optional(),
  created_by: z.string(),
  created_at: z.string(),
  updated_at: z.string().nullable().optional(),
  updated_by: z.string().nullable().optional(),
  is_active: z.boolean(),
});

export const CommunicationTimelineSchema = z.object({
  id: z.string(),
  application_id: z.string(),
  candidate_id: z.string().nullable().optional(),
  communication_type: CommunicationTypeSchema,
  subject: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  sent_to: z.string().nullable().optional(),
  sent_from: z.string().nullable().optional(),
  status: CommunicationStatusSchema,
  opened_at: z.string().nullable().optional(),
  clicked_at: z.string().nullable().optional(),
  template_id: z.string().nullable().optional(),
  metadata: z.record(z.any()),
  created_by: z.string(),
  created_at: z.string(),
  template_name: z.string().nullable().optional(),
  created_by_email: z.string().nullable().optional(),
});

export const CreateEmailTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  category: EmailTemplateCategorySchema,
  subject: z.string().min(1).max(500),
  body: z.string().min(1),
  variables: z.array(z.string()).default([]),
  is_default: z.boolean().default(false),
  company_id: z.string().nullable().optional(),
});

export const UpdateEmailTemplateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  category: EmailTemplateCategorySchema.optional(),
  subject: z.string().min(1).max(500).optional(),
  body: z.string().min(1).optional(),
  variables: z.array(z.string()).optional(),
  is_default: z.boolean().optional(),
});

export const SendEmailRequestSchema = z.object({
  application_id: z.string(),
  template_id: z.string().nullable().optional(),
  subject: z.string().nullable().optional(),
  body: z.string().nullable().optional(),
  variables: z.record(z.any()).default({}),
  custom_template: z.boolean().default(false),
});

export type TEmailTemplate = z.infer<typeof EmailTemplateSchema>;
export type TCommunicationTimeline = z.infer<typeof CommunicationTimelineSchema>;
export type TCreateEmailTemplate = z.infer<typeof CreateEmailTemplateSchema>;
export type TUpdateEmailTemplate = z.infer<typeof UpdateEmailTemplateSchema>;
export type TSendEmailRequest = z.infer<typeof SendEmailRequestSchema>;
export type TEmailTemplateCategory = z.infer<typeof EmailTemplateCategorySchema>;
export type TCommunicationType = z.infer<typeof CommunicationTypeSchema>;
export type TCommunicationStatus = z.infer<typeof CommunicationStatusSchema>;

