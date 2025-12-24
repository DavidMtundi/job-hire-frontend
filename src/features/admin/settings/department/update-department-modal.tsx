"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useUpdateDepartmentMutation } from "~/apis/departments/queries";
import { TUpdateDepartment, UpdateDepartmentSchema } from "~/apis/departments/schemas";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { useDepartmentModal } from "~/hooks/use-department-modal";


export const UpdateDepartmentModal = () => {
  const { data: department, modal, isOpen, onOpenChange, onClose } = useDepartmentModal();

  const { mutate: updateDepartment, isPending } = useUpdateDepartmentMutation();

  // console.log("Rendering UpdateDepartmentModal", department);

  const form = useForm<TUpdateDepartment>({
    resolver: zodResolver(UpdateDepartmentSchema),
    defaultValues: {
      name: department?.name || "",
      description: department?.description || "",
    },
  })

  useEffect(() => {
    if (department) {
      form.reset({
        name: department?.name,
        description: department?.description,
      });
    }
    return () => {
      form.reset();
    }
  }, [isOpen, department]);

  const onSubmit = (data: TUpdateDepartment) => {
    // return console.log("formdata", data);
    updateDepartment({ ...data, id: department?.id }, {
      onSuccess: () => {
        toast.success("Department updated successfully.");
        onClose()
        form.reset();
      },
      onError: (error) => {
        toast.error(error.message || "Something went wrong");
        form.reset();
      },
    })
  }

  const handleReset = () => {
    form.reset();
    onClose();
  }

  return (
    <Dialog open={modal === "edit" && isOpen} onOpenChange={onOpenChange}>
      {/* <DialogTrigger asChild>
        {trigger ? trigger : <Button variant="ghost"><EditIcon /> Edit Department</Button>}
      </DialogTrigger> */}
      <DialogContent className="min-w-fit">
        <DialogHeader>
          <DialogTitle>Update Department</DialogTitle>
          <DialogDescription>
            Update the details of <strong>{department?.name}</strong> department.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor={field.name}>Name<span className="text-red-500">*</span></Label>
                  <FormControl>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="e.g: Engineering"
                      disabled={isPending}
                    />
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
                    <Textarea
                      {...field}
                      id={field.name}
                      placeholder="Enter description"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" disabled={isPending} onClick={handleReset} className="w-28">Cancel</Button>
              <Button type="submit" disabled={isPending} className="w-28">
                {isPending ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
