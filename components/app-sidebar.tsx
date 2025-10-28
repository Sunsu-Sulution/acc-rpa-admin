/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import {
  IconBasketFilled,
  IconBrandTablerFilled,
  IconGitBranch,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Branch Mapping",
      url: "/dashboard",
      icon: IconBasketFilled,
    },
  ],
  documents: [
    {
      name: "Logs",
      url: "/dashboard/logs",
      icon: IconBrandTablerFilled,
    },
    {
      name: "User History",
      url: "/dashboard/user-history",
      icon: IconGitBranch,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <div>
                <img src="/logo.png" alt="logo icon" className="h-8" />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
