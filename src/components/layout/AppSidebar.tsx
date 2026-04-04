"use client";

import * as React from "react";
import {
  Building2,
  LayoutDashboard,
  Receipt,
  Wrench,
  Settings,
  LogOut,
  ChevronRight,
  Mail,
  ShieldCheck,
  Users,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 系統側邊導航組件
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const role = (session?.user as any)?.role as string | undefined;

  /**
   * 根據系統角色 (systemRole) 決定側邊欄的導航選單項目
   * - ADMIN: 平台管理員專屬選單，路由指向 /admin/*
   * - LANDLORD / MANAGER: 房源管理選單，路由指向 /landlord/*
   * - TENANT (預設): 租客選單，路由指向 /tenant
   */
  const navItems =
    role === "ADMIN"
      ? [
          { title: "系統儀表板", url: "/admin", icon: LayoutDashboard },
          { title: "組織管理", url: "/admin/organizations", icon: Building2 },
          { title: "用戶管理", url: "/admin/users", icon: Users },
          { title: "房東邀請", url: "/admin/invitations", icon: Mail },
          { title: "系統設定", url: "/admin/settings", icon: Settings },
        ]
      : role === "LANDLORD" || role === "MANAGER"
        ? [
            { title: "總覽儀表板", url: "/landlord", icon: LayoutDashboard },
            { title: "房源管理", url: "/landlord/properties", icon: Building2 },
            { title: "帳單報表", url: "/landlord/billings", icon: Receipt },
            { title: "報修處理", url: "/landlord/maintenances", icon: Wrench },
          ]
        : [
            { title: "我的租務", url: "/tenant", icon: LayoutDashboard },
          ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            P
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-semibold uppercase tracking-wider">PrimeStay</span>
            <span className="truncate text-xs text-muted-foreground">高端租務代管</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="px-2 py-2">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url}
                tooltip={item.title}
                className="py-6"
              >
                <Link href={item.url}>
                  <item.icon className="size-5" />
                  <span className="font-medium group-data-[collapsible=icon]:hidden">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                    <AvatarFallback className="rounded-lg">{session?.user?.name?.slice(0, 2) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden ml-2">
                    <span className="truncate font-semibold">{session?.user?.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {role === "ADMIN" ? "平台管理員" : role === "LANDLORD" ? "房東" : role === "MANAGER" ? "代管人員" : "房客"}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg">{session?.user?.name?.slice(0, 2) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{session?.user?.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{session?.user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  登出系統
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}