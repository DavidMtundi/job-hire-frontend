import * as z from "zod";

const interviewStatus = ["pending", "scheduled", "accepted", "declined", "completed", "expired", "rescheduled", "cancelled", "shortlisted", "rejected"] as const;
const interviewType = ["technical", "hr"] as const;

export const InterviewSchema = z.object({
  id: z.string(),
  candidate_id: z.string().optional(),
  job_id: z.string().optional(),
  hr_id: z.string(),
  application_id: z.string().optional(),

  name: z.string().optional(),
  title: z.string().optional(),

  candidate: z.object({
    id: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    email: z.string(),
    phone: z.string().optional(),
  }).optional(),

  job: z.object({
    id: z.string(),
    title: z.string(),
    department: z.string().optional(),
  }).optional(),

  interview_date: z.string(),
  duration: z.number(),
  meeting_link: z.string(),
  notes: z.string().optional(),
  hr_remarks: z.string().optional(),
  available_time_slots: z.union([z.string(), z.array(z.string())]).optional(),
  interview_type: z.enum(interviewType),
  selected_time_slot: z.string().nullable().optional(),

  status: z.enum(interviewStatus).optional(),
  ai_interview_link: z.string().optional(),
  ai_interview: z.boolean().optional(),

  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const CreateInterviewSchema = z.object({
  candidate_id: z.string().min(1, "Candidate is required"),
  job_id: z.string().min(1, "Job is required"),
  hr_id: z.string().min(1, "HR is required"),
  application_id: z.string().optional(),
  interview_date: z.string().min(1, "Interview date is required"), // ISO datetime
  duration: z.number().min(15, "Duration must be at least 15 minutes").optional(),
  meeting_link: z.string().url("Must be a valid URL").min(1, "Meeting link is required"),
  notes: z.string().optional(),
  hr_remarks: z.string().optional(),
  available_time_slots: z.array(z.string()).optional(),
  interview_type: z.enum(interviewType).optional(),
});

export const UpdateInterviewSchema = CreateInterviewSchema.partial().extend({
  status: z.enum(interviewStatus).optional(),
  ai_interview_link: z.string().optional(),
});

export type TInterviewStatus = typeof interviewStatus[number];
export type TInterviewType = typeof interviewType[number];
export type TInterview = z.infer<typeof InterviewSchema>;
export type TCreateInterview = z.infer<typeof CreateInterviewSchema>;
export type TUpdateInterview = z.infer<typeof UpdateInterviewSchema>;
