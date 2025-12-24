"use client"

import { ColumnDef } from "@tanstack/react-table";
import { ShieldCheckIcon, ShieldIcon, ShieldXIcon, UserCheckIcon, UsersIcon, UserXIcon, MapPinIcon, PhoneIcon, MailIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { CellAction } from "./cell-action";
import { TCandidate } from "~/apis/candidates/schema";
import { TJob } from "~/apis/jobs/schemas";

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "inactive":
      return "bg-gray-100 text-gray-800";
    case "restricted":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <UserCheckIcon className="h-3 w-3" />;
    case "inactive":
      return <UserXIcon className="h-3 w-3" />;
    case "restricted":
      return <ShieldXIcon className="h-3 w-3" />;
    default:
      return <UsersIcon className="h-3 w-3" />;
  }
};

const getRoleIcon = (role: string) => {
  switch (role) {
    case "HR Manager":
    case "admin":
      return <ShieldCheckIcon className="h-4 w-4" />;
    case "recruiter":
    case "hiring_manager":
      return <ShieldIcon className="h-4 w-4" />;
    default:
      return <UsersIcon className="h-4 w-4" />;
  }
};


export const columns: ColumnDef<TJob>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-2">
          <span>{row.original.created_at}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => <CellAction data={row.original} />
  },
]