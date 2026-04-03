import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

/**
 * 房東管理後台首頁
 */
export default async function LandlordDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">房東管理後台</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="mb-2">歡迎回來, {session.user?.name}</p>
        <p className="text-sm text-gray-500">角色: { (session.user as any).role }</p>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/landlord/properties" className="border p-4 rounded hover:bg-gray-50 block transition-colors">
            <h3 className="font-semibold">房源管理</h3>
            <p className="text-xs text-gray-400">管理您的物件、租約</p>
          </Link>
          <Link href="/landlord/billings" className="border p-4 rounded hover:bg-gray-50 block transition-colors">
            <h3 className="font-semibold">帳單報表</h3>
            <p className="text-xs text-gray-400">查看收款進度</p>
          </Link>
          <Link href="/landlord/maintenances" className="border p-4 rounded hover:bg-gray-50 block transition-colors">
            <h3 className="font-semibold">維修申請</h3>
            <p className="text-xs text-gray-400">處理租客報修</p>
          </Link>
        </div>
      </div>
    </div>
  );
}