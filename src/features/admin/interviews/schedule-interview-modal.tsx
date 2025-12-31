"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
      interview_type: "technical",
    },
  });

  const { data: candidatesData } = useGetCandidatesQuery();
  const { data: jobsData } = useGetJobsQuery();
  const createMutation = useCreateInterviewMutation();

  const candidates = candidatesData?.data || [];
  const jobs = jobsData?.data || [];

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
    }
  }, [open, prefilledData, session, form]);

  const onSubmit = async (values: TCreateInterview) => {
    try {
      const applicationId = prefilledData?.applicationId || values.application_id;
      
      if (!applicationId || applicationId.trim() === "") {
        toast.error("Application ID is required. Please ensure you're scheduling from an application page.");
        return;
      }

      // Backend expects lowercase interview_type: "technical" or "hr"
      const interviewType = values.interview_type?.toLowerCase() || "hr";

      // Validate interview_date
      if (!values.interview_date) {
        toast.error("Interview date is required");
        return;
      }

      // Prepare interview data according to backend schema
      // Backend expects: application_id, interview_date (datetime), duration, meeting_link (optional), hr_remarks (optional), interview_type
      const interviewData: any = {
        application_id: applicationId,
        interview_date: new Date(values.interview_date).toISOString(), // Backend will parse ISO string to datetime
        duration: Number(values.duration) || 45, // Default to 45 minutes if not provided
        meeting_link: values.meeting_link || null, // Use null instead of "string" for optional fields
        hr_remarks: values.hr_remarks || null, // Use null instead of "string" for optional fields
        interview_type: interviewType, // Lowercase: "technical" or "hr"
      };

      // Remove null/empty values if they're truly optional
      if (!interviewData.meeting_link) {
        delete interviewData.meeting_link;
      }
      if (!interviewData.hr_remarks) {
        delete interviewData.hr_remarks;
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

            <div className="grid grid-cols-2 gap-4">
           
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

          
              <FormField
                control={form.control}
                name="interview_type"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor={field.name}>
                      Interview Type <span className="text-red-500">*</span>
                    </Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

         
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
