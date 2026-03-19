"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useGetApplicationsQuery } from "~/apis/applications/queries";
import { useGetCandidatesQuery } from "~/apis/candidates/queries";
import { useCreateInterviewMutation } from "~/apis/interviews/queries";
import {
  CreateInterviewSchema,
  TCreateInterview,
} from "~/apis/interviews/schemas";
import { useGetJobsQuery } from "~/apis/jobs/queries";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
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

interface ScheduleInterviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefilledData?: {
    candidateId?: string;
    jobId?: string;
    applicationId?: string;
    candidateName?: string;
    jobTitle?: string;
  };
}

export function ScheduleInterviewModal({
  open,
  onOpenChange,
  prefilledData,
}: ScheduleInterviewModalProps) {
  const { data: session } = useSession();

  const form = useForm<TCreateInterview>({
    resolver: zodResolver(CreateInterviewSchema),
    defaultValues: {
      candidate_id: "",
      job_id: "",
      hr_id: "",
      application_id: "",
      interview_date: "",
      duration: 45,
      meeting_link: "",
      notes: "",
      hr_remarks: "",
      interview_type: "hr",
      interview_mode: "online",
      location: "",
    },
  });

  const interviewMode = form.watch("interview_mode");

  const { data: candidatesData } = useGetCandidatesQuery();
  const { data: jobsData } = useGetJobsQuery();
  const { data: applicationsData } = useGetApplicationsQuery({});
  const createMutation = useCreateInterviewMutation();

  const candidates = candidatesData?.data?.items || [];
  const jobs = jobsData?.data || [];
  const selectedCandidateId = form.watch("candidate_id");
  const lastProcessedCandidateRef = useRef<string>("");
  const hasExplicitPrefill = Boolean(prefilledData?.jobId || prefilledData?.applicationId);

  const latestApplicationByCandidateId = useMemo(() => {
    const applicationsList = Array.isArray((applicationsData as any)?.data)
      ? (applicationsData as any).data
      : (applicationsData as any)?.data?.items || [];

    const byCandidate = new Map<string, any>();

    for (const application of applicationsList) {
      const candidateId = application?.candidate_id;
      if (!candidateId) continue;

      const existing = byCandidate.get(candidateId);
      if (!existing) {
        byCandidate.set(candidateId, application);
        continue;
      }

      const existingTime = new Date(existing?.applied_at || 0).getTime();
      const incomingTime = new Date(application?.applied_at || 0).getTime();
      if (incomingTime >= existingTime) {
        byCandidate.set(candidateId, application);
      }
    }

    return byCandidate;
  }, [applicationsData]);

  useEffect(() => {
    if (open && prefilledData) {
      if (prefilledData.candidateId) {
        form.setValue("candidate_id", prefilledData.candidateId);
      }
      if (prefilledData.jobId) {
        form.setValue("job_id", prefilledData.jobId);
      }
      if (prefilledData.applicationId !== undefined) {
        form.setValue("application_id", prefilledData.applicationId);
      }
      if (session?.user?.id) {
        form.setValue("hr_id", session.user.id);
      }
      lastProcessedCandidateRef.current = prefilledData.candidateId || "";
    } else if (open && session?.user?.id) {
      form.setValue("hr_id", session.user.id);
      lastProcessedCandidateRef.current = "";
    }
  }, [open, prefilledData, session, form]);

  useEffect(() => {
    if (!open || !selectedCandidateId || hasExplicitPrefill) return;

    const matchedApplication = latestApplicationByCandidateId.get(selectedCandidateId);
    const previousCandidateId = lastProcessedCandidateRef.current;
    const candidateChanged = selectedCandidateId !== previousCandidateId;
    const shouldHydrateEmptyFields =
      !form.getValues("application_id") && !form.getValues("job_id");

    if (!candidateChanged && !shouldHydrateEmptyFields) {
      return;
    }

    if (matchedApplication?.id && matchedApplication?.job_id) {
      form.setValue("application_id", matchedApplication.id, { shouldDirty: false });
      form.setValue("job_id", matchedApplication.job_id, { shouldDirty: false });
    } else if (candidateChanged) {
      form.setValue("application_id", "", { shouldDirty: false });
      form.setValue("job_id", "", { shouldDirty: false });
    }

    lastProcessedCandidateRef.current = selectedCandidateId;
  }, [open, selectedCandidateId, hasExplicitPrefill, latestApplicationByCandidateId, form]);

  const onSubmit = async (values: TCreateInterview) => {
    try {
      const applicationId = prefilledData?.applicationId || values.application_id;
      const candidateId = prefilledData?.candidateId || values.candidate_id;
      const jobId = prefilledData?.jobId || values.job_id;
      const hrId = values.hr_id || session?.user?.id;
      
      if (!applicationId || applicationId.trim() === "") {
        toast.error("Application ID is required. Please ensure you're scheduling from an application page.");
        return;
      }
      if (!candidateId || candidateId.trim() === "") {
        toast.error("Candidate is required.");
        return;
      }
      if (!jobId || jobId.trim() === "") {
        toast.error("Job is required.");
        return;
      }
      if (!hrId || hrId.trim() === "") {
        toast.error("HR user is required.");
        return;
      }

      // Validate interview_date
      if (!values.interview_date) {
        toast.error("Interview date is required");
        return;
      }

      // Prepare interview data according to backend schema.
      // interview_type is intentionally omitted so backend/default flow can handle it.
      const normalizedMeetingLink =
        values.interview_mode === "online"
          ? (values.meeting_link || "").trim()
          : "";

      const interviewData: any = {
        candidate_id: candidateId,
        job_id: jobId,
        hr_id: hrId,
        application_id: applicationId,
        interview_date: new Date(values.interview_date).toISOString(),
        duration: Number(values.duration) || 45,
        interview_type: values.interview_type || "hr",
        meeting_link: normalizedMeetingLink,
        notes: values.notes || null,
        hr_remarks: values.hr_remarks || null,
        interview_mode: values.interview_mode || "online",
        location: values.location || null,
      };

      // Remove null/empty values if they're truly optional
      if (!interviewData.hr_remarks) {
        delete interviewData.hr_remarks;
      }
      if (!interviewData.notes) {
        delete interviewData.notes;
      }
      if (!interviewData.location) {
        delete interviewData.location;
      }

      console.log("Submitting interview data:", interviewData);

      const createdInterview = await createMutation.mutateAsync(interviewData);

      toast.success("Interview scheduled successfully");
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error scheduling interview:", error);
      const errorMessage = 
        error?.response?.data?.message || 
        error?.response?.data?.detail ||
        error?.message || 
        "Failed to schedule interview. Please check all fields and try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
          <DialogDescription>
            Fill in the details to schedule a new interview
            {prefilledData?.candidateName && (
              <span className="block mt-1 font-medium text-blue-600">
                For: {prefilledData.candidateName} - {prefilledData.jobTitle}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {prefilledData?.applicationId && (
              <FormField
                control={form.control}
                name="application_id"
                render={({ field }) => (
                  <input type="hidden" {...field} value={prefilledData.applicationId} />
                )}
              />
            )}
         
            <FormField
              control={form.control}
              name="candidate_id"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor={field.name}>
                    Candidate <span className="text-red-500">*</span>
                  </Label>
                  {prefilledData?.candidateId &&
                  prefilledData?.candidateName ? (
                    <FormControl>
                      <Input
                        value={prefilledData.candidateName}
                        disabled
                        className="bg-gray-50"
                      />
                    </FormControl>
                  ) : (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select candidate" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {candidates.map((candidate) => (
                          <SelectItem key={candidate.id} value={candidate.id}>
                            {candidate.first_name} {candidate.last_name} -{" "}
                            {candidate.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="job_id"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor={field.name}>
                    Job Position <span className="text-red-500">*</span>
                  </Label>
                  {prefilledData?.jobId && prefilledData?.jobTitle ? (
                    <FormControl>
                      <Input
                        value={prefilledData.jobTitle}
                        disabled
                        className="bg-gray-50"
                      />
                    </FormControl>
                  ) : (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {jobs.map((job) => (
                          <SelectItem key={job.id} value={job.id}>
                            {job.title}{" "}
                            {job.department && `- ${job.department}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />


            <FormField
              control={form.control}
              name="interview_date"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor={field.name}>
                    Interview Date & Time{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <FormControl>
                    <Input
                      {...field}
                      type="datetime-local"
                      placeholder="Select date and time"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4">
           
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor={field.name}>
                      Duration (minutes) <span className="text-red-500">*</span>
                    </Label>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={15}
                        step={15}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>

            <FormField
              control={form.control}
              name="interview_mode"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor={field.name}>Interview Mode</Label>
                  <div className="flex items-center gap-4 pt-1">
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                        field.value === "online"
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                      onClick={() => field.onChange("online")}
                    >
                      Online
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
                        field.value === "physical"
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                      onClick={() => field.onChange("physical")}
                    >
                      Physical
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {interviewMode === "physical" && (
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor={field.name}>
                      Location <span className="text-red-500">*</span>
                    </Label>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. 123 Main St, Suite 400, New York, NY"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {interviewMode === "online" && (
              <FormField
                control={form.control}
                name="meeting_link"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor={field.name}>
                      Meeting Link <span className="text-red-500">*</span>
                    </Label>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="https://meet.google.com/abc-defg-hij"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}


            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor={field.name}>Notes (Optional)</Label>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add any additional notes or instructions"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          
            <FormField
              control={form.control}
              name="hr_remarks"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor={field.name}>HR Remarks (Optional)</Label>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Internal HR remarks about the candidate"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

         
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-black text-white hover:bg-gray-800"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending
                  ? "Scheduling..."
                  : "Schedule Interview"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
