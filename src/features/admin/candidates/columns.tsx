"use client"

import { ColumnDef } from "@tanstack/react-table";
import { ShieldCheckIcon, ShieldIcon, ShieldXIcon, UserCheckIcon, UsersIcon, UserXIcon, MapPinIcon, PhoneIcon, MailIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { CellAction } from "./cell-action";
import { TCandidate } from "~/apis/candidates/schema";

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


export const columns: ColumnDef<TCandidate>[] = [
  {
    accessorKey: "first_name",
    header: "Candidate Name",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2 max-w-[240px]">
          <Avatar className="size-8 shrink-0">
            <AvatarImage src={""} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {row.original.first_name.charAt(0)}{row.original.last_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <div className="font-medium text-sm text-gray-900 truncate">
              {row.original.first_name} {row.original.last_name}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 truncate">
              <MailIcon className="size-3 shrink-0" />
              <span className="truncate">{row.original.email}</span>
            </div>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: "current_position",
    header: "Position",
    cell: ({ row }) => (
      <div className="max-w-[140px]">
        <span className="text-sm text-gray-900 truncate block">{row.original.current_position}</span>
      </div>
    )
  },
  {
    accessorKey: "years_experience",
    header: "Exp.",
    cell: ({ row }) => (
      <div>
        <span className="text-sm text-gray-900">{row.original.years_experience}y</span>
      </div>
    )
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1 max-w-[180px]">
        <div className="flex items-center gap-1 text-xs text-gray-600 truncate">
          <MapPinIcon className="size-3 shrink-0 text-gray-400" />
          <span className="truncate">{row.original.address}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-600 truncate">
          <PhoneIcon className="size-3 shrink-0 text-gray-400" />
          <span className="truncate">{row.original.phone}</span>
        </div>
      </div>
    )
  },
  {
    accessorKey: "created_at",
    header: "Joined",
    cell: ({ row }) => {
      const dateStr = row.original.created_at || "";

      if (!dateStr) {
        return <span className="text-xs text-gray-600">-</span>;
      }

      try {
        const date = new Date(dateStr);
        const formattedDate = !isNaN(date.getTime())
          ? date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: '2-digit'
            })
          : dateStr.split('T')[0];

        return <span className="text-xs text-gray-600 whitespace-nowrap">{formattedDate}</span>;
      } catch (error) {
        return <span className="text-xs text-gray-600">-</span>;
      }
    }
  },
  {
    accessorKey: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <CellAction data={row.original} />
      </div>
    )
  },
]