import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SUBSCRIPTION_PLANS, PlanKey } from "@/lib/constants";
import { $Enums } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

// 配置 Cloudinary (實際環境應使用環境變數)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

  // 取得 MRR 與 資源分配率
  // 邏輯已優化：從 constants.ts 讀取定價配置與限額
  const organizationsRes = await prisma.organization.findMany({
    select: {
      id: true,
      plan: true
    }
  });

  let totalPropertyLimit = 0;
  let expiredOrgsCount = 0;
  const now = new Date();

  const mrr = (organizationsRes as any[]).reduce((acc, org) => {
    const planKey = org.plan as unknown as PlanKey;
    const planConfig = SUBSCRIPTION_PLANS[planKey];
    totalPropertyLimit += planConfig?.propertyLimit || 0;
    
    // 檢查方案是否過期 (如果有設定過期日)
    if (org.planExpiresAt && new Date(org.planExpiresAt) < now) {
      expiredOrgsCount++;
    }

    return acc + (planConfig?.monthlyPrice || 0);
  }, 0);

  const resourceAllocationRate = totalPropertyLimit > 0
    ? Math.round((propertyCount / totalPropertyLimit) * 100)
    : 0;

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

  // ---------------------------------------------------------
  // 📡 真實基礎設施監控接入
  // ---------------------------------------------------------
  
  // 1. 真實資料庫大小與連線數 (PostgreSQL 特定)
  let dbStats = { usage: "N/A", load: "0%", status: "UNKNOWN" };
  try {
    const dbSizeResult: any = await prisma.$queryRaw`SELECT pg_size_pretty(pg_database_size(current_database())) as size;`;
    const activeConns: any = await prisma.$queryRaw`SELECT count(*) as count FROM pg_stat_activity WHERE state = 'active';`;
    
    dbStats = {
      usage: dbSizeResult[0]?.size || "0 MB",
      load: `${Math.min(100, (Number(activeConns[0]?.count) / 20) * 100).toFixed(0)}%`, // 假設上限 20 連線
      status: "HEALTHY"
    };
  } catch (e) {
    console.warn("DB Stats calculation failed", e);
  }

  // 2. 真實 Cloudinary 存儲空間 (透過 Admin API)
  let mediaStats = { usage: "0 GB", limit: "10 GB", bandwidth: "0 MB/day" };
  try {
    // 僅在有 API Key 時執行
    if (process.env.CLOUDINARY_API_KEY) {
      const cloudResult = await cloudinary.api.usage();
      mediaStats = {
        usage: `${(cloudResult.storage.usage / (1024 * 1024 * 1024)).toFixed(2)} GB`,
        limit: `${(cloudResult.storage.limit / (1024 * 1024 * 1024)).toFixed(0)} GB`,
        bandwidth: `${(cloudResult.bandwidth.usage / (1024 * 1024)).toFixed(0)} MB/day`
      };
    }
  } catch (e) {
    console.warn("Cloudinary Stats failed", e);
  }

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
    expiredOrgsCount,
    resourceAllocationRate,
    identityPulse: {
      landlord: landlordCount,
      manager: managerCount,
      tenant: tenantCount,
      total: landlordCount + managerCount + tenantCount
    },
    infrastructure: {
      database: dbStats,
      media: mediaStats
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