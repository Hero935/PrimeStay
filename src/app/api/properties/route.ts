import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-guards";
import { SUBSCRIPTION_PLANS, PlanKey } from "@/lib/constants";

/**
 * 房源列表與新增 API
 * GET /api/properties: 獲取所屬組織房源
 * POST /api/properties: 新增房源
 */

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const isPublicSearch = searchParams.get("public") === "true";

    // Visitor/未登入僅能存取標記為公開的房源
    if (!session && !isPublicSearch) {
      return NextResponse.json({ error: "未登入" }, { status: 401 });
    }

    const orgId = searchParams.get("organizationId");

    // 數據隔離：檢查使用者是否在該組織內 (除非是全系統管理員 或 正在進行公開搜尋)
    if (session && (session.user as any).role !== "ADMIN" && !isPublicSearch) {
      const isMember = await prisma.userOrganization.findFirst({
        where: {
          userId: (session.user as any).id,
          organizationId: orgId || "",
        }
      });

      if (!isMember && orgId) {
        return NextResponse.json({ error: "權限不足" }, { status: 403 });
      }
    }

    const properties = await prisma.property.findMany({
      where: {
        organizationId: orgId || undefined,
        // 如果是 Manager，限制僅能看到分配到的房源；如果是未登入，僅能看到 AVAILABLE 且公開的資料
        managerId: session && (session.user as any).role === "MANAGER" ? (session.user as any).id : undefined,
        status: !session ? "AVAILABLE" : undefined,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: properties });
  } catch (error) {
    console.error("獲取房源失敗:", error);
    return NextResponse.json({ error: "系統錯誤" }, { status: 500 });
  }
}

export const POST = withAuth(async (req: Request, { session }) => {
  try {
    const body = await req.json();
    const {
      organizationId,
      address,
      roomNumber,
      type,
      size,
      defaultRent,
      defaultDeposit,
      defaultElectricityFee,
      defaultWaterFee,
      defaultManagementFee,
      photos,
    } = body;

    // 校驗使用者對組織的操作權限
    if ((session.user as any).role !== "ADMIN") {
      const isOwner = await prisma.userOrganization.findFirst({
        where: {
          userId: (session.user as any).id,
          organizationId: organizationId,
          memberRole: { in: ["OWNER", "MANAGER"] }
        }
      });

      if (!isOwner) {
        return NextResponse.json({ error: "權限不足，您非該組織管理員" }, { status: 403 });
      }
    }

    if (!organizationId || !address || !roomNumber) {
      return NextResponse.json({ error: "缺少必要填寫欄位" }, { status: 400 });
    }

    // --- 訂閱方案房源上限檢查 ---
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { plan: true } as any,
    });

    if (!organization) {
      return NextResponse.json({ error: "找不到所屬組織" }, { status: 404 });
    }

    const propertyCount = await prisma.property.count({
      where: { organizationId },
    });

    const planKey = (organization as any).plan as PlanKey;
    const limit = SUBSCRIPTION_PLANS[planKey]?.propertyLimit || 0;

    if (propertyCount >= limit) {
      return NextResponse.json(
        { error: `方案額度已滿 (當前方案：${planKey}，上限：${limit} 間)，請升級方案。` },
        { status: 403 }
      );
    }
    // ----------------------------

    const property = await prisma.property.create({
      data: {
        organizationId,
        address,
        roomNumber,
        type: type || "獨立套房",
        size: Number(size) || 0,
        defaultRent: Number(defaultRent) || 0,
        defaultDeposit: Number(defaultDeposit) || 0,
        defaultElectricityFee: Number(defaultElectricityFee) || 0,
        defaultWaterFee: Number(defaultWaterFee) || 0,
        defaultManagementFee: Number(defaultManagementFee) || 0,
        photos: photos || [],
        status: "AVAILABLE",
      },
    });

    return NextResponse.json({ success: true, data: property });
  } catch (error) {
    console.error("新增房源失敗:", error);
    return NextResponse.json({ error: "系統錯誤" }, { status: 500 });
  }
}, ["ADMIN", "LANDLORD", "MANAGER"]);