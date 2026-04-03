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
import {
  managerSidebarNavMain,
  managerSidebarNavSecondary,
} from "~/config/navigation/manager-sidebar"
import { siteConfig } from "~/config/site"
import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"

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
        <NavMain items={managerSidebarNavMain} />
        <NavSecondary items={managerSidebarNavSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
