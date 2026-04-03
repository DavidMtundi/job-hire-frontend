"use client";

import { useGetKPIAnalyticsQuery } from "~/apis/dashboard-manager";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const KPIAnalyticsChart = () => {
  const { data, isLoading } = useGetKPIAnalyticsQuery();

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

  const chartData =
    data?.data?.kpis.map((item) => ({
      recruiter: item.recruiter,
      "Offers Sent": item.offers_sent,
      "Offers Accepted": item.offers_accepted,
      "Offers Rejected": item.offers_rejected,
    })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">KPI Analytics</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="recruiter" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Offers Sent" fill="#46a5e5" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Offers Accepted" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            <Bar dataKey="Offers Rejected" fill="#a10e83" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
