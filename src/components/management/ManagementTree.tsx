"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  ChevronRight, 
  Building2, 
  Home, 
  Loader2,
  ShieldCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ManagementNode {
  id: string;
  name: string;
  type: "landlord" | "property" | "organization";
  status?: string;
  subtitle?: string;
  metadata?: any;
  children?: any[];
}

interface ManagementTreeProps {
  onNodeSelect: (node: ManagementNode) => void;
}

/**
 * 深度一致性修正：
 * 1. 導航樣式完全對齊左側 Sidebar (AppSidebar) 的 Button 質感。
 * 2. 移除浮誇 Icon Container，回歸簡潔的圖示排列。
 * 3. 優化列表間距，符合生產力工具的精簡感。
 */
export function ManagementTree({ onNodeSelect }: ManagementTreeProps) {
  const [nodes, setNodes] = useState<ManagementNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNodes() {
      try {
        const res = await fetch("/api/management/tree");
        const data = await res.json();
        setNodes(data);
      } catch (err) {
        console.error("Failed to load management nodes", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNodes();
  }, []);

  const filteredNodes = nodes.filter(node => 
    node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 搜尋標題區 */}
      <div className="p-5 border-b space-y-4">
        <div className="flex items-center gap-2 px-1">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <span className="font-bold text-sm uppercase tracking-tight text-slate-900">管理中心索引</span>
        </div>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="搜尋名稱、Email..." 
            className="pl-9 h-10 bg-muted/20 border-none rounded-md text-xs font-medium focus-visible:ring-1 focus-visible:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 列表區 - 嚴格對齊 Sidebar 選單按鈕樣式 */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 mt-2">
        {loading ? (
          <div className="flex items-center justify-center py-10">
             <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
          </div>
        ) : filteredNodes.length === 0 ? (
          <p className="text-center py-10 text-[10px] uppercase font-bold text-slate-400">No Entities Found</p>
        ) : (
          filteredNodes.map((node) => (
            <button
              key={node.id}
              onClick={() => {
                setSelectedIndex(node.id);
                onNodeSelect(node);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-left group",
                selectedIndex === node.id 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "hover:bg-slate-100 text-slate-700 active:bg-slate-200"
              )}
            >
              <div className={cn(
                "shrink-0 transition-colors",
                selectedIndex === node.id ? "text-white" : "text-slate-400 group-hover:text-primary"
              )}>
                {node.type === "landlord" ? <Building2 className="w-5 h-5" /> : <Home className="w-5 h-5" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate tracking-tight">{node.name}</p>
                <p className={cn(
                  "text-[10px] truncate opacity-60 font-medium",
                  selectedIndex === node.id ? "text-white" : ""
                )}>
                  {node.subtitle || (node.type === "landlord" ? "Landlord Entity" : "Asset Property")}
                </p>
              </div>

              <ChevronRight className={cn(
                "w-4 h-4 opacity-0 transition-all",
                selectedIndex === node.id ? "opacity-100 translate-x-1" : "group-hover:opacity-40"
              )} />
            </button>
          ))
        )}
      </div>

      {/* 底部精簡資訊 */}
      <div className="p-4 border-t bg-slate-50/50 flex items-center justify-between px-6">
        <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">PrimeStay Pro</span>
        <Badge variant="outline" className="border-slate-200 text-slate-400 font-bold text-[9px] px-2 py-0">
          COUNT: {nodes.length}
        </Badge>
      </div>
    </div>
  );
}