import type { ElementType } from "react";

export type AdminNavMainItem = { title: string; url: string; icon?: ElementType };
export type AdminNavUpcomingItem = { title: string; url: string; badge: string };

export const adminSidebarNavMain: AdminNavMainItem[] = [
  { title: "Dashboard", url: "/admin/dashboard" },
  { title: "Candidates", url: "/admin/candidates" },
  { title: "Applications", url: "/admin/applications" },
  { title: "Interviews", url: "/admin/interviews" },
  { title: "Jobs", url: "/admin/jobs" },
  { title: "Summary Reports", url: "/admin/summary-reports" },
];

export const adminSidebarNavSecondary: AdminNavMainItem[] = [
  { title: "Company", url: "/admin/companies" },
  { title: "Analytics", url: "/admin/analytics" },
  { title: "Calendar", url: "/admin/calendar" },
  { title: "Compliance", url: "/admin/compliance" },
  { title: "Audit Logs", url: "/admin/audit-logs" },
  { title: "Settings", url: "/admin/settings" },
  { title: "Get Help", url: "#" },
  { title: "Search", url: "#" },
];

export const adminSidebarNavUpcoming: AdminNavUpcomingItem[] = [
  { title: "Calendar Integration", url: "/admin/calendar-integration", badge: "Coming Soon" },
  { title: "Referral Management", url: "/admin/referrals", badge: "Coming Soon" },
  { title: "Multi-Channel Posting", url: "/admin/multi-channel-posting", badge: "Coming Soon" },
];
