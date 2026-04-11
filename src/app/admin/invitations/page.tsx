import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InvitationsList } from "./InvitationsList";

/**
 * 房東邀請管理頁面 (/admin/invitations)
 * Server Component：
 * 負責資料獲取並將內容傳遞給 InvitationsList (Client Component) 進行渲染與交互
 */
export default async function AdminInvitationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "ADMIN") redirect("/");

  // 查詢系統級邀請記錄（房東 或 由 Admin 發出的代管邀請）
  const invitations = await prisma.invitation.findMany({
    where: {
      OR: [
        { targetRole: "LANDLORD" },
        { targetRole: "MANAGER" }
      ]
    },
    orderBy: { expiresAt: "desc" },
    include: {
      inviter: { select: { name: true, email: true } },
      organization: { select: { name: true } },
    },
  });

  // 查詢可用組織列表（用於在此頁面發起新邀請）
  const organizations = await prisma.organization.findMany({
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="p-4 md:p-8 pt-6 w-full h-full">
      <InvitationsList
        initialInvitations={invitations}
        organizations={organizations}
      />
    </div>
  );
}