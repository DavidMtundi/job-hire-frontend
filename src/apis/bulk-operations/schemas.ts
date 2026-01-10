/**
 * Bulk Operations API Schemas
 */
import * as z from "zod";

export const BulkUpdateStatusSchema = z.object({
  application_ids: z.array(z.string()).min(1),
  status_id: z.number(),
  remarks: z.string().optional(),
});

export const BulkAssignRecruiterSchema = z.object({
  application_ids: z.array(z.string()).min(1),
  recruiter_id: z.string(),
});

export const BulkSendEmailSchema = z.object({
  application_ids: z.array(z.string()).min(1),
  template_id: z.string(),
  variables: z.record(z.any()).default({}),
});

export type TBulkUpdateStatus = z.infer<typeof BulkUpdateStatusSchema>;
export type TBulkAssignRecruiter = z.infer<typeof BulkAssignRecruiterSchema>;
export type TBulkSendEmail = z.infer<typeof BulkSendEmailSchema>;

export interface IBulkActionResponse {
  success: boolean;
  message: string;
  data: {
    processed_count: number;
    failed_count: number;
    failed_ids: string[];
  };
}

