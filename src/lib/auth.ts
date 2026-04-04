import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * NextAuth 配置選項
 * 包含 Credentials Provider 與 Session 策略
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("請輸入信箱與密碼");
        }

        console.log(`[Auth] 嘗試登入: ${credentials.email}`);

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.log(`[Auth] 找不到用戶: ${credentials.email}`);
          throw new Error("找不到該用戶");
        }

        if (!user.hashedPassword) {
          console.log(`[Auth] 用戶資料無密碼欄位: ${credentials.email}`);
          throw new Error("帳號尚未設定密碼");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        console.log(`[Auth] 密碼驗證結果: ${isPasswordValid}`);

        if (!isPasswordValid) {
          throw new Error("密碼錯誤");
        }

        // 檢查帳號狀態：SUSPENDED 帳號禁止登入
        if (user.status === "SUSPENDED") {
          console.log(`[Auth] 帳號已被停權: ${credentials.email}`);
          throw new Error("此帳號已被停用，請聯絡系統管理員");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.systemRole,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    /**
     * JWT 回調：將 user 資訊（id, role, status）寫入 token
     * 登入時由 authorize 回傳的 user 觸發，後續請求由 token 提供
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.status = (user as any).status;
      }
      return token;
    },
    /**
     * Session 回調：將 token 中的 id, role, status 暴露給前端 session
     */
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).status = token.status;
      }
      return session;
    },
  },
};