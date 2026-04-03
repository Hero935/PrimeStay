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

interface DashboardShellProps {
  children: React.ReactNode;
}

/**
 * 儀表板通用外殼
 * 整合響應式導航（PC 側邊欄 + 行動端底欄）
 */
export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  
  // 簡單的麵包屑邏輯 (僅供示範，可根據路徑動態生成)
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((s, i) => ({
    label: s.charAt(0).toUpperCase() + s.slice(1),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-slate-50/50 w-full">
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white/50 backdrop-blur px-4 sticky top-0 z-30">
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
          </header>
          
          <main className="flex-1 overflow-y-auto pb-20 md:pb-8">
            <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
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