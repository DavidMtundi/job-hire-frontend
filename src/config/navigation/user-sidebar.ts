import type { ElementType } from "react";
import { HelpCircleIcon, SearchIcon, SettingsIcon } from "lucide-react";
import {
  PiFiles,
  PiListMagnifyingGlassDuotone,
  PiReadCvLogo,
  PiUserCircleCheckDuotone,
} from "react-icons/pi";
import { TbDashboard, TbDatabase, TbFileWord, TbMessageCircle, TbReport } from "react-icons/tb";

export type SidebarNavItem = {
  title: string;
  url: string;
  icon?: ElementType;
};

export const userSidebarNavMain: SidebarNavItem[] = [
  { title: "Dashboard", url: "/user/dashboard", icon: TbDashboard },
  { title: "Jobs", url: "/user/jobs", icon: PiListMagnifyingGlassDuotone },
  { title: "Applications", url: "/user/applications", icon: PiFiles },
  { title: "Resume", url: "/user/resume", icon: PiReadCvLogo },
  { title: "Profile", url: "/user/profile", icon: PiUserCircleCheckDuotone },
];

export const userSidebarNavSecondary: SidebarNavItem[] = [
  { title: "Search", url: "#", icon: SearchIcon },
  { title: "Get Help", url: "#", icon: HelpCircleIcon },
  { title: "Settings", url: "#", icon: SettingsIcon },
];

export const userSidebarDocuments: SidebarNavItem[] = [
  { title: "Agent", url: "#", icon: TbDatabase },
  { title: "Refer & Earn", url: "#", icon: TbReport },
  { title: "Messages", url: "#", icon: TbMessageCircle },
  { title: "Feedback", url: "#", icon: TbFileWord },
];

export const userSidebarPlaceholderUser = {
  name: "John Doe",
  email: "john.doe@example.com",
  avatar: "/images/avatar.png",
};
