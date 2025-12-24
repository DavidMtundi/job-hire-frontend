"use client";

import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { useGetDepartmentsQuery } from "~/apis/departments/queries";
import { Input } from "~/components/ui/input";
import { CreateDepartmentModal } from "./create-department-modal";
import { DeleteDepartmentModal } from "./delete-department-modal";
import { DepartmentDetailsModal } from "./department-details-modal";
import { ListDepartments } from "./list-departments";
import { UpdateDepartmentModal } from "./update-department-modal";

export default function DepartmentsScreen() {
  const [searchTerm, setSearchTerm] = useState("");

  const search = searchTerm?.trim().toLowerCase() || "";

  const { data, isLoading, isError } = useGetDepartmentsQuery();
  const departments = data?.data ?? [];

  const filteredDepartments = departments.filter((department) => {
    const name = department.name?.toLowerCase() || "";
    const description = department.description?.toLowerCase() || "";
    const totalJobs = department.total_jobs?.toString() || "";

    const matchesSearch =
      !search ||
      name.includes(search) ||
      description.includes(search) ||
      totalJobs.includes(search);

    return matchesSearch;
  });


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative max-w-md w-full">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search departments by name, description, or total jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <CreateDepartmentModal />
      </div>



      <ListDepartments departments={filteredDepartments} isLoading={isLoading} isError={isError} />

      <DepartmentDetailsModal />
      <UpdateDepartmentModal />
      <DeleteDepartmentModal />
    </div>
  );
}