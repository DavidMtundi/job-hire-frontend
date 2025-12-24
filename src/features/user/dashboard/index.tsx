"use client";

import { useSession } from "next-auth/react";
import { Loader } from "~/components/loader";
import { ApplicationOverview } from "./application-overview";
import { ApplicationStatus } from "./application-status";
import { ApplicationTrend } from "./application-trend";
import { Welcome } from "~/components/welcome";

export default function DashboardScreen() {
  const { data } = useSession();
  const user = data?.user as any;

  if (!user) {
    return <Loader mode="icon" />;
  }

  return (
    <div className="min-h-screen">
      <div className="space-y-3">
        <Welcome />

        <ApplicationOverview />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ApplicationTrend />
          <ApplicationStatus />
        </div>
      </div>
    </div>
  );
}
