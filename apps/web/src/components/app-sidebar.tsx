/* eslint-disable */
// @ts-nocheck
"use client"
import * as React from "react"
import {
  IconDashboard,
  IconPlus,
} from "@tabler/icons-react"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"
import { usePathname } from "next/navigation"

const data = {
  navMain: [
    {
      title: "Start Order",
      url: "/dashboard/start-order",
      icon: IconPlus,
    },
    {
      title: "Orders",
      url: "/dashboard/orders",
      icon: IconDashboard,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = authClient.useSession();
  const pathname = usePathname();

  const navMainWithActive = data.navMain.map(item => ({
    ...item,
    isActive: pathname === item.url
  }));

  return (
    <Sidebar collapsible="offcanvas" {...props} className="pt-10">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <span className="text-primary text-base font-semibold">Delivery Link</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainWithActive} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={session?.user ?? {}} />
      </SidebarFooter>
    </Sidebar>
  )
}
