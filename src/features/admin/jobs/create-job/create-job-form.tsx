"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2Icon, PlusIcon, XCircleIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DatePicker } from "~/components/date-picker";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { useCreateJobMutation } from "~/apis/jobs/queries";
import { CreateJobSchema, TCreateJob } from "~/apis/jobs/schemas";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { useGetDepartmentsQuery, useCreateDepartmentMutation } from "~/apis/departments/queries";
import { useGetCategoriesQuery, useCreateCategoryMutation } from "~/apis/categories/queries";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { IAIGeneratedJobData } from "~/apis/jobs/dto";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { TCreateCategory, CreateCategorySchema } from "~/apis/categories/schemas";
import { TCreateDepartment, CreateDepartmentSchema } from "~/apis/departments/schemas";
import { Combobox } from "~/components/ui/combobox";

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

// Common currencies with labels (ISO 4217)
const salaryCurrencies = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "JPY", label: "JPY - Japanese Yen" },
  { value: "AUD", label: "AUD - Australian Dollar" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "CHF", label: "CHF - Swiss Franc" },
  { value: "CNY", label: "CNY - Chinese Yuan" },
  { value: "INR", label: "INR - Indian Rupee" },
  { value: "NZD", label: "NZD - New Zealand Dollar" },
  { value: "SGD", label: "SGD - Singapore Dollar" },
  { value: "HKD", label: "HKD - Hong Kong Dollar" },
  { value: "SEK", label: "SEK - Swedish Krona" },
  { value: "NOK", label: "NOK - Norwegian Krone" },
  { value: "DKK", label: "DKK - Danish Krone" },
  { value: "PLN", label: "PLN - Polish Zloty" },
  { value: "MXN", label: "MXN - Mexican Peso" },
  { value: "BRL", label: "BRL - Brazilian Real" },
  { value: "ZAR", label: "ZAR - South African Rand" },
  { value: "KRW", label: "KRW - South Korean Won" },
  { value: "TRY", label: "TRY - Turkish Lira" },
  { value: "RUB", label: "RUB - Russian Ruble" },
  { value: "AED", label: "AED - UAE Dirham" },
  { value: "SAR", label: "SAR - Saudi Riyal" },
  { value: "ILS", label: "ILS - Israeli Shekel" },
  { value: "EGP", label: "EGP - Egyptian Pound" },
  { value: "NGN", label: "NGN - Nigerian Naira" },
  { value: "KES", label: "KES - Kenyan Shilling" },
  { value: "GHS", label: "GHS - Ghanaian Cedi" },
  { value: "TZS", label: "TZS - Tanzanian Shilling" },
  { value: "UGX", label: "UGX - Ugandan Shilling" },
  { value: "ETB", label: "ETB - Ethiopian Birr" },
  { value: "PKR", label: "PKR - Pakistani Rupee" },
  { value: "BDT", label: "BDT - Bangladeshi Taka" },
  { value: "LKR", label: "LKR - Sri Lankan Rupee" },
  { value: "THB", label: "THB - Thai Baht" },
  { value: "VND", label: "VND - Vietnamese Dong" },
  { value: "IDR", label: "IDR - Indonesian Rupiah" },
  { value: "MYR", label: "MYR - Malaysian Ringgit" },
  { value: "PHP", label: "PHP - Philippine Peso" },
];

interface CreateJobFormProps {
  aiGeneratedData?: IAIGeneratedJobData | null;
}

export const CreateJobForm = ({ aiGeneratedData }: CreateJobFormProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<TCreateJob>({
    resolver: zodResolver(CreateJobSchema),
    defaultValues: {
      title: "",
      description: "",
      responsibilities: [],
      benefits: [],
      required_skills: [],
      education_requirements: "",
      department_id: undefined,
      category_id: undefined,
      location: "",
      // optional and default values
      job_type: "full_time",
      experience_level: "entry",
      // salary_min: 0,
      // salary_max: 0,
      salary_currency: "USD",
      is_remote: false,
      // work_mode: "remote",
      // application_deadline: null,
      // max_applications: null,
      status: "active",
    },
  });

  // These queries run automatically on component mount
  // If they fail with 401, it will trigger a redirect to /login via axios interceptor
  console.log("[CreateJobForm] Component mounted - initializing queries");
  const { data: departmentsData, error: departmentsError, isLoading: departmentsLoading } = useGetDepartmentsQuery();
  const { data: categoriesData, error: categoriesError, isLoading: categoriesLoading } = useGetCategoriesQuery();
  
  useEffect(() => {
    console.log("[CreateJobForm] Query status:", {
      departmentsLoading,
      departmentsError: departmentsError ? {
        status: (departmentsError as any)?.response?.status,
        message: (departmentsError as any)?.message,
      } : null,
      categoriesLoading,
      categoriesError: categoriesError ? {
        status: (categoriesError as any)?.response?.status,
        message: (categoriesError as any)?.message,
      } : null,
    });
    
    if (departmentsError || categoriesError) {
      const error = departmentsError || categoriesError;
      const status = (error as any)?.response?.status;
      if (status === 401) {
        console.error("[CreateJobForm] ⚠️ 401 error detected in queries - redirect will happen via axios interceptor");
      }
    }
  }, [departmentsLoading, departmentsError, categoriesLoading, categoriesError]);

  const departments = departmentsData?.data || [];
  const categories = categoriesData?.data || [];

  const { mutate: createJob, isPending, isSuccess } = useCreateJobMutation();
  
  // State for create modals
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isCreateDepartmentOpen, setIsCreateDepartmentOpen] = useState(false);
  
  // Create mutations with callbacks
  const { mutate: createCategory } = useCreateCategoryMutation();
  const { mutate: createDepartment } = useCreateDepartmentMutation();
  
  // Form instances for create modals
  const categoryForm = useForm<TCreateCategory>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });
  
  const departmentForm = useForm<TCreateDepartment>({
    resolver: zodResolver(CreateDepartmentSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (aiGeneratedData) {
      const matchedDepartment = departments.find(
        (dept) =>
          dept.name?.toLowerCase() === aiGeneratedData.department?.toLowerCase()
      );

      let experienceLevel: "entry" | "mid" | "senior" = "entry";
      const expYears = aiGeneratedData.experience?.match(/\d+/)?.[0];
      if (expYears) {
        const years = parseInt(expYears);
        if (years >= 5) experienceLevel = "senior";
        else if (years >= 2) experienceLevel = "mid";
      }

      const isRemote = aiGeneratedData.location?.toLowerCase() === "remote";

      form.reset({
        title: aiGeneratedData.job_title || "",
        description: aiGeneratedData.description || "",
        responsibilities: aiGeneratedData.responsibilities || [],
        benefits: [],
        required_skills: aiGeneratedData.required_skills || [],
        education_requirements:
          aiGeneratedData.education_requirements?.join("\n") || "",
        department_id: matchedDepartment?.id
          ? Number(matchedDepartment.id)
          : undefined,
        category_id: form.getValues("category_id"),
        location: aiGeneratedData.location || "",
        job_type: "full_time",
        experience_level: experienceLevel,
        salary_currency: "USD",
        is_remote: isRemote,
        status: "active",
      });
    }
  }, [aiGeneratedData, departments, form]);

  const onSubmit = async (values: TCreateJob) => {
    // return console.log("values", values);
    createJob(values, {
      onSuccess: async () => {
        toast.success("Job created successfully.");
        form.reset({
          title: "",
          description: "",
          responsibilities: [],
          benefits: [],
          required_skills: [],
          education_requirements: "",
          department_id: undefined,
          category_id: undefined,
          location: "",
          job_type: "full_time",
          experience_level: "entry",
          salary_currency: "USD",
          is_remote: false,
          status: "active",
        });
        // router.push("/admin/jobs");
      },
      onError: (error) => {
        toast.error(error.message || "Something went wrong");
      },
    });
  };
  
  // Handle category creation
  const handleCreateCategory = (data: TCreateCategory) => {
    createCategory(data, {
      onSuccess: async (response) => {
        toast.success("Category created successfully.");
        setIsCreateCategoryOpen(false);
        categoryForm.reset();
        
        // Refetch categories to update the dropdown
        await queryClient.refetchQueries({ queryKey: ["categories"] });
        
        // Select the newly created category from the response
        if (response?.data?.id) {
          form.setValue("category_id", Number(response.data.id));
        }
      },
      onError: (error: any) => {
        toast.error(error.message || "Something went wrong");
      },
    });
  };
  
  // Handle department creation
  const handleCreateDepartment = (data: TCreateDepartment) => {
    createDepartment(data, {
      onSuccess: async (response) => {
        toast.success("Department created successfully.");
        setIsCreateDepartmentOpen(false);
        departmentForm.reset();
        
        // Refetch departments to update the dropdown
        await queryClient.refetchQueries({ queryKey: ["departments"] });
        
        // Select the newly created department from the response
        if (response?.data?.id) {
          form.setValue("department_id", Number(response.data.id));
        }
      },
      onError: (error: any) => {
        toast.error(error.message || "Something went wrong");
      },
    });
  };

  return (
    <>
      {isSuccess && (
        <Alert className="mb-4" variant="success">
          <CheckCircle2Icon />
          <AlertTitle>Success! Job created successfully</AlertTitle>
          <AlertDescription>
            Job created successfully. You can now view it in the jobs list.
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
                    <Label htmlFor={field.name}>
                      Job Title <span className="text-red-500">*</span>
                    </Label>
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
                    <Label htmlFor={field.name}>
                      Description <span className="text-red-500">*</span>
                    </Label>
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

              <div>
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="relative max-w-xl">
                      <Label htmlFor={field.name}>
                        Location <span className="text-red-500">*</span>
                      </Label>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="department_id"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <Label htmlFor={field.name}>
                        Department <span className="text-red-500">*</span>
                      </Label>
                      <FormControl>
                        <Select
                          {...field}
                          disabled={isPending}
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          value={field.value?.toString() || ""}
                        >
                          <SelectTrigger
                            className={cn(
                              "w-full",
                              form.formState.errors.department_id &&
                                "border-red-400 focus:ring-red-400"
                            )}
                          >
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((item) => (
                              <SelectItem
                                key={item.id}
                                value={item.id?.toString() || ""}
                              >
                                {item.name}
                              </SelectItem>
                            ))}
                            <div
                              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-primary font-medium"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsCreateDepartmentOpen(true);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <PlusIcon className="h-4 w-4" />
                                Create New Department
                              </div>
                            </div>
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
                      <Label htmlFor={field.name}>
                        Category <span className="text-red-500">*</span>
                      </Label>
                      <FormControl>
                        <Select
                          {...field}
                          disabled={isPending}
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          value={field.value?.toString() || ""}
                        >
                          <SelectTrigger
                            className={cn(
                              "w-full",
                              form.formState.errors.category_id &&
                                "border-red-400 focus:ring-red-400"
                            )}
                          >
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((item) => (
                              <SelectItem
                                key={item.id}
                                value={item.id?.toString() || ""}
                              >
                                {item.name}
                              </SelectItem>
                            ))}
                            <div
                              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-primary font-medium"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsCreateCategoryOpen(true);
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <PlusIcon className="h-4 w-4" />
                                Create New Category
                              </div>
                            </div>
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
                      <Label htmlFor={field.name}>
                        Experience Level <span className="text-red-500">*</span>
                      </Label>
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
                      <Label htmlFor={field.name}>
                        Job Type <span className="text-red-500">*</span>
                      </Label>
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
                              <SelectItem
                                key={jobType.value}
                                value={jobType.value}
                              >
                                {jobType.label}
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
                  name="is_remote"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <Label htmlFor={field.name}>
                        Work Mode <span className="text-red-500">*</span>
                      </Label>
                      <FormControl>
                        <Select
                          {...field}
                          disabled={isPending}
                          value={field.value?.toString()}
                          onValueChange={(value) =>
                            field.onChange(value === "true")
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {workModes.map((workMode) => (
                              <SelectItem
                                key={workMode.value}
                                value={
                                  workMode.value === "remote" ? "true" : "false"
                                }
                              >
                                {workMode.label}
                              </SelectItem>
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
                              const newResponsibilities = field.value.filter(
                                (_, i) => i !== index
                              );
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
                        <PlusIcon className="size-4" /> Add Responsibility
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
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
                        <PlusIcon className="size-4" /> Add Skill
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              <FormField
                control={form.control}
                name="required_skills"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor={field.name}>Required Skills</Label>
                    <div className="space-y-2">
                      {field.value.map((skill, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={skill}
                            onChange={(e) => {
                              const newRequiredSkills = [...field.value];
                              newRequiredSkills[index] = e.target.value;
                              field.onChange(newRequiredSkills);
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
                              const newRequiredSkills = field.value.filter(
                                (_, i) => i !== index
                              );
                              field.onChange(newRequiredSkills);
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
                        <PlusIcon className="size-4" /> Add Skill
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
              <CardTitle className="text-primary/80">
                Compensation and Benefits
              </CardTitle>
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
                              const newBenefits = field.value.filter(
                                (_, i) => i !== index
                              );
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
                        <PlusIcon className="size-4" /> Add Benefit
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
                          id={field.name}
                          name={field.name}
                          disabled={isPending}
                          placeholder="Enter min salary"
                          type="number"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === "" ? undefined : Number(val));
                          }}
                          onBlur={field.onBlur}
                          ref={field.ref}
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
                          id={field.name}
                          name={field.name}
                          disabled={isPending}
                          placeholder="Enter max salary"
                          type="number"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === "" ? undefined : Number(val));
                          }}
                          onBlur={field.onBlur}
                          ref={field.ref}
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
                        <Combobox
                          options={salaryCurrencies}
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                          placeholder="Select or enter currency code"
                          searchPlaceholder="Search currency..."
                          emptyText="No currency found. Type to add custom code."
                          disabled={isPending}
                          allowCustom={true}
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
                        id={field.name}
                        name={field.name}
                        disabled={isPending}
                        placeholder="Enter max no of applications"
                        type="number"
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === "" ? undefined : Number(val));
                        }}
                        onBlur={field.onBlur}
                        ref={field.ref}
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
              <Link href="/admin/jobs">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Job"}
            </Button>
          </div>
        </form>
      </Form>
      
      {/* Create Category Dialog */}
      <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new category for job classification.
            </DialogDescription>
          </DialogHeader>
          <Form {...categoryForm}>
            <form
              onSubmit={categoryForm.handleSubmit(handleCreateCategory)}
              className="space-y-4"
            >
              <FormField
                control={categoryForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor={field.name}>
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <FormControl>
                      <Input
                        {...field}
                        id={field.name}
                        placeholder="e.g: Frontend Development"
                        disabled={categoryForm.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={categoryForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor={field.name}>Description</Label>
                    <FormControl>
                      <Textarea
                        {...field}
                        id={field.name}
                        placeholder="Enter description"
                        disabled={categoryForm.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateCategoryOpen(false);
                    categoryForm.reset();
                  }}
                  className="w-28"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={categoryForm.formState.isSubmitting}
                  className="w-28"
                >
                  {categoryForm.formState.isSubmitting ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Create Department Dialog */}
      <Dialog open={isCreateDepartmentOpen} onOpenChange={setIsCreateDepartmentOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Department</DialogTitle>
            <DialogDescription>
              Add a new department for job organization.
            </DialogDescription>
          </DialogHeader>
          <Form {...departmentForm}>
            <form
              onSubmit={departmentForm.handleSubmit(handleCreateDepartment)}
              className="space-y-4"
            >
              <FormField
                control={departmentForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor={field.name}>
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <FormControl>
                      <Input
                        {...field}
                        id={field.name}
                        placeholder="e.g: Engineering"
                        disabled={departmentForm.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={departmentForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor={field.name}>Description</Label>
                    <FormControl>
                      <Textarea
                        {...field}
                        id={field.name}
                        placeholder="Enter description"
                        disabled={departmentForm.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDepartmentOpen(false);
                    departmentForm.reset();
                  }}
                  className="w-28"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={departmentForm.formState.isSubmitting}
                  className="w-28"
                >
                  {departmentForm.formState.isSubmitting ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
