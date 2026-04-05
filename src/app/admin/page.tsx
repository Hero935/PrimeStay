import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  Building2,
  Users,
  Home,
  AlertTriangle,
  Mail,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * 系統管理員儀表板頁面 (/admin)
 * 顯示全平台統計概覽、組織列表與待處理邀請
 */
export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "ADMIN") redirect("/");

  // 平行查詢所有儀表板所需資料
  const [
    organizationCount,
    memberCount,
    propertyCount,
    pendingBillingCount,
    pendingMaintenanceCount,
    organizations,
    pendingInvitations,
  ] = await Promise.all([
    // 組織總數
    prisma.organization.count(),

    // 活躍成員數（LANDLORD + MANAGER）
    prisma.user.count({
      where: { systemRole: { in: ["LANDLORD", "MANAGER"] } },
    }),

    // 房源總數
    prisma.property.count(),

    // 待審核帳單數
    prisma.billing.count({ where: { status: "PENDING_APPROVAL" } }),

    // 待處理報修數
    prisma.maintenance.count({
      where: { status: { in: ["PENDING", "PROCESSING"] } },
    }),

    // 組織列表（含房東、房源數、入住數）
    prisma.organization.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: {
          select: {
            properties: true,
            members: true,
          },
        },
        properties: {
          select: {
            status: true,
            contracts: {
              where: { status: "OCCUPIED" },
              select: { id: true },
            },
          },
        },
      },
    }),

    // 尚未使用且未過期的待處理邀請
    prisma.invitation.findMany({
      where: {
        isUsed: false,
        expiresAt: { gt: new Date() },
        targetRole: "LANDLORD",
      },
      orderBy: { expiresAt: "asc" },
      include: {
        inviter: { select: { name: true } },
        organization: { select: { name: true } },
      },
    }),
  ]);

  // 異常告警數 = 待審核帳單 + 待處理報修
  const alertCount = pendingBillingCount + pendingMaintenanceCount;

  // 統計卡片設定
  const statCards = [
    {
      title: "組織數量",
      value: organizationCount,
      icon: Building2,
      description: "目前在平台運作的組織",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "活躍成員數",
      value: memberCount,
      icon: Users,
      description: "房東與代管人員總計",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "房源總數",
      value: propertyCount,
      icon: Home,
      description: "全平台所有房源",
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      title: "異常告警數",
      value: alertCount,
      icon: AlertTriangle,
      description: `待審核帳單 ${pendingBillingCount} 筆 ｜ 待處理報修 ${pendingMaintenanceCount} 筆`,
      color: alertCount > 0 ? "text-red-600" : "text-slate-400",
      bg: alertCount > 0 ? "bg-red-50" : "bg-slate-50",
    },
  ];

  return (
    <div className="p-4 lg:p-10 space-y-8 w-full overflow-x-hidden min-w-0">
      {/* 頁面標題 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 text-white">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">管理員儀表板</h1>
          <p className="text-sm text-slate-500">全平台概況監控中心</p>
        </div>
      </div>

      {/* 統計卡片區 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.title} className="border border-slate-100 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-500">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${card.color}`}>
                {card.value}
              </div>
              <p className="text-xs text-slate-400 mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 主要內容區：組織列表 + 待處理邀請 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 組織列表（佔 2/3） */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-base font-semibold text-slate-800">組織列表</h2>
          {organizations.length === 0 ? (
            <Card className="border-dashed border-slate-200">
              <CardContent className="flex items-center justify-center py-12 text-slate-400">
                目前尚無任何組織
              </CardContent>
            </Card>
          ) : (
            organizations.map((org) => {
              // 計算入住中房客數
              const occupiedCount = org.properties.reduce(
                (acc, p) => acc + p.contracts.length,
                0
              );
              const rentedCount = org.properties.filter(
                (p) => p.status === "RENTED"
              ).length;

              return (
                <Card
                  key={org.id}
                  className="border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="py-4 px-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* 組織名稱與建立日期 */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-800 truncate">
                            {org.name}
                          </span>
                          <span className="text-xs text-slate-400 shrink-0">
                            {new Date(org.createdAt).toLocaleDateString("zh-TW")}
                          </span>
                        </div>
                        {/* 房東資訊 */}
                        <p className="text-sm text-slate-500 truncate">
                          房東：{org.owner.name ?? "未設定"}{" "}
                          <span className="text-slate-400">
                            ({org.owner.email})
                          </span>
                        </p>
                      </div>
                      {/* 統計標籤 */}
                      <div className="flex flex-wrap gap-1.5 shrink-0">
                        <Badge
                          variant="secondary"
                          className="text-xs bg-slate-100 text-slate-600"
                        >
                          🏠 {org._count.properties} 房源
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-blue-50 text-blue-600"
                        >
                          🔑 {rentedCount} 出租中
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-emerald-50 text-emerald-600"
                        >
                          👥 {occupiedCount} 房客
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-violet-50 text-violet-600"
                        >
                          👤 {org._count.members} 成員
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* 待處理邀請（佔 1/3） */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">
              待處理房東邀請
            </h2>
            {pendingInvitations.length > 0 && (
              <Badge className="bg-amber-100 text-amber-700 text-xs">
                {pendingInvitations.length} 待接受
              </Badge>
            )}
          </div>

          {pendingInvitations.length === 0 ? (
            <Card className="border-dashed border-slate-200">
              <CardContent className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-300" />
                <span className="text-sm">所有邀請均已處理</span>
              </CardContent>
            </Card>
          ) : (
            pendingInvitations.map((inv) => {
              const expiresAt = new Date(inv.expiresAt);
              const now = new Date();
              const diffDays = Math.ceil(
                (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
              );
              const isExpiringSoon = diffDays <= 2;

              return (
                <Card
                  key={inv.id}
                  className={`border shadow-sm ${
                    isExpiringSoon
                      ? "border-amber-200 bg-amber-50"
                      : "border-slate-100"
                  }`}
                >
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start gap-2">
                      <Mail
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          isExpiringSoon ? "text-amber-500" : "text-slate-400"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">
                          {inv.organization?.name ?? "新房東註冊 (待設定組織)"}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          邀請人：{inv.inviter.name}
                        </p>
                        <div
                          className={`flex items-center gap-1 mt-1 text-xs ${
                            isExpiringSoon
                              ? "text-amber-600"
                              : "text-slate-400"
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {diffDays <= 0
                            ? "今天到期"
                            : `還有 ${diffDays} 天到期`}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}