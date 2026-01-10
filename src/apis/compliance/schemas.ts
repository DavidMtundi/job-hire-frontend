/**
 * Compliance Management API Schemas
 */
import * as z from "zod";

export const EEOTrackingSchema = z.object({
  id: z.string(),
  application_id: z.string(),
  candidate_id: z.string(),
  gender: z.string().nullable().optional(),
  race_ethnicity: z.string().nullable().optional(),
  veteran_status: z.boolean().nullable().optional(),
  disability_status: z.boolean().nullable().optional(),
  age_range: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const ComplianceDocumentSchema = z.object({
  id: z.string(),
  document_type: z.string(),
  entity_type: z.string(),
  entity_id: z.string(),
  file_name: z.string(),
  file_url: z.string(),
  file_size: z.number().nullable().optional(),
  mime_type: z.string().nullable().optional(),
  uploaded_by: z.string(),
  description: z.string().nullable().optional(),
  expires_at: z.string().nullable().optional(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const ComplianceReportSchema = z.object({
  id: z.string(),
  report_type: z.string(),
  report_name: z.string(),
  report_period_start: z.string(),
  report_period_end: z.string(),
  generated_by: z.string(),
  file_url: z.string().nullable().optional(),
  report_data: z.record(z.any()).nullable().optional(),
  status: z.string(),
  created_at: z.string(),
});

export const EEOSummaryItemSchema = z.object({
  gender: z.string().nullable().optional(),
  race_ethnicity: z.string().nullable().optional(),
  total_applications: z.number(),
  total_hired: z.number(),
  hire_rate_percent: z.number().nullable().optional(),
});

export type TEEOTracking = z.infer<typeof EEOTrackingSchema>;
export type TComplianceDocument = z.infer<typeof ComplianceDocumentSchema>;
export type TComplianceReport = z.infer<typeof ComplianceReportSchema>;
export type TEEOSummaryItem = z.infer<typeof EEOSummaryItemSchema>;

