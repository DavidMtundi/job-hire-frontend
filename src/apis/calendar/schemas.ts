/**
 * Calendar Integration API Schemas
 */
import * as z from "zod";

export const CalendarTypeSchema = z.enum(["google", "outlook", "apple", "calendly"]);

export const CalendarIntegrationSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  calendar_type: CalendarTypeSchema,
  calendar_id: z.string(),
  is_active: z.boolean(),
  sync_enabled: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const InterviewerAvailabilitySchema = z.object({
  id: z.string(),
  user_id: z.string(),
  day_of_week: z.number().min(0).max(6),
  start_time: z.string(),
  end_time: z.string(),
  timezone: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const SchedulingLinkSchema = z.object({
  id: z.string(),
  interview_id: z.string(),
  candidate_link: z.string(),
  interviewer_link: z.string().nullable().optional(),
  expires_at: z.string().nullable().optional(),
  is_active: z.boolean(),
  created_at: z.string(),
});

export type TCalendarIntegration = z.infer<typeof CalendarIntegrationSchema>;
export type TInterviewerAvailability = z.infer<typeof InterviewerAvailabilitySchema>;
export type TSchedulingLink = z.infer<typeof SchedulingLinkSchema>;
export type TCalendarType = z.infer<typeof CalendarTypeSchema>;

