import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

/**
 * 獲取當前使用者所屬組織 API
 * GET /api/user/organizations
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "未登入" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // 查詢使用者關聯的所有組織
    const userOrgs = await prisma.userOrganization.findMany({
      where: { userId },
      include: {
        organization: true,
      },
    });

    const organizations = userOrgs.map((uo: any) => ({
      id: uo.organizationId,
      name: uo.organization.name,
      role: uo.memberRole,
    }));

    return NextResponse.json({ success: true, data: organizations });
  } catch (error) {
    console.error("獲取使用者組織失敗:", error);
    return NextResponse.json({ error: "系統錯誤" }, { status: 500 });
  }
}