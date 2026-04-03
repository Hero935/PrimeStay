import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

/**
 * 帳單管理 API
 * POST /api/billings: 為特定租約建立一筆新帳單
 * GET /api/billings: 獲取帳單列表 (支援房客也支援房東)
 */

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "未登入" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const contractId = searchParams.get("contractId");
    
    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    // 條件過濾：租客只能看到自己的
    const whereClause: any = {};
    if (contractId) whereClause.contractId = contractId;
    if (role === "TENANT") {
      whereClause.contract = { tenantId: userId };
    }

    const billings = await prisma.billing.findMany({
      where: whereClause,
      include: {
        contract: {
          include: { property: true }
        },
        payments: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, data: billings });
  } catch (error) {
    return NextResponse.json({ error: "獲取帳單失敗" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "LANDLORD", "MANAGER"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "權限不足" }, { status: 403 });
    }

    const { contractId, periodStart, periodEnd } = await req.json();

    // 1. 取得租約設定
    const contract = await prisma.contract.findUnique({
      where: { id: contractId }
    });

    if (!contract) return NextResponse.json({ error: "找不到租約" }, { status: 404 });

    // 2. 建立帳單 (帶入租約預設費用)
    const billing = await prisma.billing.create({
      data: {
        contractId,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        monthlyRent: contract.monthlyRent,
        managementFee: contract.managementFee || 0,
        electricityRate: contract.electricityRate,
        waterRate: contract.waterRate,
        status: "PENDING_TENANT",
      }
    });

    return NextResponse.json({ success: true, data: billing });
  } catch (error) {
    console.error("建立帳單失敗:", error);
    return NextResponse.json({ error: "系統錯誤" }, { status: 500 });
  }
}