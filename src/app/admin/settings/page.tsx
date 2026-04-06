/**
 * Admin Command Control Room (Settings)
 * AIC v3 戰略參數中控室
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
    Settings,
    Shield,
    Database,
    Info,
    ToggleRight,
    Percent,
    Server,
    BellRing,
    Zap,
    Scale,
    Cpu
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const user = session.user as any;
  if (user.role !== "ADMIN") redirect("/");

  // 查詢所有組織（統計用途）
  const organizations = await prisma.organization.findMany({
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="p-8 space-y-8 w-full max-w-7xl mx-auto">
      {/* 頁面標題與戰略定位 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-100">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
               戰略參數中控室
               <Badge variant="outline" className="bg-slate-900 text-white border-none text-[10px] px-1.5 h-4 font-mono">CC-ROOM v3</Badge>
            </h1>
            <p className="text-sm text-slate-500 font-medium">全平台行為閾值與功能旗標管控中心</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="text-right mr-4 hidden md:block">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">系統脈動</p>
                <p className="text-xs font-mono font-bold text-emerald-500">OPERATIONAL</p>
            </div>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded-xl px-4 py-5 shadow-lg shadow-indigo-100">
                <Server className="w-4 h-4 mr-2" /> 更新全體參數
            </Button>
        </div>
      </div>

      {/* 主體網格 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 左欄：核心旗標與治理權限 (Feature Flags) */}
        <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-sm bg-slate-50/50">
                <CardHeader className="pb-3 border-b border-slate-100 bg-white rounded-t-xl">
                    <CardTitle className="text-sm font-bold text-slate-800 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <ToggleRight className="w-4 h-4 text-indigo-500" /> 功能旗標 (Feature Flags)
                        </span>
                        <Badge variant="outline" className="text-[9px] border-slate-200">即時生效</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100 bg-white">
                        {[
                            { id: 'f1', name: "AI 租金建議引擎", desc: "基於區域大數據的租金定價建議功能", status: true },
                            { id: 'f2', name: "電子簽章法務模組", desc: "整合外部電子簽章服務進行合約簽署", status: true },
                            { id: 'f3', name: "區塊鏈交易憑證", desc: "將繳費紀錄同步至私有鏈存證 (Beta)", status: false },
                            { id: 'f4', name: "智慧硬體解鎖入口", desc: "支援遠端智慧門鎖開啟與授權管理", status: false },
                        ].map((flag) => (
                            <div key={flag.id} className="flex items-center justify-between p-5 hover:bg-slate-50/30 transition-colors">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">{flag.name}</h4>
                                    <p className="text-xs text-slate-500">{flag.desc}</p>
                                </div>
                                <div className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer",
                                    flag.status ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-100 border-slate-200 text-slate-400"
                                )}>
                                    <span className="text-[10px] font-black uppercase tracking-tighter">{flag.status ? "Active" : "Disabled"}</span>
                                    <div className={cn("w-2 h-2 rounded-full", flag.status ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white">
                <CardHeader className="pb-4 border-b border-slate-50 text-indigo-600">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
                        <Scale className="w-4 h-4" /> 治理閾值與費率參數 (Global Thresholds)
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 p-6">
                    <ThresholdSlider label="出租率警告閾值 (Occupancy Trap)" value="40" unit="%" desc="低於此百分比將於首頁診斷顯示預警" />
                    <ThresholdSlider label="預設度電費率 (Power Rate)" value="5.5" unit="TWD" desc="系統預設生成的房源電力平均單價" />
                    <ThresholdSlider label="帳單審核時限 (Grace Period)" value="72" unit="Hrs" desc="房客繳費後房東必須審核的緩衝時間" />
                    <ThresholdSlider label="DB 容量警戒線 (Prisma Guard)" value="85" unit="%" desc="資料庫空間佔用超過此值將限制附件上傳" />
                </CardContent>
            </Card>
        </div>

        {/* 右欄：基礎設施狀態與廣播 (Infrastructure Audit) */}
        <div className="space-y-8">
            <Card className="border-none shadow-lg shadow-indigo-100/20 bg-indigo-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Zap className="w-24 h-24 rotate-12" />
                </div>
                <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <BellRing className="w-4 h-4" /> 緊急緊急廣播頻道
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <textarea
                        className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-xs placeholder:text-white/40 focus:outline-none focus:bg-white/20 min-h-[100px]"
                        placeholder="請鍵入全平台推播內容... (例如維護通知)"
                    />
                    <Button variant="secondary" className="w-full bg-white text-indigo-900 font-bold text-xs hover:bg-slate-100 transition-all">
                        發送全域廣播
                    </Button>
                    <p className="text-[9px] text-white/40 text-center italic font-mono uppercase">Broadcasted logs will be archived in Audit Vault</p>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white">
                <CardHeader>
                    <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Cpu className="w-4 h-4" /> 基礎設施快照 (Pulse)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <InfrastructureStatus label="Prisma Client 連線數" value="12 / 20" progress={60} color="bg-indigo-500" />
                    <InfrastructureStatus label="Next.js 伺服器端負載" value="2.4ms" progress={15} color="bg-emerald-500" />
                    <InfrastructureStatus label="API 請求速率 (RPM)" value="120" progress={45} color="bg-blue-500" />
                    
                    <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 space-y-1 font-mono">
                        <div className="flex justify-between"><span>版本控制:</span><span className="text-slate-800">AIC-V3.4.2-STABLE</span></div>
                        <div className="flex justify-between"><span>節點狀態:</span><span className="text-emerald-500 font-bold">NODE_HEALTHY</span></div>
                        <div className="flex justify-between"><span>最近部署:</span><span className="text-slate-800">2026-04-05 22:15</span></div>
                    </div>
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}

/**
 * 閾值調整顯示組件
 */
function ThresholdSlider({ label, value, unit, desc }: { label: string, value: string, unit: string, desc: string }) {
  return (
    <div className="space-y-2 group">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">{label}</label>
        <span className="text-xs font-mono font-bold bg-slate-900 text-white px-1.5 rounded">{value} <span className="opacity-50 text-[9px]">{unit}</span></span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
         <div className="h-full bg-slate-900 w-1/2 group-hover:w-2/3 transition-all duration-700" />
      </div>
      <p className="text-[10px] text-slate-400 transform transition-all group-hover:translate-x-1">{desc}</p>
    </div>
  );
}

/**
 * 基礎設施狀態顯示組件
 */
function InfrastructureStatus({ label, value, progress, color }: { label: string, progress: number, value: string, color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-bold text-slate-700">{label}</span>
        <span className="text-[10px] font-mono text-slate-400">{value}</span>
      </div>
      <Progress value={progress} className="h-1" />
    </div>
  );
}