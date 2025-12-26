"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Building2, Loader2 } from "lucide-react";
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
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "sonner";
import { usePublicRegisterCompanyMutation, useRegisterCompanyMutation } from "~/apis/companies/queries";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// Company registration schema - owner fields are optional (required only for public registration)
const companySchema = z.object({
  company_name: z.string().min(1, "Company name is required").max(255),
  company_domain: z
    .string()
    .min(1, "Domain is required")
    .regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid domain format (e.g., company.com)"),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  description: z.string().optional(),
  industry: z.string().optional(),
  size: z.enum(["startup", "small", "medium", "large", "enterprise"]).optional(),
  owner_email: z.string().email("Invalid email address").optional(),
  owner_username: z.string().min(3, "Username must be at least 3 characters").max(50).optional(),
  owner_password: z.string().min(8, "Password must be at least 8 characters").optional(),
}).refine((data) => {
  // If owner_email is provided, all owner fields must be provided
  if (data.owner_email || data.owner_username || data.owner_password) {
    return !!(data.owner_email && data.owner_username && data.owner_password);
  }
  return true;
}, {
  message: "All owner account fields are required for public registration",
  path: ["owner_email"],
});

type CompanyFormValues = z.infer<typeof companySchema>;

export function CompanyRegistrationForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const publicRegisterCompany = usePublicRegisterCompanyMutation();
  const registerCompany = useRegisterCompanyMutation();

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      company_name: "",
      company_domain: "",
      website: "",
      description: "",
      industry: "",
      size: undefined,
      owner_email: "",
      owner_username: "",
      owner_password: "",
    },
  });

  const onSubmit = async (data: CompanyFormValues) => {
    setIsSubmitting(true);
    try {
      // If user is logged in, use authenticated endpoint
      // Otherwise, use public registration endpoint
      if (session) {
        const result = await registerCompany.mutateAsync({
          name: data.company_name,
          domain: data.company_domain.replace("@", "").toLowerCase(),
          website: data.website || undefined,
          description: data.description || undefined,
          industry: data.industry || undefined,
          size: data.size,
        });

        if (result.success) {
          toast.success("Company registered successfully!");
          router.push("/admin/companies");
        } else {
          toast.error(result.message || "Failed to register company");
        }
      } else {
        // Public registration - creates company + owner account
        // Validate owner fields are provided
        if (!data.owner_email || !data.owner_username || !data.owner_password) {
          toast.error("Owner account details are required for public registration");
          setIsSubmitting(false);
          return;
        }

        const result = await publicRegisterCompany.mutateAsync({
          company_name: data.company_name,
          company_domain: data.company_domain.replace("@", "").toLowerCase(),
          website: data.website || undefined,
          description: data.description || undefined,
          industry: data.industry || undefined,
          size: data.size,
          owner_email: data.owner_email,
          owner_username: data.owner_username,
          owner_password: data.owner_password,
        });

        if (result.success) {
          toast.success("Company and account created successfully!", {
            description: "You can now login with your owner email and password.",
            duration: 5000,
          });
          // Small delay to show success message
          setTimeout(() => {
            router.push("/login?registered=true");
          }, 1500);
        } else {
          toast.error(result.message || "Failed to register company");
        }
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to register company");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Register Your Company</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Create your company profile to start posting jobs, managing applications, and finding the best talent.
          {!session && " We'll also create your owner account so you can get started immediately."}
        </p>
        {session && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg inline-block">
            <p className="text-sm text-blue-800">
              ✓ You're logged in as <strong>{session.user?.email}</strong>. This account will be set as the company owner.
            </p>
          </div>
        )}
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Company Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
                </div>

                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Inc" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your company's official name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company_domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Domain *</FormLabel>
                      <FormControl>
                        <Input placeholder="acme.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your company's email domain (e.g., acme.com). Team members with emails from this domain will automatically be associated with your company.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://acme.com" type="url" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <FormControl>
                          <Input placeholder="Technology, Healthcare, Finance" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Size</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select company size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="startup">Startup (1-10)</SelectItem>
                          <SelectItem value="small">Small (11-50)</SelectItem>
                          <SelectItem value="medium">Medium (51-200)</SelectItem>
                          <SelectItem value="large">Large (201-1000)</SelectItem>
                          <SelectItem value="enterprise">Enterprise (1000+)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your company, culture, and what makes you unique..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional: Help candidates learn more about your company
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Owner Account Section (only shown if not logged in) */}
              {!session && (
                <>
                  <div className="border-t my-6" />
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2">
                      <Building2 className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Owner Account</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      We'll create your company owner account so you can start managing your company immediately after registration.
                    </p>
                    
                    <FormField
                      control={form.control}
                      name="owner_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Owner Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="owner@acme.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            This will be your login email. Use an email from your company domain if possible.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="owner_username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username *</FormLabel>
                            <FormControl>
                              <Input placeholder="johndoe" {...field} />
                            </FormControl>
                            <FormDescription>
                              At least 3 characters
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="owner_password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password *</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormDescription>
                              Minimum 8 characters
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  {session ? (
                    <p>Your account <strong>{session.user?.email}</strong> will be set as the company owner.</p>
                  ) : (
                    <p>By registering, you agree to create a company account and become the owner.</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(session ? "/admin/companies" : "/")}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="min-w-[160px]">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {session ? "Registering..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <Building2 className="h-4 w-4 mr-2" />
                        {session ? "Register Company" : "Create Company & Account"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Help Section */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium underline">
            Login here
          </a>
          {" "}or{" "}
          <a href="/signup" className="text-blue-600 hover:text-blue-700 font-medium underline">
            sign up as a candidate
          </a>
        </p>
      </div>
    </div>
  );
}

