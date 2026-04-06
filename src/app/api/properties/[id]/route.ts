import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-guards";

/**
 * 特定房源操作 API
 * GET /api/properties/[id]: 獲取房源詳情
 * PUT /api/properties/[id]: 更新房源資訊
 * DELETE /api/properties/[id]: 刪除房源
 */

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        organization: {
          select: { id: true, name: true, plan: true }
        },
        manager: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!property) {
      return NextResponse.json({ error: "找不到該房源" }, { status: 404 });
    }

    // 權限與資料過濾邏輯
    let isAuthorized = false;
    
    if (session) {
      if ((session.user as any).role === "ADMIN") {
        isAuthorized = true;
      } else {
        const isMember = await prisma.userOrganization.findFirst({
          where: {
            userId: (session.user as any).id,
            organizationId: property.organizationId,
          }
        });
        if (isMember) isAuthorized = true;
      }
    }

    // 如果是訪客或非成員，過濾敏感資訊
    if (!isAuthorized) {
      // 訪客僅能看到基礎資訊
      const publicData = {
        id: property.id,
        address: property.address, // TODO: 未來可考慮地址脫敏 (例如僅顯示到道路)
        type: property.type,
        size: property.size,
        defaultRent: property.defaultRent,
        photos: property.photos,
        status: property.status,
        organization: property.organization,
        // 隱藏管理費、水電費預設值、房號與聯繫方式
        roomNumber: "***",
        manager: null,
        isPublicPreview: true
      };
      return NextResponse.json({ success: true, data: publicData });
    }

    return NextResponse.json({ success: true, data: property });
  } catch (error) {
    console.error("獲取房源詳情失敗:", error);
    return NextResponse.json({ error: "系統錯誤" }, { status: 500 });
  }
}

/**
 * 更新房源資訊
 * @param req 請求物件
 * @param context 路由上下文，包含非同步參數
 */
export const PUT = withAuth(async (req: Request, { params, session }) => {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "缺少房源 ID" }, { status: 400 });
    }
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
}, ["ADMIN", "LANDLORD", "MANAGER"]);

export const DELETE = withAuth(async (req: Request, { params, session }) => {
  try {
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
}, ["ADMIN", "LANDLORD"]);