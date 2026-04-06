"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronRight,
  Building2,
  Home,
  Loader2,
  ShieldCheck,
  Users as UsersIcon
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ManagementNode {
  id: string;
  name: string;
  type: "landlord" | "property" | "organization" | "manager" | "tenant";
  status?: string;
  subtitle?: string;
  metadata?: any;
  children?: ManagementNode[];
}

interface ManagementTreeProps {
  onNodeSelect: (node: ManagementNode) => void;
}

/**
 * 樹狀節點組件
 */
function ManagementTreeNode({
  node,
  level = 0,
  onSelect,
  selectedId
}: {
  node: ManagementNode,
  level?: number,
  onSelect: (node: ManagementNode) => void,
  selectedId: string | null
}) {
  const [isOpen, setIsOpen] = useState(level === 0); // 預設展開第一層
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  const getIcon = () => {
    switch (node.type) {
      case "organization": return <Building2 className="w-4 h-4 text-slate-900" />;
      case "landlord": return <UsersIcon className="w-4 h-4 text-blue-500" />;
      case "property": return <Home className="w-4 h-4" />;
      case "manager": return <ShieldCheck className="w-4 h-4 text-amber-500" />;
      case "tenant": return <UsersIcon className="w-4 h-4 text-slate-400" />;
      default: return <UsersIcon className="w-4 h-4 text-slate-400" />;
    }
  };

  // Nexus Pulse: 根據節點狀態返回脈動點顏色
  const getPulseColor = () => {
    if (node.status === "SUSPENDED") return "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]";
    if (node.type === "property" && node.status === "RENTED") return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
    if (node.type === "property" && node.status === "AVAILABLE") return "bg-blue-500";
    return "bg-slate-300";
  };

  return (
    <div className="flex flex-col">
      <button
        onClick={() => {
          if (hasChildren) setIsOpen(!isOpen);
          onSelect(node);
        }}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md transition-all text-left text-xs group relative overflow-hidden",
          isSelected
            ? "bg-primary/10 text-primary font-bold after:absolute after:left-0 after:top-0 after:h-full after:w-1 after:bg-primary"
            : "hover:bg-slate-100 text-slate-600"
        )}
        style={{ paddingLeft: `${(level * 16) + 12}px` }}
      >
        {/* Nexus Pulse: 動態脈動指示點 */}
        <div className={cn(
          "size-1.5 rounded-full shrink-0 animate-pulse transition-all mr-1 duration-1000",
          getPulseColor()
        )} />

        {hasChildren ? (
          <ChevronRight className={cn(
            "w-3 h-3 shrink-0 transition-transform",
            isOpen && "rotate-90"
          )} />
        ) : (
          <div className="w-3 h-3 shrink-0" />
        )}
        
        <div className={cn(
          "shrink-0",
          isSelected ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
        )}>
          {getIcon()}
        </div>

        <span className={cn(
          "truncate flex-1 tracking-tight",
          node.status === "SUSPENDED" && "line-through opacity-50"
        )}>
          {node.name}
        </span>
        
        {node.status && (
          <Badge variant="outline" className={cn(
            "h-4 px-1 text-[8px] font-black",
            node.status === "ACTIVE" ? "text-emerald-500 border-emerald-500/20" :
            node.status === "SUSPENDED" ? "text-red-500 border-red-500/20 bg-red-50" :
            "text-slate-400 border-slate-200"
          )}>
            {node.status}
          </Badge>
        )}
      </button>

      {isOpen && hasChildren && (
        <div className="flex flex-col">
          {node.children?.map(child => (
            <ManagementTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 深度一致性修正：
 * 實作真正的遞迴樹狀結構，支援多層級展開與選取。
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
      <div className="p-5 border-b space-y-4 shrink-0">
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

      {/* 列表區 - 實作遞迴樹狀 */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 mt-2 scrollbar-thin">
        {loading ? (
          <div className="flex items-center justify-center py-20">
             <Loader2 className="w-6 h-6 animate-spin text-primary/30" />
          </div>
        ) : filteredNodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <Search className="w-10 h-10 mb-2" />
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">No Entities Found</p>
          </div>
        ) : (
          filteredNodes.map((node) => (
            <ManagementTreeNode
              key={node.id}
              node={node}
              onSelect={(n) => {
                setSelectedIndex(n.id);
                onNodeSelect(n);
              }}
              selectedId={selectedIndex}
            />
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