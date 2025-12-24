"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { useGetJobAnalyticsQuery, useGetRecruiterAnalyticsQuery } from '~/apis/dashboard-manager';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type TabType = 'job' | 'recruiter';

export const JobRecruiterAnalyticsChart = () => {
  const [activeTab, setActiveTab] = useState<TabType>('job');
  const { data: jobData, isLoading: jobLoading } = useGetJobAnalyticsQuery();
  const { data: recruiterData, isLoading: recruiterLoading } = useGetRecruiterAnalyticsQuery();

  const isLoading = activeTab === 'job' ? jobLoading : recruiterLoading;

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

  const categories = activeTab === 'job'
    ? jobChartData?.jobs.map((item) => item.title) || []
    : recruiterChartData?.recruiters.map((item) => item.recruiter) || [];

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
    fill: {
      opacity: 1,
      colors: ['#c4b5fd', '#a78bfa', '#8b5cf6'],
    },
    xaxis: {
      categories: categories,
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

  const series = activeTab === 'job'
    ? [
        {
          name: 'Applied',
          data: jobChartData?.jobs.map((item) => item.applied_total) || [],
        },
        {
          name: 'Shortlisted',
          data: jobChartData?.jobs.map((item) => item.shortlisted) || [],
        },
        {
          name: 'Hired',
          data: jobChartData?.jobs.map((item) => item.hired) || [],
        },
      ]
    : [
        {
          name: 'Total Applications',
          data: recruiterChartData?.recruiters.map((item) => item.total_applications) || [],
        },
        {
          name: 'Shortlisted',
          data: recruiterChartData?.recruiters.map((item) => item.shortlisted) || [],
        },
        {
          name: 'Hired',
          data: recruiterChartData?.recruiters.map((item) => item.hired) || [],
        },
      ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Analytics</CardTitle>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('job')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'job'
                  ? 'bg-blue-950 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Job
            </button>
            <button
              onClick={() => setActiveTab('recruiter')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'recruiter'
                  ? 'bg-blue-950 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Recruiter
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Chart options={options} series={series} type="bar" height={300} />
      </CardContent>
    </Card>
  );
};
