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

  // 取得 MRR (目前暫定為所有組織計畫的預估月營收)
  // Starter: 999/mo, Pro: 2999/mo (假設幣別為 TWD)
  const organizationsRes = await prisma.organization.findMany({
    select: { plan: true }
  });

  const mrr = (organizationsRes as any[]).reduce((acc, org) => {
    if (org.plan === "STARTER") return acc + 999;
    if (org.plan === "PRO") return acc + 2999;
    return acc;
  }, 0);

  // 取得低出租率組織數 (出租率 < 40%)
  const orgsWithOccupancy = await prisma.organization.findMany({
    include: {
      _count: {
        select: {
          properties: true,
        }
      },
      properties: {
        where: { status: "RENTED" },
        select: { id: true }
      }
    }
  });

  const lowOccupancyCount = orgsWithOccupancy.filter(org => {
    if (org._count.properties === 0) return false;
    const occupancyRate = (org.properties.length / org._count.properties) * 100;
    return occupancyRate < 40;
  }).length;

  // 全域身分脈動 (Identity Pulse)
  const [landlordCount, managerCount, tenantCount] = await Promise.all([
    prisma.user.count({ where: { systemRole: "LANDLORD" } }),
    prisma.user.count({ where: { systemRole: "MANAGER" } }),
    prisma.user.count({ where: { systemRole: "TENANT" } }),
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
    mrr,
    lowOccupancyCount,
    identityPulse: {
      landlord: landlordCount,
      manager: managerCount,
      tenant: tenantCount,
      total: landlordCount + managerCount + tenantCount
    }
  });
}

/**
 * POST /api/admin/stats
 * 取得最近的系統審計日誌 (採用 POST 避免部分環境快取)
 */
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const logs = await prisma.auditLog.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true }
        }
      }
    });
    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}