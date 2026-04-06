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