import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

/**
 * 房源列表與新增 API
 * GET /api/properties: 獲取所屬組織房源
 * POST /api/properties: 新增房源
 */

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "未登入" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("organizationId");

    // 數據隔離：檢查使用者是否在該組織內 (除非是全系統管理員)
    if ((session.user as any).role !== "ADMIN") {
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
      where: orgId ? { organizationId: orgId } : {},
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: properties });
  } catch (error) {
    console.error("獲取房源失敗:", error);
    return NextResponse.json({ error: "系統錯誤" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "LANDLORD", "MANAGER"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "權限不足" }, { status: 403 });
    }

    const body = await req.json();
    const {
      organizationId,
      address,
      roomNumber,
      type,
      size,
      defaultRent,
      defaultDeposit,
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

    const property = await prisma.property.create({
      data: {
        organizationId,
        address,
        roomNumber,
        type: type || "套房",
        size: Number(size) || 0,
        defaultRent: Number(defaultRent) || 0,
        defaultDeposit: Number(defaultDeposit) || 0,
        photos: photos || [],
        status: "AVAILABLE",
      },
    });

    return NextResponse.json({ success: true, data: property });
  } catch (error) {
    console.error("新增房源失敗:", error);
    return NextResponse.json({ error: "系統錯誤" }, { status: 500 });
  }
}