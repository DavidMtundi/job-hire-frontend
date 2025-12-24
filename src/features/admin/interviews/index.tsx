"use client";

import { Calendar, Plus, Search, X } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useGetCandidatesQuery } from "~/apis/candidates/queries";
import { useGetInterviewsQuery, useGetInterviewStatusListQuery } from "~/apis/interviews/queries";
import {
  TInterview,
  TInterviewStatus,
  TInterviewType,
} from "~/apis/interviews/schemas";
import { useGetJobsQuery } from "~/apis/jobs/queries";
import { useGetApplicationsQuery } from "~/apis/applications/queries";
import { FilterGroup } from "~/components/filters/FilterGroup";
import { Spinner } from "~/components/spinner";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { InterviewCard } from "./interview-card";
import { ScheduleInterviewModal } from "./schedule-interview-modal";

interface InterviewsFilters {
  search: string;
  status: string;
  type: string;
  interview_date: string;
}

export default function InterviewsScreen() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const [filters, setFilters] = useState<InterviewsFilters>({
    search: "",
    status: "all",
    type: "all",
    interview_date: "", 
  });
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [hasOpenedFromUrl, setHasOpenedFromUrl] = useState(false);
  const [prefilledData, setPrefilledData] = useState<{
    candidateId?: string;
    jobId?: string;
    applicationId?: string;
    candidateName?: string;
    jobTitle?: string;
  }>({});

  useEffect(() => {
    const candidateId = searchParams.get("candidateId");
    const jobId = searchParams.get("jobId");
    const applicationId = searchParams.get("applicationId");
    const candidateName = searchParams.get("candidateName");
    const jobTitle = searchParams.get("jobTitle");
    const openModal = searchParams.get("openModal");

    if (candidateId && jobId && openModal === "true" && !hasOpenedFromUrl) {
      setPrefilledData({
        candidateId,
        jobId,
        applicationId: applicationId || undefined,
        candidateName: candidateName || undefined,
        jobTitle: jobTitle || undefined,
      });

      setIsScheduleModalOpen(true);
      setHasOpenedFromUrl(true);
      
      setTimeout(() => {
        router.replace("/admin/interviews");
      }, 100);
    }
  }, [searchParams, hasOpenedFromUrl, router]);

  const handleModalClose = (open: boolean) => {
    setIsScheduleModalOpen(open);
    if (!open) {
      setPrefilledData({});
      setHasOpenedFromUrl(false);
    }
  };

  const {
    data: interviewsData,
    isLoading: isLoadingInterviews,
    error,
  } = useGetInterviewsQuery({
    ...(filters.interview_date && { interview_date: filters.interview_date }),
  });
  const { data: candidatesData, isLoading: isLoadingCandidates } =
    useGetCandidatesQuery();
  const { data: jobsData, isLoading: isLoadingJobs } = useGetJobsQuery();
  const { data: applicationsData } = useGetApplicationsQuery({});
  const { data: interviewStatusList, isLoading: isLoadingInterviewStatusList } = useGetInterviewStatusListQuery();

  const enrichedInterviews = useMemo(() => {
    if (!interviewsData || interviewsData.length === 0) return [];

    const candidatesMap = new Map(
      candidatesData?.data?.map((c) => [c.id, c]) || []
    );
    const jobsMap = new Map(jobsData?.data?.map((j) => [j.id, j]) || []);
    
    const applicationsMap = new Map<string, string>();
    applicationsData?.data?.forEach((app) => {
      const key = `${app.candidate_id}-${app.job_id}`;
      applicationsMap.set(key, app.id);
    });

    return interviewsData.map((interview) => {
      const candidate = interview.candidate_id ? candidatesMap.get(interview.candidate_id) : undefined;
      const job = interview.job_id ? jobsMap.get(interview.job_id) : undefined;
      
      let applicationId = interview.application_id;
      if (!applicationId && interview.candidate_id && interview.job_id) {
        const key = `${interview.candidate_id}-${interview.job_id}`;
        applicationId = applicationsMap.get(key);
      }

      return {
        ...interview,
        application_id: applicationId || interview.application_id,
        candidate: candidate
          ? {
              id: candidate.id,
              first_name: candidate.first_name,
              last_name: candidate.last_name,
              email: candidate.email,
              phone: candidate.phone,
            }
          : undefined,
        job: job
          ? {
              id: job.id,
              title: job.title,
              department: job.department,
            }
          : undefined,
      } as TInterview;
    });
  }, [interviewsData, candidatesData, jobsData, applicationsData]);

  const isLoading = isLoadingInterviews || isLoadingCandidates || isLoadingJobs;
  const interviews = enrichedInterviews;

  useEffect(() => {
    const interviewId = searchParams.get("interviewId");
    
    if (interviewId && interviews.length > 0) {
      const timer = setTimeout(() => {
        const interviewCard = document.getElementById(`interview-card-${interviewId}`);
        if (interviewCard) {
          interviewCard.scrollIntoView({ behavior: "smooth", block: "center" });
          interviewCard.classList.add("ring-2", "ring-blue-500", "ring-offset-2");
          setTimeout(() => {
            interviewCard.classList.remove("ring-2", "ring-blue-500", "ring-offset-2");
          }, 3000);
          router.replace("/admin/interviews");
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router, interviews]);

  const statusOptions = useMemo(() => {
    const allStatusOption = { value: "all", label: "All Status" };
    
    if (interviewStatusList && interviewStatusList.length > 0) {
      const apiStatusOptions = interviewStatusList
        .filter((statusItem) => statusItem.status && statusItem.status.trim() !== "")
        .map((statusItem) => ({
          value: statusItem.status,
          label: statusItem.status.charAt(0).toUpperCase() + statusItem.status.slice(1).replace(/_/g, ' '),
        }));
      
      return [allStatusOption, ...apiStatusOptions];
    }
    
    return [
      allStatusOption,
      { value: "scheduled", label: "Scheduled" },
      { value: "accepted", label: "Accepted" },
      { value: "declined", label: "Declined" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
      { value: "rescheduled", label: "Rescheduled" },
      { value: "no_show", label: "No Show" },
    ];
  }, [interviewStatusList]);

  const filterConfigs = [
    {
      label: "Status",
      value: filters.status || "all",
      onChange: (val: string) =>
        setFilters((prev) => ({ ...prev, status: val })),
      placeholder: isLoadingInterviewStatusList ? "Loading statuses..." : "All Status",
      options: statusOptions,
      className: "w-48",
    },
    {
      label: "Type",
      value: filters.type || "all",
      onChange: (val: string) => setFilters((prev) => ({ ...prev, type: val })),
      placeholder: "All Types",
      options: [
        { value: "all", label: "All Types" },
        { value: "technical", label: "Technical" },
        { value: "hr", label: "HR" },
      ],
      className: "w-48",
    },
  ];

  const filteredInterviews = interviews.filter((interview) => {
    const searchLower = filters.search?.toLowerCase() || "";

    const matchesSearch =
      interview.name?.toLowerCase().includes(searchLower) ||
      interview.title?.toLowerCase().includes(searchLower) ||
      interview.candidate?.first_name?.toLowerCase().includes(searchLower) ||
      interview.candidate?.last_name?.toLowerCase().includes(searchLower) ||
      interview.job?.title?.toLowerCase().includes(searchLower) ||
      interview.meeting_link?.toLowerCase().includes(searchLower);

    const matchesStatus =
      filters.status === "all" ||
      !filters.status ||
      interview.status?.toLowerCase() === filters.status.toLowerCase();

    const matchesType =
      filters.type === "all" ||
      !filters.type ||
      interview.interview_type === filters.type;

    const matchesDate =
      !filters.interview_date ||
      (interview.interview_date && interview.interview_date.split('T')[0] === filters.interview_date);

    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  return (
    <div className="space-y-6">
     
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Interview Scheduling
          </h1>
          <p className="text-gray-600">
            Schedule and manage candidate interviews
          </p>
        </div>
        <Button
          onClick={() => {
            setPrefilledData({});
            setIsScheduleModalOpen(true);
          }}
          className="bg-black text-white hover:bg-gray-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Schedule Interview
        </Button>
      </div>

   
      <Card className="border-none shadow-none p-0">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search interviews..."
                  value={searchTerm}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchTerm(value);
                    setFilters((prev) => ({ ...prev, search: value }));
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Input
                  type="date"
                  value={filters.interview_date}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, interview_date: e.target.value }))
                  }
                  className="w-48"
                  placeholder="Filter by date"
                />
              </div>
              {filters.interview_date && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setFilters((prev) => ({ ...prev, interview_date: "" }))}
                  className="h-10 w-10"
                  title="Clear date filter"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-4">
              <FilterGroup filters={filterConfigs} />
            </div>
          </div>
        </CardContent>
      </Card>

     
      {isLoading ? (
        <Spinner />
      ) : filteredInterviews.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No interviews found
            </h3>
            <p className="text-gray-600 mb-4">
              {filters.search ||
              filters.status !== "all" ||
              filters.type !== "all" ||
              filters.interview_date
                ? "Try adjusting your filters"
                : "Get started by scheduling your first interview"}
            </p>
            {!filters.search &&
              filters.status === "all" &&
              filters.type === "all" &&
              !filters.interview_date && (
                <Button
                  onClick={() => {
                    setPrefilledData({});
                    setIsScheduleModalOpen(true);
                  }}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Interview
                </Button>
              )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredInterviews.map((interview) => (
            <div key={interview.id} id={`interview-card-${interview.id}`}>
              <InterviewCard interview={interview} />
            </div>
          ))}
        </div>
      )}

     
      <ScheduleInterviewModal
        open={isScheduleModalOpen}
        onOpenChange={handleModalClose}
        prefilledData={prefilledData}
      />
    </div>
  );
}
