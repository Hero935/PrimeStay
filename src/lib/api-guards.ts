import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Role = "ADMIN" | "LANDLORD" | "MANAGER" | "TENANT";

/**
 * 通用 API 權限檢查包裝函數
 * @param handler 原始 API 處理函數
 * @param allowedRoles 允許的角色清單 (選填，不填則僅檢查登入與狀態)
 */
export function withAuth(
  handler: (req: Request, context: { params: any, session: any }) => Promise<NextResponse>,
  allowedRoles?: Role[]
) {
  return async (req: Request, context: { params?: any }) => {
    try {
      const session = await getServerSession(authOptions);

      // 1. 檢查是否登入
      if (!session) {
        return NextResponse.json({ error: "未登入" }, { status: 401 });
      }

      // 2. 檢查用戶狀態 (從資料庫獲取最新狀態)
      const user = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        select: { status: true, systemRole: true }
      });

      if (!user) {
        return NextResponse.json({ error: "用戶不存在" }, { status: 401 });
      }

      if (user.status === "SUSPENDED") {
        return NextResponse.json({
          error: "您的帳號已被停權，請聯繫管理員。",
          isSuspended: true
        }, { status: 403 });
      }

      // 3. 檢查角色權限
      if (allowedRoles && !allowedRoles.includes(user.systemRole as any)) {
        return NextResponse.json({ error: "權限不足，您的角色無法執行此操作。" }, { status: 403 });
      }

      // 執行原始處理程序，並傳入擴展的 context (確保 params 與 session 型別正確)
      return await handler(req, { 
        params: context?.params || {}, 
        session 
      });
    } catch (error) {
      console.error("API Guard Error:", error);
      return NextResponse.json({ error: "系統內部錯誤" }, { status: 500 });
    }
  };
}

/**
 * 資源所有權稽核工具
 * 用於驗證發起請求的用戶是否對該資源 (組織/房源) 具備合法操作權限
 */
export const OwnershipGuard = {
  /**
   * 驗證用戶是否為組織擁有者 (Landlord)
   */
  async belongsToOrg(userId: string, organizationId: string) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { ownerId: true }
    });
    return org?.ownerId === userId;
  },

  /**
   * 驗證房源是否屬於用戶管理的組織
   */
  async canManageProperty(userId: string, propertyId: string) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        organization: {
          select: { ownerId: true }
        }
      }
    });

    if (!property) return false;

    // 1. 如果是用戶直接管理的房源 (Manager)
    if (property.managerId === userId) return true;

    // 2. 如果是房源所屬組織的擁有者 (Landlord)
    if (property.organization.ownerId === userId) return true;

    return false;
  }
};