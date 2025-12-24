"use client";

import {
  TbFileText,
  TbCalendar,
  TbUserCheck,
  TbUserX
} from "react-icons/tb";
import { useGetManagerOverviewSummaryQuery } from "~/apis/dashboard-manager";
import { Skeleton } from "~/components/ui/skeleton";
import { MetricCard } from "./metric-card";

export const DashboardOverview = () => {
  const { data, isLoading, error } = useGetManagerOverviewSummaryQuery();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const metrics = {
    total_applications: data?.data?.recruiters.reduce((sum, r) => sum + r.total_applications, 0) || 0,
    interview_scheduled: data?.data?.recruiters.reduce((sum, r) => sum + r.interview_scheduled, 0) || 0,
    hired_count: data?.data?.recruiters.reduce((sum, r) => sum + r.hired, 0) || 0,
    rejected_count: data?.data?.recruiters.reduce((sum, r) => sum + r.rejected, 0) || 0,
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <div className="grid grid-cols-4 divide-x divide-gray-200">
        <MetricCard
          title="Total Applications"
          value={metrics.total_applications}
          icon={TbFileText}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <MetricCard
          title="Interview Scheduled"
          value={`${metrics.interview_scheduled}%`}
          icon={TbCalendar}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <MetricCard
          title="Hired Count"
          value={metrics.hired_count}
          icon={TbUserCheck}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
        />
        <MetricCard
          title="Rejected Count"
          value={metrics.rejected_count}
          icon={TbUserX}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
      </div>
    </div>
  );
};
