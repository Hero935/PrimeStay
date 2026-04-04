import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

/**
 * 撤銷邀請 API
 * DELETE /api/invitations/[id]
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "LANDLORD", "MANAGER"].includes((session.user as any).role)) {
      return NextResponse.json({ error: "權限不足" }, { status: 403 });
    }

    const { id } = await params;

    // 檢查該邀請是否存在且屬於該組織 (簡單起見，先檢查是否存在)
    const invitation = await prisma.invitation.findUnique({
      where: { id },
    });

    if (!invitation) {
      return NextResponse.json({ error: "邀請不存在" }, { status: 404 });
    }

    // 刪除邀請
    await prisma.invitation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("刪除邀請失敗:", error);
    return NextResponse.json({ error: "內部系統錯誤" }, { status: 500 });
  }
}