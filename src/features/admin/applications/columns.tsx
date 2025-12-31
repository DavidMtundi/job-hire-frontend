"use client"

import React, { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { TApplication } from "~/apis/applications/schemas";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { CellAction } from "./cell-action";
import { useGetStatusListQuery } from "~/apis/applications/queries";

export const columns: ColumnDef<TApplication>[] = [
  // {
  //   accessorKey: "id",
  //   header: "ID",
  //   cell: ({ row }) => <CellCard application={row.original} />
  // },
  {
    accessorKey: "candidate.email",
    header: "Applicant",
    cell: ({ row }) => {
      const firstName = row.original.candidate.first_name || "";
      const lastName = row.original.candidate.last_name || "";
      const initials = `${firstName} ${lastName}`
        .trim()
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?";

      return (
        <div className="flex items-center space-x-2 max-w-[180px]">
          <Avatar className="size-8 flex-shrink-0">
            <AvatarImage src={""} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 truncate whitespace-nowrap overflow-hidden">
              {firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || "N/A"}
            </div>
            <div className="text-sm text-gray-500 truncate whitespace-nowrap overflow-hidden">
              {row.original.candidate.email || "N/A"}
            </div>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: "job.title",
    header: "Job Title",
    cell: ({ row }) => {
      return (
        <div className="max-w-[140px]">
          <p className="truncate whitespace-nowrap overflow-hidden">{row.original.job.title}</p>
          <p className="text-xs text-gray-500 truncate whitespace-nowrap overflow-hidden">{row.original.job.location}</p>
          {/* <div className="flex items-center space-x-2">
            <p className="text-xs text-gray-500 truncate">{row.original.job.id}</p>
            <CopyIcon
              className="size-3.5 hover:text-gray-900 cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(row.original.job.id);
                toast.success("Job ID copied to the clipboard.");
              }} />
          </div> */}
        </div>
      )
    }
  },
  // {
  //   accessorKey: "job.location",
  //   header: "Location",
  // },
  // {
  //   accessorKey: "status",
  //   header: "Status",
  //   cell: ({ row }) => {
  //     return (
  //       <Badge variant="default">
  //         {row.original.stage}
  //       </Badge>
  //     )
  //   }
  // },
  {
    accessorKey: "stage",
    header: "Status & Progress",
    cell: ({ row }) => {
      return <StatusProgressCell key={row.original.id} application={row.original} />
    }
  },
  // {
  //   accessorKey: "next_step",
  //   header: "Next Step",
  //   cell: ({ row }) => {
  //     const nextStep = row.original.next_step || "N/A";
  //     const nextStepDate = row.original.next_step_date
  //       ? new Date(row.original.next_step_date).toLocaleDateString()
  //       : "N/A";

  //     return (
  //       <div>
  //         <p className="text-sm text-gray-600">Next: <span className="font-medium text-gray-800">{nextStep}</span></p>
  //         <p className="text-xs text-gray-600">Date: <span className="font-medium text-gray-800">{nextStepDate}</span></p>
  //       </div>
  //     )
  //   }
  // },
  
  {
    accessorKey: "score",
    header: "Score",
    cell: ({ row }) => {
      const score = row.original.score;
      const matchLevel = row.original.match_level;
      return (
        <div className="font-medium text-gray-600">
          <p>
            {typeof score === "number"
              ? `${Math.floor(score ?? 0)}`
              : "N/A"}
          </p>
          <p className="text-xs text-gray-500">
            {matchLevel || ""}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "recommendation",
    header: "Recommendation",
    cell: ({ row }) => {
      if (!row.original.recommendation) {
        return <div className="text-sm text-gray-500">N/A</div>
      }
      return <RecommendationModal recommendation={row.original.recommendation} />
    }
  },
  {
    accessorKey: "applied_at",
    header: "Applied At",
    cell: ({ row }) => {
      const appliedAt = row.original.applied_at
        ? new Date(row.original.applied_at).toLocaleDateString()
        : "N/A";

      return (
        <span className="text-sm text-gray-500">{appliedAt}</span>
      )
    }
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => <CellAction data={row.original} />
  },
]


const StatusProgressCell = ({ application }: { application: TApplication }) => {
  const { data: statusList, isLoading: isLoadingStatusList } = useGetStatusListQuery();

  const mapStageToApiStatus = (stage: string): string | null => {
    const stageMap: Record<string, string> = {
      "applied": "Application Received",
      "screening": "Under Review",
      "shortlisted": "Shortlisted",
      "hr_interview": "Interview Scheduled",
      "technical_interview": "Interview Scheduled",
      "final_interview": "Interview Scheduled",
      "in_review": "Evaluation Pending",
      "offer_sent": "Offer Extended",
      "hired": "Hired",
      "rejected": "CV Rejected",
      "talent_pool": "Selected",
    };

    const normalizedStage = stage.toLowerCase().replace(/\s+/g, '_');
    return stageMap[normalizedStage] || null;
  };

  const getStatusFromApplication = (): string => {
    if (!statusList || statusList.length === 0) {
      return "Application Received";
    }

    if (application.status_id) {
      const found = statusList.find(item => item.id === application.status_id);
      if (found) {
        return found.status;
      }
    }

    if (application.stage) {
      const apiStatus = mapStageToApiStatus(application.stage);
      if (apiStatus) {
        const found = statusList.find(item => item.status === apiStatus);
        if (found) {
          return apiStatus;
        }
      }
    }

    return "Application Received";
  };

  const currentStatus = getStatusFromApplication();

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("hired") || statusLower.includes("selected")) return "default";
    if (statusLower.includes("rejected") || statusLower.includes("declined")) return "destructive";
    if (statusLower.includes("pending") || statusLower.includes("review")) return "secondary";
    return "outline";
  };

  if (isLoadingStatusList) {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }

  return (
    <Badge variant={getStatusVariant(currentStatus)} className="whitespace-nowrap">
      {currentStatus}
    </Badge>
  );
};

const RecommendationModal = ({ recommendation }: { recommendation: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="underline text-blue-600 hover:text-blue-800 text-sm">
          View
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Recommendation</DialogTitle>
          <DialogDescription>
            Review the detailed recommendation for this candidate.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 whitespace-pre-line text-sm text-gray-700">
          {recommendation}
        </div>
      </DialogContent>
    </Dialog>
  )
}