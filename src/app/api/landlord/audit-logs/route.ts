import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

/**
 * GET /api/landlord/audit-logs
 * 獲取組織內成員的操作日誌
 * 僅限房東 (OWNER) 檢視
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "LANDLORD") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const userId = (session.user as any).id;
    const organization = await prisma.organization.findFirst({
      where: { ownerId: userId },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const logs = await (prisma as any).auditLog.findMany({
      where: { organizationId: organization.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100, // 僅檢視最近 100 筆
    });

    return NextResponse.json({ data: logs });
  } catch (error) {
    console.error("[Landlord Audit Logs GET] 失敗:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}