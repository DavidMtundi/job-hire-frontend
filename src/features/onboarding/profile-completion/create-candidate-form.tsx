'use client'

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, XCircleIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { useOnboardingStore } from "~/hooks/use-onboarding-store";
import { useSession } from "next-auth/react";
import { useCreateCandidateMutation } from "~/apis/candidates/queries";
import { CreateCandidateSchema, TCreateCandidate } from "~/apis/candidates/schema";

export const CreateCandidateForm = () => {
  const { resumeData, clearResume, clearResumeData } = useOnboardingStore();
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();

  // console.log("resumeData", resumeData);

  const form = useForm<TCreateCandidate>({
    resolver: zodResolver(CreateCandidateSchema),
    mode: "onChange", // Enable validation on change for better UX
    defaultValues: {
      first_name: resumeData?.first_name || "",
      last_name: resumeData?.last_name || "",
      email: resumeData?.email || session?.user?.email || "",
      phone: resumeData?.phone || "",
      address: resumeData?.address || "",
      current_position: resumeData?.current_position || "",
      years_experience: resumeData?.years_experience ?? 0,
      stack: resumeData?.stack && resumeData.stack.length > 0 ? resumeData.stack : [],
      skills: resumeData?.skills && resumeData.skills.length > 0 ? resumeData.skills : [],
      linkedin_url: resumeData?.linkedin_url || "",
      summary: resumeData?.summary || "",
      expected_salary: resumeData?.expected_salary || "",
      last_education: resumeData?.last_education || "",
      joining_availability: resumeData?.joining_availability || "1 month",
      resume_url: resumeData?.resume_url || "",
    },
  })

  const { mutate: createCandidate, isPending } = useCreateCandidateMutation();

  // Update form when resumeData changes (e.g., after CV upload) - REMOVED DUPLICATE
  useEffect(() => {
    if (resumeData) {
      form.reset({
        first_name: resumeData.first_name || "",
        last_name: resumeData.last_name || "",
        email: resumeData.email || session?.user?.email || "",
        phone: resumeData.phone || "",
        address: resumeData.address || "",
        current_position: resumeData.current_position || "",
        years_experience: resumeData.years_experience ?? 0,
        stack: resumeData.stack && resumeData.stack.length > 0 ? resumeData.stack : [],
        skills: resumeData.skills && resumeData.skills.length > 0 ? resumeData.skills : [],
        linkedin_url: resumeData.linkedin_url || "",
        summary: resumeData.summary || "",
        expected_salary: resumeData.expected_salary || "",
        last_education: resumeData.last_education || "",
        joining_availability: resumeData.joining_availability || "1 month",
        resume_url: resumeData.resume_url || "",
      });
    }
  }, [resumeData, form, session?.user?.email]);

  const onSubmit = async (values: TCreateCandidate) => {
    console.log("Form submitted with values:", values);
    console.log("Form state:", {
      isValid: form.formState.isValid,
      errors: form.formState.errors,
      isSubmitting: form.formState.isSubmitting
    });

    // Validate session first
    if (!session?.user?.id) {
      toast.error("Session expired. Please login again.");
      router.push("/login");
      return;
    }

    // Ensure required arrays have at least one item (schema requirement)
    // If empty, validation will catch it, but we can provide better UX
    if (!values.stack || values.stack.length === 0) {
      form.setError("stack", { 
        type: "manual", 
        message: "At least one stack is required" 
      });
      toast.error("Please add at least one stack");
      return;
    }

    if (!values.skills || values.skills.length === 0) {
      form.setError("skills", { 
        type: "manual", 
        message: "At least one skill is required" 
      });
      toast.error("Please add at least one skill");
      return;
    }

    // Ensure resume_url is provided (schema requirement)
    if (!values.resume_url || values.resume_url.trim() === "") {
      form.setError("resume_url", { 
        type: "manual", 
        message: "Resume URL is required" 
      });
      toast.error("Resume URL is required. Please go back and upload your resume.");
      return;
    }

    // Clean up empty strings in arrays (filter out empty stack/skill entries)
    const cleanedValues = {
      ...values,
      stack: values.stack.filter(s => s && s.trim() !== ""),
      skills: values.skills.filter(s => s && s.trim() !== ""),
      years_experience: values.years_experience ?? 0,
    };

    // Validate again after cleaning
    if (cleanedValues.stack.length === 0) {
      form.setError("stack", { 
        type: "manual", 
        message: "At least one stack is required" 
      });
      toast.error("Please add at least one stack (remove empty entries)");
      return;
    }

    if (cleanedValues.skills.length === 0) {
      form.setError("skills", { 
        type: "manual", 
        message: "At least one skill is required" 
      });
      toast.error("Please add at least one skill (remove empty entries)");
      return;
    }

    console.log("Submitting candidate data:", cleanedValues);

    createCandidate(cleanedValues, {
      onSuccess: async (response) => {
        console.log("Candidate created successfully:", response);
        toast.success("Profile completed successfully!");
        form.reset();
        clearResume();
        clearResumeData();
        
        // Update session and set isProfileCompleted to true
        if (session) {
          try {
            await updateSession({
              ...session,
              user: {
                ...session.user,
                is_profile_complete: true
              },
            });
            router.push("/user/dashboard");
          } catch (sessionError) {
            console.error("Session update error:", sessionError);
            // Even if session update fails, redirect to dashboard
            router.push("/user/dashboard");
          }
        } else {
          toast.error("Session not found");
          router.push("/login");
        }
      },
      onError: (error: any) => {
        console.error("Error creating candidate:", error);
        
        // Extract error message from various possible error structures
        const errorMessage = 
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          error?.message ||
          error?.error?.message ||
          "Failed to create profile. Please check all fields and try again.";
        
        toast.error(errorMessage);
        
        // If it's a validation error, try to set form errors
        if (error?.response?.data?.errors) {
          const errors = error.response.data.errors;
          Object.keys(errors).forEach((key) => {
            form.setError(key as any, {
              type: "server",
              message: errors[key]
            });
          });
        }
      }
    });
  }

  // Handle form submission errors (validation failures)
  const onError = (errors: any) => {
    console.error("Form validation errors:", errors);
    const errorMessages = Object.values(errors).flatMap((error: any) => {
      if (error?.message) return error.message;
      if (Array.isArray(error)) return error.map((e: any) => e?.message).filter(Boolean);
      return [];
    });
    
    if (errorMessages.length > 0) {
      toast.error(`Please fix the following errors: ${errorMessages.slice(0, 3).join(", ")}`);
    } else {
      toast.error("Please check all required fields and try again");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal information</CardTitle>
            <CardDescription>Please provide your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor={field.name}>First name <span className="text-red-500">*</span></Label>
                    <FormControl>
                      <Input
                        {...field}
                        id={field.name}
                        disabled={isPending}
                        placeholder="Enter your first name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor={field.name}>Last name <span className="text-red-500">*</span></Label>
                    <FormControl>
                      <Input
                        {...field}
                        id={field.name}
                        disabled={isPending}
                        placeholder="Enter your last name"
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
                    <Label htmlFor={field.name}>Email <span className="text-red-500">*</span></Label>
                    <FormControl>
                      <Input
                        {...field}
                        id={field.name}
                        disabled={isPending}
                        placeholder="Enter your email address"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor={field.name}>Phone <span className="text-red-500">*</span></Label>
                    <FormControl>
                      <Input
                        {...field}
                        id={field.name}
                        disabled={isPending}
                        placeholder="Enter your phone number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor={field.name}>Address <span className="text-red-500">*</span></Label>
                      <FormControl>
                        <Input
                          {...field}
                          id={field.name}
                          disabled={isPending}
                          placeholder=""
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professional information</CardTitle>
            <CardDescription>Please provide your professional information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <FormField
                  control={form.control}
                  name="years_experience"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor={field.name}>Years of experience</Label>
                      <FormControl>
                        <Input
                          {...field}
                          value={Number.isNaN(field.value) ? "" : field.value}
                          onChange={(e) => {
                            field.onChange(e.target.valueAsNumber);
                          }}
                          id={field.name}
                          disabled={isPending}
                          placeholder=""
                          type="number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="current_position"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <Label htmlFor={field.name}>Current position <span className="text-red-500">*</span></Label>
                      <FormControl>
                        <Input
                          {...field}
                          id={field.name}
                          disabled={isPending}
                          placeholder="Enter current position (e.g. Software Engineer at MustCompany)"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="stack"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor={field.name}>Stack</Label>
                    <div className="flex flex-wrap gap-2">
                      {field.value.map((stack, index) => (
                        <div key={index} className="relative">
                          <Input
                            value={stack}
                            onChange={(e) => {
                              const newSkills = [...field.value];
                              newSkills[index] = e.target.value;
                              field.onChange(newSkills);
                            }}
                            placeholder=""
                            disabled={isPending}
                            className="h-8 max-w-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newStacks = field.value.filter((_, i) => i !== index);
                              field.onChange(newStacks);
                            }}
                            className="p-1 absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-900"
                          >
                            <XCircleIcon className="size-4" />
                          </button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => field.onChange([...field.value, ""])}
                        disabled={isPending}
                      >
                        Add Stack
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor={field.name}>Skills</Label>
                    <div className="flex flex-wrap gap-2">
                      {field.value.map((skill, index) => (
                        <div key={index} className="relative">
                          <Input
                            value={skill}
                            onChange={(e) => {
                              const newSkills = [...field.value];
                              newSkills[index] = e.target.value;
                              field.onChange(newSkills);
                            }}
                            placeholder=""
                            disabled={isPending}
                            className="h-8 max-w-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newSkills = field.value.filter((_, i) => i !== index);
                              field.onChange(newSkills);
                            }}
                            className="p-1 absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-900"
                          >
                            <XCircleIcon className="size-4" />
                          </button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => field.onChange([...field.value, ""])}
                        disabled={isPending}
                      >
                        Add Skill
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="linkedin_url"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor={field.name}>LinkedIn URL</Label>
                    <FormControl>
                      <Input
                        {...field}
                        id={field.name}
                        disabled={isPending}
                        placeholder="Enter your LinkedIn Profile URL"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor={field.name}>Summary</Label>
                    <FormControl>
                      <Textarea
                        {...field}
                        id={field.name}
                        disabled={isPending}
                        placeholder="Enter summary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional information</CardTitle>
            <CardDescription>Please provide your additional information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="expected_salary"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <Label htmlFor={field.name}>Expected salary (Monthly)</Label>
                      <FormControl>
                        <Input
                          {...field}
                          id={field.name}
                          disabled={isPending}
                          placeholder="e.g 2000 USD"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="joining_availability"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <Label htmlFor={field.name}>Joining availability</Label>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isPending}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediately">Immediately</SelectItem>
                            <SelectItem value="1 week">1 week</SelectItem>
                            <SelectItem value="2 weeks">2 weeks</SelectItem>
                            <SelectItem value="1 month">1 month</SelectItem>
                            <SelectItem value="more than 1 month">More than 1 month</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="last_education"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor={field.name}>Last Education</Label>
                    <FormControl>
                      <Input
                        {...field}
                        id={field.name}
                        disabled={isPending}
                        placeholder="Enter your last education"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="resume_url"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor={field.name}>Resume URL</Label>
                    <FormControl>
                      <Input
                        {...field}
                        id={field.name}
                        disabled={isPending}
                        placeholder="Upload resume or enter resume URL"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button asChild variant="outline" type="button" disabled={isPending}>
            <Link href="/onboarding/resume-upload">
              <ArrowLeftIcon /> Back
            </Link>
          </Button>
          <Button 
            type="submit" 
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save and continue"}
          </Button>
        </div>
        {/* Show form validation errors summary */}
        {Object.keys(form.formState.errors).length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800 mb-2">
              Please fix the following errors:
            </p>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {Object.entries(form.formState.errors).map(([field, error]) => (
                <li key={field}>
                  <strong>{field.replace(/_/g, " ")}</strong>: {error && typeof error === 'object' && 'message' in error ? String(error.message) : "Invalid value"}
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </Form>
  );
};

