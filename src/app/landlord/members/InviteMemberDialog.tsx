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
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useInvitation } from "@/hooks/use-invitation";
import { InviteResultView } from "@/components/invitations/InviteResultView";
import { InviteFormContent } from "@/components/invitations/InviteFormContent";

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
 * 房東端邀請成員對話框 (重構版)
 * 使用共通邀請 Hook 與組件來減少代碼重複，確保與 Admin 端具備一致的體驗
 */
export function InviteMemberDialog({
  isOpen,
  onOpenChange,
  targetRole,
  onSuccess,
}: InviteMemberDialogProps) {
  // 使用共通邏輯 Hook
  const { generate, reset, copyContent, inviteCode, isLoading, isCopied } = useInvitation(onSuccess);
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [orgId, setOrgId] = useState<string | null>(null);

  // 當對話框狀態變更時初始化獲取資料或重置狀態
  useEffect(() => {
    if (isOpen) {
      fetchOrgAndProperties();
      reset();
    }
  }, [isOpen]);

  /**
   * 獲取目前組織與房源資訊
   */
  const fetchOrgAndProperties = async () => {
    try {
      // 房東端下限定獲取自身所屬組織
      const orgRes = await fetch("/api/landlord/organization");
      const orgData = await orgRes.json();
      if (orgData.data?.id) {
        setOrgId(orgData.data.id);
        
        // 僅當邀請房客時才需要房源列表
        if (targetRole === "TENANT") {
          const propRes = await fetch(`/api/properties?organizationId=${orgData.data.id}`);
          const propData = await propRes.json();
          setProperties(propData.data || []);
        }
      }
    } catch (error) {
      console.error("獲取基礎資訊失敗:", error);
      toast.error("系統無法取得房源資訊，請稍後再試");
    }
  };

  /**
   * 執行邀請碼生成請求
   */
  const handleGenerate = () => {
    if (!orgId) {
      toast.error("組織資訊尚未就緒");
      return;
    }

    if (targetRole === "TENANT" && !selectedPropertyId) {
      toast.error("請先選擇房源，邀請房客將自動綁定該房源");
      return;
    }

    generate({
      organizationId: orgId,
      targetRole,
      propertyId: targetRole === "TENANT" ? selectedPropertyId : undefined,
    });
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
          /* 使用通用表單組件 */
          <InviteFormContent
            targetRole={targetRole}
            selectedPropertyId={selectedPropertyId}
            onPropertyChange={setSelectedPropertyId}
            properties={properties}
          />
        ) : (
          /* 使用通用結果顯示組件 */
          <InviteResultView
            inviteCode={inviteCode}
            isCopied={isCopied}
            onCopy={() => copyContent(targetRole)}
          />
        )}

        <DialogFooter>
          {!inviteCode ? (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button onClick={handleGenerate} disabled={isLoading}>
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