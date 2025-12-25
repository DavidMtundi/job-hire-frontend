"use client";

import { ArrowLeft, Calendar } from "lucide-react";
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/admin/applications")}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Button>
            <Button
              onClick={() => {
                if (!applicationId && !application?.id) {
                  toast.error("Application ID is missing. Please refresh the page.");
                  return;
                }
                setIsScheduleModalOpen(true);
              }}
              size="sm"
              className="bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 hover:from-blue-800 hover:via-blue-600 hover:to-blue-400 text-white text-sm px-3 py-1.5"
            >
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Schedule Interview
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <CandidateDetailsCard application={application} />
            <CandidateSummaryCard 
              summary={application?.metadata?.ai_summary} 
              candidateName={application?.first_name && application?.last_name 
                ? `${application.first_name} ${application.last_name}` 
                : undefined}
            />
            <ResumeMatchingCard application={application} />
            <AIInterviewAssessmentCard application={application} />
            <JobDetailsCard application={application} />
          </div>
          <div className="lg:col-span-2">
            <TimelineCard applicationId={applicationId} application={application} />
          </div>
        </div>

        <div className="mt-6">
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

