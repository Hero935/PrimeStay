import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-guards";

/**
 * 獲取當前使用者所屬組織 API
 * GET /api/user/organizations
 */
export const GET = withAuth(async (req, { session }) => {
  try {
    const userId = (session.user as any).id;

    // 查詢使用者關聯的所有組織，並包含方案資訊與房源計數
    const userOrgs = await prisma.userOrganization.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            _count: {
              select: { properties: true }
            }
          }
        },
      },
    });

    const organizations = userOrgs.map((uo: any) => ({
      id: uo.organizationId,
      name: uo.organization.name,
      memberRole: uo.memberRole,
      plan: uo.organization.plan,
      propertyCount: uo.organization._count.properties,
      planExpiresAt: uo.organization.planExpiresAt,
    }));

    return NextResponse.json({ success: true, data: organizations });
  } catch (error) {
    console.error("獲取使用者組織失敗:", error);
    return NextResponse.json({ error: "系統錯誤" }, { status: 500 });
  }
});