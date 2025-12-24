import { useGetApplicationTrendQuery } from '~/apis/dashboard-candidate/queries';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { Skeleton } from '~/components/ui/skeleton';


export const ApplicationTrend = () => {
  const { data: applicationTrendData, isLoading } = useGetApplicationTrendQuery();

  const trendData = applicationTrendData?.data?.trend || [];
  const totalApplications = trendData.reduce((acc, item) => acc + item.applications, 0);

  if (isLoading) {
    return <ApplicationTrendSkeleton />;
  }

  return (
    <Card className=" bg-white shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Application Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trendData.slice(0, 4).map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between"
            >
              <span className="text-sm font-medium text-gray-600">
                {item.month}
              </span>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${(item.applications / totalApplications) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-gray-900 w-6">
                  {item.applications}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const ApplicationTrendSkeleton = () => {
  return (
    <Card className="w-full rounded-2xl border-none shadow-sm">
      <CardHeader className="flex items-center gap-2 pb-2">
        <BarChart3 className="size-5 text-muted-foreground" />
        <h3 className="font-medium text-muted-foreground">Application Trend</h3>
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