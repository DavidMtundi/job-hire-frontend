import { useGetApplicationStatusSummaryQuery } from '~/apis/dashboard-candidate/queries';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { PieChart } from 'lucide-react';
import { Skeleton } from '~/components/ui/skeleton';


export const ApplicationStatus = () => {
  const { data: applicationStatusData, isLoading } = useGetApplicationStatusSummaryQuery();

  const statusData = applicationStatusData?.data?.status_summary || [];
  const totalApplications = statusData.reduce((acc, item) => acc + item.count, 0);

  const statusDistribution = [
    { status: "Pending", count: 6, color: "#fbbf24" },
    { status: "Interview", count: 3, color: "#3b82f6" },
    { status: "Accepted", count: 1, color: "#10b981" },
    { status: "Rejected", count: 5, color: "#ef4444" },
  ] as const;
  
  const statusColors: Record<string, string> = {
    Pending: "#FACC15", // yellow-400
    Shortlisted: "#60A5FA", // blue-400
    Interviewed: "#34D399", // green-400
    Rejected: "#F87171", // red-400
    Hired: "#4ADE80", // green-400
  }
  

  if (isLoading) {
    return <ApplicationStatusSkeleton />;
  }

  return (
    <Card className=" bg-white shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center">
          <PieChart className="h-5 w-5 mr-2" />
          Application Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statusData.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: statusColors[item.status] }}
                ></div>
                <span className="text-sm font-medium text-gray-600">
                  {item.status}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${(item.count / totalApplications) * 100}%`,
                      backgroundColor: statusColors[item.status],
                    }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-900 w-6">
                  {item.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const ApplicationStatusSkeleton = () => {
  return (
    <Card className="w-full rounded-2xl border-none shadow-sm">
      <CardHeader className="flex items-center gap-2 pb-2">
        <PieChart className="size-5 text-muted-foreground" />
        <h3 className="font-medium text-muted-foreground">Application Status</h3>
      </CardHeader>

      <CardContent className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <Skeleton className="w-16 h-4 rounded bg-primary/10" />
            <Skeleton className="flex-1 h-4 rounded-full bg-primary/10" />
            <Skeleton className="w-4 h-4 rounded bg-primary/10" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}