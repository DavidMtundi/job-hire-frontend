"use client";

import {
  Briefcase,
  Calendar,
  DollarSign,
  DownloadIcon,
  EyeIcon,
  Mail,
  MapPin,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { TApplication } from "~/apis/applications/schemas";
import { useGetInterviewsByApplicationIdQuery } from "~/apis/interviews/queries";
import { useGetApplicationStatusQuery, useGetStatusListQuery } from "~/apis/applications/queries";
import { IApplicationStatus } from "~/apis/applications/dto";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Progress } from "~/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useApplicationModal } from "~/hooks/use-application-modal";
import { TInterview } from "~/apis/interviews/schemas";

export const ApplicationDetailsModal = () => {
  const {
    data: application,
    modal,
    isOpen,
    onOpenChange,
  } = useApplicationModal();

  // console.log("Rendering UserDetailsModal:", user);

  return (
    <Dialog open={modal === "view" && isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
          <DialogDescription>
            Complete application information and progress
          </DialogDescription>
        </DialogHeader>
        {application ? (
          <ApplicationDetailsView application={application} />
        ) : (
          <div className="flex justify-center items-center">
            No application found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const ApplicationDetailsView = ({
  application,
}: {
  application: TApplication;
}) => {
  const router = useRouter();
  const { data: interviews, isLoading: isLoadingInterviews } = useGetInterviewsByApplicationIdQuery(application.id);
  const { data: statusHistory, isLoading: isLoadingStatusHistory } = useGetApplicationStatusQuery(application.id);
  const { data: statusList } = useGetStatusListQuery();

  const applicationJobTitle = application.job?.title || "N/A";

  const getStatusName = (statusId: string | number) => {
    if (!statusList) return "Unknown";
    const status = statusList.find(s => s.id === Number(statusId));
    return status?.status || "Unknown";
  };

  const handleScheduleInterview = () => {
    const params = new URLSearchParams({
      candidateId: application.candidate_id,
      jobId: application.job_id,
      applicationId: application.id,
      candidateName: `${application.candidate.first_name} ${application.candidate.last_name}`,
      jobTitle: application.job.title,
      openModal: "true",
    });

    router.push(`/admin/interviews?${params.toString()}`);
  };

  const handleViewInterview = (interviewId: string) => {
    const params = new URLSearchParams({
      interviewId: interviewId,
    });
    router.push(`/admin/interviews?${params.toString()}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "review":
        return "bg-yellow-100 text-yellow-800";
      case "interview":
        return "bg-blue-100 text-blue-800";
      case "offer":
        return "bg-purple-100 text-purple-800";
      case "hired":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  function getPriorityColor(priority: string) {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  const firstName = application.candidate.first_name || "";
  const lastName = application.candidate.last_name || "";
  const initials =
    `${firstName} ${lastName}`
      .trim()
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <div className="space-y-6">
      <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-lg">
        <Avatar className="h-16 w-16">
          <AvatarImage src={""} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">
            {firstName && lastName
              ? `${firstName} ${lastName}`
              : firstName || lastName || "N/A"}
          </h3>
          <p className="text-gray-600">
            {application.candidate.email || "N/A"}
          </p>
          <div className="flex items-center space-x-4 mt-2">
            {application.stage && (
              <Badge className={getStatusColor(application.stage)}>
                {application.stage}
              </Badge>
            )}
            <Badge className={getPriorityColor(application.priority)}>
              {application.priority?.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Application Progress */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Application Progress</h4>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {application.stage}
            </span>
            <span className="text-sm text-gray-500">
              {application.progress}%
            </span>
          </div>
          <Progress value={application.progress} className="h-3" />
          <p className="text-sm text-gray-600 mt-2">
            Next: {application.next_step}
          </p>
        </div>
      </div>

      {/* Job Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Job Information</h4>
          <div className="bg-white p-4 rounded-lg border space-y-3">
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm">{application.job.title}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm">{application.job.department}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm">{application.job.location}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm">
                {application.job.salary_min} - {application.job.salary_max}{" "}
                {application.job.salary_currency}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Status Timeline</h4>
          <div className="bg-white p-4 rounded-lg border">
            {isLoadingStatusHistory ? (
              <div className="text-center text-sm text-gray-500 py-4">
                Loading timeline...
              </div>
            ) : statusHistory && statusHistory.length > 0 ? (
              <div className="space-y-3">
                {statusHistory.map((status: IApplicationStatus, index: number) => (
                  <div
                    key={status.id}
                    className="flex items-start justify-between pb-3 border-b last:border-b-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-medium">
                          {getStatusName(status.status_id)}
                        </Badge>
                        {index === 0 && (
                          <span className="text-xs text-blue-600 font-medium">Current</span>
                        )}
                      </div>
                      {status.remark && (
                        <p className="text-sm text-gray-600 mt-1">{status.remark}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">
                        {new Date(status.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <br />
                      <span className="text-xs text-gray-500">
                        {new Date(status.created_at).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-sm text-gray-500 py-4">
                No status history available
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Resume</h4>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <DownloadIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Resume Preview
              </h3>
              <div className="text-left mt-4">
                <div className="prose prose-sm max-w-none">
                  <h4 className="text-sm font-normal italic text-gray-600">Candidate Matching Summary</h4>
                  <ul className="space-y-2">
                    <li>
                      <strong>
                        <span style={{ color: "#24292f" }}>Score:</span>
                      </strong>{" "}
                      {application.score != null ? (
                        <span style={{ color: "#24292f", fontWeight: "bold" }}>{application.score}</span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </li>
                    <li>
                      <strong>Match Level:</strong>{" "}
                      {application.match_level || <span className="text-gray-400">N/A</span>}
                    </li>
                    <li>
                      <strong>Matching Skills:</strong>{" "}
                      {Array.isArray(application.matching_skills) && application.matching_skills.length > 0
                        ? (
                          <div className="flex flex-wrap gap-2 mt-1 pl-1">
                            {application.matching_skills.map((sk: string, i: number) => (
                              <span
                                key={i}
                                className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        )
                        : <span className="text-gray-400">None</span>
                      }
                    </li>
                    <li>
                      <strong>Missing Skills:</strong>{" "}
                      {Array.isArray(application.missing_skills) && application.missing_skills.length > 0
                        ? (
                          <div className="flex flex-wrap gap-2 mt-1 pl-1">
                            {application.missing_skills.map((sk: string, i: number) => (
                              <span
                                key={i}
                                className="inline-block bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        )
                        : <span className="text-gray-400">None</span>
                      }
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (application?.candidate?.resume_url) {
                    window.open(application.candidate.resume_url, "_blank");
                  }
                }}
                disabled={!application?.candidate?.resume_url}
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                View in Browser
              </Button>
              <Button
                onClick={async () => {
                  if (application?.candidate?.resume_url) {
                    try {
                      const resumeUrl = application.candidate.resume_url;
                      const response = await fetch(resumeUrl, { mode: 'cors' });
                      if (!response.ok) throw new Error('Network response was not ok');
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = resumeUrl.split("/").pop() || "resume.pdf";
                      document.body.appendChild(link);
                      link.click();
                      setTimeout(() => {
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(link);
                      }, 500);
                    } catch (e) {
                      alert("Failed to download the resume.");
                    }
                  }
                }}
                disabled={!application?.candidate?.resume_url}
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {application.job.title === "Senior" ? "5+" : "3+"}
            </p>
            <p className="text-sm text-gray-600">Years Experience</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {Math.floor((application?.score ?? 0) * 20)}%
            </p>
            <p className="text-sm text-gray-600">Match Score</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {application.job.department === "Engineering" ? "8+" : "5+"}
            </p>
            <p className="text-sm text-gray-600">Key Skills</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Resume</h4>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <DownloadIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Resume Preview
              </h3>
              <div className="text-left mt-4">
                <div className="prose prose-sm max-w-none">
                  <h4 className="text-sm font-normal italic text-gray-600">Candidate Matching Summary</h4>
                  <ul className="space-y-2">
                    <li>
                      <strong>
                        <span style={{ color: "#24292f" }}>Score:</span>
                      </strong>{" "}
                      {application.score != null ? (
                        <span style={{ color: "#24292f", fontWeight: "bold" }}>{application.score}</span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </li>
                    <li>
                      <strong>Match Level:</strong>{" "}
                      {application.match_level || <span className="text-gray-400">N/A</span>}
                    </li>
                    <li>
                      <strong>Matching Skills:</strong>{" "}
                      {Array.isArray(application.matching_skills) && application.matching_skills.length > 0
                        ? (
                          <div className="flex flex-wrap gap-2 mt-1 pl-1">
                            {application.matching_skills.map((sk: string, i: number) => (
                              <span
                                key={i}
                                className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        )
                        : <span className="text-gray-400">None</span>
                      }
                    </li>
                    <li>
                      <strong>Missing Skills:</strong>{" "}
                      {Array.isArray(application.missing_skills) && application.missing_skills.length > 0
                        ? (
                          <div className="flex flex-wrap gap-2 mt-1 pl-1">
                            {application.missing_skills.map((sk: string, i: number) => (
                              <span
                                key={i}
                                className="inline-block bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        )
                        : <span className="text-gray-400">None</span>
                      }
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (application?.candidate?.resume_url) {
                    window.open(application.candidate.resume_url, "_blank");
                  }
                }}
                disabled={!application?.candidate?.resume_url}
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                View in Browser
              </Button>
              <Button
                onClick={async () => {
                  if (application?.candidate?.resume_url) {
                    try {
                      const resumeUrl = application.candidate.resume_url;
                      const response = await fetch(resumeUrl, { mode: 'cors' });
                      if (!response.ok) throw new Error('Network response was not ok');
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = resumeUrl.split("/").pop() || "resume.pdf";
                      document.body.appendChild(link);
                      link.click();
                      setTimeout(() => {
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(link);
                      }, 500);
                    } catch (e) {
                      alert("Failed to download the resume.");
                    }
                  }
                }}
                disabled={!application?.candidate?.resume_url}
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {application.job.title === "Senior" ? "5+" : "3+"}
            </p>
            <p className="text-sm text-gray-600">Years Experience</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {Math.floor((application?.score ?? 0) * 20)}%
            </p>
            <p className="text-sm text-gray-600">Match Score</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {application.job.department === "Engineering" ? "8+" : "5+"}
            </p>
            <p className="text-sm text-gray-600">Key Skills</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button variant="outline" onClick={handleScheduleInterview}>
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Interview
        </Button>
        <Button variant="outline" disabled>
          <Mail className="h-4 w-4 mr-2" />
          Send Email
        </Button>
        <Button disabled>Update Status</Button>
      </div>
    </div>
  );
};
