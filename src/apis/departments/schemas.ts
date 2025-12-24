import * as z from "zod";

export const DepartmentSchema = z.object({
  id: z.number().optional(),
  name: z
    .string()
    .nonempty({ message: "Name is required" })
    .max(255, "Name must be at most 255 characters"),
  description: z.string().optional(),
  total_jobs: z.number().optional(), // for response only
});

export const CreateDepartmentSchema = DepartmentSchema.omit({
  id: true,
  total_jobs: true,
});

export const UpdateDepartmentSchema = DepartmentSchema.omit({
  total_jobs: true,
});
  
export type TDepartment = z.infer<typeof DepartmentSchema>;
export type TCreateDepartment = z.infer<typeof CreateDepartmentSchema>;
export type TUpdateDepartment = z.infer<typeof UpdateDepartmentSchema>;

// mock department data
const departmentSchema = {
  id: 1,
  name: "Human Resources",
  description: "Human Resources Department",
  total_jobs: 10,
}