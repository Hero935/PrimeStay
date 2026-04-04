import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { UserStatusToggle } from "./UserStatusToggle";

/**
 * 角色顯示名稱對照表
 */
const roleLabels: Record<string, string> = {
  ADMIN: "系統管理員",
  LANDLORD: "房東",
  MANAGER: "代管人員",
  TENANT: "房客",
};

/**
 * /admin/users - 用戶管理頁面（Server Component）
 * 顯示所有用戶清單，並提供帳號停權/恢復功能
 * 僅限 ADMIN 存取
 */
export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  // 查詢所有用戶，依角色分類排序
  // Re-compilation trigger: 2026-04-04 19:46
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      systemRole: true,
      // @ts-ignore - 暫時繞過 Prisma Client 未即時更新的問題
      status: true,
      createdAt: true,
      organizations: {
        select: {
          id: true,
          name: true,
        },
      },
      userOrganizations: {
        select: {
          memberRole: true,
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: [
      { systemRole: "asc" },
      { createdAt: "desc" },
    ],
  });

  // 統計各狀態數量
  const totalUsers = users.length;
  const suspendedCount = users.filter((u) => u.status === "SUSPENDED").length;
  const activeCount = totalUsers - suspendedCount;

  // 排除管理員帳號（不顯示在管理清單中，防止誤操作）
  const nonAdminUsers = users.filter((u) => u.systemRole !== "ADMIN");

  return (
    <div className="p-6 space-y-6">
      {/* 頁面標題 */}
      <div>
        <h1 className="text-2xl font-bold">用戶管理</h1>
        <p className="text-muted-foreground text-sm mt-1">
          管理所有平台用戶的帳號狀態（停權/恢復）
        </p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              總用戶數
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              正常帳號
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              已停權帳號
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{suspendedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* 用戶列表 */}
      <Card>
        <CardHeader>
          <CardTitle>用戶清單</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {/* 表頭 */}
            <div className="grid grid-cols-5 gap-4 py-3 px-4 bg-muted/50 rounded-t-md text-sm font-medium text-muted-foreground">
              <div>姓名 / 信箱</div>
              <div>角色</div>
              <div>所屬組織</div>
              <div>加入時間</div>
              <div>帳號狀態</div>
            </div>

            {/* 用戶列表 */}
            {nonAdminUsers.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                目前沒有非管理員用戶
              </div>
            ) : (
              nonAdminUsers.map((user, index) => {
                // 取得組織名稱（房東看 organizations，代管/房客看 userOrganizations）
                const orgNames =
                  user.organizations.length > 0
                    ? user.organizations.map((o) => o.name).join(", ")
                    : user.userOrganizations.length > 0
                    ? user.userOrganizations
                        .map((uo) => uo.organization.name)
                        .join(", ")
                    : "未加入組織";

                return (
                  <div
                    key={user.id}
                    className={`grid grid-cols-5 gap-4 py-3 px-4 text-sm items-center border-b ${
                      index === nonAdminUsers.length - 1 ? "border-b-0" : ""
                    } ${user.status === "SUSPENDED" ? "bg-red-50/50" : ""}`}
                  >
                    {/* 姓名 / 信箱 */}
                    <div>
                      <div className="font-medium">
                        {user.name || "(未設定名稱)"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user.email}
                      </div>
                    </div>

                    {/* 角色 */}
                    <div>
                      <Badge
                        variant={
                          user.systemRole === "LANDLORD"
                            ? "default"
                            : user.systemRole === "MANAGER"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {roleLabels[user.systemRole] || user.systemRole}
                      </Badge>
                    </div>

                    {/* 所屬組織 */}
                    <div className="text-muted-foreground text-xs truncate">
                      {orgNames}
                    </div>

                    {/* 加入時間 */}
                    <div className="text-muted-foreground text-xs">
                      {new Date(user.createdAt).toLocaleDateString("zh-TW")}
                    </div>

                    {/* 帳號狀態切換按鈕（Client Component） */}
                    <div>
                      <UserStatusToggle
                        userId={user.id}
                        currentStatus={user.status}
                        userName={user.name || user.email}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}