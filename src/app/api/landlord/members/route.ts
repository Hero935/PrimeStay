import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

/**
 * GET /api/landlord/members
 * 取得房東所屬組織的所有成員（Manager 與 Tenant）
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  // 權限驗證：僅允許 LANDLORD
  if (!session || (session.user as any).role !== "LANDLORD") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 取得房東擁有的組織 ID
  const organization = await prisma.organization.findFirst({
    where: { ownerId: (session.user as any).id },
  });

  if (!organization) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  try {
    // 取得組織內的 Manager
    const managers = await prisma.userOrganization.findMany({
      where: { organizationId: organization.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    // 取得與組織房源相關聯的 Tenant
    // 修改邏輯：由原本只查詢有 Contract 的人，優化為包含所有與該組織有關聯的租客
    const tenants = await prisma.user.findMany({
      where: {
        systemRole: "TENANT",
        OR: [
          {
            contracts: {
              some: {
                property: {
                  organizationId: organization.id,
                },
              },
            },
          },
          // 支援透過邀請碼已註冊但可能尚未完全綁定到合約的潛在關聯 (如果有的話)
          // 目前註冊時已自動建立 Contract，此處 OR 保持擴展性
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        contracts: {
          where: {
            property: {
              organizationId: organization.id,
            },
          },
          select: {
            property: {
              select: {
                address: true,
                roomNumber: true,
              },
            },
            endDate: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      managers: managers.map(m => ({ ...m.user, memberRole: m.memberRole })),
      tenants 
    });
  } catch (error) {
    console.error("[Landlord Members API] 查詢失敗:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}