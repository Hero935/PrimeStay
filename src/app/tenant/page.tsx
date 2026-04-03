import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

/**
 * 租客首頁面板
 */
export default async function TenantDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  // 獲取租客當前有效的租約
  const contract = await prisma.contract.findFirst({
    where: { 
      tenantId: userId,
      status: "OCCUPIED" 
    },
    include: {
      property: true,
    }
  });

  // 獲取待處理帳單
  const pendingBillings = await prisma.billing.findMany({
    where: {
      contract: { tenantId: userId },
      status: { in: ["PENDING_TENANT"] }
    },
    orderBy: { periodStart: "desc" }
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        租客面板
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 租約與房源資訊 */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            🏠 我的租處
          </h2>
          {contract ? (
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-lg font-bold">{contract.property.address}</p>
                <p className="text-sm text-gray-600">房號: {contract.property.roomNumber}</p>
              </div>
              <div className="grid grid-cols-2 text-sm">
                <div>
                  <p className="text-gray-400">起租日</p>
                  <p>{new Date(contract.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">月租金</p>
                  <p className="font-bold text-primary">${Number(contract.monthlyRent).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 py-4">目前沒有啟用的租約</p>
          )}
        </section>

        {/* 最新待繳帳單 */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            💰 待繳帳單
          </h2>
          {pendingBillings.length > 0 ? (
            <div className="space-y-3">
              {pendingBillings.map((bill: any) => (
                <div key={bill.id} className="flex justify-between items-center bg-red-50 p-3 rounded border border-red-100">
                  <div>
                    <p className="text-sm font-bold text-red-800">
                      {new Date(bill.periodStart).getMonth() + 1}月 帳單
                    </p>
                    <p className="text-xs text-red-600">請輸入水電度數並繳費</p>
                  </div>
                  <div className="text-right">
                    <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors">
                      去繳費
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-green-600 text-sm font-medium py-4">恭喜！目前沒有待繳帳單</p>
          )}
        </section>
      </div>

      {/* 功能入口網格 */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border text-center hover:shadow-md cursor-pointer transition-shadow">
          <div className="text-2xl mb-1">📋</div>
          <div className="text-xs font-bold">歷史帳單</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border text-center hover:shadow-md cursor-pointer transition-shadow">
          <div className="text-2xl mb-1">🛠️</div>
          <div className="text-xs font-bold">我要報修</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border text-center hover:shadow-md cursor-pointer transition-shadow">
          <div className="text-2xl mb-1">📄</div>
          <div className="text-xs font-bold">合約文件</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border text-center hover:shadow-md cursor-pointer transition-shadow">
          <div className="text-2xl mb-1">🏢</div>
          <div className="text-xs font-bold">組織資訊</div>
        </div>
      </div>
    </div>
  );
}