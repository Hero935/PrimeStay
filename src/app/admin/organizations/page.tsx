/**
 * Admin Organization Governance Page
 * AIC v3 組織實體治理 (Organization Registry & Infrastructure)
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { 
    Building2, 
    Users, 
    Home, 
    Search, 
    Filter, 
    Activity, 
    Briefcase,
    ShieldCheck,
    MoreHorizontal,
    ArrowUpRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AdminOrganizationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "ADMIN") redirect("/");

  /**
   * 獲取所有組織及其關聯之房東、成員、房源資訊
   */
  const organizations = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
      members: {
        select: { id: true },
      },
      properties: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  // 計算全域統計指標
  const totalProperties = organizations.reduce((acc, org) => acc + org.properties.length, 0);
  const totalMembers = organizations.reduce((acc, org) => acc + org.members.length, 0);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* 1. 頁面標題與搜尋控制項 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-200">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">組織管理</h1>
            <p className="text-sm text-slate-500">全平台營運實體監控與資源分配系統</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                    placeholder="搜尋組織名稱 / 負責人..."
                    className="bg-white border border-slate-200 rounded-lg py-1.5 pl-9 pr-4 text-xs font-mono text-slate-900 w-64 focus:outline-none focus:border-indigo-500/50 transition-all font-sans"
                />
            </div>
            <Button variant="outline" className="border-slate-200 bg-white text-[10px] uppercase font-bold h-9 hover:border-slate-300">
                <Filter className="w-3 h-3 mr-2" /> 篩選參數
            </Button>
        </div>
      </div>

      {/* 2. 實體數據指標 (Infrastructure Pulse) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <Card className="bg-white border-slate-200 p-4 flex items-center gap-4 hover:border-indigo-500/30 transition-all cursor-pointer shadow-sm">
              <div className="p-3 rounded-xl bg-indigo-50">
                 <Briefcase className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                 <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">部署組織數</div>
                 <div className="text-xl font-mono font-bold text-slate-900">{organizations.length}</div>
              </div>
           </Card>
           <Card className="bg-white border-slate-200 p-4 flex items-center gap-4 hover:border-emerald-500/30 transition-all cursor-pointer shadow-sm">
              <div className="p-3 rounded-xl bg-emerald-50">
                 <Home className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                 <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">代管房源總量</div>
                 <div className="text-xl font-mono font-bold text-emerald-500">{totalProperties}</div>
              </div>
           </Card>
           <Card className="bg-white border-slate-200 p-4 flex items-center gap-4 hover:amber-500/30 transition-all cursor-pointer shadow-sm">
              <div className="p-3 rounded-xl bg-amber-50">
                 <Activity className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                 <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">營運成員總計</div>
                 <div className="text-xl font-mono font-bold text-amber-500">{totalMembers}</div>
              </div>
           </Card>
      </div>

      {/* 3. 組織清單 (Entity Grid) */}
      <Card className="bg-white border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">組織實體標識 (Entity ID)</th>
                        <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">負責房東 (Landlord)</th>
                        <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">資產部署狀態</th>
                        <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">建立日期環境</th>
                        <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right whitespace-nowrap">管理動作</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {organizations.map((org) => (
                        <tr key={org.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="p-4">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{org.name}</span>
                                    <span className="text-[9px] font-mono text-slate-400 truncate max-w-[150px]">{org.id}</span>
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-700 font-medium">{org.owner.name || "未設定名稱"}</span>
                                    <span className="text-[9px] text-slate-400 font-mono">{org.owner.email}</span>
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="flex gap-2 items-center">
                                    <Badge className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 text-[9px] px-1.5 h-4 flex items-center gap-1">
                                        <Home className="w-2.5 h-2.5" /> {org.properties.length} 房源
                                    </Badge>
                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] px-1.5 h-4 flex items-center gap-1">
                                        <Users className="w-2.5 h-2.5" /> {org.members.length} 成員
                                    </Badge>
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-2">
                                     <span className="text-[10px] text-slate-500 font-mono">
                                        {new Date(org.createdAt).toISOString().split('T')[0]}
                                     </span>
                                     <Badge variant="outline" className="text-[8px] border-emerald-500/10 text-emerald-500/60 py-0 px-1 rounded-sm">
                                        穩定運行
                                     </Badge>
                                </div>
                            </td>
                            <td className="p-4 text-right">
                               <div className="opacity-0 group-hover:opacity-100 transition-all flex justify-end gap-1.5">
                                    <button className="h-7 w-7 flex items-center justify-center border border-slate-200 rounded bg-white text-slate-400 hover:border-indigo-500/50 hover:text-indigo-600 transition-all shadow-sm" title="查看資源詳情">
                                        <ArrowUpRight className="w-3 h-3" />
                                    </button>
                                    <button className="h-7 w-7 flex items-center justify-center border border-slate-200 rounded bg-white text-slate-400 hover:border-indigo-500/50 hover:text-indigo-600 transition-all shadow-sm">
                                        <MoreHorizontal className="w-3.5 h-3.5" />
                                    </button>
                               </div>
                            </td>
                        </tr>
                    ))}
                    {organizations.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-20 text-center text-slate-600 font-mono text-xs italic tracking-widest">
                                NO ENTITIES DETECTED IN REGISTRY
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </Card>
      
      {/* 底部導引與導航 */}
      <div className="flex justify-between items-center text-[9px] text-slate-700 font-mono font-bold uppercase tracking-widest mt-2">
         <div>治理週期：常規 | 實體活躍度：{organizations.length > 0 ? "穩定" : "無"}</div>
         <div className="flex gap-6">
            <button className="hover:text-amber-400 transition-colors">基礎設施快照 (.json)</button>
            <button className="hover:text-indigo-400 transition-colors">權限重構 (Re-auth)</button>
         </div>
      </div>
    </div>
  );
}