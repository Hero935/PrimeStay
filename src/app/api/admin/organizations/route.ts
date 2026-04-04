import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/organizations
 * 取得所有組織列表及其詳情，供系統管理員儀表板使用
 * 僅限 systemRole === "ADMIN" 的使用者存取
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  // 驗證登入狀態
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 驗證管理員身份
  const role = (session.user as any).role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 查詢所有組織，包含房東資訊、房源數與入住合約數
  const organizations = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      // 組織擁有者（房東）基本資訊
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      // 成員清單（含角色）
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              systemRole: true,
            },
          },
        },
      },
      // 房源清單（只計數需要的欄位）
      properties: {
        select: {
          id: true,
          status: true,
          address: true,
          roomNumber: true,
          // 含入住中合約
          contracts: {
            where: { status: "OCCUPIED" },
            select: { id: true },
          },
        },
      },
    },
  });

  // 整理輸出格式，計算各組織的統計數據
  const formatted = organizations.map((org) => {
    const propertyCount = org.properties.length;
    const rentedCount = org.properties.filter((p) => p.status === "RENTED").length;
    const occupiedTenantCount = org.properties.reduce(
      (acc, p) => acc + p.contracts.length,
      0
    );
    const memberCount = org.members.length;

    return {
      id: org.id,
      name: org.name,
      createdAt: org.createdAt,
      owner: org.owner,
      memberCount,
      propertyCount,
      rentedCount,
      occupiedTenantCount,
      members: org.members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        systemRole: m.user.systemRole,
        memberRole: m.memberRole,
      })),
    };
  });

  return NextResponse.json(formatted);
}