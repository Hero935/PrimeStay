import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Settings, Shield, Database, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GenerateLandlordInviteForm from "./GenerateLandlordInviteForm";

/**
 * 系統設定頁面 (/admin/settings)
 * Server Component：
 * - 查詢所有組織供邀請表單使用
 * - 顯示系統資訊（平台版本、RBAC 架構說明）
 * - 嵌入 GenerateLandlordInviteForm（Client Component）提供邀請產生功能
 */
export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const user = session.user as any;
  if (user.role !== "ADMIN") redirect("/");

  // 查詢所有組織（供邀請表單選擇）
  const organizations = await prisma.organization.findMany({
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* 頁面標題 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 text-white">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">系統設定</h1>
          <p className="text-sm text-slate-500">平台管理員操作中心</p>
        </div>
      </div>

      {/* 主體兩欄佈局 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 左欄：產生邀請碼 */}
        <GenerateLandlordInviteForm
          organizations={organizations}
          adminId={user.id}
        />

        {/* 右欄：系統資訊 */}
        <div className="space-y-4">
          {/* 版本資訊 */}
          <Card className="border border-slate-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-slate-800 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-500" />
                平台版本
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>版本</span>
                <span className="font-mono text-slate-800">v1.0.0</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>框架</span>
                <span className="font-mono text-slate-800">Next.js 14 App Router</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>資料庫</span>
                <span className="font-mono text-slate-800">PostgreSQL + Prisma</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>身份驗證</span>
                <span className="font-mono text-slate-800">NextAuth.js JWT</span>
              </div>
            </CardContent>
          </Card>

          {/* 角色架構說明 */}
          <Card className="border border-slate-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-slate-800 flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-500" />
                角色權限架構
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  role: "ADMIN",
                  label: "平台管理員",
                  desc: "全平台最高管理權限",
                  color: "bg-red-50 text-red-700 border-red-100",
                },
                {
                  role: "LANDLORD",
                  label: "房東",
                  desc: "擁有組織、管理房源與租約",
                  color: "bg-amber-50 text-amber-700 border-amber-100",
                },
                {
                  role: "MANAGER",
                  label: "代管人員",
                  desc: "協助房東管理特定業務",
                  color: "bg-blue-50 text-blue-700 border-blue-100",
                },
                {
                  role: "TENANT",
                  label: "房客",
                  desc: "查看租務、繳費、申請維修",
                  color: "bg-emerald-50 text-emerald-700 border-emerald-100",
                },
              ].map((r) => (
                <div key={r.role} className="flex items-start gap-3">
                  <span
                    className={`text-xs font-mono px-2 py-0.5 rounded border shrink-0 mt-0.5 ${r.color}`}
                  >
                    {r.role}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{r.label}</p>
                    <p className="text-xs text-slate-500">{r.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 資料庫統計（實時） */}
          <Card className="border border-slate-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-slate-800 flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-500" />
                即時資料概況
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>組織數量</span>
                <span className="font-bold text-slate-800">{organizations.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 安全提示 Banner */}
      <div className="rounded-xl border border-amber-100 bg-amber-50/50 px-5 py-4 flex gap-3">
        <Shield className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-700">
          <p className="font-semibold mb-0.5">安全提示</p>
          <p className="text-amber-600">
            產生的邀請碼包含組織存取權限，請確認受邀對象身份後再傳送。邀請碼僅限單次使用，且有效期為 7 天。
          </p>
        </div>
      </div>
    </div>
  );
}