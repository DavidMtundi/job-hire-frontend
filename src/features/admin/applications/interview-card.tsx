"use client";

import { Calendar, Clock, MapPin, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { TInterview } from "~/apis/interviews/schemas";

interface InterviewCardProps {
  interview: TInterview;
  application: any;
}

export const InterviewCard = ({ interview, application }: InterviewCardProps) => {
  const isCompleted = interview.status === "completed";
  const isScheduled = interview.status === "scheduled";

  const jobTitle = application?.title || interview.job?.title || application?.current_position || "N/A";

  const getInterviewTypeTitle = () => {
    if (!interview.interview_type) return "Technical Interview";
    const type = interview.interview_type.toLowerCase();
    if (type === "hr") return "HR Interview";
    if (type === "technical") return "Technical Interview";
    return `${interview.interview_type.charAt(0).toUpperCase() + interview.interview_type.slice(1).toLowerCase()} Interview`;
  };

  const formatFullDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "EEEE, MMMM d, yyyy");
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "h:mm a");
    } catch {
      return dateString;
    }
  };

  const formatDuration = (minutes: number) => {
    return `${minutes} minutes`;
  };

  const handleJoinInterview = () => {
    if (interview.meeting_link) {
      window.open(interview.meeting_link, "_blank");
    }
  };

  return (
    <div className="p-5 rounded-lg border bg-white border-blue-200 relative w-full min-w-0">
      <div
        className={`absolute top-3 right-3 px-2 py-1 rounded-md ${
          isCompleted
            ? "bg-black text-white"
            : isScheduled
            ? "bg-black text-white"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        <span className="text-xs font-medium capitalize">{interview.status || "Pending"}</span>
      </div>

      <div className="space-y-3 pr-14">
        <h3 className="font-bold text-gray-900 text-lg whitespace-nowrap">
          {getInterviewTypeTitle()}
        </h3>

        <p className="text-sm text-gray-900">
          {jobTitle}
        </p>

        <div className="flex items-center gap-2 text-gray-900">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{formatFullDate(interview.interview_date)}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-900">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-sm">
            {formatTime(interview.interview_date)} ({formatDuration(interview.duration)})
          </span>
        </div>

        {interview.meeting_link && (
          <div className="flex items-center gap-2 text-gray-900">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-sm">
              Meeting Link:{" "}
              <a
                href={interview.meeting_link}
                onClick={(e) => {
                  e.preventDefault();
                  handleJoinInterview();
                }}
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {interview.meeting_link}
              </a>
            </span>
          </div>
        )}

        {interview.hr_remarks && (
          <div className="flex items-start gap-2 text-gray-900 pt-1">
            <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-sm font-medium">HR Remarks: </span>
              <span className="text-sm text-gray-700">{interview.hr_remarks}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

