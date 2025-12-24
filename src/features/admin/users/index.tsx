"use client";

import { Search, ShieldX, UserCheck, Users, UserX } from "lucide-react";
import {
  TbUsers,
  TbUserCheck,
  TbShieldX,
  TbUserX
} from "react-icons/tb";
import { useState } from "react";
import { FilterGroup } from "~/components/filters/FilterGroup";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { MetricCard } from "~/components/metric-card";
import { useUrlFilter } from "~/hooks/useFilters";
import { useGetUsersQuery } from "~/apis/users/queries";
import { CreateUserModal } from "./create-user-modal";
import { DeleteUserModal } from "./delete-user-modal";
import { ListUsers } from "./list-users";
import { UpdateUserModal } from "./update-user-modal";
import { UserDetailsModal } from "./user-details-modal";

interface UserFilters {
  [key: string]: string;
  search: string;
  status: string;
  role: string;
}

export default function UsersScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const { filters, setFilters } = useUrlFilter<UserFilters>();

  const search = searchTerm?.trim().toLowerCase() || "";

  const { data, isLoading, isError } = useGetUsersQuery();
  const usersData = data?.data ?? [];

  const filteredUsers = usersData.filter((user) => {
    const name = user.username?.toLowerCase() || "";
    const email = user.email?.toLowerCase() || "";
    const role = user.role?.toLowerCase() || "";
    const status = user.is_active ? "active" : "inactive";

    const matchesSearch =
      !search ||
      name.includes(search) ||
      email.includes(search) ||
      role.includes(search);

    const matchesStatus =
      !filters.status ||
      filters.status === "all" ||
      status === filters.status;

    const matchesRole =
      !filters.role ||
      filters.role === "all" ||
      role === filters.role;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const statusCounts = {
    all: usersData.length,
    active: usersData.filter((u) => u.is_active === true).length,
    inactive: usersData.filter((u) => u.is_active === false).length,
    restricted: 0,
  };

  const userMetrics = [
    {
      title: "Total Users",
      value: usersData.length,
      icon: TbUsers,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
    },
    {
      title: "Active Users",
      value: statusCounts.active,
      icon: TbUserCheck,
      iconColor: "text-yellow-600",
      iconBg: "bg-yellow-50",
    },
    {
      title: "Restricted Users",
      value: statusCounts.restricted,
      icon: TbShieldX,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50",
    },
    {
      title: "Inactive Users",
      value: statusCounts.inactive,
      icon: TbUserX,
      iconColor: "text-teal-600",
      iconBg: "bg-teal-50",
    },
  ] as const;

  const filterConfigs = [
    {
      label: "Status",
      value: filters.status || "all",
      onChange: (val: string) => setFilters({ status: val }),
      placeholder: "Filter by status",
      options: [
        { value: "all", label: "All Status" },
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "restricted", label: "Restricted" },
      ],
      className: "w-48",
    },
    {
      label: "Role",
      value: filters.role || "all",
      onChange: (val: string) => setFilters({ role: val }),
      placeholder: "Filter by role",
      options: [
        { value: "all", label: "All Roles" },
        { value: "admin", label: "Admin" },
        { value: "hr", label: "HR Manager" },
        { value: "recruiter", label: "Recruiter" },
        { value: "hiring_manager", label: "Hiring Manager" },
        { value: "hr_assistant", label: "HR Assistant" },
      ],
      className: "w-48",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600">
            Manage user accounts, roles, and permissions
          </p>
        </div>

        <CreateUserModal />
      </div>

      {/* Summary Cards */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-4 divide-x divide-gray-200">
          {userMetrics.map((metric, index) => (
            <div key={index} className="flex items-center gap-3 px-6 first:pl-0 last:pr-0">
              <div className={`${metric.iconBg} p-2.5 rounded-lg shrink-0`}>
                <metric.icon className={`h-5 w-5 ${metric.iconColor}`} />
              </div>
              <div className="flex flex-col">
                <p className="text-xs font-medium text-gray-500">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{metric.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <FilterGroup filters={filterConfigs} />
          </div>
        </CardContent>
    

      <ListUsers usersData={filteredUsers} isLoading={isLoading} isError={isError} />

      <UserDetailsModal  />
      <UpdateUserModal />
      <DeleteUserModal />
    </div>
  );
}