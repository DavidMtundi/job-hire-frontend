"use client";

import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Loader2,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetJobQuery } from "~/apis/jobs/queries";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { formatDate, getJobTypeLabel } from "~/lib/utils";
import { ApplyJobModal } from "./apply-job-modal";
import { useGetApplicationsQuery } from "~/apis/applications/queries";
import { TJob } from "~/apis/jobs/schemas";
import { useSession } from "next-auth/react";
import { useDeleteResumeMutation } from "~/apis/resume/queries";
import { toast } from "sonner";

interface JobDetailsProps {
  jobId: string;
}

export const JobDetails = ({ jobId }: JobDetailsProps) => {
  const router = useRouter();

  const { data: jobData, isLoading } = useGetJobQuery(jobId);
  const { data: applicationsData } = useGetApplicationsQuery();
  const { data: session } = useSession();

  const userId = session?.user?.id;

  const job = jobData?.data;
  // Backend returns data.items (array) or data (array) depending on response structure
  const applicationsList = Array.isArray(applicationsData?.data) 
    ? applicationsData.data 
    : (applicationsData?.data?.items ?? []);
  const applications = Array.isArray(applicationsList) ? applicationsList : [];
  const isApplied = applications.some(
    (item) => item.job_id === jobId && item.status_id !== 17
  );
  const hasWithdrawnApplication = applications.some(
    (item) => item.job_id === jobId && item.status_id === 17
  );

  //DELETE RESUME HOOK
  const { mutate: deleteResume, isPending: isDeleting } =
    useDeleteResumeMutation();

  // DELETE HANDLER
  const handleDelete = () => {
    if (!userId) return;

    deleteResume(
      { userId },
      {
        onSuccess: () => {
          toast.success("Resume deleted successfully");
        },
        onError: () => {
          toast.error("Failed to delete resume");
        },
      }
    );
  };

  return (
    <div className="p-3 space-y-6">
      <div>
        <Button variant="secondary" onClick={() => router.back()}>
          <ArrowLeft className="size-4 mr-2" />
          Back to Jobs
        </Button>
      </div>

      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Info */}
            <Card className="bg-white shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl mb-3">{job?.title}</CardTitle>

                <div className="flex items-center text-gray-600 mb-3">
                  <Building2 className="size-5 mr-2" />
                </div>

                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                  <div className="flex items-center">
                    <MapPin className="size-4 mr-1" />
                    <span>{job?.location}</span>
                  </div>

                  <div className="flex items-center">
                    <Clock className="size-4 mr-1" />
                    <span>{getJobTypeLabel(job?.job_type as string)}</span>
                  </div>

                  {job?.salary_min &&
                    job?.salary_max &&
                    job?.salary_min > 0 &&
                    job?.salary_max > 0 && (
                      <div className="flex items-center">
                        <DollarSign className="size-4 mr-1" />
                        <span className="font-medium text-green-600">
                          ${job.salary_min} - ${job.salary_max}
                        </span>
                      </div>
                    )}
                </div>
              </CardHeader>
            </Card>

            {/* Description */}
            <Card className="bg-white shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 whitespace-pre-line">
                  {job?.description}
                </p>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card className="bg-white shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job?.responsibilities?.map((req, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="size-5 text-green-500 mr-3" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Benefits */}
            {job?.benefits && job?.benefits?.length > 0 && (
              <Card className="bg-white shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Benefits & Perks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {job.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-center">
                        <CheckCircle className="size-4 text-blue-500 mr-2" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">
            {/* APPLY/UPLOAD/DELETE CARD */}
            <Card className="bg-white shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Ready to Apply?</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* APPLY BUTTON */}
                <ApplyJobModal
                  job={job as TJob}
                  trigger={
                    <Button className="w-full" size="lg" disabled={isApplied}>
                      {isApplied ? "Applied" : "Apply for this Position"}
                    </Button>
                  }
                />

                {/* STATUS MESSAGE */}
                {isApplied ? (
                  <p className="text-sm font-medium text-emerald-600 text-center">
                    You have already applied for this position
                  </p>
                ) : hasWithdrawnApplication ? (
                  <p className="text-sm font-medium text-orange-600 text-center">
                    Your previous application was withdrawn. You can apply
                    again.
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 text-center">
                    Click to start your application process
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Job Stats */}
            <Card className="bg-white shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Job Type:</span>
                  <Badge variant="outline">{job?.job_type}</Badge>
                </div>

                {job?.salary_min &&
                  job?.salary_max &&
                  job?.salary_min > 0 &&
                  job?.salary_max > 0 && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <span>Salary Range:</span>
                        <span className="font-medium text-green-600">
                          ${job.salary_min} - ${job.salary_max}
                        </span>
                      </div>
                    </>
                  )}

                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-600">Posted:</span>
                  <span className="font-medium">
                    {formatDate(job?.created_at as string)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
