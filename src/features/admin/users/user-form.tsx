"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { CreateUserSchema, TCreateUser } from "~/apis/users/schemas";

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

interface UserFormProps {
  user: TCreateUser;
  isPending: boolean;
  onSubmit: (data: TCreateUser) => void;
  onClose: () => void;
}

export const UserForm = ({ user, isPending, onSubmit, onClose }: UserFormProps) => {
  const form = useForm<TCreateUser>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      username: user.username,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      is_email_verified: user.is_email_verified,
      is_profile_complete: user.is_profile_complete,
    },
  })

  return (
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
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isPending}>Create</Button>
        </div>
      </form>
    </Form>
  )
}

