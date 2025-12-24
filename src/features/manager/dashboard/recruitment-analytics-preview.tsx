"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import { TbArrowRight } from "react-icons/tb";
import { useGetRecruitmentAnalyticsQuery } from "~/apis/dashboard-manager";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export const RecruitmentAnalyticsPreview = () => {
  const router = useRouter();
  const { data: apiResponse, isLoading } = useGetRecruitmentAnalyticsQuery();
  const data = apiResponse?.data || [];

  const activeJobs = data.filter((job) => job.tags === "active").length;
  const closedJobs = data.filter((job) => job.tags === "closed").length;
  const inactiveJobs = data.filter((job) => job.tags === "inactive").length;

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
            className="p-0 h-auto font-semibold text-base hover:underline"
            onClick={() => router.push("/manager/recruitments")}
          >
          Recruitment Analytics
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => router.push("/manager/recruitments")}
          >
            View All
            <TbArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {totalJobs > 0 ? (
          <div className="w-full">
            <Chart
              options={statusChartOptions}
              series={statusChartSeries}
              type="donut"
              height={300}
              width="100%"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

