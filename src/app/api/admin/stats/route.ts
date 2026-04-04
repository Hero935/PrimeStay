import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/stats
 * 取得全平台統計數據，供系統管理員儀表板使用
 * 僅限 systemRole === "ADMIN" 的使用者存取
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  // 驗證登入狀態
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 驗證管理員身份
  const role = (session.user as any).role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 平行查詢所有統計數據以提升效能
  const [
    organizationCount,
    memberCount,
    propertyCount,
    pendingBillingCount,
    pendingMaintenanceCount,
    pendingInvitationCount,
  ] = await Promise.all([
    // 組織總數
    prisma.organization.count(),

    // 活躍成員數（LANDLORD + MANAGER）
    prisma.user.count({
      where: {
        systemRole: {
          in: ["LANDLORD", "MANAGER"],
        },
      },
    }),

    // 房源總數
    prisma.property.count(),

    // 待審核帳單數（PENDING_APPROVAL）
    prisma.billing.count({
      where: {
        status: "PENDING_APPROVAL",
      },
    }),

    // 待處理報修數（PENDING + PROCESSING）
    prisma.maintenance.count({
      where: {
        status: {
          in: ["PENDING", "PROCESSING"],
        },
      },
    }),

    // 尚未使用且未過期的邀請數
    prisma.invitation.count({
      where: {
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    }),
  ]);

  // 異常告警數 = 待審核帳單 + 待處理報修
  const alertCount = pendingBillingCount + pendingMaintenanceCount;

  return NextResponse.json({
    organizationCount,
    memberCount,
    propertyCount,
    alertCount,
    pendingBillingCount,
    pendingMaintenanceCount,
    pendingInvitationCount,
  });
}