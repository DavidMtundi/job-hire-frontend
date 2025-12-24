"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { DataTable } from "~/components/data-table";
import { DataTablePagination } from "~/components/data-table-pagination";
import { Skeleton } from "~/components/ui/skeleton";
import { useState, useMemo } from "react";
import { useGetRecruitersPerformanceQuery } from "~/apis/dashboard-manager";
import { TRecruiterPerformanceItem } from "~/apis/dashboard-manager/dto";
import {
  TbUsers,
  TbUserSearch,
  TbUserCheck,
  TbCheck
} from "react-icons/tb";
import { MetricCard } from "./metric-card";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export const RecruitersPerformance = () => {
  const { data: apiResponse, isLoading } = useGetRecruitersPerformanceQuery();
  const allRecruiters = apiResponse?.data?.recruiters || [];
  const totalRecruiters = apiResponse?.data?.meta?.total_recruiters || 0;
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Calculate pagination
  const totalCount = allRecruiters.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRecruiters = useMemo(() => {
    return allRecruiters.slice(startIndex, endIndex);
  }, [allRecruiters, startIndex, endIndex]);

  const totalLeads = allRecruiters.reduce((sum, r) => sum + r.no_of_leads, 0);
  const totalHRScreening = allRecruiters.reduce((sum, r) => sum + r.hr_screening, 0);
  const totalOffersSent = allRecruiters.reduce((sum, r) => sum + r.no_of_offer_sent, 0);
  const totalOffersAccepted = allRecruiters.reduce((sum, r) => sum + r.no_of_offer_acceptance, 0);

  const recruiterNames = allRecruiters.map((r) => r.recruiter);
  const leadsData = allRecruiters.map((r) => r.no_of_leads);
  const hrScreeningData = allRecruiters.map((r) => r.hr_screening);
  const offersRejectedData = allRecruiters.map((r) => r.no_of_offer_rejected);
  const offersAcceptedData = allRecruiters.map((r) => r.no_of_offer_acceptance);

  const chartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        speed: 800,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "70%",
        borderRadius: 2,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: recruiterNames,
      labels: {
        style: {
          colors: "#9ca3af",
          fontSize: "11px",
        },
        rotate: -45,
        rotateAlways: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#9ca3af",
          fontSize: "11px",
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val: number) => val.toString(),
      },
      theme: "light",
    },
    legend: {
      position: "top",
      horizontalAlign: "center",
      fontSize: "12px",
      markers: {
        size: 8,
      },
      itemMargin: {
        horizontal: 12,
        vertical: 0,
      },
    },
    colors: ["#c4b5fd", "#a78bfa", "#8b5cf6", "#7c3aed", "#6d28d9"],
    grid: {
      borderColor: "#f3f4f6",
      strokeDashArray: 0,
      yaxis: {
        lines: {
          show: true,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
  };

  const chartSeries = [
    {
      name: "Leads",
      data: leadsData,
    },
    {
      name: "HR Screening",
      data: hrScreeningData,
    },
    {
      name: "Offers Rejected",
      data: offersRejectedData,
    },
    {
      name: "Offers Accepted",
      data: offersAcceptedData,
    },
  ];

  const columns: ColumnDef<TRecruiterPerformanceItem>[] = [
    {
      accessorKey: "recruiter",
      header: "Recruiter",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("recruiter")}</div>
      ),
    },
    {
      accessorKey: "no_of_leads",
      header: "Leads",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("no_of_leads")}</div>
      ),
    },
    {
      accessorKey: "hr_screening",
      header: "HR Screening",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("hr_screening")}</div>
      ),
    },
    {
      accessorKey: "passed_assessment",
      header: "Passed Assessment",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("passed_assessment")}</div>
      ),
    },
    {
      accessorKey: "technical_interview_stage",
      header: "Technical Interview",
      cell: ({ row }) => (
        <div className="text-center">{row.getValue("technical_interview_stage")}</div>
      ),
    },
    {
      accessorKey: "no_of_offer_sent",
      header: "Offers Sent",
      cell: ({ row }) => (
        <div className="text-center font-semibold text-blue-600">
          {row.getValue("no_of_offer_sent")}
        </div>
      ),
    },
    {
      accessorKey: "no_of_offer_acceptance",
      header: "Offers Accepted",
      cell: ({ row }) => (
        <div className="text-center text-green-600">
          {row.getValue("no_of_offer_acceptance")}
        </div>
      ),
    },
    {
      accessorKey: "no_of_offer_rejected",
      header: "Offers Rejected",
      cell: ({ row }) => (
        <div className="text-center text-red-600">
          {row.getValue("no_of_offer_rejected")}
        </div>
      ),
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
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-4 divide-x divide-gray-200">
          <MetricCard
            title="Total Recruiters"
            value={totalRecruiters}
            icon={TbUsers}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
          <MetricCard
            title="Total Leads"
            value={totalLeads}
            icon={TbUserSearch}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
          />
          <MetricCard
            title="HR Screening"
            value={totalHRScreening}
            icon={TbUserCheck}
            iconColor="text-teal-600"
            iconBg="bg-teal-50"
          />
          <MetricCard
            title="Offers Accepted"
            value={totalOffersAccepted}
            icon={TbCheck}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Recruiters Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allRecruiters.length > 0 ? (
            <Chart
              options={chartOptions}
              series={chartSeries}
              type="bar"
              height={400}
            />
          ) : (
            <div className="flex items-center justify-center h-[400px] text-gray-500">
              No data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Recruiters Performance Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedRecruiters.length > 0 ? (
            <div>
              <DataTable columns={columns} data={paginatedRecruiters} disablePagination />
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
              <p className="text-gray-500">No recruiter data available.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

