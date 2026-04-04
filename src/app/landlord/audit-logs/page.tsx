"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, User, Activity, Clock } from "lucide-react";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

interface AuditLog {
  id: string;
  action: string;
  targetType: string;
  metadata: any;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
}

const ACTION_MAP: Record<string, { label: string, color: string }> = {
  "UPDATE_MEMBER_STATUS": { label: "變更成員狀態", color: "bg-amber-100 text-amber-700" },
  "PROPERTY_ASSIGNMENT": { label: "房源分派", color: "bg-blue-100 text-blue-700" },
  "UPDATE_ORGANIZATION": { label: "更新組織資訊", color: "bg-purple-100 text-purple-700" },
  "INVITE_MANAGER": { label: "邀請代管人員", color: "bg-green-100 text-green-700" },
};

export default function LandlordAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/landlord/audit-logs");
      const { data } = await res.json();
      setLogs(data || []);
    } catch (err) {
      console.error("載入日誌失敗");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">操作日誌</h1>
        <p className="text-slate-500">稽核組織內所有 Manager 與關鍵變動紀錄</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" /> 最近操作紀錄
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-lg" />)}
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-100 ml-3 pl-6 space-y-8">
                {logs.map((log) => (
                  <div key={log.id} className="relative">
                    {/* Time node */}
                    <div className="absolute -left-[31px] mt-1.5 w-3 h-3 rounded-full bg-slate-200 border-2 border-white" />
                    
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] uppercase font-bold ${ACTION_MAP[log.action]?.color || "bg-slate-100"}`}>
                          {ACTION_MAP[log.action]?.label || log.action}
                        </Badge>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm", { locale: zhTW })}
                        </span>
                      </div>
                      
                      <div className="text-sm">
                        <span className="font-semibold text-slate-900">{log.user.name || log.user.email}</span>
                        <span className="text-slate-500 mx-2">執行了</span>
                        <span className="font-medium text-slate-700">{ACTION_MAP[log.action]?.label}</span>
                      </div>

                      {log.metadata && (
                         <pre className="mt-2 p-3 bg-slate-50 rounded-lg text-[10px] text-slate-500 overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                         </pre>
                      )}
                    </div>
                  </div>
                ))}

                {logs.length === 0 && (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">尚無任何操作紀錄</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}