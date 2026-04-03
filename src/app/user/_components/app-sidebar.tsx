"use client"

import Link from "next/link"
import * as React from "react"
import { Button } from "~/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem
} from "~/components/ui/sidebar"
import { userSidebarNavMain } from "~/config/navigation/user-sidebar"
import { siteConfig } from "~/config/site"
import { NavMain } from "./nav-main"

export const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex justify-center items-center">
            <Button asChild size="icon" variant="ghost">
              <Link href="/user/dashboard">
                <img
                  src={siteConfig.brand.icon}
                  alt={siteConfig.title}
                  width={512}
                  height={512}
                  className="h-7 w-7 object-contain"
                />
              </Link>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={userSidebarNavMain} />
      </SidebarContent>
    </Sidebar>
  )
}
