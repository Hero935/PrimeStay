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
  Loader2
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
import { QuickActionDrawer } from "@/components/admin/QuickActionDrawer";

interface ManagementNode {
  id: string;
  name: string;
  type: "landlord" | "property" | "organization" | "manager" | "tenant";
  status?: string;
  subtitle?: string;
  metadata?: any;
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
export function ManagementViewWrapper({ initialSelectedOrgId }: { initialSelectedOrgId?: string }) {
  const [selectedNode, setSelectedNode] = useState<ManagementNode | null>(null);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [diagnosticData, setDiagnosticData] = useState({
    utilization: 94.8,
    latency: 0.42,
    insights: "Infrastructure load is stable. Recommended to scale sub-entities in Region-B."
  });
  const isMobile = useIsMobile();

  /**
   * 遞迴提取節點內所有人員
   * @param node 當前選中的節點
   */
  const getFlattenedUsers = (node: ManagementNode): FlattenedUser[] => {
    const users: FlattenedUser[] = [];

    const traverse = (target: any, context?: string) => {
      if (["landlord", "manager", "tenant"].includes(target.type)) {
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
   * 執行全網掃描模擬
   */
  const handleStartScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    
    // 模擬進度條與數據抖動
    for (let i = 0; i <= 100; i += 5) {
      setScanProgress(i);
      setDiagnosticData(prev => ({
        ...prev,
        utilization: Number((Math.random() * 20 + 75).toFixed(1)),
        latency: Number((Math.random() * 0.5 + 0.1).toFixed(2))
      }));
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setDiagnosticData({
      utilization: 82.3,
      latency: 0.28,
      insights: "Scan Complete. All clusters operating within optimized parameters. Memory allocation adjusted."
    });
    setIsScanning(false);
  };

  /**
   * 渲染治理工作區
   * @param node 被選中的實體
   * @param showBack 是否顯示返回按鈕 (手機版)
   */
  const renderWorkspace = (node: ManagementNode, showBack = false) => {
    const users = getFlattenedUsers(node);

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
            {node.type === "landlord" ? <Building2 className="size-5" /> : <Home className="size-5 text-emerald-400" />}
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
                 NEXUS INDEX {" > "} {node.type} {" > "} {node.id.split("-").pop()}
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
                  const targetUrl = node.type === "organization"
                    ? `/admin/organizations?id=${node.id}`
                    : `/admin/properties?id=${node.id}`;
                  window.open(targetUrl, "_blank");
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
                        { label: "實體數", value: node.children?.length || 0, color: "text-blue-600", icon: <Building2 className="size-4"/> },
                        { label: "授權人", value: users.length, color: "text-amber-600", icon: <UsersIcon className="size-4"/> },
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
                         <MapPin className="size-4 text-blue-600" /> 核心資產網格 (高密度模式)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {node.children?.slice(0, 6).map((item: any) => (
                          <div key={item.id} className="group p-4 bg-slate-50/50 hover:bg-white rounded-xl border border-transparent hover:border-primary/10 hover:shadow-md transition-all cursor-pointer flex items-center gap-4">
                            <div className="size-10 bg-white rounded-lg flex items-center justify-center border shadow-sm text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                              <Home className="size-5" />
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
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Diagnostic DNA</span>
                        <Badge className="bg-emerald-500/10 text-emerald-500 text-[8px] border-none font-black h-5">LIVE</Badge>
                      </div>
                      
                      {/* Entity DNA Sparkline Pattern */}
                      <div className="flex items-end justify-between gap-1 h-32 relative">
                          {[40, 70, 45, 90, 65, 80, 50, 95, 40, 60, 75, 45, 85, 55, 70].map((h, i) => (
                              <div key={i} className="w-full bg-blue-500/20 rounded-t-[1px] hover:bg-blue-400 sequence-animation transition-all" style={{ height: `${h}%` }} />
                          ))}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none" />
                      </div>
                      
                      <div className="space-y-5">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Utilization</span>
                          <span className={cn(
                            "text-xs font-black tracking-tighter transition-all duration-300",
                            isScanning ? "text-blue-400" : "text-white"
                          )}>
                            {diagnosticData.utilization}%
                          </span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)] transition-all duration-300"
                            style={{ width: `${diagnosticData.utilization}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Latency</span>
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
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Advisor insight</p>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-medium italic transition-all duration-500">
                          "{diagnosticData.insights}"
                        </p>
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
                   <div className="relative w-full sm:w-[350px]">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <Input placeholder="快篩人員識別資訊..." className="pl-10 h-11 bg-slate-50 border-none text-xs font-bold rounded-lg focus-visible:ring-1 focus-visible:ring-primary" />
                   </div>
                   <Button size="sm" className="w-full sm:w-auto font-black text-[10px] h-11 px-8 rounded-lg uppercase tracking-widest">新增授權成員</Button>
                </div>
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex-1 flex flex-col">
                  <div className="flex-1 overflow-y-auto scrollbar-thin">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b sticky top-0 z-10">
                        <tr>
                          <th className="px-8 py-4 font-black text-slate-400 uppercase tracking-widest text-[9px]">識別姓名 / 帳號</th>
                          <th className="px-8 py-4 font-black text-slate-400 uppercase tracking-widest text-[9px]">角色與存取等級</th>
                          <th className="px-8 py-4 font-black text-slate-400 uppercase tracking-widest text-[9px] text-right">權限管理</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {users.map(u => (
                          <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-8 py-4">
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
                        <Home className="size-6 text-slate-400 group-hover:text-primary" />
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
      {/* Nexus Index Tree Area - 固定寬度 */}
      <div className={cn(
        "w-full lg:w-[350px] transition-all duration-300 shrink-0 flex flex-col bg-white border-r",
        isMobile && selectedNode ? "hidden" : "flex"
      )}>
        <ManagementTree
          onNodeSelect={setSelectedNode}
          initialSelectedId={initialSelectedOrgId}
        />
      </div>

      {/* Main Command Area - 自適應填滿視窗空間 */}
      <div className={cn(
        "flex-1 flex flex-col bg-slate-50/10 transition-all duration-300 overflow-hidden min-w-0 relative",
        isMobile ? (selectedNode ? "flex" : "hidden") : "flex"
      )}>
        {/* Nexus Pulse: Background Grid Canvas */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

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