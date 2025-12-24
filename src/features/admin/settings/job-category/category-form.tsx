"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CreateCategorySchema, TCreateCategory } from "~/apis/categories/schemas";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";


interface IProps {
  category: TCreateCategory;
  isPending: boolean;
  onSubmit: (data: TCreateCategory) => void;
  onClose: () => void;
}

export const CategoryForm = ({ category, isPending, onSubmit, onClose }: IProps = {
  category: {
    name: "",
    description: "",
  },
  isPending: false,
  onSubmit: () => {},
  onClose: () => {},
}) => {
  const form = useForm<TCreateCategory>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
      name: category.name,
      description: category.description,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor={field.name}>Name<span className="text-red-500">*</span></Label>
              <FormControl>
                <Input {...field} id={field.name} placeholder="e.g: Frontend Development" disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor={field.name}>Description</Label>
              <FormControl>
                <Textarea {...field} id={field.name} placeholder="Enter description" disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="w-28">Cancel</Button>
          <Button type="submit" disabled={isPending} className="w-28">
            {isPending ? "Creating..." : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

