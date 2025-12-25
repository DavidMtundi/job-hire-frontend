"use client";

import {
  Calendar,
  Clock,
  MapPin,
  User,
  Briefcase,
  Mail,
  Phone,
  ArrowLeft,
  XCircle,
  Sparkles,
  FileText,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { useGetApplicationDetailQuery, useGetApplicationStatusHistoryQuery, useGetStatusListQuery, useUpdateApplicationMutation, useUpdateApplicationStatusByIdMutation } from "~/apis/applications/queries";
import { useGetInterviewsByApplicationIdQuery } from "~/apis/interviews/queries";
import { useGetAIInterviewLinkMutation } from "~/apis/ai-interview/queries";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function CandidatePortalScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const interviewId = searchParams.get("interview_id");
  const applicationId = searchParams.get("application_id");
  const [aiInterviewSubmissions, setAiInterviewSubmissions] = useState<Record<string, any>>({});

  const {
    data: applicationData,
    isLoading: applicationLoading,
    error: applicationError,
  } = useGetApplicationDetailQuery(applicationId || "");
  
  const application = applicationData?.data;

  const { data: statusData, isLoading: statusLoading } =
    useGetApplicationStatusHistoryQuery(applicationId || "");

  const { data: interviews, isLoading: interviewsLoading } =
    useGetInterviewsByApplicationIdQuery(applicationId || "");

  const { data: statusList, isLoading: isLoadingStatusList } = useGetStatusListQuery();
  const updateApplicationMutation = useUpdateApplicationMutation();
  const updateApplicationStatusByIdMutation = useUpdateApplicationStatusByIdMutation();
  const getAIInterviewLinkMutation = useGetAIInterviewLinkMutation();
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    if (statusList && process.env.NODE_ENV === 'development') {
      console.log('StatusList loaded:', statusList);
    }
  }, [statusList]);

  useEffect(() => {
    const submissionData = localStorage.getItem("ai_interview_submissions");
    if (submissionData) {
      try {
        const parsed = JSON.parse(submissionData);
        setAiInterviewSubmissions(parsed);
      } catch (error) {
        console.error("Error parsing AI interview submissions:", error);
      }
    }
  }, []);

  if (!applicationId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Application Portal</h1>
          <p className="text-gray-600">
            View application status and scheduled interviews
          </p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Application Selected
            </h3>
           
          </CardContent>
        </Card>
      </div>
    );
  }

  if (applicationLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading application details...</p>
      </div>
    );
  }

  if (applicationError || !application) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Application Portal</h1>
          <p className="text-gray-600">
            View application status and scheduled interviews
          </p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-red-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Application
            </h3>
            
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatSalary = () => {
    if (application.salary_min && application.salary_max) {
      return `${
        application.salary_currency
      } ${application.salary_min.toLocaleString()} - ${
        application.salary_currency
      } ${application.salary_max.toLocaleString()}`;
    }
    return "Not specified";
  };

  const getJobTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      full_time: "Full-time",
      part_time: "Part-time",
      contract: "Contract",
      internship: "Internship",
    };
    return types[type] || type;
  };

  const getStatusName = (statusId: string | number) => {
    if (typeof statusId === 'string' && !/^\d+$/.test(statusId)) {
      return statusId;
    }
    
    if (!statusList || !Array.isArray(statusList) || statusList.length === 0) {
      return String(statusId);
    }
    
    const numericStatusId = Number(statusId);
    if (isNaN(numericStatusId)) {
      return String(statusId);
    }
    
    const status = statusList.find(s => s.id === numericStatusId);
    if (status && status.status) {
      return status.status;
    }
    
   
    
    return String(statusId);
  };

  const isWithdrawDisabled = () => {
    if (statusData && statusData.length > 0) {
      const hasWithdrawn = statusData.some((status) => {
        const statusId = status.status_id;
        if (typeof statusId === 'string') {
          return statusId === "Candidate Withdrawn";
        }
        return Number(statusId) === 17;
      });
      if (hasWithdrawn) {
        return true;
      }
    }
    
    return false;
  };

  const handleWithdraw = async () => {
    if (!applicationId) return;

    setIsWithdrawing(true);
    try {
      await updateApplicationMutation.mutateAsync({
        id: applicationId,
        status_id: 17,
        priority: "High",
      } as any);

      await updateApplicationStatusByIdMutation.mutateAsync({
        applicationId: applicationId,
        status_id: 17,
        remark: "Candidate Withdrawn",
      });

      toast.success("Application withdrawn successfully");

      setTimeout(() => {
        router.push("/user/applications");
      }, 1500);
    } catch (error) {
      toast.error("Failed to withdraw application. Please try again.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleBeginAIInterview = async (interviewId: string, jobId: string) => {
    if (!applicationId) {
      toast.error("Application ID is missing");
      return;
    }

    try {
      await getAIInterviewLinkMutation.mutateAsync({
        applicationId,
        interviewId,
        jobId,
      });

      const aiInterviewUrl = `/user/ai-interview?interview_id=${interviewId}&job_id=${jobId}&application_id=${applicationId}`;
      window.open(aiInterviewUrl, '_blank');
    } catch (error) {
      toast.error("Failed to start AI interview. Please try again.");
    }
  };

  return (
    <div className="w-full h-full space-y-4 sm:space-y-6">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Application Portal</h1>
          <Button variant="secondary" size="sm" onClick={() => router.back()} className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" /> 
            <span className="hidden sm:inline">Back to Applications</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>
        <p className="text-sm sm:text-base text-gray-600">
          View application status and scheduled interviews
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
       
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
            
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-500" />
                </div>

               
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {application.first_name} {application.last_name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {application.years_experience} years Experience
                  </p>
                </div>

               
                <div className="w-full space-y-2 text-left">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="truncate">{application.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{application.phone}</span>
                  </div>
                </div>

               
                <div className="w-full space-y-2 text-left">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {application.skills?.slice(0, 10).map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-gray-100 text-gray-800 hover:bg-gray-200"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Application View</h2>
            <p className="text-xs sm:text-sm text-gray-600">
              View application status and scheduled interviews
            </p>
          </div>

          <Card className="w-full">
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
             
              <div>
                
                  <h3 className="text-lg font-semibold text-gray-900">
                    Application Status
                  </h3>
                 
            
                <p className="text-sm text-gray-600">
                  Track your application progress
                </p>
              </div>

            
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Current Status
                </p>
                <p className="text-gray-900">{application.stage}</p>
                {application.remarks && (
                  <p className="text-sm text-gray-600 mt-2">
                    Remarks: {application.remarks}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-5 h-5 text-gray-500" />
                  <h4 className="font-semibold text-gray-900">
                    Applied Position
                  </h4>
                </div>
                <div className="border rounded-lg p-4 space-y-3">
                  <div>
                    <h5 className="font-semibold text-gray-900 text-lg">
                      {application.title}
                    </h5>
                    <p className="text-sm text-gray-600">
                      {application.location}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-gray-100 text-gray-800"
                    >
                      {getJobTypeLabel(application.job_type)}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={
                        application.status === "active"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                      }
                    >
                      {application.status === "active"
                        ? "Open"
                        : application.status}
                    </Badge>
                    {application.is_remote && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        Remote
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">{formatSalary()}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    Applied on:{" "}
                    {format(new Date(application.applied_at), "MM/dd/yyyy")}
                  </div>
                </div>
              </div>

            
              {applicationId && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">
                      Application Timeline
                    </h4>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleWithdraw}
                      disabled={isWithdrawDisabled() || isWithdrawing}
                      className="gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      {isWithdrawing ? "Withdrawing..." : "Withdraw"}
                    </Button>
                  </div>
                  {applicationLoading || statusLoading || isLoadingStatusList ? (
                    <div className="text-sm text-gray-500">
                      Loading timeline...
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {statusData && statusData.length > 0 ? (
                        <>
                          {statusData
                            .filter((status) => {
                              if (!status.status_id) return true;
                              const statusId = typeof status.status_id === 'string' 
                                ? parseInt(status.status_id, 10) 
                                : Number(status.status_id);
                              if (isNaN(statusId)) return true;
                              return statusId < 8 || statusId > 13;
                            })
                            .map((status, index, filteredArray) => (
                            <div key={status.id} className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    index === filteredArray.length - 1
                                      ? "bg-blue-600"
                                      : "bg-gray-900"
                                  } mt-2`}
                                ></div>
                                {index !== filteredArray.length - 1 && (
                                  <div className="w-0.5 h-full bg-gray-300 mt-1"></div>
                                )}
                              </div>
                              <div className="flex-1 pb-4">
                                <h5 className="font-semibold text-gray-900">
                                  {getStatusName(status.status_id)}
                                </h5>
                                <p className="text-sm text-gray-600">
                                  {format(
                                    new Date(status.created_at),
                                    "MM/dd/yyyy"
                                  )}
                                </p>
                                {status.remark && (
                                  <p className="text-sm text-gray-700 mt-1">
                                    {status.remark}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        application && (
                          <div className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                            </div>
                            <div className="flex-1 pb-4">
                              <h5 className="font-semibold text-gray-900">
                                Application Received
                              </h5>
                              <p className="text-sm text-gray-600">
                                {format(
                                  new Date(application.applied_at),
                                  "MM/dd/yyyy"
                                )}
                              </p>
                              <p className="text-sm text-gray-700 mt-1">
                                Application Received
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

         
        </div>
        <div className="lg:col-span-3 space-y-4 sm:space-y-6">
          <Card className="w-full">
            <CardContent className="p-4 sm:p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Your Interviews
                </h3>
              
              </div>

              <div className="grid grid-cols-1 gap-4">
                {interviewsLoading && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <p>Loading interview details...</p>
                  </div>
                )}

                {interviews && interviews.length > 0 ? (
                  interviews.map((interview) => {
                    const aiSubmission = aiInterviewSubmissions[interview.id];

                    return (
                      <div key={interview.id} className="space-y-4">
                        <div className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-lg mb-1">
                                {interview.interview_type === "hr"
                                  ? "HR Interview"
                                  : interview.interview_type === "technical"
                                  ? "Technical Interview"
                                  : "Interview"}
                              </h4>
                              {application?.title && (
                                <p className="text-sm text-gray-600 font-medium">
                                  {application.title}
                                </p>
                              )}
                            </div>
                            <Badge className="bg-gray-900 text-white capitalize">
                              {interview.status || "pending"}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span>
                                {interview.interview_date
                                  ? format(
                                      new Date(interview.interview_date),
                                      "EEEE, MMMM dd, yyyy"
                                    )
                                  : "Date not set"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span>
                                {interview.interview_date
                                  ? format(
                                      new Date(interview.interview_date),
                                      "h:mm a"
                                    )
                                  : "Time not set"}{" "}
                                ({interview.duration} minutes)
                              </span>
                            </div>

                            {interview.meeting_link && (
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">Meeting Link: </span>
                                {interview.meeting_link !== "string" && interview.meeting_link.startsWith("http") ? (
                                  <a
                                    href={interview.meeting_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline break-all"
                                  >
                                    {interview.meeting_link}
                                  </a>
                                ) : (
                                  <span className="text-gray-600">{interview.meeting_link}</span>
                                )}
                              </div>
                            )}
                          </div>

                          {interview.hr_remarks && (
                            <div className="pt-3 border-t">
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                HR Remarks:
                              </p>
                              <p className="text-sm text-gray-600">
                                {interview.hr_remarks}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Show AI interview card only when ai_interview flag is true */}
                        {interview.ai_interview && (
                          <div className="relative rounded-xl p-[3px] bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500">
                            <Card className="border-0">
                              <CardContent className="p-6">
                                {aiSubmission && aiSubmission.submitted ? (
                                  <>
                                    <div className="flex items-center gap-3 mb-6">
                                      <div className="p-2 rounded-lg bg-green-500">
                                        <CheckCircle2 className="w-6 h-6 text-white" />
                                      </div>
                                      <div>
                                        <h3 className="text-xl font-bold text-gray-900">AI Interview Submitted</h3>
                                        <p className="text-sm text-gray-600">Thank you for completing the assessment</p>
                                      </div>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                                        <div className="flex items-center gap-3">
                                          <FileText className="w-5 h-5 text-green-600" />
                                          <span className="text-sm text-gray-600">Questions Submitted</span>
                                        </div>
                                        <span className="text-lg font-semibold text-gray-900">
                                          {aiSubmission.totalQuestions} Questions
                                        </span>
                                      </div>

                                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                                        <div className="flex items-center gap-3">
                                          <Clock className="w-5 h-5 text-blue-600" />
                                          <span className="text-sm text-gray-600">Total Time Taken</span>
                                        </div>
                                        <span className="text-lg font-semibold text-gray-900">
                                          {Math.floor(aiSubmission.totalTime / 60)} min {aiSubmission.totalTime % 60} sec
                                        </span>
                                      </div>
                                    </div>

                                    <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg p-4 text-center">
                                      <p className="text-gray-700 font-medium mb-1">
                                        Thank you for your time!
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        Please wait while we review your responses. We will get back to you soon with the results.
                                      </p>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-3 mb-6">
                                      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500">
                                        <Sparkles className="w-6 h-6 text-white" />
                                      </div>
                                      <div>
                                        <h3 className="text-xl font-bold text-gray-900">AI Interview</h3>
                                        <p className="text-sm text-gray-600">Complete your AI-powered assessment</p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                        <div>
                                          <p className="text-sm text-gray-600">Questions</p>
                                          <p className="text-lg font-semibold text-gray-900">5 Questions</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-3 p-4 bg-teal-50 rounded-lg border border-teal-100">
                                        <Clock className="w-5 h-5 text-teal-600" />
                                        <div>
                                          <p className="text-sm text-gray-600">Duration</p>
                                          <p className="text-lg font-semibold text-gray-900">15 Minutes</p>
                                        </div>
                                      </div>
                                    </div>

                                    <Button
                                      className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white text-lg py-6"
                                      onClick={() => {
                                        if (!application?.job_id) {
                                          toast.error("Job ID is missing. Cannot start AI interview.");
                                          return;
                                        }
                                        handleBeginAIInterview(interview.id, application.job_id);
                                      }}
                                      disabled={getAIInterviewLinkMutation.isPending || !application?.job_id}
                                    >
                                      <PlayCircle className="w-5 h-5 mr-2" />
                                      {getAIInterviewLinkMutation.isPending ? "Loading..." : "Begin AI Interview"}
                                    </Button>
                                  </>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  !interviewsLoading && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>No scheduled interviews yet</p>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
      </div>
      </div>
    </div>
  );
}
