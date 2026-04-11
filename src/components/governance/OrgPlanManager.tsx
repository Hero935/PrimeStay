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

interface OrgPlanManagerProps {
  orgId: string;
  currentPlan: string;
  orgName: string;
}

const PLANS = [
  { id: "FREE", name: "免費方案", color: "bg-slate-500" },
  { id: "STARTER", name: "開發者方案", color: "bg-blue-500" },
  { id: "PRO", name: "專業版", color: "bg-indigo-600" },
  { id: "ENTERPRISE", name: "企業旗艦", color: "bg-purple-600" },
];

/**
 * 組織訂閱方案管理組件
 * 提供方案切換與即時狀態更新
 */
export function OrgPlanManager({ orgId, currentPlan, orgName }: OrgPlanManagerProps) {
  const [loading, setLoading] = useState(false);
  const [activePlan, setActivePlan] = useState(currentPlan);

  const handlePlanChange = async (planId: string) => {
    setLoading(true);
    // 模擬 API 調用
    await new Promise((resolve) => setTimeout(resolve, 800));
    setActivePlan(planId);
    setLoading(false);
  };

  return (
    <DropdownMenu>
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