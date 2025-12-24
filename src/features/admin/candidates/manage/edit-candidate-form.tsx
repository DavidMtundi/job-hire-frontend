'use client'

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, CheckCircle2Icon, XCircleIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useUpdateCandidateMutation } from "~/apis/candidates/queries";
import { TCandidate, TUpdateCandidate, UpdateCandidateSchema } from "~/apis/candidates/schema";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";

interface EditCandidateFormProps {
  candidateData: TCandidate;
}

export const EditCandidateForm = ({ candidateData }: EditCandidateFormProps) => {
  const router = useRouter();

  const form = useForm<TUpdateCandidate>({
    resolver: zodResolver(UpdateCandidateSchema),
    defaultValues: {
      id: candidateData?.id || "",
      first_name: candidateData?.first_name || "",
      last_name: candidateData?.last_name || "",
      email: candidateData?.email || "",
      phone: candidateData?.phone || "",
      address: candidateData?.address || "",
      current_position: candidateData?.current_position || "",
      years_experience: candidateData?.years_experience || 0,
      stack: candidateData?.stack || [],
      skills: candidateData?.skills || [],
      linkedin_url: candidateData?.linkedin_url || "",
      summary: candidateData?.summary || "",
      expected_salary: candidateData?.expected_salary || "",
      last_education: candidateData?.last_education || "",
      joining_availability: "1 month",
      resume_url: candidateData?.resume_url || "",
      // metadata: {},
    },
  })


  const { mutate: updateCandidate, isPending, isSuccess } = useUpdateCandidateMutation();

  const onSubmit = async (values: TUpdateCandidate) => {
    // return console.log("values", values);
    updateCandidate(values, {
      onSuccess: async () => {
        toast.success("Candidate updated successfully.");
        form.reset();
        // router.push("/admin/candidates");
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
          <AlertTitle>Success! Candidate updated successfully</AlertTitle>
          <AlertDescription>
            Candidate updated successfully. You can now view it in the candidates list.
          </AlertDescription>
        </Alert>
      )}
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
                  name="id"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <Label htmlFor={field.name}>ID <span className="text-red-500">*</span></Label>
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
                          placeholder=""
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
                          placeholder=""
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
                          placeholder=""
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
                          placeholder=""
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
                            id={field.name}
                            disabled={isPending}
                            placeholder=""
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
                    name="current_position"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Label htmlFor={field.name}>Current position <span className="text-red-500">*</span></Label>
                        <FormControl>
                          <Input
                            {...field}
                            id={field.name}
                            disabled={isPending}
                            placeholder="e.g. Software Engineer at MustCompany"
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
                          placeholder=""
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
                          placeholder=""
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
                          placeholder=""
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
                          placeholder=""
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
            <Button asChild variant="outline" className="w-32">
              <Link href="/admin/candidates">
                <ArrowLeftIcon /> Back
              </Link>
            </Button>
            <Button type="submit" disabled={isPending} className="w-32">
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

