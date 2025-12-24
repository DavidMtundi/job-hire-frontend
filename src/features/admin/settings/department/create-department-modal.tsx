"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useCreateDepartmentMutation } from "~/apis/departments/queries";
import { CreateDepartmentSchema, TCreateDepartment } from "~/apis/departments/schemas";
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

export const CreateDepartmentModal = ({ trigger }: IProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<TCreateDepartment>({
    resolver: zodResolver(CreateDepartmentSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  const { mutate: createDepartment, isPending } = useCreateDepartmentMutation();

  useEffect(() => {
    form.reset();
  }, [isOpen, form]);

  const onSubmit = (data: TCreateDepartment) => {
    createDepartment(data, {
      onSuccess: () => {
        toast.success("Department created successfully.");
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
        {trigger ? trigger : <Button><PlusIcon /> Create Department</Button>}
      </DialogTrigger>
      <DialogContent className="min-w-fit">
        <DialogHeader>
          <DialogTitle>Create Department</DialogTitle>
          <DialogDescription>
            Add a new department to the system.
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
