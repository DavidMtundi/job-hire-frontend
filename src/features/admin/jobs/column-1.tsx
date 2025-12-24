"use client"

import { ColumnDef } from "@tanstack/react-table";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Eye,
  BriefcaseIcon,
  MapPin,
  MoreHorizontal,
  Users,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { TJob } from "~/apis/jobs/schemas";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { JobCard } from "./job-card";


const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "paused":
      return "bg-yellow-100 text-yellow-800";
    case "closed":
      return "bg-red-100 text-red-800";
    case "draft":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <CheckCircle className="h-3 w-3" />;
    case "paused":
      return <AlertCircle className="h-3 w-3" />;
    case "closed":
      return <XCircle className="h-3 w-3" />;
    case "draft":
      return <Clock className="h-3 w-3" />;
    default:
      return <Clock className="h-3 w-3" />;
  }
};

const getPriorityColor = (priority: string) => {
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
};


export const columns1: ColumnDef<TJob>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      const job = row.original;
      return (
        <JobCard job={job} />
      )
    }
  },
]