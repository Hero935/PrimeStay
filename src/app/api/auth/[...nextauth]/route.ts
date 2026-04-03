import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";

/**
 * NextAuth API Handler
 * 支援 GET 與 POST 請求
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };