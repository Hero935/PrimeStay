import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Mail, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * 房東邀請管理頁面 (/admin/invitations)
 * 顯示所有房東邀請記錄（含使用中、已使用、已過期）
 * 管理員可在此查看邀請狀態，發送新邀請請至系統設定操作
 */
export default async function AdminInvitationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "ADMIN") redirect("/");

  // 查詢所有房東邀請記錄（targetRole = LANDLORD）
  const invitations = await prisma.invitation.findMany({
    where: { targetRole: "LANDLORD" },
    orderBy: { expiresAt: "desc" },
    include: {
      inviter: { select: { name: true, email: true } },
      organization: { select: { name: true } },
    },
  });

  const now = new Date();

  /**
   * 判斷邀請狀態
   * @param isUsed 是否已使用
   * @param expiresAt 到期時間
   * @returns 狀態標籤配置
   */
  const getInviteStatus = (isUsed: boolean, expiresAt: Date) => {
    if (isUsed) {
      return {
        label: "已接受",
        icon: CheckCircle2,
        className: "bg-emerald-50 text-emerald-600",
      };
    }
    if (expiresAt < now) {
      return {
        label: "已過期",
        icon: XCircle,
        className: "bg-slate-100 text-slate-400",
      };
    }
    const diffDays = Math.ceil(
      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays <= 2) {
      return {
        label: `即將到期（${diffDays} 天）`,
        icon: AlertCircle,
        className: "bg-amber-50 text-amber-600",
      };
    }
    return {
      label: "待接受",
      icon: Clock,
      className: "bg-blue-50 text-blue-600",
    };
  };

  // 統計各狀態數量
  const stats = {
    total: invitations.length,
    accepted: invitations.filter((i) => i.isUsed).length,
    pending: invitations.filter((i) => !i.isUsed && i.expiresAt > now).length,
    expired: invitations.filter((i) => !i.isUsed && i.expiresAt <= now).length,
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* 頁面標題 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 text-white">
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">房東邀請管理</h1>
          <p className="text-sm text-slate-500">
            共 {stats.total} 筆邀請記錄
          </p>
        </div>
      </div>

      {/* 統計摘要卡片 */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border border-emerald-100 bg-emerald-50/50">
          <CardContent className="py-4 px-5">
            <p className="text-xs text-emerald-600 font-medium mb-1">已接受</p>
            <p className="text-2xl font-bold text-emerald-700">{stats.accepted}</p>
          </CardContent>
        </Card>
        <Card className="border border-blue-100 bg-blue-50/50">
          <CardContent className="py-4 px-5">
            <p className="text-xs text-blue-600 font-medium mb-1">待接受</p>
            <p className="text-2xl font-bold text-blue-700">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-100 bg-slate-50/50">
          <CardContent className="py-4 px-5">
            <p className="text-xs text-slate-500 font-medium mb-1">已過期</p>
            <p className="text-2xl font-bold text-slate-400">{stats.expired}</p>
          </CardContent>
        </Card>
      </div>

      {/* 邀請記錄列表 */}
      <Card className="border border-slate-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-slate-800">邀請記錄</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {invitations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
              <Mail className="w-8 h-8 text-slate-200" />
              <span className="text-sm">尚無任何房東邀請記錄</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {invitations.map((inv) => {
                const status = getInviteStatus(inv.isUsed, inv.expiresAt);
                const StatusIcon = status.icon;
                const diffDays = Math.ceil(
                  (inv.expiresAt.getTime() - now.getTime()) /
                    (1000 * 60 * 60 * 24)
                );

                return (
                  <div
                    key={inv.id}
                    className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors"
                  >
                    {/* 狀態圖示 */}
                    <div className={`mt-0.5 p-1.5 rounded-lg ${status.className}`}>
                      <StatusIcon className="w-4 h-4" />
                    </div>

                    {/* 邀請詳情 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-slate-800 text-sm">
                          {inv.organization.name}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${status.className}`}
                        >
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">
                        邀請人：{inv.inviter.name ?? inv.inviter.email}
                      </p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                        邀請碼：{inv.code}
                      </p>
                    </div>

                    {/* 時間資訊 */}
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-500">
                        {inv.isUsed
                          ? "已完成"
                          : inv.expiresAt < now
                          ? "已過期"
                          : `還有 ${diffDays} 天`}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(inv.expiresAt).toLocaleDateString("zh-TW")} 到期
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}