import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { AppSidebar } from "./_components/app-sidebar";
import { SiteHeader } from "./_components/site-header";
import { authSession } from "~/lib/auth";
import { redirect } from "next/navigation";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await authSession();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "candidate") {
    redirect("/");
  }

  if (!session.user.is_profile_complete) {
    redirect("/onboarding");
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 28)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="p-4 sm:p-6 h-full overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
