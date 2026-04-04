"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Building2,
  Receipt,
  Wrench,
  User,
  Users,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 行動端底部導航列
 * 適配 ADMIN / LANDLORD-MANAGER / TENANT 三種導航模式
 */
export function BottomNav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const role = (session?.user as any)?.role;

  // 根據角色決定導航項
  const navItems = role === "ADMIN"
    ? [
        { title: "儀表板", url: "/admin", icon: LayoutDashboard },
        { title: "組織", url: "/admin/organizations", icon: Building2 },
        { title: "用戶", url: "/admin/users", icon: Users },
        { title: "設定", url: "/admin/settings", icon: Settings },
      ]
    : role === "LANDLORD" || role === "MANAGER"
      ? [
          { title: "總覽", url: "/landlord", icon: LayoutDashboard },
          { title: "房源", url: "/landlord/properties", icon: Building2 },
          { title: "帳單", url: "/landlord/billings", icon: Receipt },
          { title: "報修", url: "/landlord/maintenances", icon: Wrench },
          { title: "設定", url: "/landlord/settings", icon: Settings },
        ]
      : [
          { title: "我的租務", url: "/tenant", icon: LayoutDashboard },
        ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-slate-200 pb-safe">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.url;
          return (
            <Link 
              key={item.url} 
              href={item.url}
              className={cn(
                "flex flex-col items-center justify-center flex-1 space-y-1 transition-colors",
                isActive ? "text-primary" : "text-slate-400"
              )}
            >
              <item.icon className={cn("size-5", isActive && "stroke-[2.5px]")} />
              <span className="text-[10px] font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}