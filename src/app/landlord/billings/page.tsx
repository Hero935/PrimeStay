"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * 帳單報表頁面 (房東端)
 * 提供帳單彙總、列表檢視及審核功能
 */
export default function LandlordBillingsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  
  const [billings, setBillings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedBilling, setSelectedBilling] = useState<any>(null); // 用於審核彈窗內容
  
  // 彙總數據
  const [summary, setSummary] = useState({
    totalPending: 0,
    totalToApprove: 0,
    totalCompleted: 0
  });

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
    } else if (authStatus === "authenticated") {
      fetchBillings();
    }
  }, [authStatus, filterStatus]);

  /**
   * 獲取帳單列表
   */
  const fetchBillings = async () => {
    setLoading(true);
    try {
      const url = filterStatus 
        ? `/api/billings?status=${filterStatus}` 
        : "/api/billings";
      const res = await fetch(url);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setBillings(data);
        
        // 計算彙總 (通常應由後端計算，此處前端暫行計算以求即時)
        const pending = data.filter(b => b.status === "PENDING_TENANT").reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0);
        const toApprove = data.filter(b => b.status === "PENDING_APPROVAL").reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0);
        const completed = data.filter(b => b.status === "COMPLETED").reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0);
        
        setSummary({
          totalPending: pending,
          totalToApprove: toApprove,
          totalCompleted: completed
        });
      }
    } catch (err) {
      console.error("載入帳單失敗", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 更新帳單狀態 (審核)
   */
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/billings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        alert("操作成功");
        setSelectedBilling(null);
        fetchBillings();
      } else {
        const error = await res.json();
        alert(`失敗: ${error.error}`);
      }
    } catch (err) {
      alert("更新狀態出錯");
    }
  };

  if (authStatus === "loading") return <div className="p-8">載入中...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link href="/landlord" className="text-gray-500 hover:text-primary mr-4 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">帳單財務報表</h1>
        </div>
        
        <div className="flex gap-2">
          <select 
            className="border rounded-md px-3 py-1.5 text-sm shadow-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">所有狀態</option>
            <option value="PENDING_TENANT">待填度數</option>
            <option value="PENDING_APPROVAL">待審核</option>
            <option value="COMPLETED">已完成</option>
          </select>
          <button 
            onClick={() => fetchBillings()}
            className="bg-white border rounded-md px-3 py-1.5 text-sm shadow-sm hover:bg-gray-50"
          >
            重新整理
          </button>
        </div>
      </div>

      {/* 數據概覽卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-400">
          <p className="text-sm text-gray-500 font-medium uppercase">租客待繳總額</p>
          <p className="text-2xl font-bold mt-1">${summary.totalPending.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 font-medium uppercase">待審核金額</p>
          <p className="text-2xl font-bold mt-1">${summary.totalToApprove.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <p className="text-sm text-gray-500 font-medium uppercase">本期已入帳</p>
          <p className="text-2xl font-bold mt-1">${summary.totalCompleted.toLocaleString()}</p>
        </div>
      </div>

      {/* 帳單表格 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">房源 / 房號</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">租客</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">帳單期間</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">應收總額</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">狀態</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">載入中...</td>
                </tr>
              ) : billings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">查無帳單資料</td>
                </tr>
              ) : (
                billings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">{b.contract.property.address}</div>
                      <div className="text-xs text-gray-400">房號: {b.contract.property.roomNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">{b.contract.tenant?.name || b.contract.tenantName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500">
                        {new Date(b.periodStart).toLocaleDateString()} - 
                        {new Date(b.periodEnd).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-bold text-primary">${Number(b.totalAmount || 0).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      {b.status === "PENDING_TENANT" && <span className="px-2 py-1 text-xs font-bold bg-yellow-100 text-yellow-700 rounded-full">待填度數</span>}
                      {b.status === "PENDING_APPROVAL" && <span className="px-2 py-1 text-xs font-bold bg-blue-100 text-blue-700 rounded-full border border-blue-200">待審核</span>}
                      {b.status === "COMPLETED" && <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full">已完成</span>}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setSelectedBilling(b)}
                        className="text-primary hover:underline text-sm font-medium"
                      >
                        檢視詳情
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 詳情與審核彈窗 */}
      {selectedBilling && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">帳單詳情與審核</h2>
              <button 
                onClick={() => setSelectedBilling(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">房源</p>
                  <p className="font-bold">{selectedBilling.contract.property.address}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">房號</p>
                  <p className="font-bold">{selectedBilling.contract.property.roomNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">租客</p>
                  <p className="font-bold">{selectedBilling.contract.tenantName}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">狀態</p>
                  <p className="font-bold">{selectedBilling.status}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold mb-3 border-b pb-2">明細</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>月租金:</span>
                    <span>${Number(selectedBilling.monthlyRent).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>管理費:</span>
                    <span>${Number(selectedBilling.managementFee).toLocaleString()}</span>
                  </div>
                  {selectedBilling.electricityRate && (
                    <div className="flex justify-between text-gray-600">
                      <span>電費 ({selectedBilling.startElectricityMeter} → {selectedBilling.endElectricityMeter}):</span>
                      <span>${((Number(selectedBilling.endElectricityMeter || 0) - Number(selectedBilling.startElectricityMeter || 0)) * Number(selectedBilling.electricityRate)).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedBilling.waterRate && (
                    <div className="flex justify-between text-gray-600">
                      <span>水費 ({selectedBilling.startWaterMeter} → {selectedBilling.endWaterMeter}):</span>
                      <span>${((Number(selectedBilling.endWaterMeter || 0) - Number(selectedBilling.startWaterMeter || 0)) * Number(selectedBilling.waterRate)).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t font-bold text-lg text-primary">
                    <span>總計:</span>
                    <span>${Number(selectedBilling.totalAmount || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 匯款憑證 */}
              <div className="space-y-3">
                <h3 className="font-bold">匯款憑證</h3>
                {selectedBilling.payments && selectedBilling.payments.length > 0 ? (
                  <div className="space-y-4">
                    {selectedBilling.payments.map((p: any) => (
                      <div key={p.id} className="border rounded-lg p-3 bg-white">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-500">上傳日期: {new Date(p.createdAt).toLocaleString()}</span>
                          <span className="font-medium text-blue-600">末三碼: {p.accountLastThree}</span>
                        </div>
                        {p.receiptPhotoUrl ? (
                          <div className="relative aspect-video w-full overflow-hidden rounded border bg-gray-100">
                            <img 
                              src={p.receiptPhotoUrl} 
                              alt="Receipt" 
                              className="object-contain w-full h-full"
                            />
                            <a 
                              href={p.receiptPhotoUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 text-xs rounded hover:bg-opacity-70"
                            >
                              開啟大圖
                            </a>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic">無照片憑證</p>
                        )}
                        <p className="mt-2 text-sm font-bold">匯款金額: ${Number(p.amount).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 bg-gray-100 p-4 rounded text-center">租客尚未上傳憑證</p>
                )}
              </div>

              {/* 審核按鈕 */}
              <div className="flex gap-4 pt-4 border-t sticky bottom-0 bg-white">
                <button 
                  onClick={() => setSelectedBilling(null)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium"
                >
                  關閉
                </button>
                {selectedBilling.status === "PENDING_APPROVAL" && (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(selectedBilling.id, "PENDING_TENANT")}
                      className="flex-1 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 font-medium"
                    >
                      退回拒絕對帳
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedBilling.id, "COMPLETED")}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 font-medium shadow-md"
                    >
                      審核通過 (入帳)
                    </button>
                  </>
                )}
                {selectedBilling.status === "COMPLETED" && (
                   <button 
                   onClick={() => handleUpdateStatus(selectedBilling.id, "PENDING_APPROVAL")}
                   className="flex-1 px-4 py-2 bg-orange-50 text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-100 font-medium"
                 >
                   取消核可 (轉回待審)
                 </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}