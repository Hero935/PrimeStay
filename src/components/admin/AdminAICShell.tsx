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

export function AdminAICShell({
  children,
  sidebar,
  actionVault,
}: AdminAICShellProps) {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-50/50 text-slate-900 font-sans tracking-tight">
      <div className="flex flex-1 overflow-hidden">
        {/* [A] 全域選單 - App Sidebar (配合房東 UI 配色) */}
        <aside className="flex-none border-r bg-white/50 backdrop-blur">
          {sidebar}
        </aside>

      {/* [B] 戰略脈動區 - Strategic Pulse (Diagnostic Core) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col bg-white">
        {/* 背景效果 */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-slate-100/50 blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 flex-1 p-6 max-w-[1400px] mx-auto w-full">
          {children}
        </div>
      </main>

      {/* [C] 命令與告警面板 - Action Vault (Right Side) */}
      <aside className="w-[350px] flex-none border-l bg-slate-50/80 backdrop-blur-sm overflow-y-auto custom-scrollbar">
        <div className="p-5 h-full">
          {actionVault}
        </div>
      </aside>
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