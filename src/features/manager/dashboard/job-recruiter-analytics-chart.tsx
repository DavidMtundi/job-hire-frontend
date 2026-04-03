"use client";

import { useState } from "react";
import { useGetJobAnalyticsQuery, useGetRecruiterAnalyticsQuery } from "~/apis/dashboard-manager";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type TabType = "job" | "recruiter";

export const JobRecruiterAnalyticsChart = () => {
  const [activeTab, setActiveTab] = useState<TabType>("job");
  const { data: jobData, isLoading: jobLoading } = useGetJobAnalyticsQuery();
  const { data: recruiterData, isLoading: recruiterLoading } = useGetRecruiterAnalyticsQuery();

  const isLoading = activeTab === "job" ? jobLoading : recruiterLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64" />
        </CardContent>
      </Card>
    );
  }

  const jobChartData = jobData?.data;
  const recruiterChartData = recruiterData?.data;

  const chartData =
    activeTab === "job"
      ? jobChartData?.jobs.map((item) => ({
          name: item.title,
          Applied: item.applied_total,
          Shortlisted: item.shortlisted,
          Hired: item.hired,
        })) || []
      : recruiterChartData?.recruiters.map((item) => ({
          name: item.recruiter,
          "Total Applications": item.total_applications,
          Shortlisted: item.shortlisted,
          Hired: item.hired,
        })) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Analytics</CardTitle>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("job")}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                activeTab === "job" ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Job
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("recruiter")}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                activeTab === "recruiter" ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Recruiter
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            {activeTab === "job" ? (
              <>
                <Bar dataKey="Applied" fill="#46a5e5" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Shortlisted" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Hired" fill="#a10e83" radius={[2, 2, 0, 0]} />
              </>
            ) : (
              <>
                <Bar dataKey="Total Applications" fill="#46a5e5" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Shortlisted" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Hired" fill="#a10e83" radius={[2, 2, 0, 0]} />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
