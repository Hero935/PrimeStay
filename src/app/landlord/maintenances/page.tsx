"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * 房東維修管理頁面
 * 用於查看租客提交的維修單並進行回覆與狀態更新
 */
export default function LandlordMaintenancesPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [maintenances, setMaintenances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null);
  const [reply, setReply] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/login");
    } else if (authStatus === "authenticated") {
      fetchMaintenances();
    }
  }, [authStatus]);

  const fetchMaintenances = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/maintenances");
      const json = await res.json();
      if (json.success) {
        setMaintenances(json.data);
      }
    } catch (err) {
      console.error("載入維修單失敗", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/maintenances/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, landlordReply: reply }),
      });

      if (res.ok) {
        alert("更新成功");
        setSelectedMaintenance(null);
        setReply("");
        fetchMaintenances();
      }
    } catch (err) {
      alert("更新失敗");
    } finally {
      setUpdating(false);
    }
  };

  if (authStatus === "loading") return <div className="p-8 text-center text-gray-500">載入中...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link href="/landlord" className="text-gray-500 hover:text-primary transition-colors mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">維修審核管理</h1>
        </div>
        <button 
          onClick={() => fetchMaintenances()}
          className="px-4 py-2 bg-white border rounded-lg text-sm shadow-sm hover:bg-gray-50 transition-colors"
        >
          重新整理
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="text-center py-20 text-gray-400">正在獲取報修數據...</div>
        ) : maintenances.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">目前沒有待處理的維修申請</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {maintenances.map((m) => (
              <div 
                key={m.id} 
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedMaintenance(m);
                  setReply(m.landlordReply || "");
                }}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${
                      m.status === 'PENDING' ? 'bg-red-100 text-red-600' : 
                      m.status === 'PROCESSING' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {m.status === 'PENDING' ? '待處理' : m.status === 'PROCESSING' ? '維修中' : '已完成'}
                    </span>
                    <span className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <h3 className="font-bold text-lg text-gray-800 mb-1">{m.item}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{m.description}</p>
                  
                  <div className="pt-4 border-t border-gray-50 text-xs text-gray-500">
                    <p className="font-medium text-gray-700">{m.contract.property?.address}</p>
                    <p>房號: {m.contract.property?.roomNumber} | 租客: {m.contract.tenantName}</p>
                  </div>
                </div>
                {m.photos && m.photos[0] && (
                  <div className="h-32 w-full overflow-hidden">
                    <img src={m.photos[0]} alt="Maintenance" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 詳細彈窗 */}
      {selectedMaintenance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold">維修工單詳情</h2>
              <button onClick={() => setSelectedMaintenance(null)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex gap-4">
                 <div className="flex-1">
                    <label className="text-xs text-gray-400 uppercase font-bold">申報項目</label>
                    <p className="text-lg font-bold">{selectedMaintenance.item}</p>
                 </div>
                 <div>
                    <label className="text-xs text-gray-400 uppercase font-bold">目前狀態</label>
                    <p className="font-bold text-primary">{selectedMaintenance.status}</p>
                 </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 uppercase font-bold">詳細描述</label>
                <div className="bg-gray-50 p-4 rounded-lg mt-1 text-gray-700 whitespace-pre-wrap">
                  {selectedMaintenance.description}
                </div>
              </div>

              {selectedMaintenance.photos && selectedMaintenance.photos.length > 0 && (
                <div>
                  <label className="text-xs text-gray-400 uppercase font-bold">現場照片</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {selectedMaintenance.photos.map((url: string, idx: number) => (
                      <img key={idx} src={url} className="w-full h-40 object-cover rounded-lg border" alt="Issue" />
                    ))}
                  </div>
                </div>
              )}

              <hr />

              <div>
                <label className="text-sm font-bold text-gray-800">房東回覆 / 維修紀錄</label>
                <textarea
                  className="w-full mt-2 p-3 border rounded-lg focus:ring-2 focus:ring-primary h-24 text-sm"
                  placeholder="請輸入回覆或維修進度更新..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white">
                <button 
                  onClick={() => setSelectedMaintenance(null)}
                  className="flex-1 py-2 px-4 border rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedMaintenance.id, "PROCESSING")}
                  disabled={updating}
                  className="flex-1 py-2 px-4 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 font-medium transition-colors disabled:opacity-50"
                >
                  標記為維修中
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedMaintenance.id, "COMPLETED")}
                  disabled={updating}
                  className="flex-1 py-2 px-4 bg-primary text-white rounded-lg hover:bg-opacity-90 font-medium transition-opacity shadow-md disabled:opacity-50"
                >
                  完成維修
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}