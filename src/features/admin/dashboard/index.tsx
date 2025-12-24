"use client";

import { useSession } from "next-auth/react";
import { DashboardSummary } from "./dashboard-summary";
import { HiringFunnel } from "./hiring-funnel";
import { RecentApplications } from "./recent-applications";
import { TopJobs } from "./top-jobs";
import { Welcome } from "~/components/welcome";

export default function AdminDashboard() {
  const { data } = useSession();
  const user = data?.user;

  return (
    <div className="mx-auto space-y-6 w-full">
      <Welcome />
      <DashboardSummary />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HiringFunnel />
        <TopJobs />
      </div>
      <RecentApplications />
    </div>
  );
}
