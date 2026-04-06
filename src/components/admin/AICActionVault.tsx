/**
 * AICActionVault.tsx
 * AIC v3 右側行動面板內容
 */
"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Search, ExternalLink, ShieldAlert, History as HistoryIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { InviteDialog } from "@/components/invitations/InviteDialog";

export function AICActionVault() {
  const [activeTab, setActiveTab] = useState<"LANDLORD" | "MANAGER" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    // 導向用戶管理頁面並帶入搜尋參數
    window.location.href = `/admin/users?search=${encodeURIComponent(searchQuery)}`;
  };

  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Failed to fetch stats for alerts:", err));
  }, []);

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
        <form onSubmit={handleSearch} className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="全域指令 / 搜尋 (用戶)"
            className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-400 font-sans"
          />
        </form>
        
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
            狀態正常
          </Badge>
        </div>
        
        <div className="space-y-2">
          {stats?.lowOccupancyCount > 0 ? (
            <AlertItem
              type="warning"
              title="低出租率風險"
              desc={`${stats.lowOccupancyCount} 個組織的出租率低於 40%，可能面臨客戶流失風險。`}
            />
          ) : (
            <AlertItem
              type="info"
              title="系統穩定"
              desc="所有核心服務目前運作正常，無掛起任務。"
            />
          )}

          {stats?.expiredOrgsCount > 0 && (
            <AlertItem
              type="error"
              title="訂閱逾期風險"
              desc={`發現 ${stats.expiredOrgsCount} 個組織方案已過期，可能影響系統營收。`}
            />
          )}

          {stats?.pendingBillingCount > 0 && (
            <AlertItem
              type="error"
              title="待審帳單告警"
              desc={`目前有 ${stats.pendingBillingCount} 筆帳單等待管理員審核。`}
            />
          )}

          {stats?.pendingMaintenanceCount > 0 && (
            <AlertItem
                type="warning"
                title="報修逾時風險"
                desc={`系統偵測到 ${stats.pendingMaintenanceCount} 個報修任務尚未指派處理人。`}
            />
          )}
        </div>
      </div>

      {/* 3. 最近稽核脈動 (Live Pulse) */}
      <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <HistoryIcon className="w-3 h-3" /> 系統審計脈動 (實時)
          </h3>
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2 scroll-smooth">
          <LiveAuditStream />
        </div>
      </div>
    </div>
  );
}

function LiveAuditStream() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = () => {
            fetch("/api/admin/stats", { method: "POST" })
                .then(res => res.json())
                .then(data => {
                    if (data.logs) setLogs(data.logs);
                    setLoading(false);
                })
                .catch(err => console.error("Failed to fetch logs:", err));
        };

        fetchLogs();
        const timer = setInterval(fetchLogs, 30000); // 30秒更新一次
        return () => clearInterval(timer);
    }, []);

    if (loading) return <div className="text-[10px] text-slate-400">正在接入審計脈動...</div>;

    return (
        <div className="space-y-4">
            {logs.length > 0 ? logs.map((log) => (
                <AuditLogItem
                    key={log.id}
                    action={log.action}
                    user={log.user?.name || "Unknown"}
                    target={`${log.targetType}: ${log.targetId?.slice(0, 8) || "N/A"}`}
                    time={new Date(log.createdAt).toLocaleTimeString()}
                />
            )) : (
                <div className="text-[10px] text-slate-400 mt-4 text-center">目前尚無稽核紀錄</div>
            )}
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
    <div className="relative pl-4 pb-4 border-l border-slate-100 last:pb-0 group/item">
      <div className="absolute -left-[6.5px] top-0 w-3 h-3 rounded-full bg-white border-2 border-slate-200" />
      <div className="text-[10px] font-mono text-indigo-600 font-bold tracking-tight mb-0.5">{action}</div>
      <div className="text-[10px] text-slate-500 font-medium leading-tight">
        <span className="text-slate-900 font-bold">{user}</span> <span className="text-[9px] text-slate-400">操作於</span> <span className="text-slate-800 font-semibold">{target}</span>
      </div>
      <div className="text-[9px] text-slate-400 font-mono mt-1 font-semibold">{time}</div>
    </div>
  );
}