import * as z from "zod";

export const CategorySchema = z.object({
  id: z.number().optional(),
  slug: z.string(),
  name: z
    .string()
    .nonempty({ message: "Name is required" })
    .max(255, "Name must be at most 255 characters"),
  description: z.string().optional(),
  icon: z.string().optional(),
  total_jobs: z.number().optional(), // for response only
});

export const CreateCategorySchema = CategorySchema.omit({
  id: true,
  slug: true,
  total_jobs: true,
});

export const UpdateCategorySchema = CategorySchema.omit({
  slug: true,
  total_jobs: true,
});

export type TCategory = z.infer<typeof CategorySchema>;
export type TCreateCategory = z.infer<typeof CreateCategorySchema>;
export type TUpdateCategory = z.infer<typeof UpdateCategorySchema>;

// mock category data
const categorySchema = {
  id: 1,
  slug: "frontend-development",
  name: "Frontend Development",
  description: "Frontend Development Job Category",
  total_jobs: 10,
}