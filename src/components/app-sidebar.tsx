"use client"

import * as React from "react"
import {
  BarChart3,
  Users,
  ShoppingCart,
  Package,
  TrendingUp,
  Settings,
  Home,
  Database,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Bundling",
    url: "/bundling",
    icon: BarChart3,
  },
  {
    title: "Frequency",
    url: "/purchase-frequency",
    icon: Users,
  },
  {
    title: "Discount",
    url: "/discount-territory",
    icon: ShoppingCart,
  },
  {
    title: "Salespersons",
    url: "/salesperson-retention",
    icon: Package,
  },
  {
    title: "Turnover",
    url: "/inventory-turnover",
    icon: TrendingUp,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  
  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="AdventureWorks" className="data-[state=collapsed]:p-2">
              <Link href="/">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <BarChart3 className="size-6" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">AdventureWorks</span>
                  <span className="text-xs text-muted-foreground">CRM Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.title}
                      className="h-10"
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="size-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={pathname === "/settings"}
              tooltip="Settings"
              className="h-10"
            >
              <Link href="/settings" className="flex items-center gap-3">
                <Settings className="size-5" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
