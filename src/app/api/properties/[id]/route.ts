import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

/**
 * 特定房源操作 API
 * GET /api/properties/[id]: 獲取房源詳情
 * PUT /api/properties/[id]: 更新房源資訊
 * DELETE /api/properties/[id]: 刪除房源
 */

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "未登入" }, { status: 401 });
    }

    const { id } = params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        organization: true,
        manager: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!property) {
      return NextResponse.json({ error: "找不到該房源" }, { status: 404 });
    }

    // 數據隔離檢查
    if ((session.user as any).role !== "ADMIN") {
      const isMember = await prisma.userOrganization.findFirst({
        where: {
          userId: (session.user as any).id,
          organizationId: property.organizationId,
        }
      });

      if (!isMember) {
        return NextResponse.json({ error: "權限不足" }, { status: 403 });
      }
    }

    return NextResponse.json({ success: true, data: property });
  } catch (error) {
    console.error("獲取房源詳情失敗:", error);
    return NextResponse.json({ error: "系統錯誤" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "LANDLORD", "MANAGER"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "權限不足" }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();

    // 檢查房源是否存在
    const existingProperty = await prisma.property.findUnique({
      where: { id },
    });

    if (!existingProperty) {
      return NextResponse.json({ error: "找不到該房源" }, { status: 404 });
    }

    // 數據隔離：檢查使用者是否為該組織成員且具有管理權限
    if ((session.user as any).role !== "ADMIN") {
      const hasPermission = await prisma.userOrganization.findFirst({
        where: {
          userId: (session.user as any).id,
          organizationId: existingProperty.organizationId,
          memberRole: { in: ["OWNER", "MANAGER"] }
        }
      });

      if (!hasPermission) {
        return NextResponse.json({ error: "權限不足，您非該組織管理員" }, { status: 403 });
      }
    }

    const {
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
      status, 
    } = body;

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        address: address || undefined,
        roomNumber: roomNumber || undefined,
        type: type || undefined,
        size: size ? Number(size) : undefined,
        defaultRent: defaultRent ? Number(defaultRent) : undefined,
        defaultDeposit: defaultDeposit ? Number(defaultDeposit) : undefined,
        defaultElectricityFee: defaultElectricityFee !== undefined ? Number(defaultElectricityFee) : undefined,
        defaultWaterFee: defaultWaterFee !== undefined ? Number(defaultWaterFee) : undefined,
        defaultManagementFee: defaultManagementFee !== undefined ? Number(defaultManagementFee) : undefined,
        photos: photos || undefined,
        status: status || undefined,
      },
    });

    return NextResponse.json({ success: true, data: updatedProperty });
  } catch (error) {
    console.error("更新房源失敗:", error);
    return NextResponse.json({ error: "系統錯誤" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "LANDLORD"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "權限不足" }, { status: 403 });
    }

    const { id } = params;

    // 檢查房源是否存在
    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return NextResponse.json({ error: "找不到該房源" }, { status: 404 });
    }

    // 權限檢查
    if ((session.user as any).role !== "ADMIN") {
      const isOwner = await prisma.userOrganization.findFirst({
        where: {
          userId: (session.user as any).id,
          organizationId: property.organizationId,
          memberRole: "OWNER"
        }
      });

      if (!isOwner) {
        return NextResponse.json({ error: "權限不足，僅組織持有人可刪除房源" }, { status: 403 });
      }
    }

    // 檢查是否有關聯的合約
    const activeContracts = await prisma.contract.count({
      where: { propertyId: id, status: "OCCUPIED" }
    });

    if (activeContracts > 0) {
      return NextResponse.json({ error: "該房源尚有合約在執行中，無法刪除" }, { status: 400 });
    }

    await prisma.property.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "房源已成功刪除" });
  } catch (error) {
    console.error("刪除房源失敗:", error);
    return NextResponse.json({ error: "系統錯誤" }, { status: 500 });
  }
}