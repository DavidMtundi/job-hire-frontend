"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import { TbArrowRight } from "react-icons/tb";
import { useGetRecruitersPerformanceQuery } from "~/apis/dashboard-manager";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export const RecruitersPerformancePreview = () => {
  const router = useRouter();
  const { data: apiResponse, isLoading } = useGetRecruitersPerformanceQuery();
  const recruiters = apiResponse?.data?.recruiters || [];

  const sortedRecruiters = [...recruiters]
    .sort((a, b) => b.no_of_leads - a.no_of_leads)
    .slice(0, 5); 

  const recruiterNames = sortedRecruiters.map((r) => r.recruiter);
  const leadsData = sortedRecruiters.map((r) => r.no_of_leads);
  const hrScreeningData = sortedRecruiters.map((r) => r.hr_screening);

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
      colors: ["#c4b5fd", "#a78bfa"],
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
    colors: ["#c4b5fd", "#a78bfa"],
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
  ];

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
            onClick={() => router.push("/manager/performance")}
          >
            Recruiters Performance
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => router.push("/manager/performance")}
          >
            View All
            <TbArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recruiters.length > 0 ? (
          <div className="w-full">
            <Chart
              options={chartOptions}
              series={chartSeries}
              type="bar"
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

