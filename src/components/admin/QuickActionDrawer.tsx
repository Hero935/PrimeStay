"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldAlert,
  Zap,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OrgPlanManager } from "@/app/admin/organizations/OrgPlanManager";
import { UserStatusToggle } from "@/app/admin/users/UserStatusToggle";
import { Separator } from "@/components/ui/separator";

interface QuickActionDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  node: {
    id: string;
    name: string;
    type: string;
    status?: string;
  } | null;
}

/**
 * 快速管理側拉面板
 * 用於對選中實體進行停權、啟動或方案調整。
 */
export function QuickActionDrawer({ isOpen, onOpenChange, node }: QuickActionDrawerProps) {
  const [loading, setLoading] = useState(false);

  if (!node) return null;

  /**
   * 治理影響告知組件 (Impact Advisor) - 按鈕上方提示
   */
  const GovernanceImpactAdvisor = ({ node }: { node: any }) => {
    if (node.status === "SUSPENDED") return null;

    let warnings: string[] = [];
    if (node.type === "landlord") {
      warnings = [
        "旗下所有房源將自動隱藏 (Private)",
        "組織下所有成員 (Manager) 轉為唯讀模式",
        "租約與帳單流程將全面凍結"
      ];
    } else if (node.type === "manager") {
      warnings = [
        "負責房源之管理權將自動解除關聯",
        "系統將通知 Landlord 重新指派人員",
        "待辦報修事項將全數回歸給 Landlord"
      ];
    } else if (node.type === "tenant") {
      warnings = [
        "房客將獲取禁止登入權限",
        "禁止發起報修與線上繳費",
        "已產生的帳單仍維持有效狀態"
      ];
    }

    if (warnings.length === 0) return null;

    return (
      <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex gap-3 mb-6">
        <AlertTriangle className="size-5 text-rose-500 shrink-0" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-rose-900 uppercase tracking-tighter">執行停權連鎖影響</p>
          <ul className="list-disc pl-4 space-y-0.5">
            {warnings.map((w, i) => (
              <li key={i} className="text-[10px] text-rose-700 leading-tight">
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md border-l bg-white/95 backdrop-blur-md">
        <SheetHeader className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Zap className="size-5 text-primary" />
            </div>
            <SheetTitle className="text-xl font-black tracking-tight uppercase">快速指揮 (AIC Quick Cmd)</SheetTitle>
          </div>
          <SheetDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            正在針對實體進行戰略調整
          </SheetDescription>
        </SheetHeader>

        <div className="py-8 space-y-8 overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin px-1">
          {/* 實體資訊 */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner">
            <div className="flex items-center justify-between mb-4">
               <Badge className="bg-slate-900 text-white font-black text-[9px] px-2 h-5 tracking-widest border-none">
                 {node.type.toUpperCase()}
               </Badge>
               <Badge variant="outline" className={cn(
                 "font-black text-[9px] px-2 h-5 tracking-widest",
                 node.status === "SUSPENDED" ? "text-red-500 border-red-200 bg-red-50" : "text-emerald-600 border-emerald-200 bg-emerald-50"
               )}>
                 {node.status || "ACTIVE"}
               </Badge>
            </div>
            <h3 className="text-lg font-black text-slate-900 truncate mb-1">{node.name}</h3>
            <p className="text-[10px] font-mono text-slate-400">UID: {node.id}</p>
          </div>

          <Separator className="bg-slate-100" />

          {/* 組織治理專區 */}
          {node.type === "organization" && (
            <div className="space-y-3 animate-in fade-in duration-500">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <Zap className="size-3 text-amber-500" /> 訂閱方案管理
               </h4>
               <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">當前部署方案</p>
                    <p className="text-sm font-black text-indigo-600 truncate max-w-[120px]">{(node as any).metadata?.plan || "FREE"}</p>
                  </div>
                  <OrgPlanManager
                    orgId={node.id}
                    currentPlan={(node as any).metadata?.plan || "FREE"}
                    orgName={node.name}
                  />
               </div>
            </div>
          )}

          {/* 安全治理與用戶控制 */}
          {["landlord", "manager", "tenant"].includes(node.type) && (
            <div className="space-y-4 animate-in fade-in duration-500">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 text-rose-500">
                 <ShieldAlert className="size-3" /> 安全狀態與全域治理
               </h4>
               <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
                  <UserStatusToggle
                    userId={node.id}
                    currentStatus={node.status || "ACTIVE"}
                    userName={node.name}
                  />
                  <p className="text-[9px] text-slate-400 font-medium mt-4 leading-relaxed italic border-t pt-3">
                    戰略提示：停權動作將由 AIC 全域派發，立即凍結所有相關數位資產存取權。
                  </p>
               </div>
               
               {/* 治理影響告知 (Impact Advisor) */}
               <GovernanceImpactAdvisor node={node} />
            </div>
          )}

          {/* 附加工具組件 */}
          <div className="space-y-3 pb-4">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-blue-500">進階分析工具</p>
             <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-20 flex-col gap-2 font-black text-[10px] uppercase tracking-widest bg-white hover:bg-slate-50 border-slate-200 transition-all hover:border-blue-500/30 group">
                  <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <AlertCircle className="size-4" />
                  </div>
                  診斷日誌
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 font-black text-[10px] uppercase tracking-widest bg-white hover:bg-slate-50 border-slate-200 transition-all hover:border-amber-500/30 group">
                  <div className="size-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
                    <Zap className="size-4" />
                  </div>
                  資源映射
                </Button>
             </div>
          </div>
        </div>

        <SheetFooter className="absolute bottom-6 left-6 right-6">
          <div className="w-full flex items-center justify-center gap-2 opacity-30">
             <ShieldAlert className="size-3 text-slate-400" />
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">AIC Command Safeguard Active</span>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}