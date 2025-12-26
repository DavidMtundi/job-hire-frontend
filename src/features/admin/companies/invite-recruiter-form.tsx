"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserPlus, Mail, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "sonner";
import { useInviteRecruiterMutation } from "~/apis/companies/queries";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["recruiter", "admin"]).default("recruiter"),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface InviteRecruiterFormProps {
  companyId: string;
}

export function InviteRecruiterForm({ companyId }: InviteRecruiterFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inviteRecruiter = useInviteRecruiterMutation();

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "recruiter",
    },
  });

  const onSubmit = async (data: InviteFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await inviteRecruiter.mutateAsync({
        companyId,
        data: {
          email: data.email,
          role: data.role,
        },
      });

      if (result.success) {
        toast.success(result.message || "Invitation sent successfully!");
        form.reset();
      } else {
        toast.error(result.message || "Failed to send invitation");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to send invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <UserPlus className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <CardTitle>Invite Recruiter</CardTitle>
            <CardDescription>Add team members to your company</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="recruiter@company.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The recruiter will receive an invitation email
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="recruiter">Recruiter</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Recruiters can manage applications. Admins can manage company settings.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

