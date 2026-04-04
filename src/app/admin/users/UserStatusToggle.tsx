"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface UserStatusToggleProps {
  userId: string;
  currentStatus: string;
  userName: string;
}

/**
 * 用戶狀態切換按鈕（Client Component）
 * 透過 PATCH /api/admin/users/[id]/status 呼叫 API 切換 ACTIVE ↔ SUSPENDED
 */
export function UserStatusToggle({
  userId,
  currentStatus,
  userName,
}: UserStatusToggleProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(currentStatus);

  /**
   * 切換用戶帳號狀態
   * 發送 PATCH 請求並在成功後刷新頁面
   */
  const handleToggle = async () => {
    const newStatus = status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const action = newStatus === "SUSPENDED" ? "停權" : "恢復";

    if (!confirm(`確定要${action}用戶「${userName}」的帳號嗎？`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(`操作失敗：${data.error}`);
        return;
      }

      setStatus(newStatus);
      router.refresh();
    } catch {
      alert("網路錯誤，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* 帳號狀態標籤 */}
      <Badge
        variant={status === "ACTIVE" ? "default" : "destructive"}
        className="text-xs"
      >
        {status === "ACTIVE" ? "正常" : "已停權"}
      </Badge>

      {/* 切換按鈕 */}
      <Button
        size="sm"
        variant={status === "ACTIVE" ? "outline" : "default"}
        onClick={handleToggle}
        disabled={loading}
        className="text-xs h-7 px-2"
      >
        {loading ? "處理中..." : status === "ACTIVE" ? "停權" : "恢復"}
      </Button>
    </div>
  );
}