"use client";

import { useState } from "react";
import { Download, RefreshCw, Info } from "lucide-react";
import { toast } from "sonner";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface OrgActionsProps {
    organizations: any[];
}

/**
 * 組織治理底端動作組件
 * 負責快照導出與權限重構
 */
export function OrgActions({ organizations }: OrgActionsProps) {
    const [isExporting, setIsExporting] = useState(false);

    /**
     * 執行基礎設施快照導出
     * 將當前組織資料轉換為 JSON 並觸發瀏覽器下載
     */
    const handleExportSnapshot = () => {
        setIsExporting(true);
        try {
            const snapshot = {
                timestamp: new Date().toISOString(),
                version: "v3",
                entityCount: organizations.length,
                data: organizations
            };
            
            const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `primestay-infra-snapshot-${new Date().getTime()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            toast.success("基礎設施快照已導出");
        } catch (err) {
            toast.error("快照導出失敗");
        } finally {
            setIsExporting(false);
        }
    };

    /**
     * 執行權限重構
     * 重新載入頁面並觸發 Session 刷新
     */
    const handleReauth = () => {
        toast.info("正在啟動權限重構序列...");
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    };

    return (
        <TooltipProvider>
            <div className="flex gap-6">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={handleExportSnapshot}
                            disabled={isExporting}
                            className="hover:text-amber-400 transition-colors flex items-center gap-1"
                        >
                            {isExporting ? "處理中..." : "基礎設施快照 (.json)"}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px] text-[10px] bg-slate-900 text-white border-slate-800">
                        將當前所有組織、負責人及資產部署狀態導出為標準 AIC v3 JSON 快照檔案。
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={handleReauth}
                            className="hover:text-indigo-400 transition-colors"
                        >
                            權限重構 (Re-auth)
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px] text-[10px] bg-slate-900 text-white border-slate-800">
                        強制執行系統權限同步並重新載入各組織資料序列，確保管理狀態與資料庫即時同步。
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    );
}