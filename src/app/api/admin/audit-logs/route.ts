import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/audit-logs
 * 獲取全系統審核日誌 (僅限管理員)
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "未經授權" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const action = searchParams.get("action");
    const userId = searchParams.get("userId");

    const logs = await prisma.auditLog.findMany({
      where: {
        action: action || undefined,
        userId: userId || undefined,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error("[Audit Log API Error]:", error);
    return NextResponse.json({ error: "伺服器內部錯誤" }, { status: 500 });
  }
}