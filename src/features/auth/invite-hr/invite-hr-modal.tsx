"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Redo2Icon } from "lucide-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormError } from "~/components/form-error";
import { FormSuccess } from "~/components/form-success";
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
import { useInviteHrEmailMutation } from "~/apis/auth/queries";
import { InviteHrEmailSchema, TInviteHrEmail } from "~/apis/auth/schemas";

export const InviteHrModal = () => {
  const [open, setOpen] = React.useState(false);
  const [success, setSuccess] = useState<string | undefined>("");
  const [error, setError] = useState<string | undefined>("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<TInviteHrEmail>({
    resolver: zodResolver(InviteHrEmailSchema),
    defaultValues: {
      email: "",
    },
  })

  useEffect(() => {
    if (open) resetForm();
    return () => resetForm();
  }, [open]);

  const { mutate: inviteHrEmail, isPending } = useInviteHrEmailMutation();

  const onSubmit = (values: TInviteHrEmail) => {
    inviteHrEmail(values, {
      onSuccess: () => {
        setIsSubmitted(true);
        setSuccess("We have sent an email containing a invitation link to your inbox. Please check!");
        toast.success("Email sent successfully.");
      },
      onError: (error) => {
        toast.error(error.message || "Something went wrong");
      }
    })
  }

  const resetForm = () => {
    form.reset();
    setSuccess("");
    setError("");
    setIsSubmitted(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Invite Hr</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Hr</DialogTitle>
          <DialogDescription>
            Enter an email address to invite an hr.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="relative">
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
                  <FormMessage className="absolute -bottom-5" />
                </FormItem>
              )}
            />
            <FormError message={error} />
            <FormSuccess message={success} />
            <div className="flex gap-3 justify-end">
              {isSubmitted ? (
                <Button type="button" size="xs" variant="link" onClick={resetForm}>
                  <Redo2Icon />
                  Resend Invite
                </Button>
              ) : (
                <Button type="submit" disabled={isPending || !form.formState.isValid || !form.watch("email")}>
                  Send Invite
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
