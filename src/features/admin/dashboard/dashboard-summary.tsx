"use client";

import {
  TbUsers,
  TbBriefcase,
  TbFileText,
  TbTarget
} from "react-icons/tb";
import { useGetOverviewSummaryQuery } from '~/apis/dashboard-hr/queries';
import { Skeleton } from '~/components/ui/skeleton';
import { MetricCard } from './metric-card';

export const DashboardSummary = () => {
  const { data: overviewSummaryData, isLoading, error } = useGetOverviewSummaryQuery();

  const { total_applicants, active_jobs, total_applications, hired_this_month } = overviewSummaryData?.data || {};

  const metricsData = [
    {
      title: "Total Applicants",
      value: total_applicants?.count || 0,
      icon: TbUsers,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      change: total_applicants?.change_percent ? `${total_applicants.change_percent}% from ${total_applicants.comparison_period || "last month"}` : undefined,
      trend: total_applicants?.trend as "up" | "down" | undefined,
    },
    {
      title: "Active Jobs",
      value: active_jobs?.count || 0,
      icon: TbBriefcase,
      iconColor: "text-yellow-600",
      iconBg: "bg-yellow-50",
      change: "Currently hiring",
    },
    {
      title: "Total Applications",
      value: total_applications?.count || 0,
      icon: TbFileText,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50",
      change: total_applications?.change_percent ? `${total_applications.change_percent}% from ${total_applications.comparison_period || "last month"}` : undefined,
      trend: total_applications?.trend as "up" | "down" | undefined,
    },
    {
      title: "Hired This Month",
      value: hired_this_month?.count || 0,
      icon: TbTarget,
      iconColor: "text-teal-600",
      iconBg: "bg-teal-50",
      change: hired_this_month?.change_percent ? `${hired_this_month.change_percent}% from ${hired_this_month.comparison_period || "last month"}` : undefined,
      trend: hired_this_month?.trend as "up" | "down" | undefined,
    },
  ] as const;

  if (isLoading) {
    return <DashboardSummarySkeleton />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <div className="grid grid-cols-4 divide-x divide-gray-200">
        {metricsData.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>
    </div>
  );
}

const DashboardSummarySkeleton = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <div className="grid grid-cols-4 divide-x divide-gray-200">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-3 px-6 first:pl-0 last:pr-0">
            <Skeleton className="size-10 rounded-lg" />
            <div className="flex flex-col gap-2">
              <Skeleton className="w-24 h-3" />
              <Skeleton className="w-16 h-6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}