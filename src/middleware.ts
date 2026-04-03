import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * PrimeStay 基於角色的權限 Middleware
 */
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 如果沒有 token (雖然 authorized 回傳 true, 但確保安全)，NextAuth 預設會導向登入頁
    if (!token) return NextResponse.next();

    // 取得角色
    const role = token.role as string;

    // 1. 管理員專屬路徑
    if (path.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 2. 房東/管理員可造訪路徑
    // 房東角色包含 LANDLORD 與 MANAGER (組織管理員)
    const canAccessLandlord = ["ADMIN", "LANDLORD", "MANAGER"].includes(role);
    if (path.startsWith("/landlord") && !canAccessLandlord) {
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
  ],
};