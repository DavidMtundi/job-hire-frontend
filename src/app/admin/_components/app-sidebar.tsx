"use client"

import Link from "next/link"
import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { NavUpcoming } from "./nav-upcoming"
import { NavUser } from "./nav-user"
import { siteConfig } from "~/config/site"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
    },
    {
      title: "Candidates",
      url: "/admin/candidates",
    },
    {
      title: "Applications",
      url: "/admin/applications",
    },
    {
      title: "Interviews",
      url: "/admin/interviews",
    },
    {
      title: "Jobs",
      url: "/admin/jobs",
    },
    {
      title: "Summary Reports",
      url: "/admin/summary-reports",
    },
  ],
  navSecondary: [
    {
      title: "Company",
      url: "/admin/companies",
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
    },
    {
      title: "Calendar",
      url: "/admin/calendar",
    },
    {
      title: "Compliance",
      url: "/admin/compliance",
    },
    {
      title: "Audit Logs",
      url: "/admin/audit-logs",
    },
    {
      title: "Settings",
      url: "/admin/settings",
    },
    {
      title: "Get Help",
      url: "#",
    },
    {
      title: "Search",
      url: "#",
    },
  ],
  navUpcoming: [
    {
      title: "Calendar Integration",
      url: "/admin/calendar-integration",
      badge: "Coming Soon",
    },
    {
      title: "Referral Management",
      url: "/admin/referrals",
      badge: "Coming Soon",
    },
    {
      title: "Multi-Channel Posting",
      url: "/admin/multi-channel-posting",
      badge: "Coming Soon",
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/admin/dashboard" className="flex items-center gap-2 min-w-0">
                <img
                  src={siteConfig.brand.icon}
                  alt=""
                  width={512}
                  height={512}
                  className="h-7 w-7 object-contain shrink-0"
                  aria-hidden
                />
                <span className="text-lg font-bold text-primary truncate">Riara University</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} />
        <NavUpcoming items={data.navUpcoming} className="mt-auto border-t pt-4" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
