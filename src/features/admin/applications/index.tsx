"use client";

import {
  CheckCircle,
  Clock,
  Eye,
  Search,
  Users,
  AlertCircle
} from "lucide-react";
import {
  TbUsers,
  TbClock,
  TbEye,
  TbCircleCheck
} from "react-icons/tb";
import { useState, useEffect } from "react";
import { useGetApplicationsQuery } from "~/apis/applications/queries";
import { useGetHiringFunnelQuery } from "~/apis/dashboard-hr/queries";
import { TApplicationStatus } from "~/apis/applications/schemas";
import { DataList } from "~/components/data-list";
import { DataTablePagination } from "~/components/data-table-pagination";
import { FilterGroup } from "~/components/filters/FilterGroup";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ApplicationDetailsModal } from "./application-details-modal";
import { columns } from "./columns";
import { DataTable } from "~/components/data-table";
import { Spinner } from "~/components/spinner";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { BulkActionsToolbar } from "./bulk-actions-toolbar";


interface ApplicationsFilters {
  [key: string]: string | undefined;
  search?: string;
  stage: string;
  department: string;
  priority: string;
}

export default function Applications() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ApplicationsFilters>({
    search: "",
    stage: "all",
    department: "all",
    priority: "all",
  });
  const pageSize = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchTerm.trim() === "" ? undefined : searchTerm,
      }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: applicationsData, isLoading, error } = useGetApplicationsQuery({
    page: currentPage,
    page_size: pageSize,
    search: filters.search ?? "",
    ...(filters.stage && filters.stage !== "all" && { stage: filters.stage as TApplicationStatus }),
  });

  const { data: hiringFunnelData } = useGetHiringFunnelQuery();

  // Handle backend response structure: { data: { items: [...], total_count, page, page_size } }
  const applications = applicationsData?.data?.items || [];
  const pagination = applicationsData?.data ? {
    page: applicationsData.data.page || currentPage,
    page_size: applicationsData.data.page_size || pageSize,
    total_counts: applicationsData.data.total_count || 0,
    total_pages: Math.ceil((applicationsData.data.total_count || 0) / (applicationsData.data.page_size || pageSize)),
  } : null;

  const hiringFunnel = hiringFunnelData?.data ?? [];

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.stage, filters.department, filters.priority]);

  const filterConfigs = [
    {
      label: "Status",
      value: filters.stage || "all",
      onChange: (val: string) =>
        setFilters((prev) => ({ ...prev, stage: val })),
      placeholder: "Filter by status",
      options: [
        { value: "all", label: "All Status" },
        { value: "Applied", label: "Applied" },
        { value: "Screening", label: "Screening" },
        { value: "In Review", label: "In Review" },
        { value: "HR Interview", label: "HR Interview" },
        { value: "Technical Interview", label: "Technical Interview" },
        { value: "Final Interview", label: "Final Interview" },
        { value: "Offer Sent", label: "Offer Sent" },
        { value: "Hired", label: "Hired" },
        { value: "Rejected", label: "Rejected" },
        { value: "Talent Pool", label: "Talent Pool" },
      ],
      className: "w-48",
    },
    // {
    //   label: "Department",
    //   value: filters.department || "all",
    //   onChange: (val: string) =>
    //     setFilters((prev) => ({ ...prev, department: val })),
    //   placeholder: "Filter by department",
    //   options: [
    //     { value: "all", label: "All Departments" },
    //     { value: "Engineering", label: "Engineering" },
    //     { value: "Product", label: "Product" },
    //     { value: "Design", label: "Design" },
    //     { value: "Analytics", label: "Analytics" },
    //   ],
    //   className: "w-48",
    // },
    {
      label: "Priority",
      value: filters.priority || "all",
      onChange: (val: string) =>
        setFilters((prev) => ({ ...prev, priority: val })),
      placeholder: "Filter by priority",
      options: [
        { value: "all", label: "All Priority" },
        { value: "high", label: "High" },
        { value: "medium", label: "Medium" },
        { value: "low", label: "Low" },
      ],
      className: "w-48",
    },
  ];


  const getFunnelCount = (stageName: string) => {
    const stage = hiringFunnel.find((s) => 
      s.stage.toLowerCase() === stageName.toLowerCase()
    );
    return stage?.count || 0;
  };

  const statsData = [
    {
      title: "Total Applications",
      value: getFunnelCount("Applications"),
      icon: TbUsers,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "In Review",
      value: getFunnelCount("Under review"),
      icon: TbClock,
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-600",
    },
    {
      title: "Interviews",
      value: getFunnelCount("Interview"),
      icon: TbEye,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Hired",
      value: getFunnelCount("Hired"),
      icon: TbCircleCheck,
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
    },
  ];

  const statusCounts = {
    all: getFunnelCount("Applications"),
    review: getFunnelCount("Under review"),
    interview: getFunnelCount("Interview"),
    offer: getFunnelCount("Offer"),
    hired: getFunnelCount("Hired"),
    rejected: 0, 
  };

  // Filter applications - handle missing/null fields gracefully
  const filteredApplications = applications.filter((application) => {
    // Department filter - handle missing job or department field
    const matchesDepartment =
      filters.department === "all" ||
      !filters.department ||
      !application.job || // If no job object, don't filter by department
      !application.job.department || // If no department field, don't filter by department
      application.job.department === filters.department;

    // Priority filter - handle missing/null priority field
    const matchesPriority =
      filters.priority === "all" ||
      !filters.priority ||
      !application.priority || // If no priority, only match when filter is "all"
      application.priority?.toLowerCase() === filters.priority?.toLowerCase();

    return matchesDepartment && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600">Track and manage job applications</p>
        </div>
        {/* <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div> */}
      </div>

      {/* Summary Cards */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-4 divide-x divide-gray-200">
          {statsData.map((stat, index) => (
            <div key={index} className="flex items-center gap-3 px-6 first:pl-0 last:pr-0">
              <div className={`${stat.iconBg} p-2.5 rounded-lg shrink-0`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div className="flex flex-col">
                <p className="text-xs font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>


      <Card className="border-none shadow-none p-0">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search applications by candidate, job title, or department..."
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
            <div className="flex flex-wrap gap-4 ">
              <FilterGroup filters={filterConfigs} />
            </div>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load applications. Please try again."}
          </AlertDescription>
        </Alert>
      ) : isLoading ? (
        <Spinner />
      ) : filteredApplications.length > 0 ? (
        <div className="space-y-4">
          <DataTableWithBulkActions 
            columns={columns} 
            data={filteredApplications} 
          />
          {pagination && (
            <DataTablePagination
              currentPage={currentPage}
              totalPages={pagination.total_pages}
              totalCount={pagination.total_counts}
              pageSize={pagination.page_size}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {applications.length > 0
              ? "No applications match the current filters. Try adjusting your search or filter criteria."
              : "No applications found"}
          </p>
          {applications.length > 0 && (
            <p className="text-sm text-gray-400 mt-2">
              Showing {filteredApplications.length} of {applications.length} applications
            </p>
          )}
        </div>
      )}

      <ApplicationDetailsModal />
    </div>
  );
}

// Wrapper component that integrates bulk actions with DataTable
function DataTableWithBulkActions({ columns, data }: { columns: any[]; data: any[] }) {
  const [tableInstance, setTableInstance] = useState<any>(null);

  return (
    <div className="space-y-4">
      {tableInstance && <BulkActionsToolbar table={tableInstance} />}
      <DataTable 
        columns={columns} 
        data={data} 
        disablePagination 
        onTableReady={setTableInstance}
      />
    </div>
  );
}
