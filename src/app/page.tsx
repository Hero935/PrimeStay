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
    console.log(`[Home] User role: ${role}, redirecting...`);
    if (role === "ADMIN") {
      return redirect("/admin");
    } else if (role === "LANDLORD" || role === "MANAGER") {
      redirect("/landlord");
    } else if (role === "TENANT") {
      redirect("/tenant");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white relative overflow-hidden">
      {/* 裝飾性背景網格與漸層 */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#eff6ff,transparent)]"></div>
      </div>

      <div className="container px-4 md:px-6 z-10">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 mb-4 animate-in fade-in duration-700">
               ✨ 高端租屋代管新標準
            </div>
            <h1 className="text-4xl font-extrabold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl/none bg-clip-text text-transparent bg-gradient-to-b from-neutral-900 to-neutral-500 pb-2">
              PrimeStay
            </h1>
            <p className="mx-auto max-w-[700px] text-neutral-500 md:text-xl dark:text-neutral-400 font-medium leading-relaxed">
              全方位租務自動化與多組織管理系統。<br />
              專為追求極致效率的房東與高端租客打造。
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-8 animate-in slide-in-from-bottom-4 duration-1000">
            <a
              href="/login"
              className="inline-flex h-14 items-center justify-center rounded-xl bg-slate-900 px-8 text-sm font-bold text-white shadow-xl shadow-slate-200 transition-all hover:scale-105 active:scale-95 hover:bg-slate-800"
            >
              進入管理系統
            </a>
            <a
              href="#features"
              className="inline-flex h-14 items-center justify-center rounded-xl border border-neutral-200 bg-white px-8 text-sm font-bold text-neutral-900 shadow-sm transition-all hover:bg-neutral-50 active:scale-95"
            >
              瞭解更多
            </a>
          </div>
        </div>

        {/* 預覽裝飾卡片 */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto opacity-80 scale-95 translate-y-4">
           {[
             { title: "自動化繳費", icon: "💰" },
             { title: "即時報修", icon: "🛠️" },
             { title: "多組織管理", icon: "🏢" }
           ].map((f, i) => (
             <div key={i} className="bg-white/50 backdrop-blur border border-neutral-100 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
                <span className="text-2xl">{f.icon}</span>
                <span className="font-bold text-neutral-800">{f.title}</span>
             </div>
           ))}
        </div>
      </div>

      <footer className="absolute bottom-10 text-center w-full">
         <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-300">
           © 2026 PrimeStay Software Group. All rights reserved.
         </p>
      </footer>
    </main>
  );
}