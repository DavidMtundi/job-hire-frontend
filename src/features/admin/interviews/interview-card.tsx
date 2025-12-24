"use client";

import {
  Calendar,
  Clock,
  Copy,
  Edit,
  Link,
  MapPin,
  Trash2,
  User,
  Video,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useDeleteInterviewMutation,
  useUpdateInterviewMutation,
  useGetInterviewStatusListQuery,
  useCreateInterviewStatusMutation,
} from "~/apis/interviews/queries";
import { useMarkAIInterviewMutation } from "~/apis/ai-interview/queries";
import { TInterview, TInterviewStatus } from "~/apis/interviews/schemas";
import { IStatusListItem } from "~/apis/applications/dto";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { EditInterviewModal } from "./edit-interview-modal";

interface InterviewCardProps {
  interview: TInterview;
}

export function InterviewCard({ interview }: InterviewCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(
    interview.status || "scheduled"
  );
  const deleteMutation = useDeleteInterviewMutation();
  const updateInterviewMutation = useUpdateInterviewMutation();
  const createInterviewStatusMutation = useCreateInterviewStatusMutation();
  const markAIInterviewMutation = useMarkAIInterviewMutation();
  const { data: interviewStatusList, isLoading: isLoadingInterviewStatusList } = useGetInterviewStatusListQuery();

  useEffect(() => {
    setCurrentStatus(interview.status || "scheduled");
  }, [interview.status]);

  const mapApiStatusToInterviewStatus = (apiStatus: string): TInterviewStatus => {
    const statusMap: Record<string, TInterviewStatus> = {
      "application_received": "pending",
      "under_review": "pending",
      "shortlisted": "shortlisted",
      "interview_scheduled": "scheduled",
      "evaluation_pending": "pending",
      "offer_extended": "completed",
      "offer_accepted": "accepted",
      "contract_sent": "accepted",
      "contract_signed": "accepted",
      "onboarding_in_progress": "accepted",
      "hired": "completed",
      "cv_rejected": "rejected",
      "interview_rejected": "rejected",
      "selected": "shortlisted",
      "offer_rejected": "declined",
    };
    
    const normalizedStatus = apiStatus.toLowerCase().replace(/\s+/g, '_');
    return statusMap[normalizedStatus] || "scheduled";
  };

  const mapInterviewStatusToApiStatusId = (interviewStatus: string): number | null => {
    const statusMap: Record<string, number> = {
      "pending": 1,
      "scheduled": 4,
      "accepted": 8, 
      "declined": 16,
      "completed": 12, 
      "expired": 14, 
      "rescheduled": 4, 
      "cancelled": 14, 
      "shortlisted": 3, 
      "rejected": 14, 
    };
    
    return statusMap[interviewStatus] || null;
  };

  const mapInterviewStatusToApiStatus = (interviewStatus: string): string | null => {
    const statusMap: Record<string, string> = {
      "pending": "Application Received",
      "scheduled": "Interview Scheduled",
      "accepted": "Offer Accepted",
      "declined": "Offer Rejected",
      "completed": "Hired",
      "expired": "Interview Rejected",
      "rescheduled": "Interview Scheduled",
      "cancelled": "Interview Rejected",
      "shortlisted": "Shortlisted",
      "rejected": "Interview Rejected",
    };
    
    return statusMap[interviewStatus] || null;
  };

  const getCurrentInterviewStatus = (): string => {
    if (!interviewStatusList || interviewStatusList.length === 0) {
      return currentStatus; 
    }
    
    const found = interviewStatusList.find((item: IStatusListItem) => 
      item.status.toLowerCase() === currentStatus.toLowerCase()
    );
    
    if (found) {
      return found.status;
    }
    
    const mappedStatus = mapInterviewStatusToApiStatus(currentStatus);
    if (mappedStatus) {
      const foundMapped = interviewStatusList.find((item: IStatusListItem) => 
        item.status.toLowerCase() === mappedStatus.toLowerCase()
      );
      if (foundMapped) {
        return foundMapped.status;
      }
    }
    
    return interviewStatusList[0]?.status || currentStatus;
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this interview?")) return;

    try {
      await deleteMutation.mutateAsync(interview.id);
      toast.success("Interview deleted successfully");
    } catch (error) {
      toast.error("Failed to delete interview");
    }
  };

  const handleGenerateAIInterviewLink = async () => {
    try {
      if (!interview.application_id) {
        toast.error("Application ID is required to generate AI interview link");
        return;
      }

      await markAIInterviewMutation.mutateAsync({
        applicationId: interview.application_id,
        interviewId: interview.id,
        isAiInterview: true,
      });

      toast.success("AI interview enabled successfully");
    } catch (error) {
      toast.error("Failed to enable AI interview");
    }
  };

  const handleCopyLink = async () => {
    try {
      const generatedLink = `${window.location.origin}/user/candidate-portal?application_id=${interview.application_id}&interview_id=${interview.id}`;
      await navigator.clipboard.writeText(generatedLink);
      toast.success("Link copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    const previousStatus = currentStatus;

    setCurrentStatus(newStatus as TInterviewStatus);

    try {
      const statusItem = interviewStatusList?.find((item: IStatusListItem) =>
        item.status.toLowerCase() === newStatus.toLowerCase()
      );

      if (!statusItem) {
        toast.error("Invalid status selected");
        setCurrentStatus(previousStatus);
        return;
      }

      await updateInterviewMutation.mutateAsync({
        id: interview.id,
        status: newStatus as TInterviewStatus,
        interview_date: interview.interview_date,
        duration: interview.duration || 0,
        meeting_link: interview.meeting_link || "",
        hr_remarks: interview.hr_remarks || "",
        interview_type: interview.interview_type || "",
      });

      await createInterviewStatusMutation.mutateAsync({
        interviewId: interview.id,
        status_id: statusItem.id,
        remarks: newStatus,
      });

      toast.success("Interview status updated successfully");
    } catch (error) {
      setCurrentStatus(previousStatus);
      const errorMessage = error instanceof Error ? error.message : "Failed to update interview status";
      toast.error(errorMessage);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "declined":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "expired":
      case "no_show":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "rescheduled":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "shortlisted":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "technical":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "behavioral":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "hr":
        return "bg-green-100 text-green-800 border-green-200";
      case "final":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) {
      return { date: "Not set", time: "Not set" };
    }
    
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return { date: "Invalid date", time: "Invalid time" };
      }
      
      return {
        date: date.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        }),
        time: date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      };
    } catch (error) {
      return { date: "Invalid date", time: "Invalid time" };
    }
  };

  const { date, time } = formatDateTime(interview.interview_date);
  
  const formatDuration = (duration: number | null | undefined) => {
    if (duration === null || duration === undefined) {
      return "Not specified";
    }
    if (duration === 0) {
      return "0 minutes";
    }
    return `${duration} minute${duration > 1 ? 's' : ''}`;
  };

  return (
    <>
      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6 space-y-4">
       
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">
                {interview.name ||
                  (interview.candidate?.first_name &&
                  interview.candidate?.last_name
                    ? `${interview.candidate.first_name} ${interview.candidate.last_name}`
                    : "Candidate")}
              </h3>
              <p className="text-gray-600 text-sm">
                {interview.title || interview.job?.title || "Job Position"}
              </p>
            </div>
            <Badge
              className={`${getStatusColor(
                currentStatus
              )} font-medium`}
            >
              {(() => {
                const statusItem = interviewStatusList?.find((item: IStatusListItem) => 
                  item.status.toLowerCase() === currentStatus.toLowerCase() || 
                  item.status.toLowerCase() === currentStatus.toLowerCase().replace(/\s+/g, '_')
                );
                if (statusItem) {
                  return statusItem.status.charAt(0).toUpperCase() + statusItem.status.slice(1).replace(/_/g, ' ');
                }
                return currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1).replace(/_/g, ' ');
              })()}
            </Badge>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center text-sm text-gray-700">
              <Calendar className="h-4 w-4 mr-3 text-gray-500" />
              <span>{date}</span>
            </div>

            <div className="flex items-center text-sm text-gray-700">
              <Clock className="h-4 w-4 mr-3 text-gray-500" />
              <span>
                {time}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <Clock className="h-4 w-4 mr-3 text-gray-500" />
              <span>
                Duration: {formatDuration(interview.duration)}
              </span>
            </div>

            <div className="flex items-center text-sm text-gray-700">
              <Video className="h-4 w-4 mr-3 text-gray-500" />
              <a
                href={interview.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-blue-600 hover:underline"
              >
                {interview.meeting_link}
              </a>
            </div>
          </div>

          <div>
            <Badge
              className={`${getTypeColor(
                interview.interview_type
              )} font-medium capitalize`}
            >
              {interview.interview_type}
            </Badge>
          </div>

          {interview.notes && (
            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-2">Notes:</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {interview.notes}
              </p>
            </div>
          )}

          <div className="pt-2">
            <Select
              value={getCurrentInterviewStatus()}
              onValueChange={handleStatusChange}
              disabled={isLoadingInterviewStatusList || updateInterviewMutation.isPending || createInterviewStatusMutation.isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={isLoadingInterviewStatusList ? "Loading statuses..." : "Select status"} />
              </SelectTrigger>
              <SelectContent>
                {interviewStatusList && interviewStatusList.length > 0 ? (
                  interviewStatusList
                    .filter((statusItem: IStatusListItem) => statusItem.status && statusItem.status.trim() !== "")
                    .map((statusItem: IStatusListItem) => (
                      <SelectItem key={statusItem.id} value={statusItem.status}>
                        {statusItem.status.charAt(0).toUpperCase() + statusItem.status.slice(1).replace(/_/g, ' ')}
                      </SelectItem>
                    ))
                ) : (
                  <>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="rescheduled">Rescheduled</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {interview.interview_type?.toLowerCase() === "hr" && interview.ai_interview && (
            <div className="pt-2 space-y-2">
              <span className="text-sm font-medium text-gray-700">AI Interview:</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 text-sm bg-green-50 border border-green-200 rounded-md">
                  <span className="text-green-700 font-medium">AI Interview Enabled</span>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleCopyLink}
                  className="bg-black text-white hover:bg-gray-800 flex items-center gap-2 shrink-0"
                >
                  <Copy className="h-4 w-4" />
                  Copy Link
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            {interview.interview_type?.toLowerCase() === "hr" && !interview.ai_interview && (
              <Button
                variant="default"
                size="sm"
                onClick={handleGenerateAIInterviewLink}
                className="flex-1 bg-black text-white hover:bg-gray-800 flex items-center justify-center gap-2"
                disabled={markAIInterviewMutation.isPending}
              >
                <Link className="h-4 w-4" />
                {markAIInterviewMutation.isPending ? "Enabling..." : "Enable AI Interview"}
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1 bg-black text-white hover:bg-gray-800 flex items-center justify-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex-1 bg-black text-white hover:bg-gray-800 flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <EditInterviewModal
        interview={interview}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
    </>
  );
}
