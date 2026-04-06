/**
 * AICActionVault.tsx
 * AIC v3 右側行動面板內容
 */
"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Plus, Search, ExternalLink, ShieldAlert, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { InviteDialog } from "@/components/invitations/InviteDialog";

export function AICActionVault() {
  const [activeTab, setActiveTab] = useState<"LANDLORD" | "MANAGER" | null>(null);

  return (
    <div className="flex flex-col h-full space-y-8 pr-1">
      {/* 使用統一邀請對話框 (與房東端一致) */}
      <InviteDialog
        targetRole="LANDLORD"
        isOpen={activeTab === "LANDLORD"}
        onOpenChange={(open) => !open && setActiveTab(null)}
        showTrigger={false}
      />
      <InviteDialog
        targetRole="MANAGER"
        isOpen={activeTab === "MANAGER"}
        onOpenChange={(open) => !open && setActiveTab(null)}
        showTrigger={false}
      />

      {/* 1. 全域搜尋與指令入口 */}
      <div className="space-y-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            placeholder="全域指令 / 搜尋 (Cmd+K)"
            className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-400 font-sans"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => setActiveTab("LANDLORD")}
            variant="outline"
            className="border-slate-200 bg-white text-[10px] h-8 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300"
          >
            <Plus className="w-3 h-3 mr-1" /> 房東邀請
          </Button>
          <Button
            onClick={() => setActiveTab("MANAGER")}
            variant="outline"
            className="border-slate-200 bg-white text-[10px] h-8 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300"
          >
            <Plus className="w-3 h-3 mr-1" /> 代管邀請
          </Button>
        </div>
      </div>

      {/* 2. 緊急告警牆 (Critical Alerts) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <ShieldAlert className="w-3 h-3 text-rose-500" /> 緊急風險告警
          </h3>
          <Badge variant="outline" className="text-[9px] border-rose-100 text-rose-600 bg-rose-50 font-medium rounded-full px-1.5 h-4">
            3 則新訊
          </Badge>
        </div>
        
        <div className="space-y-2">
          <AlertItem
            type="error"
            title="資料庫負載飽和"
            desc="數據表 'AuditLog' 已超出 90% 的索引限制。"
          />
          <AlertItem
            type="warning"
            title="低出租率告警"
            desc="組織 'PrimeStay-City' 出租率跌破 40% 臨界值。"
          />
          <AlertItem
            type="info"
            title="SaaS 訂閱即將到期"
            desc="5 個高級實體將於今晚進入寬限期。"
          />
        </div>
      </div>

      {/* 3. 最近稽核脈動 (Live Pulse) */}
      <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <History className="w-3 h-3" /> 系統審計脈動 (實時)
          </h3>
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2 scroll-smooth">
          <AuditLogItem
            action="合約簽署完成"
            user="Landlord-A"
            target="合約 #812"
            time="2 分鐘前"
          />
          <AuditLogItem
            action="帳單逾期預警"
            user="System-Job"
            target="發票 #990"
            time="12 分鐘前"
          />
          <AuditLogItem
            action="全域封禁執行"
            user="Admin-Prime"
            target="用戶: BadActor"
            time="45 分鐘前"
          />
        </div>
      </div>
    </div>
  );
}

function AlertItem({ type, title, desc }: { type: 'error' | 'warning' | 'info', title: string, desc: string }) {
  const styles = {
    error: "border-rose-100 bg-rose-50/50 text-rose-900",
    warning: "border-amber-100 bg-amber-50/50 text-amber-900",
    info: "border-blue-100 bg-blue-50/50 text-blue-900",
  }[type];

  return (
    <div className={cn("p-3 rounded-xl border text-xs group cursor-pointer hover:bg-white transition-all shadow-sm", styles)}>
      <div className="font-bold flex items-center justify-between uppercase text-[10px] tracking-wide mb-1 text-slate-800">
        {title} <ExternalLink className="w-2.5 h-2.5 opacity-30 group-hover:opacity-100" />
      </div>
      <div className="text-slate-600 font-normal leading-relaxed text-[11px]">{desc}</div>
    </div>
  );
}

function AuditLogItem({ action, user, target, time }: { action: string, user: string, target: string, time: string }) {
  return (
    <div className="relative pl-4 pb-4 border-l border-slate-100 last:pb-0">
      <div className="absolute -left-[6.5px] top-0 w-3 h-3 rounded-full bg-white border-2 border-slate-200" />
      <div className="text-[10px] font-mono text-indigo-600 font-bold tracking-tight mb-0.5">{action}</div>
      <div className="text-[10px] text-slate-500 font-medium leading-tight">
        <span className="text-slate-900 font-bold">{user}</span> <span className="text-[9px] text-slate-400">操作於</span> <span className="text-slate-800 font-semibold">{target}</span>
      </div>
      <div className="text-[9px] text-slate-400 font-mono mt-1 font-semibold">{time}</div>
    </div>
  );
}