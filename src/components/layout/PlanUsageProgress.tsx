"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";

/**
 * 方案房源額度進度顯示組件
 */
export function PlanUsageProgress() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  if (loading || !data) return null;

  const PLAN_LIMITS: Record<string, number> = {
    FREE: 2,
    STARTER: 10,
    PRO: 50,
  };

  const limit = PLAN_LIMITS[data.plan] || 0;
  const usagePercent = Math.min((data.propertyCount / limit) * 100, 100);
  const isFull = data.propertyCount >= limit;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground">當前方案</span>
          <Badge 
            variant={data.plan === "PRO" ? "default" : "secondary"} 
            className={`text-[10px] px-1.5 py-0 ${data.plan === "PRO" ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}`}
          >
            {data.plan === "PRO" && <Crown className="size-3 mr-1" />}
            {data.plan}
          </Badge>
        </div>
        <span className={`text-xs font-medium ${isFull ? "text-destructive" : "text-muted-foreground"}`}>
          {data.propertyCount} / {limit}
        </span>
      </div>
      
      {/* 簡易進度條 */}
      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all ${isFull ? "bg-destructive" : usagePercent > 80 ? "bg-amber-500" : "bg-blue-600"}`}
          style={{ width: `${usagePercent}%` }}
        />
      </div>
      
      <p className="text-[10px] text-muted-foreground text-center">
        {isFull ? "額度已滿，請聯繫管理員升級" : `剩餘可建立 ${limit - data.propertyCount} 間`}
      </p>
    </div>
  );
}