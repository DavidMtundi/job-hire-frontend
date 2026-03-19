"use client"

import Link from "next/link"
import * as React from "react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"
import { Badge } from "~/components/ui/badge"

interface NavUpcomingProps {
  items: {
    title: string
    url: string
    icon?: React.ElementType
    badge?: string
  }[]
}

export const NavUpcoming = ({ items, ...props }: NavUpcomingProps & React.ComponentPropsWithoutRef<typeof SidebarGroup>) => {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupLabel className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <span>Coming Soon</span>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild className="opacity-75 hover:opacity-100">
                <Link href={item.url} className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
