"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, CheckCircle2, Ban, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserStatusToggleProps {
  userId: string;
  currentStatus: string;
  userName: string;
}

/**
 * 用戶治理狀態切換組件
 * 用於執行停權、啟動等高風險權限操作
 */
export function UserStatusToggle({ userId, currentStatus, userName }: UserStatusToggleProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(currentStatus);

  const toggleStatus = async () => {
    setLoading(true);
    // 模擬治理 API 調用與資產鎖定流程
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const nextStatus = status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setStatus(nextStatus);
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">治理決策執行器</label>
        <Badge className={cn(
          "font-black text-[9px] px-2 h-5 transition-all border-none",
          status === "ACTIVE" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
        )}>
          SYSTEM: {status}
        </Badge>
      </div>
      
      <Button
        variant={status === "ACTIVE" ? "destructive" : "default"}
        className={cn(
          "w-full h-11 font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg transition-all active:scale-95",
          status === "ACTIVE" ? "bg-rose-600 hover:bg-rose-700 shadow-rose-900/10" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/10"
        )}
        onClick={toggleStatus}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : status === "ACTIVE" ? (
          <Ban className="size-4" />
        ) : (
          <CheckCircle2 className="size-4" />
        )}
        {loading ? "正在同步治理狀態..." : status === "ACTIVE" ? "執行立即停權" : "恢復權限存取"}
      </Button>
    </div>
  );
}