import * as z from "zod";

const status = ["Applied", "Screening", "HR Interview", "Technical Interview", "Final Interview", "In Review", "Offer Sent", "Hired", "Rejected", "Talent Pool"]

export const ApplicationSchema = z.object({
  id: z.string(),
  job_id: z.string().min(1, 'Job ID is required'),
  candidate_id: z.string(),
  user_id: z.string(), // no need (move to created by)
  cover_letter: z.string().min(1, 'Cover Letter is required'),
  notes: z.string().optional(),
  remarks: z.string().optional(),

  score: z.number().optional(),
  match_level: z.string().optional(), // z.enum(["Strong Match", "Good Match", "Average Match", "Weak Match"]),
  matching_skills: z.array(z.string()).optional(),
  missing_skills: z.array(z.string()).optional(),
  recommendation: z.string().optional(),

  candidate: z.object({
    id: z.string(),
    user_id: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    email: z.string(),
    phone: z.string(),
    address: z.string(),
    resume_url: z.string().optional(),
  }),

  job: z.object({
    id: z.string(),
    user_id: z.string(),
    title: z.string(),
    department: z.string(),
    location: z.string(),
    salary_min: z.number(),
    salary_max: z.number(),
    salary_currency: z.string(),
  }),

  next_step: z.string(),
  next_step_date: z.string(),
  // interview_title: z.string().optional(),
  // interview_datetime: z.string().optional(),
  progress: z.number(),
  priority: z.enum(["high", "medium", "low"]),
  recruiter: z.string(),

  stage: z.enum(status).optional(),
  status_id: z.number().optional(),

  applied_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  // created_by: z.string(),
  // updated_by: z.string(),
})

// Candidate apply to a job
export const CreateApplicationSchema = ApplicationSchema.pick({
  job_id: true,
  cover_letter: true,
});

export const UpdateApplicationSchema = ApplicationSchema.omit({
  candidate: true,
  job: true,
  // status: true,
  created_at: true,
  updated_at: true,
  created_by: true,
  updated_by: true,
});


export type TApplicationStatus = typeof status[number];
export type TApplication = z.infer<typeof ApplicationSchema>;
export type TCreateApplication = z.infer<typeof CreateApplicationSchema>;
export type TUpdateApplication = z.infer<typeof UpdateApplicationSchema>;

// suggested schema for application data:

interface IApplicationData {
  id: string,
  candidate_id: string,
  job_id: string,
  cover_letter: string,
  // this field should populate in response only if candidate_id is provided
  candidate: {
    id: string,
    first_name: string,
    last_name: string,
    email: string,
    phone: string,
    address: string,
  },
  // this field should populate in response only if job_id is provided
  job: {
    id: string,
    title: string,
    department: string,
    location: string,
    salary_min: number,
    salary_max: number,
    salary_currency: string,
  },
  applied_at: string,
  status: "Applied" | "Screening" | "HR Interview" | "Technical Interview" | "Final Interview" | "Offer Sent" | "Hired" | "Rejected" | "Talent Pool",
  // stage: string,
  next_step: string,
  next_step_date: string,
  progress: number,
  priority: "high" | "medium" | "low",
  recruiter: string,
}