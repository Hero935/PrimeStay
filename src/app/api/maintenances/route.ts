import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

/**
 * 維修申請 API
 */

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "未登入" }, { status: 401 });

    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    // 租客只能看見自己的，房東可以看到組織下的 (此處簡化為根據合約過濾)
    const maintenances = await prisma.maintenance.findMany({
      where: role === "TENANT" ? {
        contract: { tenantId: userId }
      } : {},
      include: {
        contract: {
          include: { property: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, data: maintenances });
  } catch (error) {
    return NextResponse.json({ error: "獲取維修紀錄失敗" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "TENANT") {
      return NextResponse.json({ error: "只有租客可以提交報修" }, { status: 403 });
    }

    const { contractId, item, description, photos } = await req.json();

    const maintenance = await prisma.maintenance.create({
      data: {
        contractId,
        item,
        description,
        photos: photos || [],
        status: "PENDING",
      }
    });

    return NextResponse.json({ success: true, data: maintenance });
  } catch (error) {
    console.error("提交報修失敗:", error);
    return NextResponse.json({ error: "系統錯誤" }, { status: 500 });
  }
}