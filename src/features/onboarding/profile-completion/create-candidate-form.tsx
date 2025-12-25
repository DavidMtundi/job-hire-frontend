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
    defaultValues: {
      first_name: resumeData?.first_name || "",
      last_name: resumeData?.last_name || "",
      email: resumeData?.email || "",
      phone: resumeData?.phone || "",
      address: resumeData?.address || "",
      current_position: resumeData?.current_position || "",
      years_experience: resumeData?.years_experience,
      stack: resumeData?.stack || [],
      skills: resumeData?.skills || [],
      linkedin_url: resumeData?.linkedin_url || "",
      summary: resumeData?.summary || "",
      expected_salary: resumeData?.expected_salary || "",
      last_education: resumeData?.last_education || "",
      joining_availability: "1 month",
      resume_url: resumeData?.resume_url || "",
      // metadata: {},
    },
  })

  const { mutate: createCandidate, isPending } = useCreateCandidateMutation();

  // Update form when resumeData changes (e.g., after CV upload)
  useEffect(() => {
    if (resumeData) {
      form.reset({
        first_name: resumeData.first_name || "",
        last_name: resumeData.last_name || "",
        email: resumeData.email || "",
        phone: resumeData.phone || "",
        address: resumeData.address || "",
        current_position: resumeData.current_position || "",
        years_experience: resumeData.years_experience,
        stack: resumeData.stack || [],
        skills: resumeData.skills || [],
        linkedin_url: resumeData.linkedin_url || "",
        summary: resumeData.summary || "",
        expected_salary: resumeData.expected_salary || "",
        last_education: resumeData.last_education || "",
        joining_availability: "1 month",
        resume_url: resumeData.resume_url || "",
      });
    }
  }, [resumeData, form]);

  // Update form when resumeData changes (e.g., after CV upload)
  useEffect(() => {
    if (resumeData) {
      form.reset({
        first_name: resumeData.first_name || "",
        last_name: resumeData.last_name || "",
        email: resumeData.email || "",
        phone: resumeData.phone || "",
        address: resumeData.address || "",
        current_position: resumeData.current_position || "",
        years_experience: resumeData.years_experience,
        stack: resumeData.stack || [],
        skills: resumeData.skills || [],
        linkedin_url: resumeData.linkedin_url || "",
        summary: resumeData.summary || "",
        expected_salary: resumeData.expected_salary || "",
        last_education: resumeData.last_education || "",
        joining_availability: "1 month",
        resume_url: resumeData.resume_url || "",
      });
    }
  }, [resumeData, form]);

  const onSubmit = async (values: TCreateCandidate) => {
    // return console.log("values", values);

    createCandidate(values, {
      onSuccess: async () => {
        toast.success("Profile completed successfully.");
        form.reset();
        clearResume();
        clearResumeData();
        // update session and set isProfileCompleted to true
        if (session) {
          await updateSession({
            ...session,
            user: {
              ...session.user,
              is_profile_complete: true
            },
          });
          router.push("/user/dashboard");
        } else {
          toast.error("Session not found");
          router.push("/login");
        }
      },
      onError: (error) => {
        toast.error(error.message || "Something went wrong");
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          <Button asChild variant="outline">
            <Link href="/onboarding/resume-upload">
              <ArrowLeftIcon /> Back
            </Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save and continue"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

