import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

/**
 * PATCH /api/landlord/members/[id]/status
 * 切換組織成員的帳號狀態 (ACTIVE/SUSPENDED)
 * 房東僅能針對其組織內的成員進行此操作
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const { id } = params;

  // 權限驗證：僅允許 LANDLORD
  if (!session || (session.user as any).role !== "LANDLORD") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { status } = await req.json();

  if (!status || !["ACTIVE", "SUSPENDED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const landlordId = (session.user as any).id;
    const organization = await prisma.organization.findFirst({
      where: { ownerId: landlordId },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // 檢查目標用戶是否屬於該組織 (Manager) 或擁有該組織房源的租約 (Tenant)
    const isManagerInOrg = await prisma.userOrganization.findFirst({
      where: { userId: id, organizationId: organization.id },
    });

    const isTenantInOrg = await prisma.contract.findFirst({
      where: { 
        tenantId: id,
        property: { organizationId: organization.id }
      },
    });

    if (!isManagerInOrg && !isTenantInOrg) {
      return NextResponse.json({ error: "User not found in your organization" }, { status: 404 });
    }

    // 更新狀態
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
    });

    // 記錄 Audit Log
    await prisma.auditLog.create({
      data: {
        userId: landlordId,
        organizationId: organization.id,
        action: "UPDATE_MEMBER_STATUS",
        targetType: "USER",
        targetId: id,
        metadata: { newStatus: status },
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("[Landlord Member Status API] 更新失敗:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}