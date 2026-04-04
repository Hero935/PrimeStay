import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Building2, Users, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * 組織管理頁面 (/admin/organizations)
 * 顯示所有組織的詳細資訊，供管理員唯讀查看
 */
export default async function AdminOrganizationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "ADMIN") redirect("/");

  // 查詢所有組織及其完整成員與房源資訊
  const organizations = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: {
        select: { id: true, name: true, email: true, createdAt: true },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              systemRole: true,
            },
          },
        },
      },
      properties: {
        select: {
          id: true,
          address: true,
          roomNumber: true,
          status: true,
          contracts: {
            where: { status: "OCCUPIED" },
            select: {
              id: true,
              tenantName: true,
              monthlyRent: true,
              endDate: true,
            },
          },
        },
      },
    },
  });

  // 房源狀態標籤設定
  const propertyStatusMap: Record<string, { label: string; className: string }> = {
    AVAILABLE: { label: "空置中", className: "bg-slate-100 text-slate-600" },
    RENTED: { label: "出租中", className: "bg-blue-50 text-blue-600" },
    UNDER_MAINTENANCE: { label: "維修中", className: "bg-red-50 text-red-600" },
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* 頁面標題 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 text-white">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">組織管理</h1>
          <p className="text-sm text-slate-500">
            全平台共 {organizations.length} 個組織
          </p>
        </div>
      </div>

      {/* 唯讀提示 Banner */}
      <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
        <Building2 className="w-4 h-4 shrink-0" />
        ℹ️ 您正以管理員身份檢視此資料，僅供唯讀查看，組織操作須由各組織房東自行執行。
      </div>

      {/* 組織卡片列表 */}
      {organizations.length === 0 ? (
        <Card className="border-dashed border-slate-200">
          <CardContent className="flex items-center justify-center py-16 text-slate-400">
            目前尚無任何組織
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {organizations.map((org) => {
            const occupiedCount = org.properties.reduce(
              (acc, p) => acc + p.contracts.length,
              0
            );
            const rentedCount = org.properties.filter(
              (p) => p.status === "RENTED"
            ).length;

            return (
              <Card key={org.id} className="border border-slate-100 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <CardTitle className="text-lg text-slate-800">
                        {org.name}
                      </CardTitle>
                      <p className="text-sm text-slate-500 mt-0.5">
                        建立於 {new Date(org.createdAt).toLocaleDateString("zh-TW")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                        <Home className="w-3 h-3 mr-1" />
                        {org.properties.length} 房源
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-600">
                        🔑 {rentedCount} 出租中
                      </Badge>
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-600">
                        <Users className="w-3 h-3 mr-1" />
                        {occupiedCount} 房客
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 房東資訊 */}
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-slate-500 mb-1">組織擁有者（房東）</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {org.owner.name ?? "未設定姓名"}
                    </p>
                    <p className="text-xs text-slate-500">{org.owner.email}</p>
                  </div>

                  {/* 成員列表 */}
                  {org.members.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-2">
                        組織成員（{org.members.length} 人）
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {org.members.map((m) => (
                          <div
                            key={m.user.id}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                          >
                            <span className="font-medium text-slate-700">
                              {m.user.name ?? m.user.email}
                            </span>
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1 py-0 bg-violet-50 text-violet-600"
                            >
                              {m.memberRole}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 房源列表（前 5 筆） */}
                  {org.properties.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-2">
                        房源列表（顯示前 5 筆）
                      </p>
                      <div className="space-y-1.5">
                        {org.properties.slice(0, 5).map((p) => {
                          const statusConfig =
                            propertyStatusMap[p.status] ?? propertyStatusMap.AVAILABLE;
                          return (
                            <div
                              key={p.id}
                              className="flex items-center justify-between px-3 py-2 bg-white border border-slate-100 rounded-lg"
                            >
                              <span className="text-sm text-slate-700">
                                {p.address} {p.roomNumber}
                              </span>
                              <Badge
                                variant="secondary"
                                className={`text-xs ${statusConfig.className}`}
                              >
                                {statusConfig.label}
                              </Badge>
                            </div>
                          );
                        })}
                        {org.properties.length > 5 && (
                          <p className="text-xs text-slate-400 text-center pt-1">
                            ⋯ 還有 {org.properties.length - 5} 筆房源
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}