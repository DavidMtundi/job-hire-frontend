"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useUpdateInterviewMutation } from "~/apis/interviews/queries";
import { useUpdateApplicationStatusMutation } from "~/apis/applications/queries";
import {
  TInterview,
  TUpdateInterview,
  UpdateInterviewSchema,
} from "~/apis/interviews/schemas";
import { DatePicker } from "~/components/date-picker";
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

interface EditInterviewModalProps {
  interview: TInterview;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditInterviewModal({
  interview,
  open,
  onOpenChange,
}: EditInterviewModalProps) {
  const { data: session } = useSession();
  const form = useForm<TUpdateInterview>({
    resolver: zodResolver(UpdateInterviewSchema),
    defaultValues: {
      interview_date: interview.interview_date,
      duration: interview.duration,
      meeting_link: interview.meeting_link,
      notes: interview.notes || "",
      hr_remarks: interview.hr_remarks || "",
      interview_type: interview.interview_type,
    },
  });

  const updateMutation = useUpdateInterviewMutation();
  const updateApplicationStatusMutation = useUpdateApplicationStatusMutation();

  useEffect(() => {
    form.reset({
      interview_date: interview.interview_date,
      duration: interview.duration,
      meeting_link: interview.meeting_link,
      notes: interview.notes || "",
      hr_remarks: interview.hr_remarks || "",
      interview_type: interview.interview_type,
    });
  }, [interview, form]);

  const onSubmit = async (values: TUpdateInterview) => {
    try {
     
      await updateMutation.mutateAsync({
        id: interview.id,
        ...values,
      });

      if (interview.application_id && values.hr_remarks !== interview.hr_remarks) {
        await updateApplicationStatusMutation.mutateAsync({
          applicationId: interview.application_id,
          notes: values.hr_remarks,
          recruiter: session?.user?.id ? Number(session.user.id) : undefined,
        });
      }

      toast.success("Interview updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update interview");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Interview</DialogTitle>
          <DialogDescription>
            Update the interview details
            {interview.candidate && (
              <>
                {" "}
                for {interview.candidate.first_name}{" "}
                {interview.candidate.last_name}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          
            <FormField
              control={form.control}
              name="interview_date"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor={field.name}>
                    Interview Date <span className="text-red-500">*</span>
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
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined
                          )
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
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
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
                      placeholder="e.g., https://zoom.us/j/123456789"
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
                      rows={3}
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
                      placeholder="Add any HR-specific remarks"
                      rows={3}
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
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Updating..." : "Update Interview"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
