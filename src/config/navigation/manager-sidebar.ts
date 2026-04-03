import type { ElementType } from "react";
import {
  TbChartLine,
  TbDashboard,
  TbHelp,
  TbSearch,
  TbSettings,
  TbUserSearch,
} from "react-icons/tb";

export type ManagerNavItem = { title: string; url: string; icon?: ElementType };
export type ManagerNavSecondaryItem = { title: string; url: string; icon: ElementType };

export const managerSidebarNavMain: ManagerNavItem[] = [
  { title: "Dashboard", url: "/manager/dashboard", icon: TbDashboard },
  { title: "Recruitments", url: "/manager/recruitments", icon: TbUserSearch },
  { title: "Performance", url: "/manager/performance", icon: TbChartLine },
];

export const managerSidebarNavSecondary: ManagerNavSecondaryItem[] = [
  { title: "Settings", url: "/manager/settings", icon: TbSettings },
  { title: "Get Help", url: "#", icon: TbHelp },
  { title: "Search", url: "#", icon: TbSearch },
];
