"use client";

import { useMemo } from "react";
import { useGetTopJobsQuery } from "~/apis/dashboard-hr/queries";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export const TopJobs = () => {
  const { data: topJobsData, isLoading, error } = useGetTopJobsQuery();
  const allJobs = topJobsData?.data || [];

  const topJobs = useMemo(() => {
    return allJobs
      .filter((job) => job.applications > 1)
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 5);
  }, [allJobs]);

  if (isLoading) {
    return <TopJobsSkeleton />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (topJobs.length === 0) {
    return (
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Top Performing Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No jobs with multiple applications found.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle>Top Performing Jobs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topJobs.map((job) => (
            <div
              key={job.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <h4 className="font-medium text-gray-900">{job.title}</h4>
                <p className="text-sm text-gray-500">{job.department}</p>
              </div>
              <div className="text-right">
                <div className="flex space-x-4 text-sm">
                  <span className="text-blue-600">
                    {job.applications} apps
                  </span>
                  <span className="text-purple-600">
                    {job.interviews} interviews
                  </span>
                  <span className="text-green-600">
                    {job.offers} offers
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const TopJobsSkeleton = () => {
  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <CardTitle className="text-gray-600">Top Performing Jobs</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="border rounded-xl p-3 hover:shadow-sm transition bg-white"
          >
            <div className="space-y-2">
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>

            <div className="flex items-center space-x-4 mt-3">
              <Skeleton className="h-3 w-14 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-3 w-12 rounded" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};