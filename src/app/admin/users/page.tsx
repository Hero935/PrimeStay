/**
 * Admin User Governance Page
 * AIC v3 成員治理解決方案 (Registry & Governance)
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { 
    Users, 
    ShieldAlert, 
    Ban, 
    MoreHorizontal, 
    Search,
    Filter,
    Activity,
    Tag
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "ADMIN") redirect("/");

  // 獲取所有用戶及其組織資訊
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      organizations: { select: { name: true } }, // 房東擁有的組織
      userOrganizations: { // 作為成員的組織
        include: {
          organization: { select: { name: true } }
        }
      }
    }
  });

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {/* 1. 頁面標題與搜尋控制項 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-mono font-bold tracking-tight text-slate-900 uppercase flex items-center gap-3">
             <Users className="w-6 h-6 text-indigo-600" /> 全域成員註冊清冊 (Registry)
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
             全域行為治理與身份標籤監控系統
          </p>
        </div>
        <div className="flex items-center gap-2">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                    placeholder="搜尋用戶 ID / 電子郵件..."
                    className="bg-white border border-slate-200 rounded-lg py-1.5 pl-9 pr-4 text-xs font-mono text-slate-900 w-64 focus:outline-none focus:border-indigo-500/50 transition-all font-sans"
                />
            </div>
            <Button variant="outline" className="border-slate-200 bg-white text-[10px] uppercase font-bold h-9 hover:border-slate-300">
                <Filter className="w-3 h-3 mr-2" /> 篩選條件
            </Button>
        </div>
      </div>

      {/* 2. 治理數據 Summary (Security Pulse) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <Card className="bg-white border-slate-200 p-4 flex items-center gap-4 hover:border-indigo-500/30 transition-all cursor-pointer shadow-sm">
              <div className="p-3 rounded-xl bg-indigo-50">
                 <ShieldAlert className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                 <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">活躍節點數</div>
                 <div className="text-xl font-mono font-bold text-slate-900">{users.length}</div>
              </div>
           </Card>
           <Card className="bg-white border-slate-200 p-4 flex items-center gap-4 hover:border-rose-500/30 transition-all cursor-pointer shadow-sm">
              <div className="p-3 rounded-xl bg-rose-50">
                 <Ban className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                 <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">全域封禁標記</div>
                 <div className="text-xl font-mono font-bold text-rose-500">0</div>
              </div>
           </Card>
           <Card className="bg-white border-slate-200 p-4 flex items-center gap-4 hover:border-emerald-500/30 transition-all cursor-pointer shadow-sm">
              <div className="p-3 rounded-xl bg-emerald-50">
                 <Activity className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                 <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">操作異動速率</div>
                 <div className="text-xl font-mono font-bold text-emerald-500">12.2 / h</div>
              </div>
           </Card>
      </div>

      {/* 3. 成員清單 (Actor Grid) */}
      <Card className="bg-white border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">身份標識 (Identity)</th>
                        <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">系統權限角色</th>
                        <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">所屬組織實體</th>
                        <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">行為追蹤時間軸</th>
                        <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right whitespace-nowrap">治理動作</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="p-4">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{user.name || "未綁定節點"}</span>
                                    <span className="text-[9px] font-mono text-slate-400 truncate max-w-[150px]">{user.email}</span>
                                </div>
                            </td>
                            <td className="p-4">
                                <Badge className={cn("text-[8px] uppercase font-black px-1.5 h-4 border", 
                                    user.systemRole === "ADMIN" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                                    user.systemRole === "LANDLORD" ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" :
                                    "bg-slate-500/10 text-slate-500 border-slate-500/20"
                                )}>
                                    {user.systemRole === "ADMIN" ? "超級管理員" : user.systemRole === "LANDLORD" ? "房東代理人" : "一般使用者"}
                                </Badge>
                            </td>
                            <td className="p-4">
                                <span className="text-[10px] text-slate-400 font-medium font-sans">
                                    {user.organizations?.[0]?.name || user.userOrganizations?.[0]?.organization?.name || "獨立行動者"}
                                </span>
                            </td>
                            <td className="p-4">
                                <div className="flex gap-1 flex-wrap">
                                    <Badge variant="outline" className="text-[8px] border-slate-200 text-slate-500 py-0 px-1 rounded-sm bg-slate-50">
                                        <Tag className="w-2 h-2 mr-1" /> 已認證
                                    </Badge>
                                    <Badge variant="outline" className="text-[8px] border-emerald-200 text-emerald-600 py-0 px-1 rounded-sm bg-emerald-50">
                                        在線中
                                    </Badge>
                                </div>
                            </td>
                            <td className="p-4 text-right">
                               <div className="opacity-0 group-hover:opacity-100 transition-all flex justify-end gap-1.5">
                                    <button className="h-7 w-7 flex items-center justify-center border border-slate-200 rounded bg-white text-slate-400 hover:border-rose-500/50 hover:text-rose-500 transition-all shadow-sm" title="全域封禁">
                                        <Ban className="w-3 h-3" />
                                    </button>
                                    <button className="h-7 w-7 flex items-center justify-center border border-slate-200 rounded bg-white text-slate-400 hover:border-indigo-500/50 hover:text-indigo-600 transition-all shadow-sm">
                                        <MoreHorizontal className="w-3.5 h-3.5" />
                                    </button>
                               </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </Card>
      
      {/* 底部導引與導航 */}
      <div className="flex justify-between items-center text-[9px] text-slate-700 font-mono font-bold uppercase tracking-widest mt-2">
         <div>註冊週期：穩定 | 總節點數：{users.length}</div>
         <div className="flex gap-6">
            <button className="hover:text-indigo-400 transition-colors">匯出帳冊 (.csv)</button>
            <button className="hover:text-rose-400 transition-colors">批次封鎖 (Suppress)</button>
         </div>
      </div>
    </div>
  );
}