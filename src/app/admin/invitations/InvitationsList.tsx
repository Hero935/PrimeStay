"use client";

import { useState } from "react";
import { Mail, Clock, CheckCircle2, XCircle, AlertCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { InviteDialog } from "@/components/invitations/InviteDialog";

interface Invitation {
  id: string;
  code: string;
  isUsed: boolean;
  expiresAt: Date | string;
  inviter: { name: string | null; email: string };
  organization: { name: string } | null;
  targetRole: string;
  targetPlan: string | null;
}

interface Organization {
  id: string;
  name: string;
}

interface InvitationsListProps {
  initialInvitations: any[]; 
  organizations: Organization[];
}

/**
 * 房東邀請管理列表組件 (Client Component)
 * 負責渲染列表並處理撤銷 (刪除) 操作，與房東端成員管理頁面保持一致的互動模式
 */
export function InvitationsList({
  initialInvitations,
  organizations,
}: InvitationsListProps) {
  // 將資料庫查詢出的 ISO string 轉換為 Date 物件
  const [invitations, setInvitations] = useState<Invitation[]>(
    initialInvitations.map(inv => ({ 
      ...inv, 
      expiresAt: new Date(inv.expiresAt) 
    }))
  );
  
  const now = new Date();

  /**
   * 撤銷邀請操作
   * 調用 API/invitations/[id] 進行實體刪除
   */
  const handleDelete = async (id: string) => {
    // 顯示與 Landlord 端一致的確認提示
    if (!confirm("確定要撤銷此邀請嗎？對方將無法使用該邀請碼註冊。")) {
      return;
    }

    try {
      const response = await fetch(`/api/invitations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("已撤銷該房東邀請");
        // 更新本地狀態以即時刷新列表 UI
        setInvitations(prev => prev.filter(inv => inv.id !== id));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "撤銷請求失敗");
      }
    } catch (error: any) {
      toast.error(error.message || "系統處理撤銷時發生錯誤");
    }
  };

  /**
   * 解析邀請碼狀態並回傳對應的 UI 配置
   */
  const getInviteStatus = (isUsed: boolean, expiresAt: Date) => {
    if (isUsed) {
      return {
        label: "已接受",
        icon: CheckCircle2,
        className: "bg-emerald-50 text-emerald-600",
      };
    }
    if (expiresAt < now) {
      return {
        label: "已過期",
        icon: XCircle,
        className: "bg-slate-100 text-slate-400",
      };
    }
    const diffDays = Math.ceil(
      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays <= 2) {
      return {
        label: `即將到期 (${diffDays} 天)`,
        icon: AlertCircle,
        className: "bg-amber-50 text-amber-600",
      };
    }
    return {
      label: "待接受",
      icon: Clock,
      className: "bg-blue-50 text-blue-600",
    };
  };

  // 即時計算統計卡片數據
  /**
   * 重新獲取邀請列表數據
   * 用於在生成新邀請後更新列表，而不需要重新整理整頁
   */
  const fetchInvitations = async () => {
    try {
      // 獲取 Admin 可見的邀請類型 (LANDLORD 與 MANAGER)
      const response = await fetch("/api/invitations?includeUsed=true");
      const data = await response.json();
      if (data.success) {
        setInvitations(data.data.map((inv: any) => ({
          ...inv,
          expiresAt: new Date(inv.expiresAt)
        })));
      }
    } catch (error) {
      console.error("更新列表失敗:", error);
    }
  };

  const stats = {
    total: invitations.length,
    accepted: invitations.filter((i) => i.isUsed).length,
    pending: invitations.filter((i) => !i.isUsed && (i.expiresAt as Date) > now).length,
    expired: invitations.filter((i) => !i.isUsed && (i.expiresAt as Date) <= now).length,
    conversionRate: invitations.length > 0
      ? Math.round((invitations.filter((i) => i.isUsed).length / invitations.length) * 100)
      : 0,
  };

  return (
    <div className="space-y-6">
      {/* 標題與核心動作區 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 text-white shadow-sm">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">官方邀請管理</h1>
            <p className="text-sm text-slate-500">
              共計 {stats.total} 筆由管理員發出的邀請記錄
            </p>
          </div>
        </div>
  
        <div className="flex items-center gap-3">
          <InviteDialog
            targetRole="LANDLORD"
            organizations={organizations}
            triggerLabel="房東邀請"
            onSuccess={fetchInvitations}
          />
          <InviteDialog
            targetRole="MANAGER"
            organizations={organizations}
            triggerLabel="代管邀請"
            onSuccess={fetchInvitations}
          />
        </div>
      </div>

      {/* 統計概況區 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "已授權加入", value: stats.accepted, color: "border-emerald-100 bg-emerald-50 text-emerald-700" },
          { label: "待處理邀請", value: stats.pending, color: "border-blue-100 bg-blue-50 text-blue-700" },
          { label: "已過期", value: stats.expired, color: "border-slate-100 bg-slate-50 text-slate-400" },
          {
            label: "入駐轉換率",
            value: `${stats.conversionRate}%`,
            color: "border-indigo-100 bg-indigo-50 text-indigo-700",
            isProgress: true
          }
        ].map((s) => (
          <Card key={s.label} className={`border ${s.color}`}>
            <CardContent className="py-4 px-5">
              <p className="text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">{s.label}</p>
              <div className="flex items-end justify-between gap-2">
                <p className="text-2xl font-bold">{s.value}</p>
                {s.isProgress && (
                  <div className="w-16 h-1 w-full bg-indigo-200 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-1000"
                      style={{ width: `${stats.conversionRate}%` }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 核心紀錄清單 */}
      <Card className="border border-slate-100 shadow-sm overflow-hidden bg-white/50 backdrop-blur">
        <CardHeader className="pb-3 border-b border-slate-50">
          <CardTitle className="text-base text-slate-800">全部邀請明細</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {invitations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-200">
              <Mail className="w-12 h-12 stroke-[1]" />
              <p className="text-sm text-slate-400">目前尚無任何房東邀約紀錄</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {invitations.map((inv) => {
                const status = getInviteStatus(inv.isUsed, inv.expiresAt as Date);
                const StatusIcon = status.icon;
                const expirationDate = inv.expiresAt as Date;

                return (
                  <div
                    key={inv.id}
                    className="flex items-center gap-4 px-5 py-5 hover:bg-slate-50/50 transition-colors group"
                  >
                    {/* 狀態指示圖示 */}
                    <div className={`p-2 rounded-xl shrink-0 ${status.className}`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>

                    {/* 邀請主體內容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800 text-sm truncate">
                          {inv.organization?.name ?? (
                            inv.targetRole === "LANDLORD"
                              ? "新房東註冊 (待設定組織)"
                              : inv.targetRole === "MANAGER"
                                ? "專業代管 (待設定組織)"
                                : "未指定組織"
                          )}
                        </span>
                        <Badge variant="outline" className="text-[10px] py-0 h-4 border-slate-200 text-slate-500">
                          {inv.targetRole}
                        </Badge>
                        {inv.targetPlan && (
                          <Badge variant="outline" className="text-[10px] py-0 h-4 border-blue-200 text-blue-600 bg-blue-50/50">
                            {inv.targetPlan} 方案
                          </Badge>
                        )}
                        <Badge variant="secondary" className={`text-[10px] py-0 h-4 border-none ${status.className}`}>
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <p>負責人：{inv.inviter.name ?? inv.inviter.email}</p>
                        <p className="font-mono text-slate-400">
                          CODE: <span className="text-slate-600 bg-slate-100 px-1 rounded">{inv.code}</span>
                        </p>
                      </div>
                    </div>

                    {/* 時間與操作動作區 */}
                    <div className="flex items-center gap-6">
                      <div className="text-right shrink-0 hidden sm:block">
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">到期時間</p>
                        <p className="text-xs text-slate-600 font-medium whitespace-nowrap">
                          {expirationDate.toLocaleDateString("zh-TW")}
                        </p>
                      </div>
                      
                      {/* 操作區：僅針對未使用的邀請顯示撤銷選項 */}
                      <div className="min-w-[40px] flex justify-end">
                        {!inv.isUsed ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(inv.id)}
                            className="text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors rounded-full"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        ) : (
                          <div className="w-10 h-10 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}