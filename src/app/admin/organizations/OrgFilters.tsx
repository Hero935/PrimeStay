"use client";

import { 
    Search, 
    Filter, 
    XCircle,
    Check
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
 * 組織治理篩選控制項 (Client Component)
 * 負責同步 URL 參數並提供 Dropdown 選單交互
 */
export function OrgFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(searchParams.get("search") || "");
    
    // 當 URL 變動時更新本地搜尋字串
    useEffect(() => {
        setSearch(searchParams.get("search") || "");
    }, [searchParams]);

    // 目前的過濾狀態
    const currentFilter = searchParams.get("filter");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (search) {
            params.set("search", search);
        } else {
            params.delete("search");
        }
        router.push(`/admin/organizations?${params.toString()}`);
    };

    const setFilter = (value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set("filter", value);
        } else {
            params.delete("filter");
        }
        router.push(`/admin/organizations?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2">
            {/* 1. 關鍵字搜尋 */}
            <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="搜尋組織名稱 / 負責人..."
                        className="bg-white border border-slate-200 rounded-lg py-1.5 pl-9 pr-4 text-xs font-mono text-slate-900 w-64 focus:outline-none focus:border-indigo-500/50 transition-all font-sans"
                    />
                    {search && (
                        <button 
                            type="button"
                            onClick={() => {
                                setSearch("");
                                const params = new URLSearchParams(searchParams.toString());
                                params.delete("search");
                                router.push(`/admin/organizations?${params.toString()}`);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                        >
                            <XCircle className="w-3 h-3" />
                        </button>
                    )}
                </div>
                <Button type="submit" variant="default" className="bg-slate-900 text-white text-[10px] uppercase font-bold h-9 hover:bg-slate-800">
                    搜尋
                </Button>
            </form>

            {/* 2. 篩選下拉選單 */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button 
                        variant="outline" 
                        className={cn(
                            "border-slate-200 bg-white text-[10px] uppercase font-bold h-9 hover:border-slate-300",
                            currentFilter && "border-indigo-500/50 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50"
                        )}
                    >
                        <Filter className="w-3 h-3 mr-2" /> 
                        {currentFilter === "low_occupancy" ? "流失預警" : "篩選參數"}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 text-xs font-bold uppercase tracking-tight">
                    <div className="px-2 py-1.5 text-[9px] text-slate-400 font-mono">資產部署狀態</div>
                    <DropdownMenuItem 
                        onClick={() => setFilter(null)} 
                        className="py-2 cursor-pointer flex items-center justify-between"
                    >
                        <span>所有組織</span> 
                        {!currentFilter && <Check className="w-3 h-3 text-indigo-500" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setFilter("low_occupancy")}
                        className="py-2 cursor-pointer flex items-center justify-between text-amber-600"
                    >
                        <span>流失預警 (出租率 {"<"} 40%)</span>
                        {currentFilter === "low_occupancy" && <Check className="w-3 h-3 text-amber-500" />}
                    </DropdownMenuItem>
                    
                    {currentFilter && (
                        <>
                            <div className="h-px bg-slate-100 my-1" />
                            <DropdownMenuItem 
                                onClick={() => {
                                    setSearch("");
                                    router.push("/admin/organizations");
                                }} 
                                className="py-2 cursor-pointer text-rose-500 flex items-center gap-2"
                            >
                                <XCircle className="w-3 h-3" /> 清除所有過濾
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}