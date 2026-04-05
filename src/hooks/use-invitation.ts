"use client";

import { useState } from "react";
import { toast } from "sonner";

/**
 * 邀請碼生成的參數介面
 */
interface GenerateParams {
  organizationId?: string;
  targetRole: "LANDLORD" | "MANAGER" | "TENANT";
  propertyId?: string;
}

/**
 * 共通邀請功能 Hook
 * 負責處理邀請碼生成 API 請求、複製到剪貼簿邏輯與相關狀態管理
 */
export function useInvitation(onSuccess?: (code: string) => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  /**
   * 調用 API 生成邀請碼
   * @param params - 包含組織 ID、目標角色及選填房源 ID
   */
  const generate = async (params: GenerateParams) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/invitations/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await response.json();
      if (data.success) {
        setInviteCode(data.code);
        toast.success("邀請碼生成成功");
        onSuccess?.(data.code);
      } else {
        throw new Error(data.error || "生成邀請碼失敗，請稍後再試");
      }
    } catch (error: any) {
      toast.error(error.message || "生成邀請碼時發生錯誤");
      console.error("Generate invitation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 複製邀請連結與格式化內容至剪貼簿
   * @param targetRole - 根據角色決定格式化文字內容
   */
  const copyContent = (targetRole: string) => {
    if (!inviteCode) return;

    const inviteLink = `${window.location.origin}/register?code=${inviteCode}`;
    let roleText = "成員";
    
    switch (targetRole) {
      case "LANDLORD":
        roleText = "房東";
        break;
      case "MANAGER":
        roleText = "代管管理員";
        break;
      case "TENANT":
        roleText = "房客";
        break;
    }

    const text = `您好，誠摯邀請您加入 PrimeStay 成為${roleText}平台合作夥伴。\n邀請碼：${inviteCode}\n註冊連結：${inviteLink}`;

    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied(true);
        toast.success("已複製邀請連結內容至剪貼簿");
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error("無法複製到剪貼簿:", err);
        toast.error("複製失敗，請手動複製");
      });
  };

  /**
   * 重置 Hook 狀態 (用於對話框關閉時)
   */
  const reset = () => {
    setInviteCode(null);
    setIsCopied(false);
    setIsLoading(false);
  };

  return {
    generate,
    reset,
    copyContent,
    inviteCode,
    isLoading,
    isCopied,
  };
}