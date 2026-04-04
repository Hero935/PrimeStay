"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Copy, Check } from "lucide-react";

interface Property {
  id: string;
  address: string;
  roomNumber: string;
}

interface InviteMemberDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  targetRole: "TENANT" | "MANAGER";
  onSuccess?: () => void;
}

/**
 * 邀請成員對話框組件
 * 用於生成邀請碼，支援選擇特定房源（針對房客邀請）
 */
export function InviteMemberDialog({
  isOpen,
  onOpenChange,
  targetRole,
  onSuccess,
}: InviteMemberDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);

  // 當對話框打開時，獲取組織資訊與房源列表
  useEffect(() => {
    if (isOpen) {
      fetchOrgAndProperties();
      setInviteCode(null);
      setIsCopied(false);
    }
  }, [isOpen]);

  /**
   * 獲取目前組織與房源資訊
   */
  const fetchOrgAndProperties = async () => {
    try {
      // 獲取組織資訊
      const orgRes = await fetch("/api/landlord/organization");
      const orgData = await orgRes.json();
      if (orgData.data?.id) {
        setOrgId(orgData.data.id);
        
        // 如果是邀請房客，獲取房源列表供選擇
        if (targetRole === "TENANT") {
          const propRes = await fetch(`/api/properties?organizationId=${orgData.data.id}`);
          const propData = await propRes.json();
          setProperties(propData.data || []);
        }
      }
    } catch (error) {
      console.error("獲取資訊失敗:", error);
      toast.error("獲取基礎資訊失敗");
    }
  };

  /**
   * 生成邀請碼
   */
  const handleGenerateInvite = async () => {
    if (!orgId) return;

    // 房客邀請必須選擇房源
    if (targetRole === "TENANT" && !selectedPropertyId) {
      toast.error("請選擇要邀請進入的房源");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/invitations/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          targetRole,
          propertyId: targetRole === "TENANT" ? selectedPropertyId : undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setInviteCode(data.code);
        toast.success("邀請碼生成成功");
        onSuccess?.();
      } else {
        throw new Error(data.error || "生成失敗");
      }
    } catch (error: any) {
      toast.error(error.message || "生成邀請碼失敗");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 複製邀請連結或內容
   */
  const copyToClipboard = () => {
    if (!inviteCode) return;
    
    const inviteLink = `${window.location.origin}/register?code=${inviteCode}`;
    const text = `您好，誠摯邀請您加入 PrimeStay ${
      targetRole === "TENANT" ? "成為房客" : "成為代管管理員"
    }。\n邀請碼：${inviteCode}\n註冊連結：${inviteLink}`;
    
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success("已複製邀請內容至剪貼簿");
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {targetRole === "TENANT" ? "邀請房客" : "邀請代管人員"}
          </DialogTitle>
          <DialogDescription>
            生成專屬邀請碼，讓對方註冊成為您的團隊成員或房客。
          </DialogDescription>
        </DialogHeader>

        {!inviteCode ? (
          <div className="grid gap-4 py-4">
            {targetRole === "TENANT" && (
              <div className="grid gap-2">
                <Label htmlFor="property">選擇房源</Label>
                <Select
                  value={selectedPropertyId}
                  onValueChange={setSelectedPropertyId}
                >
                  <SelectTrigger id="property">
                    <SelectValue placeholder="請選擇房源" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((prop) => (
                      <SelectItem key={prop.id} value={prop.id}>
                        {prop.address} - {prop.roomNumber}
                      </SelectItem>
                    ))}
                    {properties.length === 0 && (
                      <div className="p-2 text-sm text-slate-400">目前無可用房源</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p>📍 提示：</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>邀請碼有效期為 7 天</li>
                <li>每個邀請碼僅限一人使用</li>
                {targetRole === "TENANT" && <li>邀請房客將自動綁定至該房源</li>}
              </ul>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 py-6">
            <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-sm font-medium text-blue-600 uppercase tracking-widest">
                您的專屬邀請碼
              </p>
              <p className="text-4xl font-black text-blue-700 tracking-tighter">
                {inviteCode}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={copyToClipboard}
              >
                {isCopied ? (
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {isCopied ? "已複製" : "複製邀請連結內容"}
              </Button>
            </div>
            <p className="text-xs text-center text-slate-400">
              請將此邀請碼發送給對方，引導其至系統註冊。
            </p>
          </div>
        )}

        <DialogFooter>
          {!inviteCode ? (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button onClick={handleGenerateInvite} disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                生成邀請碼
              </Button>
            </>
          ) : (
            <Button className="w-full" onClick={() => onOpenChange(false)}>
              完成
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}