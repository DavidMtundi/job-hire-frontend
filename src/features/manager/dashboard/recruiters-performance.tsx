"use client";

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
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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

  const performanceChartData = allRecruiters.map((r) => ({
    name: r.recruiter,
    Leads: r.no_of_leads,
    "HR Screening": r.hr_screening,
    "Offers Rejected": r.no_of_offer_rejected,
    "Offers Accepted": r.no_of_offer_acceptance,
  }));

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
        <div className="text-center font-semibold text-primary">
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
        <CardContent className="h-[400px]">
          {allRecruiters.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceChartData} margin={{ top: 8, right: 8, left: 8, bottom: 48 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-35} textAnchor="end" height={70} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Leads" fill="#46a5e5" radius={[2, 2, 0, 0]} />
                <Bar dataKey="HR Screening" fill="#179bd7" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Offers Rejected" fill="#a10e83" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Offers Accepted" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[400px] items-center justify-center text-gray-500">No data available</div>
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

