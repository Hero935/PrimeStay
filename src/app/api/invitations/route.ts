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
    const targetRole = searchParams.get("targetRole");
    const includeUsed = searchParams.get("includeUsed") === "true";

    // 權限檢查與過濾邏輯
    const isAdmin = (session.user as any).role === "ADMIN";
    
    // 如果不是 Admin 且沒有提供組織 ID，則報錯
    if (!isAdmin && !organizationId) {
      return NextResponse.json({ error: "缺少組織 ID" }, { status: 400 });
    }

    // 構建查詢條件
    const where: any = {};
    
    if (organizationId) {
      where.organizationId = organizationId;
    }
    
    if (targetRole) {
      where.targetRole = targetRole;
    }

    if (!includeUsed) {
      where.isUsed = false;
    }

    // 獲取邀請列表
    const invitations = await prisma.invitation.findMany({
      where,
      include: {
        inviter: {
          select: {
            name: true,
            email: true,
          }
        },
        organization: {
          select: {
            name: true,
          }
        },
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