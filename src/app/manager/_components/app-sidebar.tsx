"use client"

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
import { siteConfig } from "~/config/site"

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
              <Link href="/manager/dashboard" className="flex items-center gap-2 min-w-0">
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
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
