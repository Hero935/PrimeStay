"use client";

import { 
    Search, 
    Filter, 
    XCircle,
    Check,
    Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * 用戶治理篩選控制項 (Client Component)
 * 負責同步 URL 參數並提供角色與風險狀態切換
 */
export function UserFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(searchParams.get("search") || "");
    
    useEffect(() => {
        setSearch(searchParams.get("search") || "");
    }, [searchParams]);

    const currentRole = searchParams.get("role");
    const currentStatus = searchParams.get("status");

    const updateParams = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });
        router.push(`/admin/users?${params.toString()}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateParams({ search: search || null });
    };

    return (
        <div className="flex items-center gap-2">
            {/* 1. 身份搜尋 */}
            <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="搜尋名稱 / Email / 身份標識..."
                        className="bg-white border border-slate-200 rounded-lg py-1.5 pl-9 pr-4 text-xs font-mono text-slate-900 w-64 focus:outline-none focus:border-rose-500/50 transition-all font-sans"
                    />
                    {search && (
                        <button 
                            type="button"
                            onClick={() => {
                                setSearch("");
                                updateParams({ search: null });
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500"
                        >
                            <XCircle className="w-3 h-3" />
                        </button>
                    )}
                </div>
                <Button type="submit" variant="default" className="bg-slate-900 text-white text-[10px] uppercase font-bold h-9 hover:bg-slate-800">
                    檢索
                </Button>
            </form>

            {/* 2. 治理篩選下拉選單 */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button 
                        variant="outline" 
                        className={cn(
                            "border-slate-200 bg-white text-[10px] uppercase font-bold h-9 hover:border-slate-300",
                            (currentRole || currentStatus) && "border-rose-500/50 text-rose-600 bg-rose-50/50 hover:bg-rose-50"
                        )}
                    >
                        <Filter className="w-3 h-3 mr-2" /> 
                        治理篩選
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 text-xs font-bold uppercase tracking-tight">
                    <div className="px-2 py-1.5 text-[9px] text-slate-400 font-mono">系統權限角色</div>
                    <DropdownMenuItem onClick={() => updateParams({ role: null })} className="py-2 cursor-pointer flex items-center justify-between">
                        所有角色 {!currentRole && <Check className="w-3 h-3 text-rose-500" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateParams({ role: "ADMIN" })} className="py-2 cursor-pointer flex items-center justify-between">
                        超級管理員 {currentRole === "ADMIN" && <Check className="w-3 h-3 text-rose-500" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateParams({ role: "LANDLORD" })} className="py-2 cursor-pointer flex items-center justify-between">
                        房東代理人 {currentRole === "LANDLORD" && <Check className="w-3 h-3 text-rose-500" />}
                    </DropdownMenuItem>
                    
                    <div className="h-px bg-slate-100 my-1" />
                    <div className="px-2 py-1.5 text-[9px] text-slate-400 font-mono">行為合規性</div>
                    <DropdownMenuItem onClick={() => updateParams({ status: "SUSPENDED" })} className="py-2 cursor-pointer flex items-center justify-between text-rose-600">
                        <span>已封禁 / 停權中</span>
                        {currentStatus === "SUSPENDED" && <Check className="w-3 h-3 text-rose-500" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateParams({ status: "ACTIVE" })} className="py-2 cursor-pointer flex items-center justify-between text-emerald-600">
                        <span>在線活耀節點</span>
                        {currentStatus === "ACTIVE" && <Check className="w-3 h-3 text-emerald-500" />}
                    </DropdownMenuItem>

                    {(currentRole || currentStatus) && (
                        <>
                            <div className="h-px bg-slate-100 my-1" />
                            <DropdownMenuItem 
                                onClick={() => router.push("/admin/users")} 
                                className="py-2 cursor-pointer text-slate-500 flex items-center gap-2"
                            >
                                <XCircle className="w-3 h-3" /> 重置所有參數
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}