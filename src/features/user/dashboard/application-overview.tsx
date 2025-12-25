"use client";

import {
  TbFileText,
  TbActivity,
  TbUsers,
  TbTrendingUp
} from "react-icons/tb";
import { useGetApplicationSummaryQuery } from '~/apis/dashboard-candidate/queries';
import { MetricCard } from './metric-card';
import { Skeleton } from '~/components/ui/skeleton';

export const ApplicationOverview = () => {
  const { data: applicationSummaryData, isLoading } = useGetApplicationSummaryQuery();

  const { total_applications, active_applications, interviews, response_rate } = applicationSummaryData?.data || {};

  const metricsData = [
    {
      title: "Total Applications",
      value: total_applications?.count || 0,
      icon: TbFileText,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      change: total_applications?.change_percent !== null && total_applications?.change_percent !== undefined
        ? `${total_applications.change_percent}% from ${total_applications.comparison_period}`
        : undefined,
      trend: total_applications?.trend as "up" | "down" | undefined,
    },
    {
      title: "Active Applications",
      value: active_applications?.count || 0,
      icon: TbActivity,
      iconColor: "text-yellow-600",
      iconBg: "bg-yellow-50",
      change: active_applications?.change_percent !== null && active_applications?.change_percent !== undefined
        ? `${active_applications.change_percent}% from ${active_applications.comparison_period}`
        : undefined,
      trend: active_applications?.trend as "up" | "down" | undefined,
    },
    {
      title: "Interviews",
      value: interviews?.count || 0,
      icon: TbUsers,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50",
      change: interviews?.change_percent !== null && interviews?.change_percent !== undefined
        ? `${interviews.change_percent}% from ${interviews.comparison_period}`
        : undefined,
      trend: interviews?.trend as "up" | "down" | undefined,
    },
    {
      title: "Response Rate",
      value: `${response_rate?.value || 0}%`,
      icon: TbTrendingUp,
      iconColor: "text-teal-600",
      iconBg: "bg-teal-50",
      change: response_rate?.change_percent !== null && response_rate?.change_percent !== undefined
        ? `${response_rate.change_percent}% from ${response_rate.comparison_period}`
        : undefined,
      trend: response_rate?.trend as "up" | "down" | undefined,
    },
  ] as const;

  if (isLoading) {
    return <ApplicationOverviewSkeleton />;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 w-full overflow-x-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-0 sm:divide-x divide-gray-200 min-w-max sm:min-w-0">
        {metricsData.map((metric, idx) => (
          <MetricCard key={idx} {...metric} />
        ))}
      </div>
    </div>
  );
}

const ApplicationOverviewSkeleton = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 w-full overflow-x-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-0 sm:divide-x divide-gray-200 min-w-max sm:min-w-0">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-3 px-4 sm:px-6 first:pl-0 last:pr-0">
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