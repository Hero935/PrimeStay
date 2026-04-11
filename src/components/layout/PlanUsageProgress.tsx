"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Crown, ShieldCheck, Activity, User } from "lucide-react";
import { useSession } from "next-auth/react";

interface PlanUsageProgressProps {
  manualData?: {
    plan: string;
    propertyCount: number;
  };
}

/**
 * 方案房源額度進度顯示組件
 */
export function PlanUsageProgress({ manualData }: PlanUsageProgressProps) {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(manualData || null);
  const [loading, setLoading] = useState(!manualData);

  const role = (session?.user as any)?.role || "TENANT";

  useEffect(() => {
    if (manualData) {
      setData(manualData);
      setLoading(false);
      return;
    }

    async function fetchOrgInfo() {
      try {
        const res = await fetch("/api/user/organizations");
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          // 預設取得目前登入的主組織
          setData(json.data[0]);
        }
      } catch (err) {
        console.error("Fetch org info error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrgInfo();
  }, [manualData]);

  if (loading || !data) return null;

  const PLAN_LIMITS: Record<string, number> = {
    FREE: 2,
    STARTER: 10,
    PRO: 50,
  };

  const limit = PLAN_LIMITS[data.plan] || 0;
  const usagePercent = Math.min((data.propertyCount / limit) * 100, 100);
  const isFull = data.propertyCount >= limit;

  // 根據角色自定義顯示內容
  const getContextInfo = () => {
    switch (role) {
      case "ADMIN":
        return {
          label: "組織資源負載",
          icon: <ShieldCheck className="size-3 text-blue-500" />,
          statusText: isFull ? "配額已達上限" : "系統分配狀態良好",
          subText: "ADMIN 模式：可隨時調整策略參數"
        };
      case "LANDLORD":
        return {
          label: "方案資產額度",
          icon: <Crown className="size-3 text-amber-500" />,
          statusText: isFull ? "額度已滿" : `可用房源 ${limit - data.propertyCount} 間`,
          subText: isFull ? "點擊治理中心申請方案升級" : "房源資產佈署中"
        };
      case "MANAGER":
        return {
          label: "轄下房源稼動率",
          icon: <Activity className="size-3 text-emerald-500" />,
          statusText: `${usagePercent.toFixed(0)}% 指標`,
          subText: "負責房源之數據已同步至中心"
        };
      default:
        return {
          label: "數位足跡診斷",
          icon: <User className="size-3 text-slate-500" />,
          statusText: "正常 (Stable)",
          subText: "權益狀態：活動中"
        };
    }
  };

  const context = getContextInfo();

  return (
    <div className="space-y-3 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {context.icon}
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{context.label}</span>
          {role !== "TENANT" && (
            <Badge
              variant={data.plan === "PRO" ? "default" : "secondary"}
              className={`text-[9px] px-1.5 h-4 font-black ${data.plan === "PRO" ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-400"}`}
            >
              {data.plan}
            </Badge>
          )}
        </div>
        <span className={`text-[10px] font-mono font-bold ${isFull ? "text-rose-500" : "text-slate-400"}`}>
          {data.propertyCount} / {limit}
        </span>
      </div>
      
      {/* Nexus Style 進度條 */}
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50 shadow-inner">
        <div
          className={`h-full transition-all duration-1000 ease-out ${isFull ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" : usagePercent > 80 ? "bg-amber-500" : "bg-indigo-600"}`}
          style={{ width: `${usagePercent}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between mt-1">
         <p className="text-[9px] font-bold text-slate-400 italic">
           {context.statusText}
         </p>
         <p className="text-[8px] font-medium text-slate-300 uppercase tracking-tighter">
           {context.subText}
         </p>
      </div>
    </div>
  );
}