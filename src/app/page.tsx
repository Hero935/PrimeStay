import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * 首頁 (Landing Page)
 * 已登入使用者將根據角色自動重導向
 */
export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    const role = (session.user as any).role;
    if (role === "ADMIN") {
      // 如果有 admin 目錄則導向 /admin，目前先導向 /landlord
      redirect("/landlord");
    } else if (role === "LANDLORD" || role === "MANAGER") {
      redirect("/landlord");
    } else if (role === "TENANT") {
      redirect("/tenant");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold text-primary">PrimeStay</h1>
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4">
          高端租屋代管平台 正在建置中...
        </p>
      </div>
      <div className="mt-8">
        <a
          href="/login"
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
        >
          進入系統 (Auth)
        </a>
      </div>
    </main>
  );
}