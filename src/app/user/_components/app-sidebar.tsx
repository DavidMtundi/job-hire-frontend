"use client"

import { HelpCircleIcon, SearchIcon, SettingsIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import * as React from "react"
import { PiFiles, PiListMagnifyingGlassDuotone, PiReadCvLogo, PiUserCircleCheckDuotone, PiUserFocusDuotone } from "react-icons/pi"
import {
  TbDashboard,
  TbDatabase,
  TbFileWord,
  TbInnerShadowTop,
  TbMessageCircle,
  TbReport
} from "react-icons/tb"
import { Button } from "~/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem
} from "~/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"

const data = {
  user: {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "/images/avatar.png",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/user/dashboard",
      icon: TbDashboard,
    },
    {
      title: "Jobs",
      url: "/user/jobs",
      icon: PiListMagnifyingGlassDuotone,
    },
    {
      title: "Applications",
      url: "/user/applications",
      icon: PiFiles,
    },
    // {
    //   title: "Resume",
    //   url: "/user/resume",
    //   icon: PiReadCvLogo,
    // },
    {
      title: "Profile",
      url: "/user/profile",
      icon: PiUserCircleCheckDuotone,
    },
  ],
  navSecondary: [
    {
      title: "Search",
      url: "#",
      icon: SearchIcon,
    },
    {
      title: "Get Help",
      url: "#",
      icon: HelpCircleIcon,
    },
    {
      title: "Settings",
      url: "#",
      icon: SettingsIcon,
    },
  ],
  documents: [
    {
      name: "Agent",
      url: "#",
      icon: TbDatabase,
    },
    {
      name: "Refer & Earn",
      url: "#",
      icon: TbReport,
    },
    {
      name: "Messages",
      url: "#",
      icon: TbMessageCircle,
    },
    {
      name: "Feedback",
      url: "#",
      icon: TbFileWord,
    },
  ],
}

export const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex justify-center items-center">
            <Button asChild size="icon" variant="ghost">
              <Link href="/user/dashboard">
                <Image 
                  src="/logo.svg" 
                  alt="Job Hire" 
                  width={24} 
                  height={24} 
                  className="size-6" 
                />
              </Link>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      {/* <SidebarFooter>
        <NavSecondary items={data.navSecondary} className="mt-auto" />
        <NavUser user={data.user} />
      </SidebarFooter> */}
    </Sidebar>
  )
}
