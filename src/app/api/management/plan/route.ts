import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * 組織方案管理 API
 * PATCH: 更新組織的訂閱方案級別
 */
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { orgId, planId } = await req.json();

    if (!orgId || !planId) {
      return new NextResponse("Missing parameters", { status: 400 });
    }

    // 處理前端可能帶有的 id 前綴 (由 ManagementTree 產生)
    const cleanOrgId = orgId.startsWith("org-") ? orgId.replace("org-", "") : orgId;

    // 執行更新
    const updatedOrg = await prisma.organization.update({
      where: { id: cleanOrgId },
      data: { plan: planId }
    });

    return NextResponse.json({
      success: true,
      plan: updatedOrg.plan,
      message: `Organization plan updated to ${planId}`
    });
  } catch (error) {
    console.error("[PLAN_PATCH_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}