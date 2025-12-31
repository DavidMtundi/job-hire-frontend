"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ClockIcon, MapPinIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { useCreateApplicationMutation } from "~/apis/applications/queries"
import { CreateApplicationSchema, TCreateApplication } from "~/apis/applications/schemas"
import { useGetAuthUserProfileQuery } from "~/apis/auth/queries"
import { TJob } from "~/apis/jobs/schemas"
import { useUploadResumeMutation, useCompareResumeMutation } from "~/apis/resume/queries"
import { useUpdateApplicationMutation } from "~/apis/applications/queries"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { formatDate } from "~/lib/utils"

interface ApplyJobModalProps {
  job: TJob;
  triggerLabel?: string
  trigger?: React.ReactNode;
}

export const ApplyJobModal = ({ job, triggerLabel = "Apply", trigger }: ApplyJobModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false)
  const [selectedResumeFile, setSelectedResumeFile] = useState<File | null>(null)
  const router = useRouter()
  const { data: session } = useSession()

  const { data: userProfile } = useGetAuthUserProfileQuery();
  const userId = userProfile?.data?.id;
  const hasResume = !!userProfile?.data?.candidate_profile?.resume_url;

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !session?.isAuthenticated) {
      toast.error("Please login to apply for this job");
      router.push(`/login?redirect=/jobs/${job.id}`);
      return;
    }
    setOpen(newOpen);
  };

  const form = useForm<TCreateApplication>({
    resolver: zodResolver(CreateApplicationSchema),
    defaultValues: {
      job_id: job.id,
      cover_letter: "",
    },
  });

  useEffect(() => {
    form.reset();
    setSelectedResumeFile(null);
  }, [open, form]);

  const { mutate: createApplication, isPending } = useCreateApplicationMutation();
  const { mutate: uploadResume, isPending: isUploadingResume } = useUploadResumeMutation();


  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedResumeFile(e.target.files[0]);
    }
  };

  const onSubmit = (data: TCreateApplication) => {
    if (!userId) {
      toast.error("User information not available");
      return;
    }

    setLoading(true);

    if (selectedResumeFile) {
      uploadResume(
        { userId, file: selectedResumeFile },
        {
          onSuccess: () => {
            createApplication(data, {
              onSuccess: () => {
                setTimeout(() => {
                  setOpen(false);
                  setLoading(false);
                  setSelectedResumeFile(null);
                  toast.success("Application submitted successfully");
                }, 500);
              },
              onError: (error: any) => {
                console.error(error);
                const message =
                  error?.response?.data?.detail ||
                  error?.message ||
                  "Application submission failed";
                toast.error(message);
                setLoading(false);
              },
            });
          },
          onError: (error: any) => {
            console.error(error);
            const message =
              error?.response?.data?.detail ||
              error?.message ||
              "Resume upload failed";
            toast.error(message);
            setLoading(false);
          },
        }
      );
    } else {
      createApplication(data, {
        onSuccess: () => {
          setTimeout(() => {
            setOpen(false);
            setLoading(false);
            toast.success("Application submitted successfully");
          }, 500);
        },
        onError: (error: any) => {
          console.error(error);
          const message =
            error?.response?.data?.detail ||
            error?.message ||
            "Application submission failed";
          toast.error(message);
          setLoading(false);
        },
      });
    }
  };
  


  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">{triggerLabel || "Apply"}</Button>}
      </DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Apply to Job</DialogTitle>
          <DialogDescription>
            Apply to the job here. Click submit to submit your application.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="job_id"
              render={({ field }) => (
                <FormItem>
                  <Label>Job</Label>
                  <Card className="p-0 bg-blue-50 rounded-lg">
                    <CardContent className="p-2">
                      <h6 className="text-lg font-medium">
                        {job.title}
                      </h6>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="size-3.5" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="size-3.5" />
                          <span>{formatDate(job.created_at)}</span>
                          <span className="mx-2">•</span>
                          <span>{job.job_type?.toUpperCase()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cover_letter"
              render={({ field }) => (
                <FormItem>
                  <Label>Cover Letter</Label>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter your cover letter"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
           <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending || loading || isUploadingResume}>
                {isUploadingResume ? 'Uploading Resume...' : isPending ? 'Submitting...' : 'Submit'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
