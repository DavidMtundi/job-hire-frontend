"use client";

import { Award, CheckCircle, Clock, Eye, FileText, Users, XCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetRecentApplicationsQuery } from "~/apis/dashboard-hr/queries";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export const RecentApplications = () => {
  const router = useRouter();
  const { data: recentApplicationsData, isLoading, error } = useGetRecentApplicationsQuery();
  const recentApplications = recentApplicationsData?.data ?? [];
  // console.log("recentApplications", recentApplications);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "review":
        return "bg-yellow-100 text-yellow-800";
      case "interview":
        return "bg-blue-100 text-blue-800";
      case "offer":
        return "bg-purple-100 text-purple-800";
      case "hired":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "review":
        return <Clock className="h-3 w-3" />;
      case "interview":
        return <Eye className="h-3 w-3" />;
      case "offer":
        return <Award className="h-3 w-3" />;
      case "hired":
        return <CheckCircle className="h-3 w-3" />;
      case "rejected":
        return <XCircle className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  if (isLoading) {
    return <RecentApplicationsSkeleton />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Applications</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/applications")}
            className="flex items-center gap-2"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentApplications.map((application) => (
            <div
              key={application.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-gray-100 p-2 rounded-full">
                  <Users className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {application.applicant_name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {application.job_title}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {application.experience}
                  </p>
                  <p className="text-xs text-gray-400">
                    Applied{" "}
                    {new Date(application.applied_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={`${getStatusColor(application.status)} flex items-center space-x-1`}>
                  {getStatusIcon(application.status)}
                  <span className="capitalize">{application.status}</span>
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const RecentApplicationsSkeleton = () => {
  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <CardTitle className="text-gray-600">Recent Applications</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl p-3 hover:shadow-md transition border border-primary/10"
          >
            {/* Left Section: Avatar + Info */}
            <div className="flex items-center space-x-3">
              <Skeleton className="w-10 h-10 rounded-full" /> {/* Avatar */}
              <div className="space-y-1">
                <Skeleton className="h-4 w-32 rounded" /> {/* Name */}
                <Skeleton className="h-3 w-40 rounded" /> {/* Job title */}
              </div>
            </div>

            {/* Middle Section: Experience + Date */}
            <div className="text-right space-y-1">
              <Skeleton className="h-3 w-12 rounded ml-auto" /> {/* Years */}
              <Skeleton className="h-3 w-24 rounded ml-auto" /> {/* Applied Date */}
            </div>

            {/* Right Section: Status Badge */}
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};