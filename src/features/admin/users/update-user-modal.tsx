"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { useUpdateUserMutation } from "~/apis/users/queries";
import { TUpdateUser, UpdateUserSchema } from "~/apis/users/schemas";
import { useUserModal } from "~/hooks/use-user-modal";
import { useEffect } from "react";

const roles = [
  {
    value: "admin",
    label: "System Admin",
    permissions: ["read", "write", "delete"],
  },
  {
    value: "hr",
    label: "HR Manager",
    permissions: ["read", "write", "delete", "admin"],
  },
  { value: "recruiter", label: "Recruiter", permissions: ["read", "write"] },
  {
    value: "hiring_manager",
    label: "Hiring Manager",
    permissions: ["read", "write"],
  },
  {
    value: "hr_assistant",
    label: "HR Assistant",
    permissions: ["read"]
  },
];

const departments = [
  { value: "Human Resources", label: "Human Resources" },
  { value: "Engineering", label: "Engineering" },
  { value: "Product", label: "Product" },
  { value: "Design", label: "Design" },
  { value: "Marketing", label: "Marketing" },
];


export const UpdateUserModal = () => {
  const { data: user, modal, isOpen, onOpenChange, onClose } = useUserModal();

  const { mutate: updateUser, isPending } = useUpdateUserMutation();

  // console.log("Rendering UpdateUserModal", user);

  const form = useForm<TUpdateUser>({
    resolver: zodResolver(UpdateUserSchema),
    // defaultValues: {
    //   username: user?.username,
    //   email: user?.email,
    //   role: user?.role,
    //   is_active: user?.is_active,
    // },
  })

  useEffect(() => {
    if(user) {
      form.reset({
        username: user.username,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
      });
    }
    return () => {
      form.reset();
    }
  }, [isOpen, user]);

  const onSubmit = (data: TUpdateUser) => {
    // return console.log("formdata", data);
    updateUser({...data, id: user?.id}, {
      onSuccess: () => {
        toast.success("User updated successfully.");
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
        {trigger ? trigger : <Button variant="ghost"><EditIcon /> Edit user</Button>}
      </DialogTrigger> */}
      <DialogContent className="min-w-fit">
        <DialogHeader>
          <DialogTitle>Update User</DialogTitle>
          <DialogDescription>
            Update user details and permissions.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <Label>Full Name</Label>
                  <FormControl>
                    <Input {...field} placeholder="e.g: John Doe" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Label>Email</Label>
                  <FormControl>
                    <Input {...field} placeholder="e.g: john.doe@example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <Label>Role</Label>
                  <FormControl>
                    <Select
                      {...field}
                      disabled={isPending}
                      onValueChange={field.onChange}>
                      <SelectTrigger
                        className={cn(
                          "w-full",
                          form.formState.errors.role && "border-red-400 focus:ring-red-400"
                        )}
                      >
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem>
                  <Label>Status</Label>
                  <FormControl>
                    <Select
                      {...field}
                      disabled={isPending}
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(value === "true")}>
                      <SelectTrigger
                        className={cn(
                          "w-full",
                          form.formState.errors.is_active && "border-red-400 focus:ring-red-400"
                        )}
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem key="active" value="true">Active</SelectItem>
                        <SelectItem key="inactive" value="false">Inactive</SelectItem>
                        {/* <SelectItem key="restricted" value="restricted">Restricted</SelectItem> */}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button variant="outline" disabled={isPending} onClick={handleReset}>Cancel</Button>
              <Button type="submit" disabled={isPending}>Update</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
