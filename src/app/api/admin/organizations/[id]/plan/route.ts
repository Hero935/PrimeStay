import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
/**
 * PATCH /api/admin/organizations/[id]/plan
 * 調整組織訂閱方案
 * 僅限 systemRole === "ADMIN" 的使用者執行
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  // 驗證登入狀態與管理員身份
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 401 });
  }

  try {
    const { plan } = await request.json();
    const { id: orgId } = await params;

    // 驗證方案有效性 (不依賴生成的 Enum，直接比對字串)
    if (!["FREE", "STARTER", "PRO"].includes(plan)) {
      return NextResponse.json({ error: "無效的訂閱方案" }, { status: 400 });
    }

    // 更新組織方案並記錄審計日誌
    const updatedOrg = await prisma.$transaction(async (tx) => {
      const org = await (tx.organization as any).update({
        where: { id: orgId },
        data: { plan: plan as any },
      });

      await tx.auditLog.create({
        data: {
          userId: (session.user as any).id,
          organizationId: orgId,
          action: "FORCE_UPGRADE_PLAN",
          targetType: "ORGANIZATION",
          targetId: orgId,
          metadata: { newPlan: plan },
        },
      });

      return org;
    });

    return NextResponse.json(updatedOrg);
  } catch (error) {
    console.error("[Org Plan API] 更新失敗:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}