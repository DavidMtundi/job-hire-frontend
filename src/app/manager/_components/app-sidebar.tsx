"use client"

import Image from "next/image"
import Link from "next/link"
import * as React from "react"
import {
  TbBriefcase,
  TbChartBar,
  TbDashboard,
  TbHelp,
  TbInnerShadowTop,
  TbListDetails,
  TbSearch,
  TbSettings,
  TbUsers,
  TbUserSearch,
  TbChartLine
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
      url: "/manager/dashboard",
      icon: TbDashboard,
    },
    {
      title: "Recruitments",
      url: "/manager/recruitments",
      icon: TbUserSearch,
    },
    {
      title: "Performance",
      url: "/manager/performance",
      icon: TbChartLine,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/manager/settings",
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
              <Link href="/manager/dashboard" className="flex items-center gap-2">
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
