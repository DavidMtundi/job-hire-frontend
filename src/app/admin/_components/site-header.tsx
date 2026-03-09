"use client";

import { usePathname } from "next/navigation";
import { Separator } from "~/components/ui/separator"
import { SidebarTrigger } from "~/components/ui/sidebar"
import { InviteHrModal } from "~/features/auth/invite-hr/invite-hr-modal"

export const SiteHeader = () => {
  const pathname = usePathname();
  const title = pathname.split("/").pop()?.replace("-", " ");

  return (
    <header className="sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 border-b border-indigo-100/50 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">
          {title ? title.charAt(0).toUpperCase() + title.slice(1) : ""}
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <InviteHrModal />
        </div>
      </div>
    </header>
  )
}
