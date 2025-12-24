"use client";

import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import { useRouter } from "next/navigation";
import { useUrlFilter } from "~/hooks/useFilters";
import { FilterGroup, FilterItem } from "~/components/filters/FilterGroup";
import { useEffect, useMemo, useState } from "react";
import debounce from "lodash.debounce";
import { useGetJobsQuery } from "~/apis/jobs/queries";
import { JobsSkeleton } from "./jobs-skeleton";
import { DataList } from "~/components/data-list";
import { DataTablePagination } from "~/components/data-table-pagination";
import { columns } from "./columns";

type JobFilters = {
  search?: string;
  location?: string;
  job_type?: string;
};

export const ListJob = () => {
  const { filters, setFilters } = useUrlFilter<JobFilters>();
  const [searchValue, setSearchValue] = useState(filters.search ?? "");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const jobsQuery = useGetJobsQuery({
    page: currentPage,
    page_size: pageSize,
    search: searchValue ?? "",
    status: "active",
    ...(filters.job_type && { job_type: filters.job_type }),
  });
  

  // console.log("Jobs", jobsQuery.data);

  const filteredJobs = jobsQuery.data?.data ?? [];
  const pagination = jobsQuery.data?.pagination;

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.job_type]);

  const debouncedSetSearch = useMemo(
    () =>
      debounce((value: string) => {
        setFilters((prev) => ({
          ...prev,
          search: value || undefined,
        }));
      }, 200),
    [setFilters]
  );


  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [debouncedSetSearch]);

  const filterItems: FilterItem[] = [
    {
      label: "Job Type",
      value: filters.job_type ?? "all",
      width: "w-40",
      options: [
        { label: "All Types", value: "all" },
        { label: "Full time", value: "full_time" },
        { label: "Contract", value: "contract" },
        { label: "Part-time", value: "part_time" },
      ],
      onChange: (value: string) =>
        setFilters((prev) => ({
          ...prev,
          job_type: value === "all" ? undefined : value,
        })),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search jobs..."
              value={filters.search ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                setSearchValue(val);
                debouncedSetSearch(val);
              }}
              className="pl-10"
            />
          </div>
        </div>
        <FilterGroup filters={filterItems} />
      </div>

      {/* Job Count */}
      <p className="text-gray-600">
        {pagination?.total_counts ?? 0} job
        {(pagination?.total_counts ?? 0) !== 1 ? "s" : ""} found
      </p>

      {/* Jobs List */}
      <div className="grid gap-6">
        {jobsQuery.isLoading ? (
          <JobsSkeleton />
        ) : filteredJobs && filteredJobs.length > 0 ? (
          <div>
            <DataList data={filteredJobs} columns={columns} disablePagination />
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
            <p className="text-gray-500 text-lg">
              No jobs found matching your criteria.
            </p>
            <p className="text-gray-400 mt-2">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
