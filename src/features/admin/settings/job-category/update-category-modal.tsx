"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useUpdateCategoryMutation } from "~/apis/categories/queries";
import { TUpdateCategory, UpdateCategorySchema } from "~/apis/categories/schemas";
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
import { useCategoryModal } from "~/hooks/use-category-modal";


export const UpdateCategoryModal = () => {
  const { data: category, modal, isOpen, onOpenChange, onClose } = useCategoryModal();

  const { mutate: updateCategory, isPending } = useUpdateCategoryMutation();

  // console.log("Rendering UpdateCategoryModal", category);

  const form = useForm<TUpdateCategory>({
    resolver: zodResolver(UpdateCategorySchema),
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
    },
  })

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        description: category.description,
      });
    }
    return () => {
      form.reset();
    }
  }, [isOpen, category]);

  const onSubmit = (data: TUpdateCategory) => {
    // return console.log("formdata", data);
    updateCategory({ ...data, id: category?.id }, {
      onSuccess: () => {
        toast.success("Category updated successfully.");
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
          <DialogTitle>Update Category</DialogTitle>
          <DialogDescription>
            Update the details of <strong>{category?.name}</strong> category.
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
                      placeholder="e.g: Frontend Development"
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
