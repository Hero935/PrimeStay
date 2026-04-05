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
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { formatDistanceToNow } from "date-fns";
import { zhTW } from "date-fns/locale";

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

  // 3. 待處理帳單 (包含待房客填寫與待房東審核)
  const pendingBillings = await prisma.billing.count({
    where: {
      status: { in: ["PENDING_TENANT", "PENDING_APPROVAL"] },
      contract: {
        property: propertyFilter
      }
    }
  });

  // 4. 逾期帳單 (僅計算狀態為 PENDING_TENANT 且已過期的)
  // 註：目前 Schema 中 Billing 尚未有 dueDate，暫以 periodEnd 作為逾期基準
  const overdueBillings = await prisma.billing.count({
    where: {
      status: "PENDING_TENANT",
      periodEnd: { lt: new Date() },
      contract: {
        property: propertyFilter
      }
    }
  });

  // 5. 空房數 (AVAILABLE 狀態的房源)
  const vacancyCount = await prisma.property.count({
    where: {
      ...propertyFilter,
      status: "AVAILABLE"
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

  // 6. 營收趨勢數據 (最近 6 個月)
  const lastSixMonths = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    lastSixMonths.push({
      start: new Date(d.getFullYear(), d.getMonth(), 1),
      end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
      label: d.toLocaleDateString("zh-TW", { month: "short" }),
    });
  }

  const revenueStats = await Promise.all(
    lastSixMonths.map(async (m) => {
      const res = await prisma.billing.aggregate({
        where: {
          status: "COMPLETED",
          periodEnd: { gte: m.start, lte: m.end },
          contract: { property: propertyFilter }
        },
        _sum: { totalAmount: true }
      });
      return {
        month: m.label,
        amount: res._sum.totalAmount ? Number(res._sum.totalAmount) : 0
      };
    })
  );

  // 7. 最近動態 (從 AuditLog 抓取)
  const recentLogs = await prisma.auditLog.findMany({
    where: { organizationId: orgId },
    take: 6,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } }
  });

  const actionIcons: Record<string, any> = {
    INVITE_TENANT: Users,
    PROPERTY_ASSIGNMENT: Building2,
    CREATE_BILLING: Receipt,
    MAINTENANCE_UPDATE: Wrench,
    DEFAULT: History
  };

  const actionLabels: Record<string, string> = {
    INVITE_TENANT: "邀請房客",
    PROPERTY_ASSIGNMENT: "房源指派",
    CREATE_BILLING: "產生帳單",
    MAINTENANCE_UPDATE: "報修更新",
    CANCEL_CONTRACT: "終止合約"
  };

  const stats = [
    {
      title: "總預估營收",
      value: `$${revenueValue}`,
      description: "目前活躍租約總計",
      icon: TrendingUp,
      color: "text-emerald-600"
    },
    {
      title: "空房數",
      value: vacancyCount.toString(),
      description: "目前待租物件",
      icon: Building2,
      color: "text-blue-600"
    },
    {
      title: "待處理報修",
      value: pendingMaintenances.toString(),
      description: "需盡速指派",
      icon: Wrench,
      color: "text-amber-600"
    },
    {
      title: "逾期帳單",
      value: overdueBillings.toString(),
      description: "待房客繳費",
      icon: Receipt,
      color: "text-red-500"
    },
  ];

  return (
    <div className="space-y-8 pb-10 w-full px-6">
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
        {/* 核心區塊：營收趨勢圖 */}
        <Card className="col-span-full md:col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>{role === "LANDLORD" ? "營收趨勢" : "負責房源營收趨勢"}</CardTitle>
            <CardDescription>最近 6 個月的租金實收分析 (已核銷)</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <RevenueChart data={revenueStats} />
          </CardContent>
        </Card>

        {/* 最近動態 / 異常告警 */}
        <Card className="col-span-full md:col-span-1 lg:col-span-3">
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
                  {recentLogs.length > 0 ? (
                    recentLogs.map((log) => {
                      const Icon = actionIcons[log.action] || actionIcons.DEFAULT;
                      return (
                        <div key={log.id} className="flex items-center gap-3">
                          <div className="bg-slate-100 p-1.5 rounded-full">
                            <Icon className="h-3.5 w-3.5 text-slate-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium leading-none truncate">
                              {actionLabels[log.action] || log.action}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-1 truncate">
                              由 {log.user.name || "系統"} 執行
                            </p>
                          </div>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: zhTW })}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-4">暫無最近動態</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}