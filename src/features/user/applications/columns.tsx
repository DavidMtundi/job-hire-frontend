"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  Building2,
  Calendar,
  ClockIcon,
  DollarSign,
  FileTextIcon,
  HandshakeIcon,
  MapPin,
  UserIcon,
  XCircleIcon,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { TApplication, TApplicationStatus } from "~/apis/applications/schemas";
import { useGetStatusListQuery } from "~/apis/applications/queries";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { MatchCard } from "./match-card";
import { Button } from "~/components/ui/button";

const CoverLetterDisplay = ({ coverLetter }: { coverLetter: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = coverLetter.length > 100;

  if (!shouldTruncate) {
    return <p className="text-sm text-gray-900 mb-3">{coverLetter}</p>;
  }

  return (
    <p className="text-sm text-gray-900 mb-3">
      {isExpanded ? coverLetter : coverLetter.slice(0, 100) + "..."}
      <Button
        variant="link"
        className="text-sm text-gray-500 p-0 h-auto ml-1"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? "Read Less" : "Read More"}
      </Button>
    </p>
  );
};

const getStatusColor = (statusName: string) => {
  switch (statusName) {
    case "Screening":
    case "Under Review":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "HR Interview":
    case "Interview Scheduled":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Offer Sent":
    case "Offer Extended":
    case "Offer Accepted":
      return "bg-green-100 text-green-800 border-green-200";
    case "Rejected":
    case "CV Rejected":
    case "Interview Rejected":
      return "bg-red-100 text-red-800 border-red-200";
    case "Candidate Withdrawn":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "Hired":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (statusName: string) => {
  switch (statusName) {
    case "Screening":
    case "Under Review":
      return <ClockIcon className="h-4 w-4" />;
    case "HR Interview":
    case "Interview Scheduled":
      return <UserIcon className="h-4 w-4" />;
    case "Offer Sent":
    case "Offer Extended":
    case "Offer Accepted":
      return <HandshakeIcon className="h-4 w-4" />;
    case "Rejected":
    case "CV Rejected":
    case "Interview Rejected":
    case "Candidate Withdrawn":
      return <XCircleIcon className="h-4 w-4" />;
    default:
      return <FileTextIcon className="h-4 w-4" />;
  }
};

const ApplicationStatusBadge = ({ application }: { application: TApplication }) => {
  const { data: statusList } = useGetStatusListQuery();
  
  const getStatusName = () => {
    if (application.status_id !== undefined && application.status_id !== null) {
      if (statusList && statusList.length > 0) {
        const status = statusList.find(s => s.id === application.status_id);
        if (status) {
          return status.status;
        }
      }
      if (application.status_id === 17) {
        return "Candidate Withdrawn";
      }
    }
    
    return application.stage || "Applied";
  };
  
  const statusName = getStatusName();
  
  return (
    <Badge variant="secondary" className={getStatusColor(statusName)}>
      {getStatusIcon(statusName)}
      <span className="ml-1">{statusName}</span>
    </Badge>
  );
};

export const columns: ColumnDef<TApplication>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <Card>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex items-start space-x-4 flex-1">
               
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {data.job.title}
                    </h3>
                
                  </div>

                  <div className="flex items-center text-gray-600 space-x-4 mb-3">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{data.job.location}</span>
                    </div>
                    {(data.job.salary_min || data.job.salary_max) && (
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          {data.job.salary_min} - {data.job.salary_max}{" "}
                          {data.job.salary_currency}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        Applied {new Date(data.applied_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <CoverLetterDisplay coverLetter={data.cover_letter} />

                  <div className="flex justify-start gap-2">
                    <Link
                      href={`/user/candidate-portal?application_id=${data.id}`}
                    >
                      <Button variant="default" size="sm" className="gap-2">
                        View Application Portal
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <ApplicationStatusBadge application={data} />
                  </div>
                </div>
              </div>
              {(data.score !== null && data.score !== undefined) && (
                <MatchCard
                  score={data.score}
                  title={data.match_level ?? ""}
                  matching_skills={data.matching_skills ?? []}
                  missing_skills={data.missing_skills ?? []}
                  recommendation={data.recommendation}
                />
              )}
            </div>
          </CardContent>
        </Card>
      );
    },
  },
];
