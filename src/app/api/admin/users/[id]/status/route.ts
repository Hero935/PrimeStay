import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * PATCH /api/admin/users/[id]/status
 * 切換用戶帳號狀態（ACTIVE ↔ SUSPENDED）
 * 僅限 ADMIN 存取；ADMIN 帳號本身無法被停權
 *
 * @param request - 包含 { status: "ACTIVE" | "SUSPENDED" } 的 JSON body
 * @param params  - URL 路徑參數，包含目標用戶 id
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  // 權限驗證：僅允許 ADMIN
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: targetId } = await params;
  const adminId = (session.user as any).id;

  // 防止管理員停用自己的帳號
  if (adminId === targetId) {
    return NextResponse.json(
      { error: "管理員無法停用自己的帳號" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { status } = body;

    // 驗證狀態值合法性
    if (!["ACTIVE", "SUSPENDED"].includes(status)) {
      return NextResponse.json(
        { error: "無效的狀態值，僅接受 ACTIVE 或 SUSPENDED" },
        { status: 400 }
      );
    }

    // 檢查目標用戶是否存在且不為 ADMIN 角色
    const targetUser = await prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, systemRole: true, email: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "找不到該用戶" }, { status: 404 });
    }

    // 防止停用其他 ADMIN 帳號
    if (targetUser.systemRole === "ADMIN") {
      return NextResponse.json(
        { error: "無法變更其他系統管理員的帳號狀態" },
        { status: 400 }
      );
    }

    // 更新用戶狀態
    const updatedUser = await prisma.user.update({
      where: { id: targetId },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        systemRole: true,
        status: true,
      },
    });

    console.log(
      `[Admin] 管理員 ${adminId} 將用戶 ${targetUser.email} 狀態更新為 ${status}`
    );

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("[Admin User Status API] 更新失敗:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}