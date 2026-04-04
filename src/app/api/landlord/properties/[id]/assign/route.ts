import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

/**
 * PATCH /api/landlord/properties/[id]/assign
 * 指派房源給特定 Manager
 * 僅限房東 (OWNER) 執行
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id: propertyId } = await params;

  // 權限驗證：僅允許 LANDLORD
  if (!session || (session.user as any).role !== "LANDLORD") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { managerId } = await req.json();

  try {
    const landlordId = (session.user as any).id;
    
    // 檢查房東是否擁有該房源所屬的組織
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { organization: true },
    });

    if (!property || property.organization.ownerId !== landlordId) {
      return NextResponse.json({ error: "Property not found or unauthorized" }, { status: 404 });
    }

    // 如果提供了 managerId，檢查其是否屬於該組織且為 MANAGER 角色
    if (managerId) {
      const isManagerInOrg = await prisma.userOrganization.findFirst({
        where: { 
          userId: managerId, 
          organizationId: property.organizationId,
          memberRole: "MANAGER"
        },
      });

      if (!isManagerInOrg) {
        return NextResponse.json({ error: "Invalid manager recruitment" }, { status: 400 });
      }
    }

    // 更新房源管理員
    const updatedProperty = await (prisma.property as any).update({
      where: { id: propertyId },
      data: { managerId: managerId || null },
    });

    // 記錄 Audit Log
    await (prisma as any).auditLog.create({
      data: {
        userId: landlordId,
        organizationId: property.organizationId,
        action: "PROPERTY_ASSIGNMENT",
        targetType: "PROPERTY",
        targetId: propertyId,
        metadata: { assignedManagerId: managerId || null },
      },
    });

    return NextResponse.json({ success: true, data: updatedProperty });
  } catch (error) {
    console.error("[Property Assignment API] 分派失敗:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}