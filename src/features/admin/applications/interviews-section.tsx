"use client";

import { Video } from "lucide-react";
import { useGetInterviewsByApplicationIdQuery } from "~/apis/interviews/queries";
import { TInterview } from "~/apis/interviews/schemas";
import { InterviewCard } from "./interview-card";

interface InterviewsSectionProps {
  applicationId: string;
  application: any;
}

export const InterviewsSection = ({ applicationId, application }: InterviewsSectionProps) => {
  const { data: interviews, isLoading } = useGetInterviewsByApplicationIdQuery(applicationId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-gray-900" />
          <h2 className="text-xl font-bold text-gray-900">Interviews</h2>
        </div>
        <div className="text-center text-sm text-gray-500 py-4">Loading interviews...</div>
      </div>
    );
  }

  if (!interviews || interviews.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-gray-900" />
          <h2 className="text-xl font-bold text-gray-900">Interviews</h2>
        </div>
        <div className="text-center text-sm text-gray-500 py-4">No interviews scheduled</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2">
        <Video className="h-5 w-5 sm:h-6 sm:w-6 text-gray-900" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Interviews</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
        {interviews.map((interview: TInterview) => (
          <InterviewCard key={interview.id} interview={interview} application={application} />
        ))}
      </div>
    </div>
  );
};

