import * as z from "zod";

export const UserSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .nonempty({ message: "Username is required" })
    .max(255, "Username must be at most 255 characters"),
  email: z
    .string()
    .nonempty({ message: "Email is required" })
    .email({ message: "Invalid email address" }),
    role: z
    .string()
    .nonempty({ message: "Role is required" })
    .refine((val) => ["admin", "hr", "recruiter", "hiring_manager", "hr_assistant", "manager"].includes(val), {
      message: "Invalid role",
    }),
  is_active: z.boolean().optional(),
  is_email_verified: z.boolean().optional(),
  is_profile_complete: z.boolean().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateUserSchema = UserSchema.omit({
  id: true,
  // is_profile_complete: true,
  created_at: true,
  updated_at: true,
}).extend({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    // .max(128, { message: "Password must be at most 128 characters long" })
    // .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    // .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    // .regex(/\d/, { message: "Password must contain at least one number" })
    // .regex(/[@$!%*?&#]/, { message: "Password must contain at least one special character" }),
});

export const UpdateUserSchema = UserSchema.omit({
  // is_profile_complete: true,
  created_at: true,
  updated_at: true,
});


export type TUser = z.infer<typeof UserSchema>;
export type TCreateUser = z.infer<typeof CreateUserSchema>;
export type TUpdateUser = z.infer<typeof UpdateUserSchema>;

// mock user data
const userSchema = {
  id: 1,
  name: "John Smith",
  email: "john.smith@company.com",
  phone: "+1 (555) 123-4567",
  role: "HR Manager",
  department: "Human Resources",
  status: "active",
  isRestricted: false,
  permissions: ["read", "write", "delete", "admin"],
  lastLogin: "2024-01-22T10:30:00Z",
  createdDate: "2023-06-15",
  avatar: "/placeholder.svg?height=40&width=40&text=JS",
  summary: {
    jobsCreated: 15,
    applicationsReviewed: 234,
  }
}