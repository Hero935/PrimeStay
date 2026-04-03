import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

/**
 * 租約管理 API
 * GET /api/contracts: 獲取租約列表
 * POST /api/contracts: 建立新租約
 */

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "未登入" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");

    const contracts = await prisma.contract.findMany({
      where: propertyId ? { propertyId } : {},
      include: {
        property: true,
        tenant: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, data: contracts });
  } catch (error) {
    return NextResponse.json({ error: "獲取租約失敗" }, { status: 500 });
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
      propertyId,
      tenantId,
      tenantName,
      gender,
      phone,
      contactAddress,
      startDate,
      endDate,
      monthlyRent,
      deposit,
      paymentCycle,
      electricityRate,
      waterRate,
      managementFee,
    } = body;

    // 建立租約
    const contract = await prisma.contract.create({
      data: {
        propertyId,
        tenantId,
        tenantName,
        gender,
        phone,
        contactAddress,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        monthlyRent: Number(monthlyRent),
        deposit: Number(deposit),
        paymentCycle: paymentCycle || "MONTHLY",
        electricityRate: Number(electricityRate) || null,
        waterRate: Number(waterRate) || null,
        managementFee: Number(managementFee) || null,
        status: "OCCUPIED",
      },
    });

    // 自動更新房源狀態為已出租
    await prisma.property.update({
      where: { id: propertyId },
      data: { status: "RENTED" }
    });

    return NextResponse.json({ success: true, data: contract });
  } catch (error) {
    console.error("建立租約失敗:", error);
    return NextResponse.json({ error: "系統錯誤" }, { status: 500 });
  }
}