"use client";

import {
  Briefcase,
  Search
} from "lucide-react";
import { useEffect, useState } from "react";
import { useGetJobsQuery } from "~/apis/jobs/queries";
import { DataList } from "~/components/data-list";
import { DataTablePagination } from "~/components/data-table-pagination";
import { FilterGroup } from "~/components/filters/FilterGroup";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useUrlFilter } from "~/hooks/useFilters";
import { columns1 } from "./column-1";
import { JobList } from "./job-list";

interface JobFilters {
  status: string;
  job_type: string;
  [key: string]: string;
}

export const ListJob = () => {
  const { filters, setFilters } = useUrlFilter<JobFilters>();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const pageSize = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchInput.trim() === "" ? undefined : searchInput,
      }));
    }, 500); 
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: jobs, isLoading, isError, refetch } = useGetJobsQuery({
    page: currentPage,
    page_size: pageSize,
    search: filters.search ?? "",
    ...(filters.status && filters.status !== "all" && { status: filters.status }),
    ...(filters.job_type && filters.job_type !== "all" && { job_type: filters.job_type }),
  });

  const { data: allJobsData } = useGetJobsQuery({ page: 1, page_size: 1 });
  const { data: activeJobsData } = useGetJobsQuery({ page: 1, page_size: 1, status: "active" });
  const { data: inactiveJobsData } = useGetJobsQuery({ page: 1, page_size: 1, status: "inactive" });
  const { data: closedJobsData } = useGetJobsQuery({ page: 1, page_size: 1, status: "closed" });
  const { data: draftJobsData } = useGetJobsQuery({ page: 1, page_size: 1, status: "draft" });

  const jobsData = jobs?.data ?? [];
  const pagination = jobs?.pagination;

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.status, filters.job_type]);

  const statusCounts = {
    all: allJobsData?.pagination?.total_counts || 0,
    active: activeJobsData?.pagination?.total_counts || 0,
    inactive: inactiveJobsData?.pagination?.total_counts || 0,
    closed: closedJobsData?.pagination?.total_counts || 0,
    draft: draftJobsData?.pagination?.total_counts || 0,
  };

  // console.log("Filtered Jobs:", filteredJobs);

  const filtersOptions = [
    {
      label: "Status",
      value: filters.status ?? "all",
      onChange: (val: string) =>
        setFilters((prev) => ({
          ...prev,
          status: val === "all" ? undefined : val,
        })),
      options: [
        { label: "All Status", value: "all" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Closed", value: "closed" },
        { label: "Draft", value: "draft" },
      ],
    },
    {
      label: "Job Type",
      value: filters.job_type ?? "all",
      onChange: (val: string) =>
        setFilters((prev) => ({
          ...prev,
          job_type: val === "all" ? undefined : val,
        })),
      options: [
        { label: "All Types", value: "all" },
        { label: "Full Time", value: "full_time" },
        { label: "Part Time", value: "part_time" },
        { label: "Internship", value: "internship" },
        { label: "Contract", value: "contract" },
        { label: "Temporary", value: "temporary" },
      ],
    },
  ];


  return (
    <div className="space-y-6">
      {/* Filters */}
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search jobs by title, department, or location..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <FilterGroup filters={filtersOptions} />
          </div>
        </CardContent>
     

      <Card className="bg-white shadow-lg">
        <CardContent className="p-0">
          <Tabs
            value={filters.status ?? "all"}
            onValueChange={(val) =>
              setFilters((prev) => ({ ...prev, status: val }))
            }
            className="w-full"
          >
         

            <div className="p-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading jobs...</p>
                </div>
              ) : jobsData.length > 0 ? (
                <div>
                  <DataList columns={columns1} data={jobsData} disablePagination />
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
                  <div className="text-gray-400 mb-4">
                    <Briefcase className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No jobs found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search criteria or create a new job.
                  </p>
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}