/**
 * AICDiagnostics.tsx
 * AIC v3 診斷組件庫 (High-Density Metrics)
 */
"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, Database, Cloud, Users, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AICFinanceStripe - 今日收支與設施成本帶 (The Ledger)
 */
export function AICFinanceStripe() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* 營收指標 */}
      <Card className="bg-white border-slate-200 p-4 relative overflow-hidden group hover:border-emerald-500/50 transition-all shadow-sm">
        <div className="absolute top-0 right-0 p-2 opacity-5">
          <Activity className="w-16 h-16 text-emerald-600" />
        </div>
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">預估月經常性營收 (MRR)</div>
        <div className="text-2xl font-mono font-bold text-emerald-600 tracking-tighter">$128,450</div>
        <div className="flex items-center gap-1 text-[10px] text-emerald-600 mt-2 font-mono font-bold">
          <TrendingUp className="w-3 h-3" /> +12.4% <span className="text-slate-400 ml-1 font-sans">相較上月</span>
        </div>
      </Card>

      {/* 方案配額與利用率 */}
      <Card className="bg-white border-slate-200 p-4 hover:border-indigo-500/50 transition-all shadow-sm group">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">訂閱負載狀態</div>
        <div className="text-2xl font-mono font-bold text-slate-900 tracking-tighter">1,248 <span className="text-xs font-bold text-slate-300 group-hover:text-indigo-500 transition-colors ml-1">活躍中</span></div>
        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between text-[8px] text-slate-400 uppercase font-bold tracking-widest">
            <span>配額利用率</span>
            <span className="text-indigo-600">65.2%</span>
          </div>
          <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full w-[65.2%]" />
          </div>
        </div>
      </Card>

      {/* 資料庫筆數脈動 */}
      <Card className="bg-white border-slate-200 p-4 hover:border-amber-500/50 transition-all shadow-sm">
        <div className="flex justify-between items-start mb-1">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">資料庫數據脈動 (總筆數)</div>
          <Database className="w-3 h-3 text-slate-300" />
        </div>
        <div className="text-2xl font-mono font-bold text-amber-600 tracking-tighter">428.5k</div>
        <div className="flex items-center gap-2 mt-2">
            <div className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 font-bold">日增長 +2.4k</div>
            <div className="text-[9px] text-slate-400 font-mono font-bold">預計 8 個月後達 1M</div>
        </div>
      </Card>

      {/* 雲端圖像存儲 */}
      <Card className="bg-white border-slate-200 p-4 hover:border-blue-500/50 transition-all shadow-sm">
        <div className="flex justify-between items-start mb-1">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">媒體存儲負載 (Cloudinary)</div>
          <Cloud className="w-3 h-3 text-slate-300" />
        </div>
        <div className="text-2xl font-mono font-bold text-blue-600 tracking-tighter">12.2 GB</div>
        <div className="mt-3 flex gap-0.5 h-1">
           {[40, 60, 30, 80, 50, 70, 90, 45, 85, 55].map((h, i) => (
             <div key={i} className="flex-1 bg-blue-100" style={{ height: `${h}%` }} />
           ))}
        </div>
        <div className="text-[9px] text-slate-400 mt-2 uppercase font-bold tracking-tighter">容量指數: 78.4%</div>
      </Card>
    </div>
  );
}

/**
 * AICHealthHeatmap - 生態健康與出租率診斷 (The Diagnostic Core)
 */
export function AICHealthHeatmap() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-800">系統戰略診斷中心</h2>
        </div>
        <Badge variant="outline" className="text-[9px] border-indigo-100 text-indigo-600 bg-indigo-50/50 px-2 py-0 font-bold tracking-tight">自動刷新: 60S</Badge>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 出租率警示 */}
        <Card className="bg-white border-slate-200 p-4 shadow-sm">
          <div className="text-[9px] text-slate-400 uppercase font-bold mb-3 tracking-wider">出租率健康度 (Occupancy)</div>
          <div className="flex items-baseline gap-2 mb-4">
            <div className="text-3xl font-mono font-bold text-slate-900 tracking-tighter">74.2%</div>
            <div className="text-[10px] text-rose-600 font-bold flex items-center bg-rose-50 px-1 rounded">-2.1%</div>
          </div>
          <div className="p-3 rounded-lg bg-rose-50/50 border border-rose-100 flex items-center justify-between">
             <div className="text-[10px] text-rose-900 font-semibold">12 位房東 {"<"} 40% 出租率</div>
             <Badge className="bg-rose-600 text-[8px] h-4 font-bold border-none">致命警告</Badge>
          </div>
        </Card>
        
        {/* 訪客動脈 */}
        <Card className="bg-white border-slate-200 p-4 shadow-sm">
           <div className="text-[10px] text-slate-400 uppercase font-bold mb-3 tracking-wider">訪客脈動 (24H 流量)</div>
           <div className="text-3xl font-mono font-bold text-slate-900 mb-4 tracking-tighter">8.4k <span className="text-[10px] text-emerald-600 uppercase font-bold ml-1">上升中</span></div>
           <div className="flex items-end gap-1 h-10 w-full mb-1">
             {[30, 45, 25, 60, 55, 80, 70, 90, 65, 85, 95, 100, 80, 60, 40, 50, 70, 90, 85, 95, 100, 110, 105, 120].map((h, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex-1 rounded-t-[1px] transition-all duration-500",
                    i > 20 ? "bg-indigo-500" : "bg-indigo-500/20"
                  )} 
                  style={{ height: `${(h / 120) * 100}%` }}
                />
             ))}
           </div>
           <div className="flex justify-between text-[8px] text-slate-700 font-mono">
             <span>00:00</span>
             <span>12:00</span>
             <span>23:59</span>
           </div>
        </Card>

        {/* 平台成員組成 */}
        <Card className="bg-white border-slate-200 p-4 flex flex-col justify-between shadow-sm">
           <div className="text-[10px] text-slate-400 uppercase font-bold mb-3 tracking-wider">全域身分脈動 (Identity Pulse)</div>
           <div className="space-y-3">
              <MemberBar label="房東" count={242} color="bg-blue-500" percent={20} />
              <MemberBar label="代管人員" count={86} color="bg-indigo-500" percent={10} />
              <MemberBar label="房客" count={1240} color="bg-emerald-500" percent={70} />
           </div>
           <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
              <div className="text-[10px] text-slate-400 font-mono font-bold">總計: 1,568 節點</div>
              <UserCheck className="w-3 h-3 text-emerald-500/30" />
           </div>
        </Card>
      </div>
    </div>
  );
}

function MemberBar({ label, count, color, percent }: { label: string, count: number, color: string, percent: number }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-16 text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
            <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className={cn("h-full", color)} style={{ width: `${percent}%` }} />
            </div>
            <div className="w-8 text-[10px] font-mono font-bold text-slate-400 text-right">{count}</div>
        </div>
    );
}