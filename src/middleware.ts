import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * PrimeStay 基於角色的權限 Middleware
 * 同時處理：角色路由保護 + SUSPENDED 帳號全局攔截
 */
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 如果沒有 token，NextAuth 預設會導向登入頁
    if (!token) return NextResponse.next();

    // 取得角色與帳號狀態
    const role = token.role as string;
    const status = token.status as string;

    // 0. 全局攔截：帳號已被停權（SUSPENDED）一律導向停權通知頁
    if (status === "SUSPENDED") {
      const suspendedUrl = new URL("/suspended", req.url);
      // 避免無限重導（若本身已在 /suspended 頁）
      if (!path.startsWith("/suspended")) {
        return NextResponse.redirect(suspendedUrl);
      }
    }

    // 1. 管理員專屬路徑
    if (path.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 2. 房東/代管可造訪路徑 (ADMIN 不應主動進入房東區)
    const canAccessLandlord = ["LANDLORD", "MANAGER"].includes(role);
    if (path.startsWith("/landlord") && !canAccessLandlord) {
      // 如果 ADMIN 誤闖，導回 ADMIN 儀表板
      if (role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 3. 租客/管理員可造訪路徑
    const canAccessTenant = ["ADMIN", "TENANT"].includes(role);
    if (path.startsWith("/tenant") && !canAccessTenant) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // 只有當此函式回傳 true 時，middleware 內容才會執行
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login", // 如果未授權導向登入頁
    }
  }
);

// 定義哪些路徑需要被 Middleware 檢查
export const config = {
  matcher: [
    "/admin/:path*",
    "/landlord/:path*",
    "/tenant/:path*",
    "/dashboard/:path*",
    "/suspended",
  ],
};