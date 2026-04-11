import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/management/batch
 * 批次處理使用者狀態 (停權/啟用)
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "未經授權" }, { status: 401 });
  }

  try {
    const { userIds, action } = await request.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "無效的使用者清單" }, { status: 400 });
    }

    // 清理可能帶有的 ID 前綴 (如 landlord-xxx)
    const cleanUserIds = userIds.map((id: string) => id.includes("-") ? id.split("-").pop()! : id);

    if (action === "SUSPEND") {
      await prisma.user.updateMany({
        where: { id: { in: cleanUserIds } },
        data: { status: "SUSPENDED" }
      });
    } else if (action === "ACTIVATE") {
      await prisma.user.updateMany({
        where: { id: { in: cleanUserIds } },
        data: { status: "ACTIVE" }
      });
    } else {
      return NextResponse.json({ error: "無效的操作" }, { status: 400 });
    }

    return NextResponse.json({ success: true, count: userIds.length });
  } catch (error) {
    console.error("[Batch API Error]:", error);
    return NextResponse.json({ error: "伺服器內部錯誤" }, { status: 500 });
  }
}