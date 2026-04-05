"use client";

import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

/**
 * 邀請碼生成結果組件
 * 專注於展示生成的邀請碼與展示複製功能
 */
interface InviteResultViewProps {
  inviteCode: string;
  isCopied: boolean;
  onCopy: () => void;
}

export function InviteResultView({
  inviteCode,
  isCopied,
  onCopy,
}: InviteResultViewProps) {
  return (
    <div className="grid gap-4 py-6">
      <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-blue-50 border border-blue-100 rounded-xl">
        <p className="text-sm font-medium text-blue-600 uppercase tracking-widest text-center">
          您的專屬邀請碼
        </p>
        <p className="text-4xl font-black text-blue-700 tracking-tighter text-center">
          {inviteCode}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2 bg-white hover:bg-slate-50 transition-colors"
          onClick={onCopy}
        >
          {isCopied ? (
            <Check className="w-4 h-4 mr-2 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 mr-2" />
          )}
          {isCopied ? "已複製至剪貼簿" : "複製邀請連結內容"}
        </Button>
      </div>
      <p className="text-xs text-center text-slate-400">
        請將此邀請碼發送給對方，引導其至系統註冊連結進行帳號啟動。
      </p>
    </div>
  );
}