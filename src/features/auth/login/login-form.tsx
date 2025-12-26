'use client'

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { LoginSchema, TLogin } from "~/apis/auth/schemas";
import { FormError } from "~/components/form-error";
import { FormSuccess } from "~/components/form-success";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export const LoginForm = () => {
  const [success, setSuccess] = useState<string | undefined>("");
  const [error, setError] = useState<string | undefined>("");
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectPath = searchParams.get("redirect");
  const registered = searchParams.get("registered");

  // Show success message if user just registered
  useEffect(() => {
    if (registered === "true") {
      toast.success("Registration successful! Please login with your credentials.");
    }
  }, [registered]);

  const form = useForm<TLogin>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: TLogin) => {
    setIsLoading(true);

    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
      // callbackUrl: absoluteUrl("/dashboard"),
    });

    if (res?.error) {
      toast.error("Invalid login credentials");
      setIsLoading(false);
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const sessionData = await sessionRes.json();
    const user = sessionData?.user;
    let fallbackRedirect = "";

    if (user?.role === "candidate") {
      if (user?.is_profile_complete) {
        fallbackRedirect = "/user/dashboard";
      } else {
        fallbackRedirect = "/onboarding";
      }
    } else if (user?.role === "admin" || user?.role === "hr") {
      fallbackRedirect = "/admin/dashboard";
    } else if (user?.role === "manager") {
      fallbackRedirect = "/manager/dashboard";
    } else {
      fallbackRedirect = "/";
    }

    router.push(fallbackRedirect || `/onboarding/redirect=${redirectPath}`);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
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
                    disabled={isLoading || isPending}
                    placeholder="Enter your email address"
                    type="email"
                    className="h-10"
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
                <div className="flex items-center justify-between">
                  <Label htmlFor={field.name}>Password</Label>
                  <Link href="/forgot-password" className="text-xs text-gray-700 font-medium hover:underline">Forgot your password?</Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      id={field.name}
                      disabled={isLoading || isPending}
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className="h-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      disabled={isLoading || isPending}
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
        <FormError message={error} />
        <FormSuccess message={success} />
        <Button 
          type="submit" 
          size="md" 
          variant="default" 
          disabled={isLoading || isPending} 
          className="w-full"
        >
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </Form>
  );
};
