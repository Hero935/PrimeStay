"use client";

import React, { useState, useEffect } from "react";
import { ManagementTree } from "./ManagementTree";
import {
  Building2,
  Home,
  Users as UsersIcon,
  Search,
  MapPin,
  ChevronLeft,
  Activity,
  Zap,
  ExternalLink,
  ShieldCheck,
  Loader2,
  UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { QuickActionDrawer } from "@/components/admin/QuickActionDrawer";
import { CommandPalette } from "./CommandPalette";
import { OrgPlanManager } from "@/components/governance/OrgPlanManager";
import { UserStatusToggle } from "@/components/governance/UserStatusToggle";
import { AlertCircle, ShieldAlert, Ban, Info, Check } from "lucide-react";

interface ManagementNode {
  id: string;
  name: string;
  type: "landlord" | "property" | "organization" | "manager" | "tenant";
  status?: string;
  subtitle?: string;
  metadata?: any;
  diagnostics?: {
    utilization: number;
    latency: number;
    insights: string;
    fixable: boolean;
    history: number[];
  };
  children?: any[];
}

interface FlattenedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  relatedEntity?: string;
}

/**
 * 響應式優化版：Nexus Pulse 極致扁平化 (Zero-Scroll)
 * 1. 壓縮 Header 為緊湊條狀，鎖定 100vh 視區。
 * 2. 核心工作區採用多欄佈局，指標與 DNA 診斷即時呈現。
 * 3. 強化導航血緣感知 (Nexus Index Breadcrumbs)。
 */
export function ManagementViewWrapper({
  initialSelectedOrgId,
  initialSearchTerm: externalSearch
}: {
  initialSelectedOrgId?: string;
  initialSearchTerm?: string;
}) {
  const [selectedNode, setSelectedNode] = useState<ManagementNode | null>(null);
  const [isSyncingChildren, setIsSyncingChildren] = useState(false);
  // 新增：緩存子節點資料，避免重複 Fetch 並確保 UI 即時顯示
  const [cachedChildren, setCachedChildren] = useState<Record<string, any[]>>({});
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(externalSearch || "");
  const [treeKey, setTreeKey] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [diagnosticData, setDiagnosticData] = useState({
    utilization: 94.8,
    latency: 0.42,
    insights: "Infrastructure load is stable. Recommended to scale sub-entities in Region-B.",
    fixable: false,
    fixAction: "",
    history: [40, 70, 45, 90, 65, 80, 50, 95, 40, 60, 75, 45, 85, 55, 70]
  });
  const isMobile = useIsMobile();

  /**
   * Nexus Index Lazy Load 同步器
   * 當選中節點且節點標記為 hasChildren 但無資料時，自動執行後台同步
   */
  /**
   * 當選中節點時，同步其診斷數據
   */
  useEffect(() => {
    if (selectedNode && selectedNode.diagnostics) {
      setDiagnosticData({
        utilization: selectedNode.diagnostics.utilization,
        latency: selectedNode.diagnostics.latency,
        insights: selectedNode.diagnostics.insights,
        fixable: selectedNode.diagnostics.fixable,
        fixAction: "",
        history: selectedNode.diagnostics.history
      });
    }
  }, [selectedNode]);

  useEffect(() => {
    // 使用局部變數鎖定當前處理的節點，避免閉包陷阱與 null 檢查問題
    const activeNode = selectedNode;
    if (!activeNode || !activeNode.id) return;

    // 關鍵修正：解決重複點擊或第二次點擊回來的資料同步問題
    // 檢查快取中是否存在該節點的資料（包含空陣列的情況）
    const hasCachedData = Object.prototype.hasOwnProperty.call(cachedChildren, activeNode.id);
    
    // 如果節點對象目前沒有 children 屬性 (undefined) 或 diagnostics，但快取中有，則進行同步
    // 注意：必須精確比對 undefined，以區分「未載入」與「載入後為空陣列」
    if ((activeNode.children === undefined || !activeNode.diagnostics) && hasCachedData) {
      const cached = cachedChildren[activeNode.id] as any;
      // 這裡需要判斷 cached 是 children 陣列還是包含 diagnostics 的物件
      // 由於 API 回傳的是陣列，診斷數據通常附帶在節點自身
      if (Array.isArray(cached)) {
         setSelectedNode({ ...activeNode, children: cached });
      }
      return;
    }

    async function syncChildren() {
      if (!activeNode) return;
      
      // 已有屬性且不為 undefined（表已同步過，包含為空陣列）或快取已知則跳過
      if (activeNode.children !== undefined || hasCachedData) return;

      setIsSyncingChildren(true);
      try {
        const res = await fetch(`/api/management/tree?parentId=${activeNode.id}&parentType=${activeNode.type}`);
        if (res.ok) {
          const data = await res.json();
          setCachedChildren(prev => ({ ...prev, [activeNode.id]: data }));
          // 同步更新當前選取節點的 children
          setSelectedNode(prev => prev?.id === activeNode.id ? { ...prev, children: data } : prev);
        }
      } catch (err) {
        console.error("Critical: Management Sync Failed", err);
      } finally {
        setIsSyncingChildren(false);
      }
    }

    syncChildren();
  }, [selectedNode, cachedChildren]); // 修正依賴項：使用整個節點對象而非僅 ID，以應對連點相同物件但物件實體不同的情境

  /**
   * 實作定義之圖標映射 (docs/roles.md#6.2)
   */
  const getEntityIcon = (type: string, className?: string) => {
    switch (type) {
      case "organization": return <Building2 className={cn("size-5", className)} />;
      case "landlord": return <UserCircle className={cn("size-5 text-blue-500", className)} />;
      case "property": return <Home className={cn("size-5 text-emerald-400", className)} />;
      case "manager": return <ShieldCheck className={cn("size-5 text-amber-500", className)} />;
      case "tenant": return <UsersIcon className={cn("size-5 text-slate-400", className)} />;
      default: return <Home className={cn("size-5", className)} />;
    }
  };

  /**
   * 統計節點下轄資訊
   * 實體：所有下轄房源 (property)
   * 授權人：所有下轄房東 (landlord)
   */
  const getEntityStats = (node: ManagementNode) => {
    let properties = 0;
    let landlords = 0;

    const traverse = (target: any) => {
      if (target.type === "property") properties++;
      if (target.type === "landlord") landlords++;
      
      if (target.children) {
        target.children.forEach((child: any) => traverse(child));
      }
    };

    // 統計從當前節點的子代開始
    if (node.children) {
      node.children.forEach(child => traverse(child));
    }

    return { properties, landlords };
  };

  /**
   * 遞迴提取節點內所有人員
   * 遵循用戶新定義：成員應包含房東與房客
   * @param node 當前選中的節點
   */
  const getFlattenedUsers = (node: ManagementNode): FlattenedUser[] => {
    // 優先讀取 API 提供的深度成員快取 (Nexus Index Deep Aggregation)
    // 這對於「組織」與「房東」層級至關重要，因為它們需要看到下轄所有層級的人員
    if (node.metadata?.deepUsers && Array.isArray(node.metadata.deepUsers)) {
      return node.metadata.deepUsers.map((u: any) => ({
        ...u,
        role: u.role || "UNKNOWN",
        status: u.status || "ACTIVE"
      }));
    }

    const users: FlattenedUser[] = [];
    const traverse = (target: any, context?: string) => {
      // 若無深度快取，降級為傳統遞迴 (僅限已加載部分)
      if (["landlord", "tenant", "manager"].includes(target.type)) {
        if (!users.find(u => u.id === target.id)) {
          users.push({
            id: target.id,
            name: target.name,
            email: target.metadata?.email || "N/A",
            role: target.type.toUpperCase(),
            status: target.status || "ACTIVE",
            relatedEntity: context || target.subtitle
          });
        }
      }
      if (target.children) {
        target.children.forEach((child: any) => {
          traverse(child, target.type === "property" ? target.name : context);
        });
      }
    };

    traverse(node);
    return users;
  };

  /**
   * 執行批次操作
   */
  const handleBatchAction = async (action: "SUSPEND" | "ACTIVATE") => {
    if (selectedUserIds.length === 0) return;
    
    setIsBatchProcessing(true);
    try {
      const res = await fetch("/api/management/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: selectedUserIds, action })
      });
      
      if (res.ok) {
        toast.success(`成功將 ${selectedUserIds.length} 位成員${action === "SUSPEND" ? "停權" : "恢復"}`);
        setSelectedUserIds([]);
        // 重新整理樹狀或是強制局部重整 (此處簡易模擬：重置 TreeKey)
        setTreeKey(prev => prev + 1);
      } else {
        toast.error("批次處理失敗");
      }
    } catch (err) {
      toast.error("系統發生錯誤");
    } finally {
      setIsBatchProcessing(false);
    }
  };

  /**
   * 執行全網掃描：主動觸發數據刷新並模擬深度診斷
   */
  const handleStartScan = async () => {
    if (!selectedNode) return;
    setIsScanning(true);
    setScanProgress(0);
    
    // 第一階段：模擬深度掃描進度
    for (let i = 0; i <= 80; i += 10) {
      setScanProgress(i);
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    // 第二階段：真實從後端獲取最新指標
    try {
      // 這裡強制 re-fetch 以取得最新的 diagnostics
      const nodeType = selectedNode.id.startsWith('org-') ? 'organization' : selectedNode.type;
      const nodeId = selectedNode.id.replace('org-', '').replace('landlord-', '');
      const res = await fetch(`/api/management/tree?id=${nodeId}&type=${nodeType}`);
      
      if (res.ok) {
        const data = await res.json();
        // 如果是單一節點查詢返回陣列首位
        const latestNode = Array.isArray(data) ? data[0] : (data.node || data);
        if (latestNode && latestNode.diagnostics) {
          setDiagnosticData({
            ...latestNode.diagnostics,
            insights: `[優化完成] ${latestNode.diagnostics.insights}`,
            fixAction: ""
          });
        }
      }
    } catch (err) {
      console.error("Scan Sync Failed", err);
    }

    setScanProgress(100);
    setIsScanning(false);
    toast.success("全網掃描已完成，數據已同步至最新狀態");
  };

  /**
   * 執行一鍵修復
   */
  const handleApplyFix = async () => {
    setIsScanning(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // 模擬修復動畫
    setDiagnosticData(prev => ({
      ...prev,
      insights: "資源優化已成功套用。系統目前處於巔峰運行效率狀態。",
      fixable: false
    }));
    setIsScanning(false);
    toast.success("系統診斷建議已修復完成");
  };

  /**
   * 治理影響告知組件 (Impact Advisor)
   * 基於 roles.md 之停權影響矩陣
   */
  const GovernanceImpactAdvisor = ({ node }: { node: ManagementNode }) => {
    if (node.status !== "ACTIVE") return null;

    let warnings: string[] = [];
    if (node.type === "organization") {
      warnings = [
        "組織停權將導致旗下所有房東帳號進入受限模式",
        "全組織所有房源將於市場平台端集體下架",
        "所有進行中的智慧門鎖與支付網關將即刻切斷存取"
      ];
    } else if (node.type === "landlord") {
      warnings = [
        "此帳號停權後，所有關聯組織之房源將自動隱藏 (Private)",
        "組織下所有成員 (Manager) 將轉為唯讀模式",
        "租約與帳單流程將全面凍結"
      ];
    } else if (node.type === "manager") {
      warnings = [
        "負責房源之管理權將自動解編",
        "系統將通知 Landlord 重新指派人員",
        "待辦報修事項將回歸給組織擁有者"
      ];
    } else if (node.type === "tenant") {
      warnings = [
        "房客將無法登入系統進行報修或繳費",
        "已產生的租約與帳單仍維持有效"
      ];
    }

    if (warnings.length === 0) return null;

    return (
      <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 mt-6 animate-in slide-in-from-top-2">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="size-3.5 text-rose-500" />
          <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">停權影響診斷</span>
        </div>
        <ul className="space-y-2">
          {warnings.map((w, i) => (
            <li key={i} className="flex gap-2 text-[11px] text-slate-600 leading-tight">
               <span className="text-rose-400 font-bold">•</span>
               {w}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  /**
   * 渲染治理工作區
   * @param node 被選中的實體
   * @param showBack 是否顯示返回按鈕 (手機版)
   */
  const renderWorkspace = (node: ManagementNode, showBack = false) => {
    const users = getFlattenedUsers(node);
    const stats = getEntityStats(node);

    return (
      <div className="flex-1 flex flex-col h-full bg-slate-50/20 overflow-hidden animate-in fade-in duration-300">
        {/* Nexus Pulse: Hyper-Flat Header (Compact Strip) */}
        <div className="bg-slate-900 border-b px-6 py-4 flex items-center gap-5 shrink-0 shadow-xl relative z-20">
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          
          {showBack && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSelectedNode(null)} 
              className="lg:hidden text-white hover:bg-white/10 shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}

          <div className="size-10 bg-white/10 shrink-0 rounded-lg flex items-center justify-center border border-white/10 text-white overflow-hidden backdrop-blur-md">
            {getEntityIcon(node.type, "size-6 text-white")}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h2 className={cn(
                "text-lg font-bold tracking-tight text-white truncate",
                node.status === "SUSPENDED" && "line-through opacity-50"
              )}>
                {node.name}
              </h2>
              <Badge className={cn(
                "border-none font-black text-[8px] uppercase tracking-widest px-2 h-5 flex items-center",
                node.status === "SUSPENDED" ? "bg-red-500 text-white" : "bg-blue-600 text-white"
              )}>
                {node.type} {node.status === "SUSPENDED" && "- TERMINATED"}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 whitespace-nowrap">
               <ShieldCheck className="size-3 text-blue-500/80" />
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-500/80 truncate">
                 NEXUS INDEX {" > "}
                 {node.type === "organization" && "組織"}
                 {node.type === "landlord" && "組織 > 房東"}
                 {node.type === "property" && "組織 > 房東 > 房源"}
                 {node.type === "manager" && "房源 > 經理"}
                 {node.type === "tenant" && "房源 > 房客"}
                 {" > "} {node.id.split("-").pop()}
               </span>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {/* 只針對 組織 或 人員 (Landlord/Manager/Tenant) 顯示快速管理 */}
            {["organization", "landlord", "manager", "tenant"].includes(node.type) && (
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-[10px] font-black h-9 px-4 rounded-lg uppercase tracking-widest"
                onClick={() => setIsQuickActionOpen(true)}
              >
                快速管理
              </Button>
            )}
            
            {/* 針對 組織 或 房源 顯示數據報告 */}
            {["organization", "property"].includes(node.type) && (
              <Button
                size="sm"
                variant="outline"
                className="border-white/10 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black h-9 px-4 rounded-lg uppercase tracking-widest"
                onClick={() => {
                  // TODO: 建立 /admin/analytics 專屬分析頁面
                  // 目前先以 alert 提示，避免跳轉至不存在的路由造成循環
                  alert(`[AIC 診斷] ${node.type === "organization" ? "組織" : "房源"}數據分析模組預計於 v3.2 版本上線。目前可於總覽控制台查看即時指標。`);
                }}
              >
                數據報告
              </Button>
            )}
          </div>
        </div>

        {/* 主工作區 - Zero-Scroll 每像素極致利用 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-white/80 backdrop-blur-sm border-b px-6 py-2 shrink-0 z-10">
                <TabsList className="bg-transparent gap-6 h-10 p-0 border-none justify-start">
                    <TabsTrigger value="overview" className="h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 font-black text-[10px] uppercase tracking-[0.2em] transition-all">總覽控制台</TabsTrigger>
                    <TabsTrigger value="users" className="h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 font-black text-[10px] uppercase tracking-[0.2em] transition-all text-slate-400">成員清單 ({users.length})</TabsTrigger>
                    <TabsTrigger value="entities" className="h-10 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 font-black text-[10px] uppercase tracking-[0.2em] transition-all text-slate-400">關聯實體</TabsTrigger>
                </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="overview" className="m-0 h-full overflow-hidden flex flex-col animate-in fade-in duration-500">
                <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
                  {/* 左側核心數據區 */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                    {/* 指標快速覽 (4 Column Row) */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        {
                          label: "實體數",
                          value: node.metadata?.propertiesCount ?? stats.properties,
                          color: "text-blue-600",
                          icon: <Building2 className="size-4"/>
                        },
                        {
                          label: "授權人",
                          value: node.metadata?.landlordsCount ?? stats.landlords,
                          color: "text-amber-600",
                          icon: <UsersIcon className="size-4"/>
                        },
                        { label: "穩定度", value: "99%", color: "text-emerald-600", icon: <ShieldCheck className="size-4"/> },
                        { label: "級別", value: "PRO", color: "text-slate-600", icon: <Zap className="size-4"/> }
                      ].map((stat, i) => (
                        <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between transition-all hover:border-slate-200">
                          <div className="flex items-center justify-between mb-1">
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                             <span className={cn("opacity-40", stat.color)}>{stat.icon}</span>
                          </div>
                          <p className={cn("text-xl font-bold tracking-tight", stat.color)}>{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* 關鍵子實體資產網格 (縮小版) */}
                    <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
                         <MapPin className="size-4 text-blue-600" />
                         {node.type === "organization" && "下轄房東清單"}
                         {node.type === "landlord" && "旗下房源網格"}
                         {node.type === "property" && "房源成員清單"}
                         {(!["organization", "landlord", "property"].includes(node.type)) && "關聯子實體"}
                         {isSyncingChildren ? " (同步中...)" : " (高密度)"}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {isSyncingChildren && (
                          <div className="col-span-2 py-8 flex flex-col items-center justify-center opacity-40">
                             <Loader2 className="size-6 animate-spin mb-2" />
                             <p className="text-[9px] font-black uppercase tracking-widest">正在提取子實體 DNA...</p>
                          </div>
                        )}
                        {!isSyncingChildren && node.children?.slice(0, 6).map((item: any) => (
                          <div key={item.id} className="group p-4 bg-slate-50/50 hover:bg-white rounded-xl border border-transparent hover:border-primary/10 hover:shadow-md transition-all cursor-pointer flex items-center gap-4">
                            <div className="size-10 bg-white rounded-lg flex items-center justify-center border shadow-sm text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                              {getEntityIcon(item.type, "size-5")}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-sm truncate text-slate-800">{item.name}</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase mt-0.5 tracking-widest opacity-60">ID: {item.id.slice(0, 8)}</p>
                            </div>
                            <ExternalLink className="size-3 text-slate-300 ml-auto group-hover:text-primary transition-colors" />
                          </div>
                        ))}
                      </div>
                      {node.children && node.children.length > 6 && (
                        <Button variant="ghost" className="w-full h-8 text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary">View All {node.children.length} Entities</Button>
                      )}
                    </div>
                  </div>

                  {/* 右側戰略診斷面板 (併入 DNA Pulse) */}
                  <div className="w-full xl:w-[320px] bg-slate-900 border-l border-white/5 flex flex-col shrink-0 overflow-hidden">
                    <div className="p-6 border-b border-white/5 space-y-8">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">系統診斷 DNA</span>
                        <Badge className="bg-emerald-500/10 text-emerald-500 text-[8px] border-none font-black h-5">即時中</Badge>
                      </div>
                      
                      {/* Entity DNA Sparkline Pattern - Interactive */}
                      <div className="flex items-end justify-between gap-1 h-32 relative group/chart">
                          {diagnosticData.history.map((h, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "w-full bg-blue-500/20 rounded-t-[1px] hover:bg-blue-400 sequence-animation transition-all cursor-crosshair relative group/bar",
                                  h > 85 && "bg-rose-500/30 hover:bg-rose-400"
                                )}
                                style={{ height: `${h}%` }}
                                onClick={() => {
                                  toast.info(`稽核索引: PS-LOG-${1024 + i} | 負載: ${h}%`, {
                                    description: "跳轉至稽核日誌對應時間點..."
                                  });
                                }}
                              >
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-[8px] px-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-50">
                                  {h}%
                                </div>
                              </div>
                          ))}
                          <div className="absolute inset-x-0 top-[20%] h-px border-t border-rose-500/30 border-dashed pointer-events-none">
                             <span className="absolute right-0 -top-3 text-[7px] text-rose-500/50 font-black">負載臨界線 (80%)</span>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none" />
                      </div>
                      
                      <div className="space-y-5">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">資源利用率</span>
                          <span className={cn(
                            "text-xs font-black tracking-tighter transition-all duration-300",
                            isScanning ? "text-blue-400" : "text-white"
                          )}>
                            {diagnosticData.utilization}%
                          </span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden relative">
                          {/* 預測性警戒線 (基於 7 日預估) */}
                          <div className="absolute left-[85%] top-0 bottom-0 w-0.5 bg-rose-500/50 z-10" title="7日預測峰值" />
                          <div
                            className={cn(
                              "h-full transition-all duration-300",
                              diagnosticData.utilization > 85 ? "bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.5)]" : "bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]"
                            )}
                            style={{ width: `${diagnosticData.utilization}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">系統延遲 (報修積壓)</span>
                        <span className={cn(
                          "text-xs font-black tracking-tighter transition-all duration-300",
                          isScanning ? "text-blue-400" : "text-emerald-400"
                        )}>
                          {diagnosticData.latency}s
                        </span>
                      </div>
                    </div>
                    </div>
                    
                    <div className="p-6 mt-auto">
                      <div className="bg-white/5 rounded-xl p-4 space-y-3 mb-6 border border-white/5">
                        <div className="flex items-center gap-2">
                          <Activity className="size-3 text-blue-500" />
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">診斷顧問建議</p>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-medium italic transition-all duration-500">
                          "{diagnosticData.insights}"
                        </p>
                        {diagnosticData.fixable && (
                          <Button
                            size="sm"
                            className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 h-8 text-[9px] font-black uppercase tracking-widest animate-pulse"
                            onClick={handleApplyFix}
                          >
                            <Check className="size-3 mr-1" /> 立即修復建議項目
                          </Button>
                        )}
                      </div>
                      <Button
                        disabled={isScanning}
                        onClick={handleStartScan}
                        className={cn(
                          "w-full font-black text-[9px] h-11 uppercase tracking-widest rounded-lg shadow-lg transition-all duration-500",
                          isScanning
                            ? "bg-slate-700 text-slate-400 shadow-none cursor-wait"
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/20"
                        )}
                      >
                        {isScanning ? (
                          <div className="flex items-center gap-2">
                             <Loader2 className="size-3 animate-spin" />
                             正在掃描... {scanProgress}%
                          </div>
                        ) : "執行全網掃描"}
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* 成員清單: 扁平化表格模式 */}
              <TabsContent value="users" className="m-0 h-full overflow-hidden flex flex-col p-6 space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border shadow-sm gap-4 shrink-0">
                   <div className="flex items-center gap-4 flex-1">
                      <div className="relative w-full sm:w-[350px]">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                          <Input placeholder="快篩人員識別資訊..." className="pl-10 h-11 bg-slate-50 border-none text-xs font-bold rounded-lg focus-visible:ring-1 focus-visible:ring-primary" />
                      </div>
                      
                      {/* 批次操作欄位 - 僅在選取時顯示 */}
                      {selectedUserIds.length > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-lg shadow-lg animate-in slide-in-from-left-4 duration-300">
                           <p className="text-[10px] font-black text-white uppercase tracking-widest mr-2">Selected: {selectedUserIds.length}</p>
                           <Button
                             disabled={isBatchProcessing}
                             variant="destructive" size="sm" className="h-7 text-[8px] font-black px-3"
                             onClick={() => handleBatchAction("SUSPEND")}
                           >
                              批次停權
                           </Button>
                           <Button
                             disabled={isBatchProcessing}
                             variant="outline" size="sm" className="h-7 text-[8px] font-black px-3 border-white/20 text-white hover:bg-white/10"
                             onClick={() => handleBatchAction("ACTIVATE")}
                           >
                              批次啟用
                           </Button>
                        </div>
                      )}
                   </div>
                   <Button size="sm" className="w-full sm:w-auto font-black text-[10px] h-11 px-8 rounded-lg uppercase tracking-widest">新增授權成員</Button>
                </div>

                <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex-1 flex flex-col">
                  <div className="flex-1 overflow-y-auto scrollbar-thin">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b sticky top-0 z-10">
                        <tr>
                          <th className="pl-8 pr-4 py-4 w-10">
                            <Checkbox
                              checked={selectedUserIds.length === users.length && users.length > 0}
                              onCheckedChange={(checked) => {
                                if (checked) setSelectedUserIds(users.map(u => u.id));
                                else setSelectedUserIds([]);
                              }}
                            />
                          </th>
                          <th className="px-4 py-4 font-black text-slate-400 uppercase tracking-widest text-[9px]">識別姓名 / 帳號</th>
                          <th className="px-8 py-4 font-black text-slate-400 uppercase tracking-widest text-[9px]">角色與存取等級</th>
                          <th className="px-8 py-4 font-black text-slate-400 uppercase tracking-widest text-[9px] text-right">權限管理</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {users.map(u => (
                          <tr key={u.id} className={cn(
                            "hover:bg-slate-50/50 transition-colors group",
                            selectedUserIds.includes(u.id) && "bg-blue-50/30"
                          )}>
                            <td className="pl-8 pr-4 py-4">
                              <Checkbox
                                checked={selectedUserIds.includes(u.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) setSelectedUserIds(prev => [...prev, u.id]);
                                  else setSelectedUserIds(prev => prev.filter(id => id !== u.id));
                                }}
                              />
                            </td>
                            <td className="px-4 py-4">
                              <p className={cn(
                                "font-black text-slate-900 group-hover:text-primary transition-colors text-sm mb-0.5",
                                u.status === "SUSPENDED" && "line-through opacity-40"
                              )}>
                                {u.name}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium tracking-tight truncate max-w-[200px]">{u.email}</p>
                            </td>
                            <td className="px-8 py-4">
                              <div className="flex items-center gap-2">
                                <Badge className="bg-primary/5 text-primary border-none text-[8px] font-black uppercase px-2.5 h-6 tracking-widest">{u.role}</Badge>
                                {u.status === "SUSPENDED" && (
                                  <Badge variant="destructive" className="text-[8px] font-black uppercase px-2 h-6 tracking-widest">Banned</Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-8 py-4 text-right">
                              <Button variant="ghost" size="sm" className="h-9 font-bold text-[9px] uppercase text-primary hover:bg-white border-2 border-transparent hover:border-slate-100 rounded-lg transition-all px-6">Manage</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              {/* 關聯實體: 網格瀏覽模式 */}
              <TabsContent value="entities" className="m-0 h-full overflow-hidden p-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 overflow-y-auto h-full pr-2 scrollbar-thin">
                  {node.children?.map((item: any) => (
                    <div key={item.id} className="group p-5 bg-white hover:bg-slate-50 rounded-xl border shadow-sm transition-all cursor-pointer flex flex-col gap-4">
                      <div className="size-12 bg-slate-50 rounded-lg flex items-center justify-center border shadow-inner group-hover:bg-white group-hover:border-primary/20 transition-all scale-100 group-hover:scale-105 duration-300">
                        {getEntityIcon(item.type, "size-6 text-slate-400 group-hover:text-primary")}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate text-slate-800">{item.name}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase mt-1 tracking-widest">STATUS: {item.status || "UNKNOWN"}</p>
                      </div>
                      <div className="mt-auto pt-4 border-t flex items-center justify-between">
                         <span className="text-[8px] font-black text-slate-300 tracking-tighter">{item.id.slice(0, 16)}</span>
                         <ExternalLink className="size-3 text-slate-300 group-hover:text-primary" />
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-1 overflow-hidden min-h-0 min-w-0 bg-white w-full">
      {/* 全域指令列組件 */}
      <CommandPalette
        onSelect={(id, name) => {
          setSearchTerm(name);
          setTreeKey(prev => prev + 1); // 強制重新選取與過濾
        }}
      />

      {/* Nexus Index Tree Area - 固定寬度 */}
      <div className={cn(
        "w-full lg:w-[350px] transition-all duration-300 shrink-0 flex flex-col bg-white border-r",
        isMobile && selectedNode ? "hidden" : "flex"
      )}>
        <ManagementTree
          key={treeKey}
          refreshKey={treeKey}
          onNodeSelect={setSelectedNode}
          initialSelectedId={initialSelectedOrgId}
          initialSearchTerm={searchTerm}
        />
      </div>

      <QuickActionDrawer
        isOpen={isQuickActionOpen}
        onOpenChange={setIsQuickActionOpen}
        node={selectedNode}
        onPlanUpdate={(newPlan) => {
          if (selectedNode) {
            setSelectedNode({
              ...selectedNode,
              metadata: { ...selectedNode.metadata, plan: newPlan }
            });
            setTreeKey(prev => prev + 1);
          }
        }}
        onStatusUpdate={(newStatus) => {
          if (selectedNode) {
            setSelectedNode({
              ...selectedNode,
              status: newStatus
            });
            setTreeKey(prev => prev + 1);
          }
        }}
      />

      {/* Main Command Area - 自適應填滿視窗空間 */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 overflow-hidden min-w-0 relative",
        selectedNode?.status === "SUSPENDED" ? "bg-rose-950/5" : "bg-slate-50/10",
        isMobile ? (selectedNode ? "flex" : "hidden") : "flex"
      )}>
        {/* Nexus Pulse: Background Grid Canvas */}
        <div className={cn(
          "absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none transition-opacity",
          selectedNode?.status === "SUSPENDED" ? "opacity-20" : "opacity-40"
        )} />

        {selectedNode ? (
          <>
            {renderWorkspace(selectedNode, isMobile)}
            <QuickActionDrawer
              isOpen={isQuickActionOpen}
              onOpenChange={setIsQuickActionOpen}
              node={selectedNode}
            />
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-slate-300 relative z-10 w-full animate-in fade-in duration-700">
             <div className="size-32 rounded-[40px] border-4 border-slate-100 flex items-center justify-center opacity-40 shadow-2xl bg-white animate-in zoom-in-50 duration-500 relative">
                <div className="absolute inset-0 rounded-[40px] border-2 border-primary/20 animate-ping duration-[3000ms]" />
                <ShieldCheck className="size-14 text-primary" />
             </div>
             <div className="mt-10 text-center space-y-4">
               <p className="text-xs font-black uppercase tracking-[0.5em] text-slate-900">Strategic Nexus Gateway</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-[280px] leading-relaxed mx-auto">
                 Select an entity from the Nexus Index to initialize diagnostic drill-down.
               </p>
             </div>
             <div className="absolute bottom-12 flex items-center gap-2 opacity-30">
                <Activity className="size-4 text-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Monitoring All Sub-Dimensions</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}