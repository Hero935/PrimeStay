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
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  const handleStatusToggle = async () => {
    setLoading(true);
    // 使用 alert 讓用戶感受到點擊功效 (模擬 API 響應)
    try {
      const isSuspending = node.status !== "SUSPENDED";
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`戰略指令已送達：${isSuspending ? '停權' : '恢復'} ${node.type} [${node.name}] 成功！\n系統稽核日誌已建立。`);
      
      onOpenChange(false);
      // 模擬 UI 更新而不重新整理 (因這是純 UI 展示測試)
      if (node.status === "SUSPENDED") {
        node.status = "ACTIVE";
      } else {
        node.status = "SUSPENDED";
      }
    } catch (err) {
      alert("指令執行失敗，請檢查權限層次。");
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustPlan = () => {
    alert(`切換至方案調整模式：正在為 ${node.name} 重新分配資源池...`);
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

        <div className="py-8 space-y-8">
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

          {/* 警告資訊 */}
          {node.status !== "SUSPENDED" && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex gap-3">
              <AlertTriangle className="size-5 text-rose-500 shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-rose-900">執行停權警告</p>
                <p className="text-[10px] text-rose-700 leading-relaxed font-medium">
                  停權該組織將導致旗下所有房源無法存取，並凍結相關帳務結算。此操作會記錄於全域稽核日誌。
                </p>
              </div>
            </div>
          )}

          {/* 操作按鈕群 */}
          <div className="space-y-3">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">可用指令 (Available Orders)</p>
             
             {node.status === "SUSPENDED" ? (
               <Button
                 onClick={handleStatusToggle}
                 disabled={loading}
                 className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-14 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
               >
                 {loading ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                 恢復實體權限 (Restore Access)
               </Button>
             ) : (
               <Button
                onClick={handleStatusToggle}
                disabled={loading}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white h-14 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-rose-900/20"
               >
                 {loading ? <Loader2 className="size-4 animate-spin" /> : <Ban className="size-4" />}
                 執行全域停權 (Global Ban)
               </Button>
             )}

             <Button
                onClick={handleAdjustPlan}
                disabled={loading}
                variant="outline"
                className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-600 border-2 hover:bg-slate-50"
             >
                調整方案配額 (Modify Plan)
             </Button>
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