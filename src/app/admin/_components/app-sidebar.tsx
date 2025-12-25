"use client"

import Image from "next/image"
import Link from "next/link"
import * as React from "react"
import {
  TbBriefcase,
  TbCalendar,
  TbChartBar,
  TbDashboard,
  TbHelp,
  TbInnerShadowTop,
  TbListDetails,
  TbSearch,
  TbSettings,
} from "react-icons/tb"
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
import { NavUser } from "./nav-user"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: TbDashboard,
    },
    {
      title: "Candidates",
      url: "/admin/candidates",
      icon: TbListDetails,
    },
    {
      title: "Applications",
      url: "/admin/applications",
      icon: TbChartBar,
    },
    {
      title: "Interviews",
      url: "/admin/interviews",
      icon: TbCalendar,
    },
    {
      title: "Jobs",
      url: "/admin/jobs",
      icon: TbBriefcase,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/admin/settings",
      icon: TbSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: TbHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: TbSearch,
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
              <Link href="/admin/dashboard" className="flex items-center gap-2">
                <Image 
                  src="/logo.svg" 
                  alt="Job Hire" 
                  width={24} 
                  height={24} 
                  className="size-6" 
                />
                <span className="text-lg font-bold text-blue-950">Job Hire</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
