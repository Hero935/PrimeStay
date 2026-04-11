"use client";

import React from "react";
import { AppSidebar } from "./AppSidebar";
import { BottomNav } from "./BottomNav";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface DashboardShellProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode; // 支援 Admin 專用的診斷面板
}

/**
 * 儀表板通用外殼
 * 整合響應式導航（PC 側邊欄 + 行動端底欄）
 */
export function DashboardShell({ children, rightPanel }: DashboardShellProps) {
  const pathname = usePathname();
  
  // 動態麵包屑邏輯 (對齊 Admin 風格)
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((s, i) => ({
    label: s.charAt(0).toUpperCase() + s.slice(1),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-slate-50/50 w-full font-sans tracking-tight text-slate-900 leading-relaxed">
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white/80 backdrop-blur-md px-4 sticky top-0 z-30">
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

            {/* 右側擴充功能 (如 Admin 診斷面板) */}
            {rightPanel && (
              <div className="flex items-center gap-2">
                <Sheet>
                   <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative group hover:bg-rose-50 transition-colors">
                         <ShieldAlert className="w-5 h-5 text-rose-500" />
                         <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                      </Button>
                   </SheetTrigger>
                   <SheetContent side="right" className="p-0 w-[85%] sm:w-[380px] border-l shadow-2xl">
                      <SheetHeader className="sr-only">
                        <SheetTitle>治理與風險面板</SheetTitle>
                        <SheetDescription>系統即時監控中心</SheetDescription>
                      </SheetHeader>
                      <div className="p-0 h-full bg-slate-50/80">
                         {rightPanel}
                      </div>
                   </SheetContent>
                </Sheet>
              </div>
            )}
          </header>
          
          <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 md:pb-0 min-w-0 bg-white">
            <div className="w-full h-full animate-in fade-in duration-500 min-w-0">
              {children}
            </div>
          </main>
          
          {/* 行動端導航 */}
          <BottomNav />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}