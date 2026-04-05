import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

/**
 * GET /api/admin/users
 * 取得所有用戶列表（含角色與帳號狀態）
 * 僅限 ADMIN 存取
 */
export async function GET() {
  // Re-compilation trigger: 2026-04-05 12:35
  const session = await getServerSession(authOptions);

  // 權限驗證：僅允許 ADMIN
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        systemRole: true,
        status: true,
        createdAt: true,
        // 組織關聯（房東/代管）
        organizations: {
          select: {
            id: true,
            name: true,
          },
        },
        // 組織成員身份
        userOrganizations: {
          select: {
            memberRole: true,
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { systemRole: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[Admin Users API] 查詢失敗:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}