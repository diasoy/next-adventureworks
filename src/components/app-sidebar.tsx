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
  DollarSign,
  LogOut,
  User,
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"

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
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Customer Value",
    url: "/dashboard/customer-value",
    icon: DollarSign,
  },
  {
    title: "Bundling",
    url: "/dashboard/bundling",
    icon: BarChart3,
  },
  {
    title: "Frequency",
    url: "/dashboard/purchase-frequency",
    icon: Users,
  },
  {
    title: "Discount",
    url: "/dashboard/discount-territory",
    icon: ShoppingCart,
  },
  {
    title: "Salespersons",
    url: "/dashboard/salesperson-retention",
    icon: Package,
  },
  {
    title: "Turnover",
    url: "/dashboard/inventory-turnover",
    icon: TrendingUp,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" })
  }
  
  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="AdventureWorks" className="data-[state=collapsed]:p-2">
              <Link href="/dashboard">
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
      <SidebarFooter className="p-2 space-y-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-1.5 text-sm">
              <User className="size-4" />
              <span className="truncate">{session?.user?.email || "Guest"}</span>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              tooltip="Logout"
              className="h-10 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="size-5" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
