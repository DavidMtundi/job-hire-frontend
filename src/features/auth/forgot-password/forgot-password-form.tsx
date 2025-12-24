'use client'

import { zodResolver } from "@hookform/resolvers/zod";
import { Redo2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FormError } from "~/components/form-error";
import { FormSuccess } from "~/components/form-success";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useForgotPasswordMutation } from "../../../apis/auth/queries";
import { ForgotPasswordSchema } from "../../../apis/auth/schemas";

export const ForgotPasswordForm = () => {
  const [success, setSuccess] = useState<string | undefined>("");
  const [error, setError] = useState<string | undefined>("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const { mutate: forgotPassword, isPending } = useForgotPasswordMutation();

  const onSubmit = (values: z.infer<typeof ForgotPasswordSchema>) => {
    forgotPassword(values, {
      onSuccess: () => {
        setIsSubmitted(true);
        setSuccess("We have sent an email containing a reset password token to your inbox. Please check!");
        toast.success("Password reset email sent successfully.");
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor={field.name}>Email</Label>
              <FormControl>
                <Input
                  {...field}
                  id={field.name}
                  disabled={isPending || isSubmitted}
                  placeholder="Enter your email address"
                  type="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormError message={error} />
        <FormSuccess message={success} />
        {isSubmitted ? (
          <div className="flex justify-end">
            <Button size="xs" variant="link" onClick={resetForm}>
              <Redo2Icon />
              Resend Email
            </Button>
          </div>
        ) : (
          <Button type="submit" disabled={isPending} className="w-full">
            Continue
          </Button>
        )}
      </form>
    </Form>
  )
}
