import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ManagementViewWrapper } from "@/components/management/ManagementViewWrapper";

export const metadata: Metadata = {
  title: "資產關係樹 | PrimeStay",
  description: "房客合約、代管與房源關係視圖",
};

/**
 * 修正後的房東管理頁面
 * 統一使用填滿佈局，消除 PC 端巨大的左右空白。
 */
export default async function LandlordManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col h-full w-full">
      <ManagementViewWrapper />
    </div>
  );
}