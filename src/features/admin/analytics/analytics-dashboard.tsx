"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import {
  useGetAnalyticsSummaryQuery,
  useGetTimeToFillQuery,
  useGetSourceOfHireQuery,
  useGetPipelineHealthQuery,
  useGetRecruiterPerformanceQuery,
  useGetConversionFunnelQuery,
} from "~/apis/analytics/queries";
import { Loader2, TrendingUp, TrendingDown, Clock, DollarSign, Users, BarChart3, Download } from "lucide-react";
import { format } from "date-fns";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface AnalyticsFilters {
  start_date?: string;
  end_date?: string;
  department_id?: string;
  recruiter_id?: string;
}

export default function AnalyticsDashboard() {
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [dateRange, setDateRange] = useState({
    start: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  });

  const { data: summaryData, isLoading, error } = useGetAnalyticsSummaryQuery({
    ...filters,
    start_date: dateRange.start,
    end_date: dateRange.end,
  });

  const handleDateChange = (type: "start" | "end", value: string) => {
    setDateRange((prev) => ({ ...prev, [type]: value }));
  };

  const handleFilterChange = (key: keyof AnalyticsFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    const errorMessage = (error as any)?.response?.data?.detail || (error as any)?.message || "Failed to load analytics data";
    const isPermissionError = (error as any)?.response?.status === 403;
    
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Analytics</CardTitle>
            <CardDescription>
              {isPermissionError 
                ? "You don't have permission to view analytics. Please contact your administrator."
                : errorMessage}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const summary = summaryData?.data;
  const timeToFill = summary?.time_to_fill;
  const sourceOfHire = summary?.source_of_hire;
  const costPerHire = summary?.cost_per_hire;
  const pipelineHealth = summary?.pipeline_health || [];
  const recruiterPerformance = summary?.recruiter_performance || [];
  const conversionFunnel = summary?.conversion_funnel || [];

  // Chart data for Pipeline Health
  const pipelineChartOptions = {
    chart: {
      type: "bar" as const,
      height: 350,
    },
    xaxis: {
      categories: pipelineHealth.map((item) => item.stage),
    },
    yaxis: {
      title: {
        text: "Count",
      },
    },
    colors: ["#3b82f6"],
    dataLabels: {
      enabled: true,
    },
  };

  const pipelineChartSeries = [
    {
      name: "Applications",
      data: pipelineHealth.map((item) => item.count),
    },
  ];

  // Chart data for Source of Hire
  const sourceChartOptions = {
    chart: {
      type: "pie" as const,
      height: 350,
    },
    labels: sourceOfHire?.data?.map((item) => item.source) || [],
    colors: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"],
    legend: {
      position: "bottom" as const,
    },
  };

  const sourceChartSeries = sourceOfHire?.data?.map((item) => item.total_hired) || [];

  // Chart data for Conversion Funnel
  const funnelChartOptions = {
    chart: {
      type: "bar" as const,
      height: 400,
    },
    xaxis: {
      categories: conversionFunnel.map((item) => item.stage),
    },
    yaxis: {
      title: {
        text: "Count",
      },
    },
    colors: ["#06b6d4"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
      },
    },
  };

  const funnelChartSeries = [
    {
      name: "Count",
      data: conversionFunnel.map((item) => item.count),
    },
    {
      name: "Conversion Rate",
      data: conversionFunnel.map((item) => item.conversion_rate_percent || 0),
      type: "line" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive HR recruitment analytics</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => handleDateChange("start", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => handleDateChange("end", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={filters.department_id || undefined} onValueChange={(v) => handleFilterChange("department_id", v)}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  {/* TODO: Populate from departments API */}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="recruiter">Recruiter</Label>
              <Select value={filters.recruiter_id || undefined} onValueChange={(v) => handleFilterChange("recruiter_id", v)}>
                <SelectTrigger id="recruiter">
                  <SelectValue placeholder="All Recruiters" />
                </SelectTrigger>
                <SelectContent>
                  {/* TODO: Populate from recruiters API */}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Time to Fill</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timeToFill?.summary?.avg_time_to_fill_days
                ? `${Math.round(timeToFill.summary.avg_time_to_fill_days)} days`
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {timeToFill?.summary?.filled_jobs || 0} jobs filled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hired</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sourceOfHire?.summary?.total_hired || 0}</div>
            <p className="text-xs text-muted-foreground">
              From {sourceOfHire?.summary?.total_sources || 0} sources
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Cost per Hire</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${costPerHire?.summary?.avg_cost_per_hire?.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Total: ${costPerHire?.summary?.total_cost?.toFixed(2) || "0.00"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Health</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pipelineHealth.length}</div>
            <p className="text-xs text-muted-foreground">Active stages</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline Health</TabsTrigger>
          <TabsTrigger value="source">Source of Hire</TabsTrigger>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="recruiters">Recruiter Performance</TabsTrigger>
          <TabsTrigger value="time-to-fill">Time to Fill</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Health</CardTitle>
              <CardDescription>Applications by stage</CardDescription>
            </CardHeader>
            <CardContent>
              {pipelineHealth.length > 0 && Chart ? (
                <Chart
                  options={pipelineChartOptions}
                  series={pipelineChartSeries}
                  type="bar"
                  height={350}
                />
              ) : (
                <p className="text-center text-muted-foreground py-8">No data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="source" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Source of Hire</CardTitle>
              <CardDescription>Hires by source channel</CardDescription>
            </CardHeader>
            <CardContent>
              {sourceChartSeries.length > 0 && Chart ? (
                <Chart
                  options={sourceChartOptions}
                  series={sourceChartSeries}
                  type="pie"
                  height={350}
                />
              ) : (
                <p className="text-center text-muted-foreground py-8">No data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>Application flow through stages</CardDescription>
            </CardHeader>
            <CardContent>
              {conversionFunnel.length > 0 && Chart ? (
                <Chart
                  options={funnelChartOptions}
                  series={funnelChartSeries}
                  type="bar"
                  height={400}
                />
              ) : (
                <p className="text-center text-muted-foreground py-8">No data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recruiters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recruiter Performance</CardTitle>
              <CardDescription>Individual recruiter metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Recruiter</th>
                      <th className="text-right p-2">Applications</th>
                      <th className="text-right p-2">Hired</th>
                      <th className="text-right p-2">Hire Rate</th>
                      <th className="text-right p-2">Avg Time to Fill</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recruiterPerformance.map((recruiter) => (
                      <tr key={recruiter.recruiter_id} className="border-b">
                        <td className="p-2 font-medium">{recruiter.recruiter_name}</td>
                        <td className="p-2 text-right">{recruiter.total_applications}</td>
                        <td className="p-2 text-right">{recruiter.total_hired}</td>
                        <td className="p-2 text-right">
                          <Badge variant={recruiter.hire_rate_percent && recruiter.hire_rate_percent > 20 ? "default" : "secondary"}>
                            {recruiter.hire_rate_percent?.toFixed(1) || "0"}%
                          </Badge>
                        </td>
                        <td className="p-2 text-right">
                          {recruiter.avg_time_to_fill_days
                            ? `${Math.round(recruiter.avg_time_to_fill_days)} days`
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time-to-fill" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time to Fill</CardTitle>
              <CardDescription>Days to fill positions by job</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Job Title</th>
                      <th className="text-left p-2">Department</th>
                      <th className="text-right p-2">Time to Fill</th>
                      <th className="text-right p-2">Applications</th>
                      <th className="text-right p-2">Hired</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeToFill?.data?.slice(0, 20).map((job) => (
                      <tr key={job.job_id} className="border-b">
                        <td className="p-2 font-medium">{job.job_title}</td>
                        <td className="p-2">{job.department_name || "N/A"}</td>
                        <td className="p-2 text-right">
                          {job.time_to_fill_days
                            ? `${Math.round(job.time_to_fill_days)} days`
                            : "Not filled"}
                        </td>
                        <td className="p-2 text-right">{job.total_applications}</td>
                        <td className="p-2 text-right">{job.total_hired}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

