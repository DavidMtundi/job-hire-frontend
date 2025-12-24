'use client'

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2Icon, XCircleIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DatePicker } from "~/components/date-picker";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { useUpdateJobMutation } from "~/apis/jobs/queries";
import { TJob, TUpdateJob, UpdateJobSchema } from "~/apis/jobs/schemas";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { useGetDepartmentsQuery } from "~/apis/departments/queries";
import { useGetCategoriesQuery } from "~/apis/categories/queries";

const jobTypes = [
  { label: "Full-time", value: "full_time" },
  { label: "Part-time", value: "part_time" },
  { label: "Contract", value: "contract" },
  { label: "Internship", value: "internship" },
];

const workModes = [
  { label: "Remote", value: "remote" },
  // { label: "Hybrid", value: "hybrid" },
  { label: "Onsite", value: "onsite" },
];

const experienceLevels = [
  { label: "Entry", value: "entry" },
  { label: "Mid", value: "mid" },
  { label: "Senior", value: "senior" },
];

const salaryCurrencies = ["USD", "EUR", "GBP", "INR"];

interface EditJobFormProps {
  jobData: TJob;
}

export const EditJobForm = ({ jobData }: EditJobFormProps) => {
  const router = useRouter();

  const form = useForm<TUpdateJob>({
    resolver: zodResolver(UpdateJobSchema),
    defaultValues: {
      id: jobData.id,
      title: jobData.title,
      description: jobData.description,
      responsibilities: jobData.responsibilities,
      benefits: jobData.benefits,
      required_skills: jobData.required_skills,
      education_requirements: jobData.education_requirements,
      department_id: jobData.department_id,
      category_id: jobData.category_id,
      location: jobData.location,
      // optional and default values
      job_type: jobData.job_type,
      experience_level: jobData.experience_level,
      salary_min: jobData.salary_min,
      salary_max: jobData.salary_max,
      salary_currency: jobData.salary_currency,
      is_remote: jobData.is_remote,
      // work_mode: "remote",
      application_deadline: jobData.application_deadline ? new Date(jobData.application_deadline) : undefined,
      max_applications: jobData.max_applications,
      status: jobData.status
    },
  })

  const { data: departmentsData } = useGetDepartmentsQuery();
  const { data: categoriesData } = useGetCategoriesQuery();

  const departments = departmentsData?.data || [];
  const categories = categoriesData?.data || [];

  const { mutate: updateJob, isPending, isSuccess } = useUpdateJobMutation();

  const onSubmit = async (values: TUpdateJob) => {
    // return console.log("values", values);
    updateJob(values, {
      onSuccess: async () => {
        toast.success("Job updated successfully.");
        form.reset();
      },
      onError: (error) => {
        toast.error(error.message || "Something went wrong");
      }
    })
  }

  return (
    <>
      {isSuccess && (
        <Alert className="mb-4" variant="success">
          <CheckCircle2Icon />
          <AlertTitle>Success! Job updated successfully</AlertTitle>
          <AlertDescription>
            Job updated successfully. You can now view it in the jobs list.
          </AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary/80">Job Basics</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="relative">
                    <Label htmlFor={field.name}>Job Title <span className="text-red-500">*</span></Label>
                    <FormControl>
                      <Input
                        {...field}
                        id={field.name}
                        disabled={isPending}
                        placeholder=""
                      />
                    </FormControl>
                    <FormMessage className="absolute -bottom-4 text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="relative">
                    <Label htmlFor={field.name}>Description <span className="text-red-500">*</span></Label>
                    <FormControl>
                      <Textarea
                        {...field}
                        id={field.name}
                        disabled={isPending}
                        placeholder=""
                      />
                    </FormControl>
                    <FormMessage className="absolute -bottom-4 text-xs" />
                  </FormItem>
                )}
              />


              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="relative max-w-xl">
                    <Label htmlFor={field.name}>Location <span className="text-red-500">*</span></Label>
                    <FormControl>
                      <Input
                        {...field}
                        id={field.name}
                        disabled={isPending}
                        placeholder=""
                      />
                    </FormControl>
                    <FormMessage className="absolute -bottom-4 text-xs" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="department_id"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <Label htmlFor={field.name}>Department <span className="text-red-500">*</span></Label>
                      <FormControl>
                        <Select
                          {...field}
                          disabled={isPending}
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString() || ""}
                        >
                          <SelectTrigger className={cn("w-full", form.formState.errors.department_id && "border-red-400 focus:ring-red-400")}>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((item) => (
                              <SelectItem key={item.id} value={item.id?.toString() || ""}>{item.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="absolute -bottom-4 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <Label htmlFor={field.name}>Category <span className="text-red-500">*</span></Label>
                      <FormControl>
                        <Select
                          {...field}
                          disabled={isPending}
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString() || ""}
                        >
                          <SelectTrigger className={cn("w-full", form.formState.errors.department_id && "border-red-400 focus:ring-red-400")}>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((item) => (
                              <SelectItem key={item.id} value={item.id?.toString() || ""}>{item.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="absolute -bottom-4 text-xs" />
                    </FormItem>
                  )}
                />

              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="experience_level"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <Label htmlFor={field.name}>Experience Level <span className="text-red-500">*</span></Label>
                      <FormControl>
                        <Select
                          {...field}
                          disabled={isPending}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {experienceLevels.map((experienceLevel) => (
                              <SelectItem
                                key={experienceLevel.value}
                                value={experienceLevel.value}
                              >
                                {experienceLevel.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="absolute -bottom-4 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="job_type"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <Label htmlFor={field.name}>Job Type <span className="text-red-500">*</span></Label>
                      <FormControl>
                        <Select
                          {...field}
                          disabled={isPending}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {jobTypes.map((jobType) => (
                              <SelectItem key={jobType.value} value={jobType.value}>{jobType.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="absolute -bottom-4 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_remote"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <Label htmlFor={field.name}>Work Mode <span className="text-red-500">*</span></Label>
                      <FormControl>
                        <Select
                          {...field}
                          disabled={isPending}
                          value={field.value?.toString()}
                          onValueChange={(value) => field.onChange(value === "true")}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {workModes.map((workMode) => (
                              <SelectItem key={workMode.value} value={workMode.value === "remote" ? "true" : "false"}>{workMode.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="absolute -bottom-4 text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-primary/80">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="responsibilities"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor={field.name}>Responsibilities</Label>
                    <div className="space-y-2">
                      {field.value.map((responsibility, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={responsibility}
                            onChange={(e) => {
                              const newResponsibilities = [...field.value];
                              newResponsibilities[index] = e.target.value;
                              field.onChange(newResponsibilities);
                            }}
                            placeholder=""
                            disabled={isPending}
                            className="h-8 max-w-2xl"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="iconSm"
                            onClick={() => {
                              const newResponsibilities = field.value.filter((_, i) => i !== index);
                              field.onChange(newResponsibilities);
                            }}
                          >
                            <XIcon className="size-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => field.onChange([...field.value, ""])}
                        disabled={isPending}
                      >
                        Add Responsibility
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="required_skills"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor={field.name}>Required Skills</Label>
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
                name="education_requirements"
                render={({ field }) => (
                  <FormItem className="relative">
                    <Label htmlFor={field.name}>Education Requirements</Label>
                    <FormControl>
                      <Textarea
                        {...field}
                        id={field.name}
                        disabled={isPending}
                        placeholder=""
                      />
                    </FormControl>
                    <FormMessage className="absolute -bottom-4 text-xs" />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-primary/80">Compensation and Benefits</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">

              <FormField
                control={form.control}
                name="benefits"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor={field.name}>Benefits</Label>
                    <div className="space-y-2">
                      {field.value.map((benefit, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={benefit}
                            onChange={(e) => {
                              const newBenefits = [...field.value];
                              newBenefits[index] = e.target.value;
                              field.onChange(newBenefits);
                            }}
                            placeholder=""
                            className="h-8 max-w-2xl"
                            disabled={isPending}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="iconSm"
                            onClick={() => {
                              const newBenefits = field.value.filter((_, i) => i !== index);
                              field.onChange(newBenefits);
                            }}
                          >
                            <XIcon className="size-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => field.onChange([...field.value, ""])}
                        disabled={isPending}
                      >
                        Add Benefit
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="salary_min"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor={field.name}>Salary Min</Label>
                      <FormControl>
                        <Input
                          {...field}
                          id={field.name}
                          disabled={isPending}
                          placeholder="Enter min salary"
                          type="number"
                          value={Number.isNaN(field.value) ? "" : field.value}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salary_max"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor={field.name}>Salary Max</Label>
                      <FormControl>
                        <Input
                          {...field}
                          id={field.name}
                          disabled={isPending}
                          placeholder="Enter max salary"
                          type="number"
                          value={Number.isNaN(field.value) ? "" : field.value}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salary_currency"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor={field.name}>Salary Currency</Label>
                      <FormControl>
                        <Select
                          {...field}
                          disabled={isPending}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {salaryCurrencies.map((salaryCurrency) => (
                              <SelectItem key={salaryCurrency} value={salaryCurrency}>{salaryCurrency}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
              <CardTitle className="text-primary/80">Job Settings</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="application_deadline"
                render={({ field }) => (
                  <FormItem className="relative max-w-sm">
                    <Label htmlFor={field.name}>Application Deadline</Label>
                    <FormControl>
                      <DatePicker
                        value={field.value ? new Date(field.value) : undefined}
                        onChange={field.onChange}
                        disabled={isPending}
                        placeholder="Select Date"
                        dateFormat="PP"
                        fieldError={form.formState.errors.application_deadline}
                      />
                    </FormControl>
                    <FormMessage className="absolute -bottom-4 text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="max_applications"
                render={({ field }) => (
                  <FormItem className="relative max-w-sm">
                    <Label htmlFor={field.name}>Max Applications</Label>
                    <FormControl>
                      <Input
                        {...field}
                        id={field.name}
                        disabled={isPending}
                        placeholder="Enter max no of applications"
                        type="number"
                        value={Number.isNaN(field.value) ? "" : field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage className="absolute -bottom-4 text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="relative max-w-sm">
                    <Label htmlFor={field.name}>Status</Label>
                    <FormControl>
                      <Select
                        {...field}
                        disabled={isPending}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="absolute -bottom-4 text-xs" />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button asChild variant="outline">
              <Link href="/admin/jobs">
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Updating..." : "Update Job"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

