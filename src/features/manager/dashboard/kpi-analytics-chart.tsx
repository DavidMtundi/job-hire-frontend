"use client";

import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { useGetKPIAnalyticsQuery } from '~/apis/dashboard-manager';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

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

  const chartData = data?.data ;
  const recruiterNames = chartData?.kpis.map((item) => item.recruiter) || [];

  const options: ApexOptions = {
    chart: {
      type: 'bar',
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
        columnWidth: '70%',
        borderRadius: 2,
        borderRadiusApplication: 'end',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: recruiterNames,
      labels: {
        style: {
          colors: '#9ca3af',
          fontSize: '11px',
        },
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
          colors: '#9ca3af',
          fontSize: '11px',
        },
      },
    },
    fill: {
      opacity: 1,
      colors: ['#c4b5fd', '#a78bfa', '#8b5cf6'],
    },
    tooltip: {
      y: {
        formatter: (val: number) => val.toString(),
      },
      theme: 'light',
    },
    legend: {
      position: 'top',
      horizontalAlign: 'center',
      fontSize: '12px',
      markers: {
        size: 8,
      },
      itemMargin: {
        horizontal: 12,
        vertical: 0,
      },
    },
    colors: ['#c4b5fd', '#a78bfa', '#8b5cf6'],
    grid: {
      borderColor: '#f3f4f6',
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

  const series = [
    {
      name: 'Offers Sent',
      data: chartData?.kpis.map((item) => item.offers_sent) || [],
    },
    {
      name: 'Offers Accepted',
      data: chartData?.kpis.map((item) => item.offers_accepted) || [],
    },
    {
      name: 'Offers Rejected',
      data: chartData?.kpis.map((item) => item.offers_rejected) || [],
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">KPI Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <Chart options={options} series={series} type="bar" height={300} />
      </CardContent>
    </Card>
  );
};
