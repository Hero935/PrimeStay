"use client";

import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface OrgDetailButtonProps {
    orgId: string;
}

/**
 * 組織詳情導航按鈕
 * 點擊後跳轉至全域資產中樞 (The Nexus Pulse) 並過濾特定組織
 */
export function OrgDetailButton({ orgId }: OrgDetailButtonProps) {
    const router = useRouter();

    /**
     * 跳轉至管理樹狀視圖
     */
    const handleViewDetails = () => {
        // 跳轉到管理樹視圖並開啟該組織節點 (加上 API 定義的 org- 前綴)
        router.push(`/admin/management?orgId=org-${orgId}`);
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={handleViewDetails}
                        className="h-7 w-7 flex items-center justify-center border border-slate-200 rounded bg-white text-slate-400 hover:border-indigo-500/50 hover:text-indigo-600 transition-all shadow-sm"
                    >
                        <ArrowUpRight className="w-3 h-3" />
                    </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[150px] text-[10px] bg-slate-900 text-white border-slate-800">
                    跨維度穿梭至「管理中心」查看該組織的資源樹狀詳情。
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}