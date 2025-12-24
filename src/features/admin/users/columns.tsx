"use client"

import { ColumnDef } from "@tanstack/react-table";
import { ShieldCheckIcon, ShieldIcon, ShieldXIcon, UserCheckIcon, UsersIcon, UserXIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { CellAction } from "./cell-action";
import { TUser } from "~/apis/users/schemas";

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


export const columns: ColumnDef<TUser>[] = [
  {
    accessorKey: "username",
    header: "User",
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-2 w-[200px]">
          <Avatar className="size-8">
            <AvatarImage src={""} />
            <AvatarFallback>
              {row.original.username
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-gray-900">{row.original.username}</div>
            <div className="text-sm text-gray-500">
              {row.original.email}
            </div>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-2">
          {getRoleIcon(row.original.role)}
          <span>{row.original.role}</span>
        </div>
      )
    }
  },
  // {
  //   accessorKey: "department",
  //   header: "Department",
  //   cell: ({ row }) => {
  //     return (
  //       <div className="flex items-center space-x-2">
  //         <span>{row.original.department}</span>
  //       </div>
  //     )
  //   }
  // },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => 
      <Badge 
        variant={row.original.is_active ? "default" : "destructive"}
      >
        {row.original.is_active ? "Active" : "Inactive"}
      </Badge>
  },
  // {
  //   accessorKey: "is_email_verified",
  //   header: "Is Email Verified",
  //   cell: ({ row }) => {
  //     return (
  //       <div className="flex items-center space-x-2">
  //         <span>{row.original.is_email_verified ? "Yes" : "No"}</span>
  //       </div>
  //     )
  //   }
  // },
  {
    accessorKey: "created_at",
    header: "Last Login",
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-2">
          <span>{row.original.created_at}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "performance",
    header: "Performance",
    cell: ({ row }) => {
      return (
        <div className="flex space-x-4 text-sm w-[100px]">
          <div className="text-center">
            <div className="font-medium text-blue-600">
              -
            </div>
            <div className="text-gray-500">Jobs</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-purple-600">
              -
            </div>
            <div className="text-gray-500">Reviews</div>
          </div>
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