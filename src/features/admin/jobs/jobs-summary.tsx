import {
  Briefcase,
  CheckCircle,
  Users
} from "lucide-react";
import { MetricCard } from '~/components/metric-card';

export const JobsSummary = () => {

  // get summary data from api
  const summaryData = {
    totalJobs: 11,
    activeJobs: 7,
    totalApplications: 230,
    totalHired: 17,
  };

  const metrics = [
    {
      title: "Total Jobs",
      value: summaryData.totalJobs,
      icon: Briefcase,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      change: "+5.2%",
      changeType: "up",
    },
    {
      title: "Active Jobs",
      value: summaryData.activeJobs,
      icon: CheckCircle,
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
      change: "-2.1%",
      changeType: "down",
    },
    {
      title: "Total Applications",
      value: summaryData.totalApplications,
      icon: Users,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
      change: "+12.4%",
      changeType: "up",
    },
    {
      title: "Total Hired",
      value: summaryData.totalHired,
      icon: CheckCircle,
      iconColor: "text-yellow-600",
      iconBg: "bg-yellow-100",
      change: "+0.8%",
      changeType: "up",
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.title}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          iconColor={metric.iconColor}
          iconBg={metric.iconBg}
          change={metric.change}
          changeType={metric.changeType}
        />
      ))}
    </div>
  )
}