import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AICFinanceStripe, AICHealthHeatmap } from "@/components/admin/AICDiagnostics";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Home, ArrowRight, Activity } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * AdminDashboardPage - Admin AIC v3 Core Dashboard
 * 採用 Obsidian Dark 戰略診斷模式
 */
export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "ADMIN") redirect("/");

  // 獲取初步統計資料 (保留與舊版相容性，但 UI 跳轉至 AIC 規格)
  const [
    organizationCount,
    memberCount,
    propertyCount,
    organizations,
  ] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count({ where: { systemRole: { in: ["LANDLORD", "MANAGER"] } } }),
    prisma.property.count(),
    prisma.organization.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { name: true } },
        properties: { select: { id: true, status: true } },
        _count: { select: { properties: true, members: true } }
      }
    }),
  ]);

  // 計算出租率預警組織數量 (用於首頁診斷 Badge)
  const allOrgsForStats = await prisma.organization.findMany({
    include: { properties: { select: { status: true } } }
  });
  
  const lowOccupancyCount = allOrgsForStats.filter(org => {
    const total = org.properties.length;
    const rented = org.properties.filter(p => p.status === 'RENTED').length;
    const rate = total > 0 ? (rented / total) * 100 : 0;
    return total > 0 && rate < 40;
  }).length;

  return (
    <div className="flex-1 space-y-6 lg:space-y-8 p-0 lg:p-8 pt-2 lg:pt-6">
      {/* 1. 頂部戰略標題 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 px-4 lg:px-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-baseline gap-2">
            <span className="text-indigo-600">AIC</span>
            <span className="text-slate-900">管理總覽</span>
            <span className="text-xs font-mono font-medium text-slate-400">v3.0.4</span>
          </h2>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-sm text-slate-500 font-medium tracking-normal">
              系統全域治理與戰略診斷介面
            </p>
            <div className="flex items-center gap-1.5 overflow-hidden bg-emerald-50/50 px-2 py-0.5 rounded-full border border-emerald-200">
               <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[9px] text-emerald-700 font-mono font-black tracking-tight">系統正常: 242ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 高密度財務與成本監控帶 (KPI Stipe) */}
      <AICFinanceStripe />

      {/* 3. 主要診斷核心 (Heatmaps & Pulse) */}
      <AICHealthHeatmap />

      {/* 4. 底層組織監控 Grid (High-Density List) */}
      <div className="grid grid-cols-1 gap-4 mt-6 lg:mt-0">
        <div className="flex items-center justify-between px-4 lg:px-0">
            <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">最近組織節點動態</h2>
            </div>
            <Link href="/admin/organizations" className="group flex items-center gap-1 text-[10px] font-medium text-slate-500 hover:text-indigo-600 transition-colors bg-white lg:bg-transparent p-1.5 lg:p-0 rounded-md border lg:border-none shadow-sm lg:shadow-none">
                查看組織項目 <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 px-4 lg:px-0">
          {organizations.map((org) => {
            const total = org.properties.length;
            const rented = org.properties.filter(p => p.status === 'RENTED').length;
            const rate = total > 0 ? Math.round((rented / total) * 100) : 0;
            const isAlert = total > 0 && rate < 40;

            return (
              <Link href={`/admin/organizations?search=${encodeURIComponent(org.name)}`} key={org.id}>
                <Card className={cn(
                    "bg-white border-slate-100 p-4 hover:border-indigo-500/50 transition-all cursor-pointer group shadow-sm",
                    isAlert && "hover:border-amber-500/50"
                )}>
                   <div className="flex justify-between items-start mb-2">
                      <div className="text-[10px] text-slate-400 font-bold uppercase truncate tracking-wider">{org.owner.name}</div>
                      {isAlert && <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" title="流失預警" />}
                   </div>
                   <div className="text-sm font-bold text-slate-900 mb-3 truncate group-hover:text-indigo-600 transition-colors">{org.name}</div>
                   <div className="flex gap-2">
                      <div className="flex-1 flex flex-col gap-1">
                         <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">出租率</span>
                         <span className={cn("text-xs font-mono font-medium", isAlert ? "text-amber-500" : "text-slate-600")}>{rate}%</span>
                      </div>
                      <div className="flex-1 flex flex-col gap-1">
                         <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">成員節點</span>
                         <span className="text-xs font-mono font-medium text-slate-600">{org._count.members}</span>
                      </div>
                      <div className="shrink-0 flex items-end pb-0.5">
                         <Badge className={cn(
                            "text-[8px] h-3.5 px-1 border",
                            isAlert ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                         )}>
                            {isAlert ? "待診斷" : "營運中"}
                         </Badge>
                      </div>
                   </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  );
}