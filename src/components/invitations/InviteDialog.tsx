"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus } from "lucide-react";
import { useInvitation } from "@/hooks/use-invitation";
import { InviteResultView } from "./InviteResultView";
import { InviteFormContent } from "./InviteFormContent";
import { toast } from "sonner";

interface Property {
  id: string;
  address: string;
  roomNumber: string;
}

interface Organization {
  id: string;
  name: string;
}

interface InviteDialogProps {
  targetRole: "LANDLORD" | "MANAGER" | "TENANT";
  // 房東端固定傳入
  fixedOrganizationId?: string;
  // 管理員端傳入可選列表
  organizations?: Organization[];
  // 房東端邀請房客時傳入
  properties?: Property[];
  // 生成成功回調
  onSuccess?: (code: string) => void;
  // 觸發按鈕的自定義文字
  triggerLabel?: string;
  // 是否預設開啟 (用於原本就已經是 Dialog 的場景)
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  // 是否以此組件作為 Trigger 容器
  showTrigger?: boolean;
}

/**
 * 共通邀請對話框組件
 * 整合了 Admin (邀請房東) 與 Landlord (邀請成員/房客) 的所有 UI 邏輯
 */
export function InviteDialog({
  targetRole,
  fixedOrganizationId,
  organizations = [],
  properties = [],
  onSuccess,
  triggerLabel = "發送邀請",
  isOpen: externalOpen,
  onOpenChange: onExternalOpenChange,
  showTrigger = true,
}: InviteDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onExternalOpenChange || setInternalOpen;

  const { generate, reset, copyContent, inviteCode, isLoading, isCopied } = useInvitation(onSuccess);
  
  const [selectedOrgId, setSelectedOrgId] = useState<string>(fixedOrganizationId || "");
  const [selectedPropId, setSelectedPropId] = useState<string>("");

  // 重置狀態
  useEffect(() => {
    if (isOpen) {
      reset();
      if (fixedOrganizationId) setSelectedOrgId(fixedOrganizationId);
    }
  }, [isOpen, fixedOrganizationId]);

  const handleGenerate = () => {
    if (targetRole !== "LANDLORD" && !selectedOrgId) {
      toast.error("缺少組織資訊");
      return;
    }

    if (targetRole === "TENANT" && !selectedPropId) {
      toast.error("請選擇要綁定的房源");
      return;
    }

    generate({
      organizationId: selectedOrgId || undefined,
      targetRole,
      propertyId: targetRole === "TENANT" ? selectedPropId : undefined,
    });
  };

  const content = (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-600" />
          {targetRole === "LANDLORD" && "邀請新房東"}
          {targetRole === "MANAGER" && "邀請代管人員"}
          {targetRole === "TENANT" && "邀請新房客"}
        </DialogTitle>
        <DialogDescription>
          {targetRole === "LANDLORD"
            ? "邀請新夥伴成為房東。註冊時，房東將能建立其專屬的管理組織。"
            : "生成專屬邀請碼，讓對方註冊成為您的團隊成員或房客。"}
        </DialogDescription>
      </DialogHeader>

      {!inviteCode ? (
        <InviteFormContent
          targetRole={targetRole}
          selectedOrganizationId={selectedOrgId}
          onOrganizationChange={setSelectedOrgId}
          organizations={organizations}
          selectedPropertyId={selectedPropId}
          onPropertyChange={setSelectedPropId}
          properties={properties}
        />
      ) : (
        <InviteResultView
          inviteCode={inviteCode}
          isCopied={isCopied}
          onCopy={() => copyContent(targetRole)}
        />
      )}

      <DialogFooter>
        {!inviteCode ? (
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={isLoading || (targetRole !== "LANDLORD" && !selectedOrgId)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              生成邀請碼
            </Button>
          </>
        ) : (
          <Button className="w-full" onClick={() => setOpen(false)}>
            完成
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  );

  if (!showTrigger) {
    return (
      <Dialog open={isOpen} onOpenChange={setOpen}>
        {content}
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      {content}
    </Dialog>
  );
}