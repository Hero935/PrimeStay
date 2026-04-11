/**
 * Admin Layout (AIC v3 Overhaul)
 * 重新設計為三欄式戰略治理佈局
 */
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AICActionVault } from "@/components/admin/AICActionVault";
import { AICAuditVault } from "@/components/admin/AICAuditVault";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // 未登入時導向登入頁
  if (!session) {
    redirect("/login");
  }

  // 權限防護：非 ADMIN 角色禁止進入
  const user = session.user as any;
  if (user.systemRole !== "ADMIN" && user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <DashboardShell
      rightPanel={
        <div className="flex flex-col h-full overflow-hidden">
          <div className="h-1/2 overflow-y-auto custom-scrollbar p-5">
            <AICActionVault />
          </div>
          <div className="h-1/2 border-t overflow-hidden p-5">
            <AICAuditVault />
          </div>
        </div>
      }
    >
      {children}
    </DashboardShell>
  );
}