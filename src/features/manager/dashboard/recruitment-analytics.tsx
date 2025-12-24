"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { DataTable } from "~/components/data-table";
import { DataTablePagination } from "~/components/data-table-pagination";
import { Skeleton } from "~/components/ui/skeleton";
import { format } from "date-fns";
import { useState, useMemo } from "react";
import { useGetRecruitmentAnalyticsQuery } from "~/apis/dashboard-manager";
import { TRecruitmentAnalyticsItem } from "~/apis/dashboard-manager/dto";
import {
  TbBriefcase,
  TbCheck,
  TbUserCheck,
  TbClock
} from "react-icons/tb";
import { MetricCard } from "./metric-card";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export const RecruitmentAnalytics = () => {
  const { data: apiResponse, isLoading } = useGetRecruitmentAnalyticsQuery();
  const allData = apiResponse?.data || [];
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Calculate pagination
  const totalCount = allData.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = useMemo(() => {
    return allData.slice(startIndex, endIndex);
  }, [allData, startIndex, endIndex]);

  const totalJobs = allData.length;
  const activeJobs = allData.filter((job) => job.tags === "active").length;
  const closedJobs = allData.filter((job) => job.tags === "closed").length;
  const inactiveJobs = allData.filter((job) => job.tags === "inactive").length;
  const totalHired = allData.reduce((sum, job) => sum + job.total_hired, 0);
  const avgTimeToFill =
    allData
      .filter((job) => job.time_to_fill_days !== null)
      .reduce((sum, job) => sum + (job.time_to_fill_days || 0), 0) /
    allData.filter((job) => job.time_to_fill_days !== null).length || 0;

  const statusChartOptions: ApexOptions = {
    chart: {
      type: "donut",
      height: 350,
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    labels: ["Active", "Closed", "Inactive"],
    colors: ["#10b981", "#3b82f6", "#6b7280"],
    legend: {
      position: "bottom",
      fontSize: "12px",
      markers: {
        size: 8,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
      style: {
        fontSize: "12px",
        fontWeight: 600,
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} jobs`,
      },
      theme: "light",
    },
    plotOptions: {
      pie: {
        donut: {
          size: "60%",
        },
      },
    },
  };

  const statusChartSeries = [activeJobs, closedJobs, inactiveJobs];

  const columns: ColumnDef<TRecruitmentAnalyticsItem>[] = [
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("role")}</div>
      ),
    },
    {
      accessorKey: "requisition_request_date",
      header: "Requisition Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("requisition_request_date"));
        return <div>{format(date, "MMM dd, yyyy")}</div>;
      },
    },
    {
      accessorKey: "date_filled",
      header: "Date Filled",
      cell: ({ row }) => {
        const dateFilled = row.getValue("date_filled") as string | null;
        return (
          <div>{dateFilled ? format(new Date(dateFilled), "MMM dd, yyyy") : "-"}</div>
        );
      },
    },
    {
      accessorKey: "time_to_fill_days",
      header: "Time to Fill (Days)",
      cell: ({ row }) => {
        const days = row.getValue("time_to_fill_days") as number | null;
        return (
          <div className="font-medium">
            {days !== null ? `${days} days` : "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "total_offer_made",
      header: "Offers Made",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("total_offer_made")}</div>
      ),
    },
    {
      accessorKey: "total_hired",
      header: "Hired",
      cell: ({ row }) => (
        <div className="text-center font-semibold text-green-600">
          {row.getValue("total_hired")}
        </div>
      ),
    },
    {
      accessorKey: "offer_accepted",
      header: "Accepted",
      cell: ({ row }) => (
        <div className="text-center text-green-600">
          {row.getValue("offer_accepted")}
        </div>
      ),
    },
    {
      accessorKey: "offer_rejected",
      header: "Rejected",
      cell: ({ row }) => (
        <div className="text-center text-red-600">
          {row.getValue("offer_rejected")}
        </div>
      ),
    },
    {
      accessorKey: "tags",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("tags") as string;
        const variant =
          status === "active"
            ? "default"
            : status === "closed"
            ? "secondary"
            : "outline";
        const colorClass =
          status === "active"
            ? "bg-green-100 text-green-800 border-green-200"
            : status === "closed"
            ? "bg-blue-100 text-blue-800 border-blue-200"
            : "bg-gray-100 text-gray-800 border-gray-200";

        return (
          <Badge variant="outline" className={colorClass}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-4 divide-x divide-gray-200">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-4 divide-x divide-gray-200">
          <MetricCard
            title="Total Jobs"
            value={totalJobs}
            icon={TbBriefcase}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
          <MetricCard
            title="Active Jobs"
            value={activeJobs}
            icon={TbCheck}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
          />
          <MetricCard
            title="Total Hired"
            value={totalHired}
            icon={TbUserCheck}
            iconColor="text-teal-600"
            iconBg="bg-teal-50"
          />
          <MetricCard
            title="Avg. Time to Fill"
            value={avgTimeToFill > 0 ? `${avgTimeToFill.toFixed(1)} days` : "-"}
            icon={TbClock}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
          />
        </div>
      </div>


      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Recruitment Analytics Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedData.length > 0 ? (
            <div>
              <DataTable columns={columns} data={paginatedData} disablePagination />
              {totalCount > pageSize && (
                <DataTablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  pageSize={pageSize}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                  }}
                />
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No recruitment data available.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

