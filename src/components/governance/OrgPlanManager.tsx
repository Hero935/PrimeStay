"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Settings2, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface OrgPlanManagerProps {
  orgId: string;
  currentPlan: string;
  orgName: string;
  onPlanUpdate?: (newPlan: string) => void;
}

const PLANS = [
  { id: "FREE", name: "Free (免費)", color: "bg-slate-500" },
  { id: "STARTER", name: "Starter (入門)", color: "bg-blue-500" },
  { id: "PRO", name: "Pro (專業)", color: "bg-indigo-600" },
];

/**
 * 組織訂閱方案管理組件
 * 提供方案切換與即時狀態更新
 */
export function OrgPlanManager({ orgId, currentPlan, orgName, onPlanUpdate }: OrgPlanManagerProps) {
  const [loading, setLoading] = useState(false);
  const [activePlan, setActivePlan] = useState(currentPlan);

  const handlePlanChange = async (planId: string) => {
    if (planId === activePlan) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/management/plan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, planId })
      });

      if (res.ok) {
        setActivePlan(planId);
        toast.success(`${orgName} 方案已成功變更為 ${planId}`);
        if (onPlanUpdate) onPlanUpdate(planId);
      } else {
        toast.error("變更方案失敗");
      }
    } catch (err) {
      toast.error("系統發生錯誤");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-indigo-200 hover:bg-indigo-100 hover:text-indigo-700 transition-all font-bold text-[10px] uppercase tracking-widest gap-2"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Settings2 className="size-3" />
          )}
          變更方案
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-2">
        <p className="px-2 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b mb-1">
          選擇部署級別
        </p>
        {PLANS.map((plan) => (
          <DropdownMenuItem
            key={plan.id}
            onClick={() => handlePlanChange(plan.id)}
            className="flex items-center justify-between py-2 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className={cn("size-2 rounded-full", plan.color)} />
              <span className="text-xs font-bold">{plan.name}</span>
            </div>
            {activePlan === plan.id && <Check className="size-3 text-indigo-600" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}