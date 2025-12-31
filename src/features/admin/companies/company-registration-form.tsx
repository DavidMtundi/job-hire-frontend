"use client";

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
import { useRegisterCompanyMutation } from "~/apis/companies/queries";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

// Company registration schema - only company fields (authentication required)
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
});

type CompanyFormValues = z.infer<typeof companySchema>;

export function CompanyRegistrationForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { mutate: registerCompanyMutate, isPending: isSubmitting } = useRegisterCompanyMutation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?redirect=${encodeURIComponent("/admin/companies/register")}`);
    }
  }, [status, router]);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      company_name: "",
      company_domain: "",
      website: "",
      description: "",
      industry: "",
      size: undefined,
    },
  });

  const onSubmit = async (data: CompanyFormValues) => {
    // User must be authenticated (handled by useEffect redirect)
    if (!session) {
      toast.error("Please login first to register a company");
      router.push(`/login?redirect=${encodeURIComponent("/admin/companies/register")}`);
      return;
    }

    registerCompanyMutate({
      name: data.company_name,
      domain: data.company_domain.replace("@", "").toLowerCase(),
      website: data.website || undefined,
      description: data.description || undefined,
      industry: data.industry || undefined,
      size: data.size,
    }, {
      onSuccess: (result) => {
        if (result.success) {
          toast.success("Company registered successfully!");
          router.push("/admin/companies");
        } else {
          toast.error(result.message || "Failed to register company");
        }
      },
      onError: (error: any) => {
        console.error("Company registration error:", error);
        toast.error(error?.message || "Failed to register company");
      }
    });
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
        </p>
        {session && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg inline-block">
            <p className="text-sm text-blue-800">
              ✓ You're logged in as <strong>{session.user?.email}</strong>. This account will be set as the company owner.
            </p>
          </div>
        )}
        {status === "unauthenticated" && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl mx-auto">
            <p className="text-sm text-yellow-800 mb-3">
              <strong>Please login first</strong> to register your company. If you don't have an account, please sign up first.
            </p>
            <div className="flex gap-3 justify-center">
              <a href={`/login?redirect=${encodeURIComponent("/admin/companies/register")}`} className="text-sm text-blue-600 hover:text-blue-700 font-medium underline">
                Login
              </a>
              <span className="text-yellow-600">•</span>
              <a href="/signup" className="text-sm text-blue-600 hover:text-blue-700 font-medium underline">
                Sign Up
              </a>
            </div>
          </div>
        )}
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(
                (data) => {
                  console.log("✅ Form validation passed, calling onSubmit with:", data);
                  onSubmit(data);
                },
                (errors) => {
                  console.log("❌ Form validation failed with errors:", errors);
                  console.log("Form state:", form.formState);
                }
              )} 
              className="space-y-6"
            >
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

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  {session && (
                    <p>Your account <strong>{session.user?.email}</strong> will be set as the company owner.</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/companies")}
                    disabled={isSubmitting || !session}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !session || status !== "authenticated"} 
                    className="min-w-[160px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      <>
                        <Building2 className="h-4 w-4 mr-2" />
                        Register Company
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
      {!session && status !== "loading" && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <a href="/signup" className="text-blue-600 hover:text-blue-700 font-medium underline">
              Sign up
            </a>
            {" "}or{" "}
            <a href={`/login?redirect=${encodeURIComponent("/admin/companies/register")}`} className="text-blue-600 hover:text-blue-700 font-medium underline">
              login
            </a>
            {" "}to register your company.
          </p>
        </div>
      )}
    </div>
  );
}

