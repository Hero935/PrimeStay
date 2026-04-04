import { DashboardShell } from "@/components/layout/DashboardShell";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * 系統管理員後台佈局 (Admin Layout)
 * 僅允許 systemRole === "ADMIN" 的使用者進入
 * 套用通用 DashboardShell 並包含側邊欄導航
 */
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

  const role = (session.user as any).role;

  // 非管理員角色導回首頁（由首頁再根據角色重導向）
  if (role !== "ADMIN") {
    redirect("/");
  }

  return (
    <DashboardShell>
      {children}
    </DashboardShell>
  );
}