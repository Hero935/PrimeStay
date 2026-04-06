"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Rocket, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface OrgPlanManagerProps {
    orgId: string;
    currentPlan: string;
    orgName: string;
}

/**
 * 組織方案管理員 (Client Component)
 * 供管理員直接強制調整組織的訂閱等級
 */
export function OrgPlanManager({ orgId, currentPlan, orgName }: OrgPlanManagerProps) {
    const [plan, setPlan] = useState(currentPlan);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const planColors: Record<string, string> = {
        FREE: "bg-slate-500/10 text-slate-500 border-slate-500/20",
        STARTER: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
        PRO: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    };

    const handleUpdatePlan = async (newPlan: string) => {
        if (newPlan === plan) return;
        if (!confirm(`確定要將「${orgName}」的方案強制變更為 ${newPlan} 嗎？`)) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/admin/organizations/${orgId}/plan`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan: newPlan }),
            });

            if (!res.ok) throw new Error("更新失敗");

            setPlan(newPlan);
            router.refresh();
        } catch (err) {
            alert("操作失敗，請稍後再試");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="group cursor-pointer">
                    <Badge className={`${planColors[plan] || ""} text-[9px] px-1.5 h-4 flex items-center gap-1 border transition-all group-hover:border-indigo-500/50`}>
                        {loading ? <span className="animate-spin text-[8px]">...</span> : <Rocket className="w-2.5 h-2.5" />}
                        {plan}
                    </Badge>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 text-xs font-bold uppercase tracking-tight">
                <div className="px-2 py-1.5 text-[9px] text-slate-400">變更訂閱方案</div>
                <DropdownMenuItem onClick={() => handleUpdatePlan("FREE")} className="py-2 cursor-pointer">
                    Free (體驗版)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdatePlan("STARTER")} className="py-2 cursor-pointer">
                    Starter (入門)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdatePlan("PRO")} className="py-2 cursor-pointer">
                    Pro (專業版)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}