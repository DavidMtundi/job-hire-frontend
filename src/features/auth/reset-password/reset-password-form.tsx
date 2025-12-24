'use client'

import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FormError } from "~/components/form-error";
import { FormSuccess } from "~/components/form-success";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useResetPasswordMutation } from "../../../apis/auth/queries";
import { ResetPasswordSchema } from "../../../apis/auth/schemas";

export const ResetPasswordForm = () => {
  const [success, setSuccess] = useState<string | undefined>("");
  const [error, setError] = useState<string | undefined>("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("No token found!");
      setSuccess("");
      setIsSubmitted(false);
    }
  }, [token]);

  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const { mutate: resetPassword, isPending } = useResetPasswordMutation();

  const onSubmit = (values: z.infer<typeof ResetPasswordSchema>) => {
    resetPassword({
      token: token || "",
      new_password: values.password,
    }, {
      onSuccess: () => {
        setIsSubmitted(true);
        setSuccess("Password reset successfully. Please login with your new password.");
        toast.success("Password reset successfully.");
      },
      onError: (error) => {
        toast.error(error.message || "Something went wrong");
      }
    })
  }

  const resetForm = () => {
    form.reset();
    setSuccess("");
    setIsSubmitted(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor={field.name}>Password</Label>
              <FormControl>
                <Input
                  {...field}
                  id={field.name}
                  disabled={isPending || isSubmitted}
                  placeholder="Enter your new password"
                  type="password"
                  autoComplete="new-password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor={field.name}>Confirm Password</Label>
              <FormControl>
                <Input
                  {...field}
                  id={field.name}
                  disabled={isPending || isSubmitted}
                  placeholder="Confirm your new password"
                  type="password"
                  autoComplete="new-password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormError message={error} />
        <FormSuccess message={success} />
        <Button type="submit" disabled={isPending || isSubmitted || !token} className="w-full">
          Reset Password
        </Button>
      </form>
    </Form>
  )
}
