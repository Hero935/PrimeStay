"use client";

import React, { useState, useEffect } from "react";
import { 
  History, 
  Search, 
  Filter, 
  User as UserIcon, 
  ExternalLink,
  Cpu,
  Clock,
  ShieldAlert,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

interface AuditLog {
  id: string;
  action: string;
  targetType: string;
  targetId: string | null;
  metadata: any;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
}

/**
 * AICAuditVault: 全域審計日誌檢視器 (AIC v3 第三欄位核心)
 */
export function AICAuditVault() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/audit-logs?limit=50");
      const result = await res.json();
      if (result.success) {
        setLogs(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch logs", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes("SUSPEND")) return "text-rose-500 bg-rose-50";
    if (action.includes("PLAN_UPDATE")) return "text-blue-500 bg-blue-50";
    if (action.includes("CREATE")) return "text-emerald-500 bg-emerald-50";
    return "text-slate-500 bg-slate-50";
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white border-l">
      {/* 標題與搜尋區 */}
      <div className="p-6 border-b shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="size-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                <History className="w-5 h-5" />
             </div>
             <div>
                <h3 className="font-black text-sm uppercase tracking-tight text-slate-900">審計日誌保險庫</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Audit Log Vault v3</p>
             </div>
          </div>
          <Button variant="outline" size="icon" className="rounded-xl" onClick={fetchLogs}>
             <Clock className={cn("w-4 h-4 text-slate-400", loading && "animate-spin")} />
          </Button>
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="過濾動作或執行者..."
            className="pl-10 h-11 bg-slate-50 border-none rounded-xl text-xs font-bold focus-visible:ring-2 focus-visible:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 日誌列表流 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 scrollbar-thin">
        {loading && logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Decrypting System Logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-20 opacity-30">
             <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-slate-300" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Security Logs Found</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-primary/20 transition-all group">
              <div className="flex items-start justify-between gap-3 mb-3">
                 <Badge className={cn("border-none font-black text-[9px] uppercase tracking-widest px-2 h-5", getActionColor(log.action))}>
                    {log.action.replace(/_/g, ' ')}
                 </Badge>
                 <span className="text-[9px] font-bold text-slate-300">
                    {format(new Date(log.createdAt), "HH:mm:ss", { locale: zhTW })}
                 </span>
              </div>
              
              <div className="space-y-2">
                 <div className="flex items-center gap-2">
                    <UserIcon className="w-3 h-3 text-slate-300" />
                    <span className="text-xs font-bold text-slate-700 truncate">{log.user.name || log.user.email}</span>
                 </div>
                 
                 {log.metadata && (
                    <div className="bg-slate-50 rounded-lg p-2.5 space-y-1">
                       {Object.entries(log.metadata).map(([key, value]: [string, any]) => (
                          <div key={key} className="flex items-center justify-between text-[9px]">
                             <span className="font-black text-slate-400 uppercase tracking-tighter">{key}:</span>
                             <span className="font-bold text-slate-600 truncate max-w-[150px]">{String(value)}</span>
                          </div>
                       ))}
                    </div>
                 )}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase">
                    <History className="w-3 h-3" />
                    Target: {log.targetType}
                 </div>
                 <Button variant="ghost" size="icon" className="size-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-3 h-3 text-primary" />
                 </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 底部摘要 */}
      <div className="p-4 border-t bg-slate-50/80 flex items-center justify-between px-6">
         <div className="flex items-center gap-2">
            <Cpu className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Live Stream</span>
         </div>
         <span className="text-[10px] font-bold text-slate-300">
            TOTAL: {filteredLogs.length}
         </span>
      </div>
    </div>
  );
}