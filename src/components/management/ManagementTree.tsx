"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronRight,
  Building2,
  Home,
  Loader2,
  ShieldCheck,
  Users as UsersIcon,
  Pin,
  PinOff,
  Filter,
  CircleOff,
  Activity
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
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
  hasChildren?: boolean; // 新增：用於 Lazy Loading 判斷
}

interface ManagementTreeProps {
  onNodeSelect: (node: ManagementNode) => void;
  initialSelectedId?: string;
  initialSearchTerm?: string;
}

/**
 * 樹狀節點組件
 */
function ManagementTreeNode({
  node,
  level = 0,
  onSelect,
  selectedId,
  isPinned = false,
  onPinToggle
}: {
  node: ManagementNode,
  level?: number,
  onSelect: (node: ManagementNode) => void,
  selectedId: string | null,
  isPinned?: boolean,
  onPinToggle?: (id: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [children, setChildren] = useState<ManagementNode[]>(node.children || []);
  const [isLoading, setIsLoading] = useState(false);
  
  const hasSubNodes = node.hasChildren || (children && children.length > 0);
  const isSelected = selectedId === node.id;

  // 延遲加載子節點
  const toggleOpen = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState && node.hasChildren && children.length === 0) {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/management/tree?parentId=${node.id}&parentType=${node.type}`);
        const data = await res.json();
        setChildren(data);
      } catch (err) {
        console.error("Lazy load failed", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

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
    if (node.status === "SUSPENDED") return "bg-slate-400 shadow-none opacity-40"; // 停權節點燈號熄滅
    if (node.type === "property" && node.status === "RENTED") return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
    if (node.type === "property" && node.status === "AVAILABLE") return "bg-blue-500";
    if (node.status === "ACTIVE") return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]";
    return "bg-slate-300";
  };

  return (
    <div className="flex flex-col">
      <button
        onClick={() => {
          if (hasSubNodes) toggleOpen();
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

        {hasSubNodes ? (
          isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin text-primary/40 shrink-0" />
          ) : (
            <ChevronRight className={cn(
              "w-3 h-3 shrink-0 transition-transform",
              isOpen && "rotate-90"
            )} />
          )
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
          "truncate flex-1 tracking-tight transition-all",
          node.status === "SUSPENDED" && "line-through opacity-30 italic text-slate-400"
        )}>
          {node.name}
        </span>

        {onPinToggle && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPinToggle(node.id);
            }}
            className={cn(
              "opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 rounded shrink-0",
              isPinned && "opacity-100 text-blue-500"
            )}
          >
            {isPinned ? <PinOff className="size-2.5" /> : <Pin className="size-2.5" />}
          </button>
        )}
        
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

      {isOpen && children.length > 0 && (
        <div className="flex flex-col">
          {children.map(child => (
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
export function ManagementTree({ onNodeSelect, initialSelectedId, initialSearchTerm, refreshKey = 0 }: ManagementTreeProps & { refreshKey?: number }) {
  const [nodes, setNodes] = useState<ManagementNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || "");
  const [selectedIndex, setSelectedIndex] = useState<string | null>(null);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // 初始化載入 Pinned Nodes
  useEffect(() => {
    const saved = localStorage.getItem("ps-pinned-nodes");
    if (saved) setPinnedIds(JSON.parse(saved));
  }, []);

  // 當 initialSelectedId 變動時同步選取狀態
  useEffect(() => {
    if (initialSelectedId) {
      setSelectedIndex(initialSelectedId);
    }
  }, [initialSelectedId]);

  // 當 initialSearchTerm 變動時同步搜尋關鍵字
  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  useEffect(() => {
    async function fetchNodes() {
      try {
        const res = await fetch("/api/management/tree");
        const data: ManagementNode[] = await res.json();
        setNodes(data);
      } catch (err) {
        console.error("Failed to load management nodes", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNodes();
  }, [refreshKey]);

  // 獨立副作用：當資料載入且存在初始選取 ID 時執行自動選取與過濾聯動
  useEffect(() => {
    if (!loading && nodes.length > 0 && initialSelectedId) {
        const findNode = (entities: ManagementNode[]): ManagementNode | null => {
            for (const node of entities) {
                if (node.id === initialSelectedId) return node;
                if (node.children) {
                    const child = findNode(node.children);
                    if (child) return child;
                }
            }
            return null;
        };

        const target = findNode(nodes);
        if (target) {
            // 1. 自動同步搜尋框，達成索引過濾效果
            if (!searchTerm) {
                setSearchTerm(target.name);
            }

            // 2. 驅動右側詳情面板呈現
            const timer = setTimeout(() => {
                onNodeSelect(target);
                setSelectedIndex(target.id);
            }, 150);
            return () => clearTimeout(timer);
        }
    }
  }, [loading, nodes, initialSelectedId, onNodeSelect, searchTerm]);

  const togglePin = (id: string) => {
    setPinnedIds(prev => {
      const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      localStorage.setItem("ps-pinned-nodes", JSON.stringify(next));
      return next;
    });
  };

  const filteredNodes = nodes.filter(node => {
    const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         node.subtitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || node.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pinnedNodes = nodes.filter(n => pinnedIds.includes(n.id));

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 搜尋標題區 */}
      <div className="p-5 border-b space-y-4 shrink-0">
        <div className="flex items-center gap-2 px-1">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <span className="font-bold text-sm uppercase tracking-tight text-slate-900">管理中心索引</span>
        </div>
        <div className="flex gap-2">
          <div className="relative group flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="搜尋名稱、Email..."
              className="pl-9 h-10 bg-muted/20 border-none rounded-md text-xs font-medium focus-visible:ring-1 focus-visible:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className={cn("h-10 w-10 shrink-0", statusFilter && "bg-blue-50 border-blue-200")}>
                <Filter className={cn("size-4", statusFilter ? "text-blue-600" : "text-slate-400")} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="end">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 py-1">狀態過濾</p>
                <button
                  onClick={() => setStatusFilter(null)}
                  className={cn("w-full flex items-center gap-2 px-2 py-1.5 text-[11px] rounded transition-colors hover:bg-slate-100", !statusFilter && "font-bold text-primary")}
                >
                   <Activity className="size-3" /> 全部狀態
                </button>
                <button
                  onClick={() => setStatusFilter("SUSPENDED")}
                  className={cn("w-full flex items-center gap-2 px-2 py-1.5 text-[11px] rounded transition-colors hover:bg-slate-100", statusFilter === "SUSPENDED" && "font-bold text-red-600")}
                >
                   <CircleOff className="size-3" /> 僅顯示已停權
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* 列表區 - 實作遞迴樹狀 */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 mt-2 scrollbar-thin">
        {pinnedNodes.length > 0 && !searchTerm && !statusFilter && (
           <div className="mb-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-3 mb-1">已釘選實體</p>
              {pinnedNodes.map(node => (
                <ManagementTreeNode
                  key={`pinned-${node.id}`}
                  node={node}
                  isPinned={true}
                  onPinToggle={togglePin}
                  onSelect={(n) => {
                    setSelectedIndex(n.id);
                    onNodeSelect(n);
                  }}
                  selectedId={selectedIndex}
                />
              ))}
              <div className="h-px bg-slate-100 my-2 mx-3" />
           </div>
        )}

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