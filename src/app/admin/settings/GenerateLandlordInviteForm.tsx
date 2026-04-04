"use client";

import { useState } from "react";
import { Copy, Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/** 組織選項 */
interface OrgOption {
  id: string;
  name: string;
}

interface Props {
  /** 所有可選的組織清單（由 Server Component 傳入） */
  organizations: OrgOption[];
  /** 目前管理員自己的 userId */
  adminId: string;
}

/**
 * 產生房東邀請表單（Client Component）
 * 讓管理員選擇組織後，一鍵產生有效期 7 天的房東邀請碼
 */
export default function GenerateLandlordInviteForm({ organizations, adminId }: Props) {
  const [selectedOrgId, setSelectedOrgId] = useState(
    organizations[0]?.id ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    code: string;
    expiresAt: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  /**
   * 呼叫 API 產生邀請碼
   */
  const handleGenerate = async () => {
    if (!selectedOrgId) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/invitations/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: selectedOrgId,
          targetRole: "LANDLORD",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "產生邀請碼失敗");
        return;
      }

      setResult({ code: data.code, expiresAt: data.expiresAt });
    } catch (e) {
      setError("網路錯誤，請稍後重試");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 複製邀請碼到剪貼簿
   */
  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border border-slate-100 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-slate-800 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-slate-500" />
          產生房東邀請碼
        </CardTitle>
        <p className="text-xs text-slate-500">
          邀請碼有效期為 7 天，被邀請人以此碼完成註冊後即成為房東並加入指定組織。
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 選擇組織 */}
        <div>
          <label className="text-xs text-slate-600 font-medium block mb-1.5">
            指定組織
          </label>
          {organizations.length === 0 ? (
            <p className="text-xs text-slate-400">目前尚無任何組織，請先建立組織。</p>
          ) : (
            <select
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              value={selectedOrgId}
              onChange={(e) => {
                setSelectedOrgId(e.target.value);
                setResult(null);
                setError(null);
              }}
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* 產生按鈕 */}
        <Button
          onClick={handleGenerate}
          disabled={loading || !selectedOrgId}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              產生中...
            </>
          ) : (
            "產生邀請碼"
          )}
        </Button>

        {/* 錯誤提示 */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* 成功結果 */}
        {result && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-4 space-y-2">
            <p className="text-xs text-emerald-600 font-medium">✓ 邀請碼已產生</p>
            <div className="flex items-center gap-2">
              <code className="text-lg font-mono font-bold text-emerald-800 tracking-widest flex-1">
                {result.code}
              </code>
              <button
                onClick={handleCopy}
                className="text-xs text-emerald-600 hover:text-emerald-800 flex items-center gap-1 px-2 py-1 rounded border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                <Copy className="w-3 h-3" />
                {copied ? "已複製！" : "複製"}
              </button>
            </div>
            <p className="text-xs text-emerald-600">
              到期時間：{new Date(result.expiresAt).toLocaleDateString("zh-TW", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              請將此邀請碼安全地傳送給受邀房東，勿公開分享。
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}