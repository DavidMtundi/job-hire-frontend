"use client"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"

interface NavSecondaryProps {
  items: {
    title: string
    url: string
    icon: React.ElementType
  }[]
}

export const NavSecondary = ({
  items,
  ...props
}: NavSecondaryProps & React.ComponentPropsWithoutRef<typeof SidebarGroup>) => {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title} className="inline-flex flex-col justify-center items-center">
              <SidebarMenuButton size="icon" tooltip={item.title} className="flex justify-center items-center hover:bg-blue-100">
                {item.icon && <item.icon className="size-6" />}
                {/* <span>{item.title}</span> */}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
