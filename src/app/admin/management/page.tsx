import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ManagementViewWrapper } from "@/components/management/ManagementViewWrapper";

export const metadata: Metadata = {
  title: "整合資產管理 | PrimeStay",
  description: "全系統組織、房東、房源與房客戰略視圖",
};

/**
 * 修正後的管理頁面入口
 * 移除寬度限制，確保在寬螢幕下能自動填滿，並調整高度適配。
 */
export default async function ManagementPage(props: {
  searchParams: Promise<{ orgId?: string; search?: string }>;
}) {
  const searchParams = await props.searchParams;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col h-full w-full">
      <ManagementViewWrapper
        initialSelectedOrgId={searchParams.orgId}
        initialSearchTerm={searchParams.search}
      />
    </div>
  );
}