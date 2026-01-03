"use client";

import { ArrowLeft, Calendar, Mail } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useGetApplicationDetailQuery } from "~/apis/applications/queries";
import { ScheduleInterviewModal } from "~/features/admin/interviews/schedule-interview-modal";
import { InterviewsSection } from "./interviews-section";
import { TimelineCard } from "./timeline-card";
import { CandidateDetailsCard } from "./candidate-details-card";
import { ResumeMatchingCard } from "./resume-matching-card";
import { AIInterviewAssessmentCard } from "./ai-interview-assessment-card";
import { JobDetailsCard } from "./job-details-card";
import { CandidateSummaryCard } from "./candidate-summary-card";
import { EmailDraftModal } from "./email-draft-modal";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Loader } from "~/components/loader";
import { useState } from "react";
import { toast } from "sonner";

export default function ApplicationDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params?.id as string;
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const {
    data: applicationData,
    isLoading,
    error,
  } = useGetApplicationDetailQuery(applicationId);

  const application = applicationData?.data;

  if (isLoading) {
    return <Loader mode="icon" />;
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Application Not Found
              </h2>
              <p className="text-gray-600 mb-4">
                {error instanceof Error ? error.message : "The application you're looking for doesn't exist."}
              </p>
              <Button onClick={() => router.push("/admin/applications")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Applications
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-7xl xl:max-w-[90rem] 2xl:max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8 lg:py-10">
        {/* Header Section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/admin/applications")}
              className="text-gray-600 hover:text-gray-900 w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Button>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <EmailDraftModal
                applicationId={applicationId || application?.id || ""}
                candidateName={
                  application?.first_name && application?.last_name
                    ? `${application.first_name} ${application.last_name}`
                    : undefined
                }
                jobTitle={application?.title}
                trigger={
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm px-3 py-1.5 flex-1 sm:flex-initial"
                  >
                    <Mail className="h-3.5 w-3.5 mr-1.5" />
                    Send Email
                  </Button>
                }
              />
              <Button
                onClick={() => {
                  if (!applicationId && !application?.id) {
                    toast.error("Application ID is missing. Please refresh the page.");
                    return;
                  }
                  setIsScheduleModalOpen(true);
                }}
                size="sm"
                className="bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 hover:from-blue-800 hover:via-blue-600 hover:to-blue-400 text-white text-sm px-3 py-1.5 flex-1 sm:flex-initial"
              >
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                Schedule Interview
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Grid - Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-12 2xl:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-3 xl:col-span-7 2xl:col-span-8 space-y-4 sm:space-y-6">
            <div className="max-w-none xl:max-w-4xl 2xl:max-w-5xl">
              <CandidateDetailsCard application={application} />
            </div>
            <div className="max-w-none xl:max-w-4xl 2xl:max-w-5xl">
              <CandidateSummaryCard 
                summary={application?.metadata?.ai_summary} 
                candidateName={application?.first_name && application?.last_name 
                  ? `${application.first_name} ${application.last_name}` 
                  : undefined}
              />
            </div>
            <div className="max-w-none xl:max-w-4xl 2xl:max-w-5xl">
              <ResumeMatchingCard application={application} />
            </div>
            <div className="max-w-none xl:max-w-4xl 2xl:max-w-5xl">
              <AIInterviewAssessmentCard application={application} />
            </div>
            <div className="max-w-none xl:max-w-4xl 2xl:max-w-5xl">
              <JobDetailsCard application={application} />
            </div>
          </div>

          {/* Right Column - Timeline Sidebar */}
          <div className="lg:col-span-2 xl:col-span-5 2xl:col-span-4">
            <div className="sticky top-6">
              <TimelineCard applicationId={applicationId} application={application} />
            </div>
          </div>
        </div>

        {/* Interviews Section - Full Width */}
        <div className="mt-6 lg:mt-8">
          <InterviewsSection applicationId={applicationId} application={application} />
        </div>

        <ScheduleInterviewModal
          open={isScheduleModalOpen}
          onOpenChange={setIsScheduleModalOpen}
          prefilledData={{
            candidateId: application?.candidate_id,
            jobId: application?.job_id,
            applicationId: applicationId || application?.id, 
            candidateName: application?.first_name && application?.last_name
              ? `${application.first_name} ${application.last_name}`
              : application?.first_name || application?.last_name || undefined,
            jobTitle: application?.title || undefined,
          }}
        />
      </div>
    </div>
  );
}

