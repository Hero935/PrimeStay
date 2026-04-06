/**
 * Admin Layout (AIC v3 Overhaul)
 * 重新設計為三欄式戰略治理佈局
 */
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { AdminAICShell } from "@/components/admin/AdminAICShell";
import { AICActionVault } from "@/components/admin/AICActionVault";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

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
    <SidebarProvider defaultOpen={false}>
      <AdminAICShell 
        sidebar={<AppSidebar />}
        actionVault={<AICActionVault />}
      >
        {children}
      </AdminAICShell>
    </SidebarProvider>
  );
}