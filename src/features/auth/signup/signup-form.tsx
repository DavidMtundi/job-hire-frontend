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
import { Form, FormControl, FormField, FormItem, FormMessage, FormDescription, FormLabel } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { useSignupMutation } from "~/apis/auth/queries";
import { SignupSchema, TSignup } from "~/apis/auth/schemas";
import { decodeJWT } from "~/utils/jwt";
import { useRouter } from "next/navigation";


export const SignupForm = () => {
  const [success, setSuccess] = useState<string | undefined>("");
  const [error, setError] = useState<string | undefined>("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const roleParam = searchParams.get("role");
  const redirectParam = searchParams.get("redirect");

  // Determine initial role
  const getInitialRole = (): "hr" | "candidate" | "manager" => {
    if (token) {
      try {
        const decodedToken = decodeJWT(token);
        if (decodedToken?.role && ["hr", "candidate", "manager"].includes(decodedToken.role)) {
          return decodedToken.role as "hr" | "candidate" | "manager";
        }
      } catch (e) {
        // Invalid token, continue
      }
    }
    if (roleParam === "hr" || roleParam === "manager") {
      return roleParam as "hr" | "manager";
    }
    return "candidate";
  };

  const form = useForm<TSignup>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: getInitialRole(),
    },
  })

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = decodeJWT(token);
        if (decodedToken) {
          form.reset({
            email: decodedToken.email,
            role: decodedToken.role || "candidate",
          });
        }
      } catch (e) {
        // Invalid token, ignore
      }
    } else if (roleParam === "hr" || roleParam === "manager") {
      form.setValue("role", roleParam as "hr" | "manager");
    }
  }, [token, roleParam, form]);

  const { mutate: signup, isPending } = useSignupMutation();
  const selectedRole = form.watch("role");

  const onSubmit = (values: TSignup) => {
    signup(values, {
      onSuccess: () => {
        toast.success("Account created successfully.");
        setSuccess("Account created successfully. Please check your email to verify your account, then login.");
        setIsSubmitted(true);
        
        // If there's a redirect param and user selected HR role, redirect to login with redirect
        if (redirectParam && values.role === "hr") {
          setTimeout(() => {
            router.push(`/login?redirect=${encodeURIComponent(redirectParam)}&registered=true`);
          }, 2000);
        }
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
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending || isSubmitted || !!token}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="candidate">Candidate (Job Seeker)</SelectItem>
                    <SelectItem value="hr">HR / Company Owner</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  {selectedRole === "hr" && "Select this to create jobs and manage a company. After signup, you'll register your company."}
                  {selectedRole === "candidate" && "For job seekers looking to apply for positions."}
                  {selectedRole === "manager" && "For managers who need to view reports and monitor applications."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button disabled={isPending || isSubmitted} type="submit" className="w-full">
          {isPending ? "Creating account..." : `Create ${selectedRole === "hr" ? "HR/Company Owner" : selectedRole === "candidate" ? "Candidate" : "Manager"} Account`}
        </Button>
        <FormSuccess message={success} />
        <FormError message={error} />
        {success && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Account created successfully!</strong>
            </p>
            {selectedRole === "hr" ? (
              <div className="text-sm text-blue-700 space-y-1">
                <p>1. Check your email to verify your account</p>
                <p>2. Login with your credentials</p>
                <p>3. Register your company after logging in</p>
              </div>
            ) : selectedRole === "candidate" ? (
              <p className="text-sm text-blue-700">
                Check your email to verify your account, then complete your profile to start applying for jobs.
              </p>
            ) : (
              <p className="text-sm text-blue-700">
                Check your email to verify your account, then login to access your dashboard.
              </p>
            )}
          </div>
        )}
      </form>
    </Form>
  );
};
