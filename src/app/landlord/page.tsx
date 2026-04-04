import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Receipt,
  Wrench,
  TrendingUp,
  Users,
  AlertCircle,
  History
} from "lucide-react";
import { prisma } from "@/lib/prisma";

/**
 * 房東/代管人員管理後台儀表板
 * 根據角色顯示不同的統計數據與功能入口
 */
export default async function LandlordDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  const userId = (session.user as any).id;
  const orgId = (session.user as any).organizationId;

  // 統一篩選條件：Manager 僅能看自己負責的，Landlord 看整個組織的
  const propertyFilter = role === "MANAGER" ? { managerId: userId } : { organizationId: orgId };

  // 1. 房源總數
  const propertyCount = await prisma.property.count({
    where: propertyFilter
  });

  // 2. 待處理報修
  const pendingMaintenances = await prisma.maintenance.count({
    where: {
      status: "PENDING",
      contract: {
        property: propertyFilter
      }
    }
  });

  // 3. 待處理帳單 (PENDING_TENANT 或 PENDING_APPROVAL)
  const pendingBillings = await prisma.billing.count({
    where: {
      status: { in: ["PENDING_TENANT", "PENDING_APPROVAL"] },
      contract: {
        property: propertyFilter
      }
    }
  });

  // 4. 活躍房客 (狀態為 OCCUPIED)
  const tenantCount = await prisma.contract.count({
    where: {
      status: "OCCUPIED",
      property: propertyFilter
    }
  });

  // 5. 總預估營收 (所有 OCCUPIED 租約的租金總和)
  const totalRevenue = await prisma.contract.aggregate({
    where: {
      status: "OCCUPIED",
      property: propertyFilter
    },
    _sum: {
      monthlyRent: true
    }
  });

  const revenueValue = totalRevenue._sum.monthlyRent ? Number(totalRevenue._sum.monthlyRent).toLocaleString() : "0";

  const stats = [
    {
      title: role === "LANDLORD" ? "總預估營收" : "最近處理帳單",
      value: role === "LANDLORD" ? `$${revenueValue}` : `${pendingBillings} 筆`,
      description: role === "LANDLORD" ? "目前活躍租約總計" : "需處理帳單數",
      icon: role === "LANDLORD" ? TrendingUp : Receipt,
      color: "text-emerald-600"
    },
    { 
      title: role === "LANDLORD" ? "所有房源" : "負責房源", 
      value: propertyCount.toString(), 
      description: "包含多種房型", 
      icon: Building2, 
      color: "text-blue-600" 
    },
    { 
      title: "活躍房客", 
      value: tenantCount.toString(), 
      description: "目前租約中", 
      icon: Users, 
      color: "text-violet-600" 
    },
    { 
      title: "待處理報修", 
      value: pendingMaintenances.toString(), 
      description: "需盡速指派", 
      icon: Wrench, 
      color: "text-amber-600" 
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {role === "LANDLORD" ? "房東儀表板" : "代管工作台"}
        </h1>
        <p className="text-muted-foreground">
          歡迎回來, {session.user?.name}。您今日的角色是：{role === "LANDLORD" ? "房東 (Owner)" : "代管人員 (Manager)"}。
        </p>
      </div>

      {/* 數據快訊卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* 核心區塊：房東看趨勢，Manager 看待辦任務清單 */}
        {role === "LANDLORD" ? (
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>營收趨勢</CardTitle>
              <CardDescription>最近 6 個月的租金收入分析</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg bg-slate-50/50 m-4">
               <div className="flex flex-col items-center gap-2 text-muted-foreground">
                 <TrendingUp className="h-8 w-8 opacity-20" />
                 <p>營收趨勢圖表 (房東專屬檢視)</p>
               </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>房源維護狀況</CardTitle>
              <CardDescription>您負責的房源目前的健康度</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg bg-slate-50/50 m-4">
               <div className="flex flex-col items-center gap-2 text-muted-foreground">
                 <Building2 className="h-8 w-8 opacity-20" />
                 <p>負責房源狀態概覽 (Manager 專屬檢視)</p>
               </div>
            </CardContent>
          </Card>
        )}

        {/* 最近動態 / 異常告警 */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>急需處理</CardTitle>
            <CardDescription>
              {pendingBillings > 0 ? `您有 ${pendingBillings + pendingMaintenances} 項待辦需要處理` : "目前暫無緊急任務"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingBillings > 0 && (
                <div className="flex items-start gap-4 p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="grid gap-1">
                    <p className="text-sm font-semibold text-amber-900 leading-none">待處理帳單</p>
                    <p className="text-xs text-amber-700">共有 {pendingBillings} 筆帳單待審核或支付</p>
                  </div>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-3">最近動態</p>
                <div className="space-y-3">
                  {[
                    { title: "新報修單", detail: "系統自動指派", time: "3小時前", icon: Wrench },
                    { title: "合約續約", detail: "房客已確認意向", time: "5小時前", icon: History },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-slate-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-none">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.detail}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}