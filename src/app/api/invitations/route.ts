import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

/**
 * 獲取邀請列表 API
 * GET /api/invitations?organizationId=xxx
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "LANDLORD", "MANAGER"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "權限不足" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json({ error: "缺少組織 ID" }, { status: 400 });
    }

    // 獲取該組織下且未使用的邀請
    const invitations = await prisma.invitation.findMany({
      where: {
        organizationId,
        isUsed: false,
      },
      include: {
        property: {
          select: {
            address: true,
            roomNumber: true,
          }
        }
      },
      orderBy: {
        expiresAt: "desc",
      },
    });

    return NextResponse.json({ success: true, data: invitations });
  } catch (error) {
    console.error("獲取邀請列表失敗:", error);
    return NextResponse.json({ error: "內部系統錯誤" }, { status: 500 });
  }
}