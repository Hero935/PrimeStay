"use client";

import { SessionProvider } from "next-auth/react";

/**
 * NextAuth Session Provider Wrapper
 * 讓 Client Component 可以透過 useSession 存取使用者狀態
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <SessionProvider>{children}</SessionProvider>;
};