'use client'

import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { FormError } from "~/components/form-error";
import { FormSuccess } from "~/components/form-success";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useSignupMutation } from "~/apis/auth/queries";
import { SignupSchema, TSignup } from "~/apis/auth/schemas";
import { decodeJWT } from "~/utils/jwt";


export const SignupForm = () => {
  const [success, setSuccess] = useState<string | undefined>("");
  const [error, setError] = useState<string | undefined>("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      const decodedToken = decodeJWT(token);
      if (decodedToken) {
        form.reset({
          email: decodedToken.email,
          role: decodedToken.role,
        });
      }
    }
  }, [token]);

  const form = useForm<TSignup>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "candidate",
    },
  })

  const { mutate: signup, isPending } = useSignupMutation();

  const onSubmit = (values: TSignup) => {
    signup(values, {
      onSuccess: () => {
        toast.success("Account created successfully.");
        setSuccess("Account created successfully. Please check your email to verify your account.");
        setIsSubmitted(true);
      },
      onError: (error) => {
        toast.error(error.message || "Something went wrong");
        setError(error.message || "Something went wrong");
        setIsSubmitted(true);
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor={field.name}>Name</Label>
                <FormControl>
                  <Input
                    {...field}
                    id={field.name}
                    disabled={isPending || isSubmitted}
                    placeholder="John Doe"
                  />
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
                <Label htmlFor={field.name}>Email</Label>
                <FormControl>
                  <Input
                    {...field}
                    id={field.name}
                    disabled={isPending || isSubmitted || !!token}
                    placeholder="john.doe@example.com"
                    type="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor={field.name}>Password</Label>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      id={field.name}
                      disabled={isPending || isSubmitted}
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className="h-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      disabled={isPending || isSubmitted}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button disabled={isPending || isSubmitted} type="submit" className="w-full">
          {isPending ? "Creating account..." : "Create Candidate Account"}
        </Button>
        <FormSuccess message={success} />
        <FormError message={error} />
        {success && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Next steps:</strong> Check your email to verify your account, then complete your profile to start applying for jobs.
            </p>
          </div>
        )}
      </form>
    </Form>
  );
};
