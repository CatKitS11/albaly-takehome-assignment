"use client"

import * as React from "react"
import {
  IconChartBar,
  IconChartPie,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { logout } from "@/app/actions/auth"

const data = {
  navMain: [
    {
      title: "Overview",
      url: "/",
      icon: IconChartBar,
    },
    {
      title: "Insights",
      url: "/insights",
      icon: IconChartPie,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#">
                {/* <IconInnerShadowTop className="!size-5" /> */}
                <span className="text-2xl font-bold">Albaly Insight</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <Button className=" h-12 w-full" onClick={() => {
          logout()
        }}>
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
