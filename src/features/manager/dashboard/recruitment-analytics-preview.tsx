"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import { TbArrowRight } from "react-icons/tb";
import { useGetRecruitmentAnalyticsQuery } from "~/apis/dashboard-manager";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const STATUS_COLORS = ["#10b981", "#3b82f6", "#6b7280"];

export const RecruitmentAnalyticsPreview = () => {
  const router = useRouter();
  const { data: apiResponse, isLoading } = useGetRecruitmentAnalyticsQuery();
  const data = apiResponse?.data || [];

  const activeJobs = data.filter((job) => job.tags === "active").length;
  const closedJobs = data.filter((job) => job.tags === "closed").length;
  const inactiveJobs = data.filter((job) => job.tags === "inactive").length;

  const pieData = [
    { name: "Active", value: activeJobs },
    { name: "Closed", value: closedJobs },
    { name: "Inactive", value: inactiveJobs },
  ].filter((d) => d.value > 0);

  const totalJobs = activeJobs + closedJobs + inactiveJobs;

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="h-auto p-0 text-base font-semibold hover:underline"
            onClick={() => router.push("/manager/recruitments")}
          >
            Recruitment Analytics
          </Button>
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => router.push("/manager/recruitments")}>
            View All
            <TbArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-[300px]">
        {totalJobs > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
                label={({ name, percent }) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value} jobs`, "Count"]} />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-gray-500">No data available</div>
        )}
      </CardContent>
    </Card>
  );
};
