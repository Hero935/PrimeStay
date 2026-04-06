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

import { AdminSystemBanner } from "./AdminSystemBanner";

export function AdminAICShell({
  children,
  sidebar,
  actionVault,
}: AdminAICShellProps) {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[#020617] text-slate-100 font-sans tracking-tight">
      {/* 全域系統橫幅 (可根據狀態切換顯隱) */}
      <AdminSystemBanner mode="READ_ONLY" />
      
      <div className="flex flex-1 overflow-hidden">
      {/* [A] 全域微導航 - Micro Sidebar */}
      <aside className="flex-none border-r border-slate-800/50 bg-[#020617]">
        {sidebar}
      </aside>

      {/* [B] 戰略脈動區 - Strategic Pulse (Diagnostic Core) */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col">
        {/* 背景微光效果 (Glow) */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 flex-1 p-6 max-w-[1400px] mx-auto w-full">
          {children}
        </div>
      </main>

      {/* [C] 命令與告警面板 - Action Vault (Right Side) */}
      <aside className="w-[350px] flex-none border-l border-slate-800/50 bg-[#0F172A]/30 backdrop-blur-sm overflow-y-auto custom-scrollbar">
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
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
}