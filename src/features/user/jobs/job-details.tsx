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
    <div className="w-full h-full p-3 sm:p-4 space-y-4 sm:space-y-6">
      <div>
        <Button variant="secondary" onClick={() => router.back()} className="w-full sm:w-auto">
          <ArrowLeft className="size-4 mr-2" />
          <span className="hidden sm:inline">Back to Jobs</span>
          <span className="sm:hidden">Back</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="animate-spin size-8" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Job Info */}
            <Card className="bg-white shadow-lg transition-shadow w-full">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl mb-3 break-words">{job?.title}</CardTitle>

                <div className="flex items-center text-gray-600 mb-3">
                  <Building2 className="size-4 sm:size-5 mr-2" />
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm sm:text-base text-gray-600 mb-4">
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
            <Card className="bg-white shadow-lg transition-shadow w-full">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Job Description</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <p className="text-sm sm:text-base text-gray-600 whitespace-pre-line break-words">
                  {job?.description}
                </p>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card className="bg-white shadow-lg transition-shadow w-full">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Requirements</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <ul className="space-y-2">
                  {job?.responsibilities?.map((req, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="size-4 sm:size-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base break-words">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Benefits */}
            {job?.benefits && job?.benefits?.length > 0 && (
              <Card className="bg-white shadow-lg transition-shadow w-full">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Benefits & Perks</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {job.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start">
                        <CheckCircle className="size-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm sm:text-base break-words">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-4 sm:space-y-6">
            {/* APPLY/UPLOAD/DELETE CARD */}
            <Card className="bg-white shadow-lg transition-shadow w-full">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Ready to Apply?</CardTitle>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-4">
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
                  <p className="text-xs sm:text-sm font-medium text-emerald-600 text-center">
                    You have already applied for this position
                  </p>
                ) : hasWithdrawnApplication ? (
                  <p className="text-xs sm:text-sm font-medium text-orange-600 text-center">
                    Your previous application was withdrawn. You can apply
                    again.
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm text-gray-500 text-center">
                    Click to start your application process
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Job Stats */}
            <Card className="bg-white shadow-lg transition-shadow w-full">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Job Details</CardTitle>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-3">
                <div className="flex justify-between items-center text-sm sm:text-base">
                  <span>Job Type:</span>
                  <Badge variant="outline" className="text-xs sm:text-sm">{job?.job_type}</Badge>
                </div>

                {job?.salary_min &&
                  job?.salary_max &&
                  job?.salary_min > 0 &&
                  job?.salary_max > 0 && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center text-sm sm:text-base">
                        <span>Salary Range:</span>
                        <span className="font-medium text-green-600 break-words">
                          ${job.salary_min} - ${job.salary_max}
                        </span>
                      </div>
                    </>
                  )}

                <Separator />
                <div className="flex justify-between items-center text-sm sm:text-base">
                  <span className="text-gray-600">Posted:</span>
                  <span className="font-medium break-words">
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
