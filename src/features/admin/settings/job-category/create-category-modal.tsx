"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useCreateCategoryMutation } from "~/apis/categories/queries";
import { CreateCategorySchema, TCreateCategory } from "~/apis/categories/schemas";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "~/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";

interface IProps {
  trigger?: React.ReactNode;
}

export const CreateCategoryModal = ({ trigger }: IProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<TCreateCategory>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  const { mutate: createCategory, isPending } = useCreateCategoryMutation();

  useEffect(() => {
    form.reset();
  }, [isOpen, form]);

  const onSubmit = (data: TCreateCategory) => {
    createCategory(data, {
      onSuccess: () => {
        toast.success("Category created successfully.");
        setIsOpen(false);
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
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : <Button><PlusIcon /> Create Category</Button>}
      </DialogTrigger>
      <DialogContent className="min-w-fit">
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
          <DialogDescription>
            Add a new category to the system.
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
              <Button type="button" variant="outline" onClick={handleReset} className="w-28">Cancel</Button>
              <Button type="submit" disabled={isPending} className="w-28">
                {isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
