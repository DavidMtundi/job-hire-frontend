"use client"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"
import { cn } from "~/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavMainProps {
  items: {
    title: string
    url: string
    icon?: React.ElementType
  }[]
}

export const NavMain = ({ items }: NavMainProps) => {
  const pathname = usePathname()
  const isActive = (url: string) => pathname === url

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="flex flex-col gap-3">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                tooltip={item.title} 
                size="xl" 
                className={cn("hover:bg-sky-50", {
                  "bg-sky-100": isActive(item.url),
                })}
                // isActive={isActive(item.url)}
              >
                <Link 
                  href={item.url} 
                  className={cn("flex flex-col justify-center items-center text-gray-700", {
                    "font-medium text-blue-950": isActive(item.url),
                  })}
                  >
                  <div className="flex flex-col gap-1 justify-center items-center">
                    {item.icon && <item.icon className="size-5" />}
                    <span className="text-xs">{item.title}</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
