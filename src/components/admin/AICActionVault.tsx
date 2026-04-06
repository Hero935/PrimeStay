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
import { GenesisInviteModal } from "./GenesisInviteModal";

export function AICActionVault() {
  const [inviteModal, setInviteModal] = useState<{ isOpen: boolean; type: "LANDLORD" | "MANAGER" }>({
    isOpen: false,
    type: "LANDLORD",
  });

  return (
    <div className="flex flex-col h-full space-y-8 pr-1">
      {/* 創世邀請 Modal */}
      <GenesisInviteModal
        isOpen={inviteModal.isOpen}
        onClose={() => setInviteModal(prev => ({ ...prev, isOpen: false }))}
        type={inviteModal.type}
      />

      {/* 1. 全域搜尋與指令入口 */}
      <div className="space-y-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
          <input
            placeholder="Command / Search (Cmd+K)"
            className="w-full bg-[#020617] border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => setInviteModal({ isOpen: true, type: "LANDLORD" })}
            variant="outline"
            className="border-slate-800 bg-[#0F172A]/50 text-[10px] h-8 rounded-lg hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-500/30"
          >
            <Plus className="w-3 h-3 mr-1" /> Landlord Invite
          </Button>
          <Button
            onClick={() => setInviteModal({ isOpen: true, type: "MANAGER" })}
            variant="outline"
            className="border-slate-800 bg-[#0F172A]/50 text-[10px] h-8 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30"
          >
            <Plus className="w-3 h-3 mr-1" /> Manager Invite
          </Button>
        </div>
      </div>

      {/* 2. 緊急告警牆 (Critical Alerts) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-500 flex items-center gap-2">
            <ShieldAlert className="w-3 h-3 text-rose-500" /> Critical Alerts
          </h3>
          <Badge variant="outline" className="text-[9px] border-rose-500/20 text-rose-500 bg-rose-500/5 rounded-full px-1.5 h-4">
            3 NEW
          </Badge>
        </div>
        
        <div className="space-y-2">
          <AlertItem 
            type="error" 
            title="Database Saturation" 
            desc="Table 'AuditLog' exceeds 90% of index limit." 
          />
          <AlertItem 
            type="warning" 
            title="Low Occupancy Alert" 
            desc="Organization 'PrimeStay-City' dropped under 40%." 
          />
          <AlertItem 
            type="info" 
            title="SaaS Subscription Expiring" 
            desc="5 Premium Orgs entering grace period tonight." 
          />
        </div>
      </div>

      {/* 3. 最近稽核脈動 (Live Pulse) */}
      <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-500 flex items-center gap-2">
            <History className="w-3 h-3" /> System Pulse (Live)
          </h3>
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
          <AuditLogItem 
            action="CONTRACT_SIGNED" 
            user="Landlord-A" 
            target="Contract #812" 
            time="2m ago" 
          />
          <AuditLogItem 
            action="BILLING_OVERDUE" 
            user="System-Job" 
            target="Invoice #990" 
            time="12m ago" 
          />
          <AuditLogItem 
            action="MEMBER_BAN" 
            user="Admin-Prime" 
            target="User: BadActor" 
            time="45m ago" 
          />
        </div>
      </div>
    </div>
  );
}

function AlertItem({ type, title, desc }: { type: 'error' | 'warning' | 'info', title: string, desc: string }) {
  const styles = {
    error: "border-rose-500/10 bg-rose-500/5 text-rose-200",
    warning: "border-amber-500/10 bg-amber-500/5 text-amber-200",
    info: "border-blue-500/10 bg-blue-500/5 text-blue-200",
  }[type];

  return (
    <div className={cn("p-3 rounded-xl border text-xs group cursor-pointer hover:scale-[1.02] transition-transform", styles)}>
      <div className="font-bold flex items-center justify-between uppercase text-[10px] mb-1">
        {title} <ExternalLink className="w-2.5 h-2.5 opacity-30 group-hover:opacity-100" />
      </div>
      <div className="opacity-70 leading-relaxed tracking-tight">{desc}</div>
    </div>
  );
}

function AuditLogItem({ action, user, target, time }: { action: string, user: string, target: string, time: string }) {
  return (
    <div className="relative pl-4 pb-4 border-l border-slate-800 last:pb-0">
      <div className="absolute -left-[6.5px] top-0 w-3 h-3 rounded-full bg-[#020617] border-2 border-slate-800" />
      <div className="text-[10px] font-mono text-indigo-400 font-bold mb-0.5">{action}</div>
      <div className="text-[10px] text-slate-300">
        <span className="text-slate-500">{user}</span> acted on <span className="text-slate-400">{target}</span>
      </div>
      <div className="text-[9px] text-slate-600 mt-1">{time}</div>
    </div>
  );
}