"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import { TbArrowRight } from "react-icons/tb";
import { useGetRecruitersPerformanceQuery } from "~/apis/dashboard-manager";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const RecruitersPerformancePreview = () => {
  const router = useRouter();
  const { data: apiResponse, isLoading } = useGetRecruitersPerformanceQuery();
  const recruiters = apiResponse?.data?.recruiters || [];

  const sortedRecruiters = [...recruiters].sort((a, b) => b.no_of_leads - a.no_of_leads).slice(0, 5);

  const chartData = sortedRecruiters.map((r) => ({
    name: r.recruiter,
    Leads: r.no_of_leads,
    "HR Screening": r.hr_screening,
  }));

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
            onClick={() => router.push("/manager/performance")}
          >
            Recruiters Performance
          </Button>
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => router.push("/manager/performance")}>
            View All
            <TbArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-[300px]">
        {recruiters.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 48 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-35} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Leads" fill="#c4b5fd" radius={[2, 2, 0, 0]} />
              <Bar dataKey="HR Screening" fill="#a78bfa" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-gray-500">No data available</div>
        )}
      </CardContent>
    </Card>
  );
};
