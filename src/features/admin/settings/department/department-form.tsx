"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CreateDepartmentSchema, TCreateDepartment } from "~/apis/departments/schemas";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";


interface IProps {
  department: TCreateDepartment;
  isPending: boolean;
  onSubmit: (data: TCreateDepartment) => void;
  onClose: () => void;
}

export const DepartmentForm = ({ department, isPending, onSubmit, onClose }: IProps = {
  department: {
    name: "",
    description: "",
  },
  isPending: false,
  onSubmit: () => {},
  onClose: () => {},
}) => {
  const form = useForm<TCreateDepartment>({
    resolver: zodResolver(CreateDepartmentSchema),
    defaultValues: {
      name: department?.name,
      description: department?.description,
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
                <Input {...field} id={field.name} placeholder="e.g: Engineering" disabled={isPending} />
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

