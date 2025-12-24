"use client";

import { DashboardOverview } from "./dashboard-overview";
import { KPIAnalyticsChart } from "./kpi-analytics-chart";
import { JobRecruiterAnalyticsChart } from "./job-recruiter-analytics-chart";
import { RecruitmentAnalyticsPreview } from "./recruitment-analytics-preview";
import { RecruitersPerformancePreview } from "./recruiters-performance-preview";

export const ManagerDashboard = () => {
  return (
    <div className="flex flex-col gap-6">
      <DashboardOverview />
      <div className="grid gap-6 md:grid-cols-2">
        <KPIAnalyticsChart />
        <JobRecruiterAnalyticsChart />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <RecruitmentAnalyticsPreview />
        <RecruitersPerformancePreview />
      </div>
    </div>
  );
};
