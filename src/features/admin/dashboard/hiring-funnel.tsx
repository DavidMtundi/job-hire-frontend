"use client";

import { useGetHiringFunnelQuery } from "~/apis/dashboard-hr/queries";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Skeleton } from "~/components/ui/skeleton";

export const HiringFunnel = () => {

  const { data: hiringFunnelData, isLoading, error } = useGetHiringFunnelQuery();
  const hiringFunnel = hiringFunnelData?.data || [];
  // console.log("hiringFunnel", hiringFunnel);

  if (isLoading) {
    return <HiringFunnelSkeleton />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle>Hiring Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {hiringFunnel.map((stage, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  {stage.stage}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {stage.percentage}%
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {stage.count}
                  </span>
                </div>
              </div>
              <Progress value={stage.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const HiringFunnelSkeleton = () => {
  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <CardTitle className="text-gray-600">Hiring Funnel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20 rounded" /> {/* Label */}
              <Skeleton className="h-3 w-10 rounded" /> {/* Percentage */}
              <Skeleton className="h-3 w-8 rounded" /> {/* Count */}
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 relative overflow-hidden">
              <Skeleton className="absolute left-0 top-0 h-2 w-2/3 rounded-full" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};