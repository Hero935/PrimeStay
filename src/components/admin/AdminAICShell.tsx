/**
 * AdminAICShell.tsx
 * AIC v3 終極治理中樞 - 三欄式零滾動佈局組件
 * 整合: [左] 微導航 [中] 戰略核心 [右] 行動與告警面板
 */
"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AdminAICShellProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  actionVault?: React.ReactNode;
}

import { ShieldAlert, Menu, LayoutDashboard, ShieldCheck, Building2, Users, Mail, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function AdminAICShell({
  children,
  sidebar,
  actionVault,
}: AdminAICShellProps) {
  const pathname = usePathname();

  // 麵包屑邏輯 (基於 pathname 動態生成)
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((s, i) => ({
    label: s === "admin" ? "Admin" : s.charAt(0).toUpperCase() + s.slice(1),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));
  
  const mobileNavItems = [
    { title: "管理總覽", url: "/admin", icon: LayoutDashboard },
    { title: "治理中心", url: "/admin/management", icon: ShieldCheck },
    { title: "邀請系統", url: "/admin/invitations", icon: Mail },
    { title: "系統設定", url: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-50/50 text-slate-900 font-sans tracking-tight">
      <div className="flex flex-1 overflow-hidden">
        {/* [A] 全域選單 - App Sidebar (手機版隱藏) */}
        <aside className="hidden lg:block flex-none border-r bg-white/50 backdrop-blur">
          {sidebar}
        </aside>

      {/* [B] 戰略脈動區 - Strategic Pulse (Diagnostic Core) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col bg-white">
        {/* 頂部工具欄 - 統整手機導航與桌面版面板切換 (已對齊 Landlord 風格) */}
        <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="/">PrimeStay</BreadcrumbLink>
                    </BreadcrumbItem>
                    {breadcrumbs.length > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                    {breadcrumbs.map((bc, i) => (
                      <React.Fragment key={bc.href}>
                        <BreadcrumbItem>
                          {bc.isLast ? (
                            <BreadcrumbPage>{bc.label}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink href={bc.href} className="hidden md:block">
                              {bc.label}
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {!bc.isLast && <BreadcrumbSeparator className="hidden md:block" />}
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="flex items-center gap-2">
                {/* 系統風險告警面板觸發 */}
                <Sheet>
                   <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative group">
                         <ShieldAlert className="w-5 h-5 text-rose-500" />
                         <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                      </Button>
                   </SheetTrigger>
                   <SheetContent side="right" className="p-0 w-[85%] sm:w-[380px]">
                      <SheetHeader className="sr-only">
                        <SheetTitle>緊急風險告警面板</SheetTitle>
                        <SheetDescription>系統即時監控與異常通知中心</SheetDescription>
                      </SheetHeader>
                      <div className="p-5 h-full bg-slate-50/80 overflow-y-auto custom-scrollbar">
                         {actionVault}
                      </div>
                   </SheetContent>
                </Sheet>
                
                {/* 手機版導航選單 */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="lg:hidden">
                            <Menu className="w-5 h-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-[280px] bg-white border-r-0">
                        <SheetHeader className="p-6 border-b">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-100">P</div>
                            <div className="flex flex-col">
                              <SheetTitle className="text-left text-sm font-black tracking-widest uppercase text-slate-900">PrimeStay</SheetTitle>
                              <SheetDescription className="text-left text-[10px] font-bold uppercase tracking-tighter text-slate-400">AIC v3.0 Mobile</SheetDescription>
                            </div>
                          </div>
                        </SheetHeader>
                        <div className="flex flex-col py-4">
                           {mobileNavItems.map((item) => (
                             <Link
                                key={item.url}
                                href={item.url}
                                className={cn(
                                  "flex items-center gap-4 px-6 py-4 text-sm font-bold transition-all",
                                  pathname === item.url
                                    ? "bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600"
                                    : "text-slate-500 hover:bg-slate-50 active:bg-slate-100"
                                )}
                             >
                                <item.icon className={cn("w-5 h-5", pathname === item.url ? "text-indigo-600" : "text-slate-400")} />
                                {item.title}
                             </Link>
                           ))}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>

        {/* 背景效果 */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-slate-100/50 blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 flex-1 p-4 lg:p-6 w-full h-full">
          {children}
        </div>
      </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}