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
  onStatusUpdate?: (newStatus: string) => void;
}

/**
 * 用戶治理狀態切換組件
 * 用於執行停權、啟動等高風險權限操作
 */
export function UserStatusToggle({ userId, currentStatus, userName, onStatusUpdate }: UserStatusToggleProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(currentStatus);

  const toggleStatus = async () => {
    try {
      setLoading(true);
      const action = status === "ACTIVE" ? "SUSPEND" : "ACTIVATE";
      
      const response = await fetch("/api/management/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds: [userId],
          action
        })
      });

      if (!response.ok) throw new Error("Failed to update status");

      const nextStatus = status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
      setStatus(nextStatus);
      onStatusUpdate?.(nextStatus);
    } catch (error) {
      console.error("Status update failed:", error);
    } finally {
      setLoading(false);
    }
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
          "w-full h-12 font-black text-[11px] uppercase tracking-[0.1em] gap-3 shadow-xl transition-all active:scale-[0.98] border-2",
          status === "ACTIVE"
            ? "bg-slate-950 border-rose-600 text-rose-500 hover:bg-rose-600 hover:text-white shadow-rose-900/20"
            : "bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-700 shadow-emerald-900/20"
        )}
        onClick={toggleStatus}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : status === "ACTIVE" ? (
          <div className="flex items-center gap-2">
            <span className="bg-rose-600 text-white text-[8px] px-1.5 py-0.5 rounded mr-1 animate-pulse">DANGER</span>
            <Ban className="size-4" />
          </div>
        ) : (
          <CheckCircle2 className="size-4" />
        )}
        {loading ? "正在同步治理狀態..." : status === "ACTIVE" ? "執行立即停權 (TERMINATE)" : "活性化 / 恢復權限存取"}
      </Button>
    </div>
  );
}