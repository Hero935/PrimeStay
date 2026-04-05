"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Property {
  id: string;
  address: string;
  roomNumber: string;
}

interface Organization {
  id: string;
  name: string;
}

/**
 * 邀請表單內容組件
 * 根據 targetRole 渲染對應的選擇介面 (如房源選擇或組織選擇)
 */
interface InviteFormContentProps {
  targetRole: "LANDLORD" | "MANAGER" | "TENANT";
  selectedOrganizationId?: string;
  onOrganizationChange?: (id: string) => void;
  organizations?: Organization[];
  selectedPropertyId?: string;
  onPropertyChange?: (id: string) => void;
  properties?: Property[];
}

export function InviteFormContent({
  targetRole,
  selectedOrganizationId,
  onOrganizationChange,
  organizations = [],
  selectedPropertyId,
  onPropertyChange,
  properties = [],
}: InviteFormContentProps) {
  return (
    <div className="grid gap-4 py-4">
      {/* 房東邀請採自定義組織模式，管理者邀請房東不再需要預選組織 */}

      {/* 房東邀請房客時顯示房源選擇 */}
      {targetRole === "TENANT" && (
        <div className="grid gap-2">
          <Label htmlFor="property">選擇房源</Label>
          <Select
            value={selectedPropertyId}
            onValueChange={onPropertyChange}
          >
            <SelectTrigger id="property">
              <SelectValue placeholder="請選擇房客要入住的房源" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((prop) => (
                <SelectItem key={prop.id} value={prop.id}>
                  {prop.address} - {prop.roomNumber}
                </SelectItem>
              ))}
              {properties.length === 0 && (
                <div className="p-2 text-sm text-slate-400 text-center">目前無可用房源</div>
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* 角色特定的提示說明 */}
      <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
        <p className="font-semibold text-slate-700 mb-1">📍 邀請提示：</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>邀請碼有效期為 7 天。</li>
          <li>每個邀請碼僅限一人使用一次。</li>
          {targetRole === "TENANT" && (
            <li>房客註冊後將自動建立租約並綁定至選擇的房源。</li>
          )}
          {targetRole === "LANDLORD" && (
            <li>房東註冊後將自動建立新組織，並擁有該組織的所有管理權限。</li>
          )}
          {targetRole === "MANAGER" && (
            <li>代管人員將加入您的組織共同管理房源與租件。</li>
          )}
        </ul>
      </div>
    </div>
  );
}