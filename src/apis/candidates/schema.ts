import { z } from "zod";

export const CandidateSchema = z.object({
  id: z.string(),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  current_position: z.string().min(1, "Current position is required"),
  years_experience: z.number("Years experience is required").min(0, "Value must be greater than 0"),
  salary_min: z.number().optional(),
  stack: z
    .array(z.string().nonempty({ message: "Stack must be non-empty" }))
    .min(1, "At least one stack is required"),
  skills: z
    .array(z.string().nonempty({ message: "Skill must be non-empty" }))
    .min(1, "At least one required skill is required"),

  linkedin_url: z.string().optional(),
  summary: z.string().optional(),
  expected_salary: z.string().optional(),
  last_education: z.string().optional(),
  joining_availability: z.enum([
    "immediately",
    "1 week",
    "2 weeks",
    "1 month",
    "more than 1 month",
  ]),
  resume_url: z.string().nonempty({ message: "Resume URL is required" }),
  metadata: z.record(z.string(), z.any()).optional(),
  user_id: z.string().optional(),
  user_email: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const ResumeDataSchema = CandidateSchema.omit({
  id: true,
  user_id: true,
  user_email: true,
  created_at: true,
  updated_at: true,
});

export const CompleteProfileSchema = CandidateSchema.omit({
  id: true,
  user_id: true,
  user_email: true,
  created_at: true,
  updated_at: true,
}).extend({
  resume_url: z.string().nonempty({ message: "Resume URL is required" }),
});

export const CreateCandidateSchema = CandidateSchema.omit({
  id: true,
  user_id: true,
  user_email: true,
  created_at: true,
  updated_at: true,
})

export const UpdateCandidateSchema = CandidateSchema.omit({
  created_at: true,
  updated_at: true,
});

export type TCandidate = z.infer<typeof CandidateSchema>;
export type TResumeData = z.infer<typeof ResumeDataSchema>;
export type TCreateCandidate = z.infer<typeof CreateCandidateSchema>;
export type TUpdateCandidate = z.infer<typeof UpdateCandidateSchema>;


// additional fields
// Candidates {
//   status: "active" | "inactive" | "blacklisted" | "pending_verification" | "verified" | "profile_incomplete" | "suspended";
//   position: string;
//   rating: 4.5,
// }
