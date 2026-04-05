"use client";

import React, { useState } from "react";
import { ManagementTree } from "./ManagementTree";
import { 
  Building2, 
  Home, 
  Settings,
  Users as UsersIcon,
  Search,
  MapPin,
  ChevronLeft,
  Activity,
  Zap,
  ExternalLink,
  ShieldCheck
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

interface ManagementNode {
  id: string;
  name: string;
  type: "landlord" | "property" | "organization";
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
 * 響應式優化版：修正 PC 兩側空白、自適應寬度與一頁呈現。
 * 1. 移除了 max-width 限制，確保在大螢幕上能向兩倍側填滿。
 * 2. 指標卡片在大螢幕下擴展為 4 欄並排。
 * 3. 確保整體高度合適，大部分 1080P/2K 螢幕均能一次顯示絕大多數重要數據。
 */
export function ManagementViewWrapper() {
  const [selectedNode, setSelectedNode] = useState<ManagementNode | null>(null);
  const isMobile = useIsMobile();

  const getFlattenedUsers = (node: ManagementNode): FlattenedUser[] => {
    const users: FlattenedUser[] = [];
    if (node.type === "landlord") {
      users.push({
        id: node.id,
        name: node.name,
        email: node.metadata?.email || "N/A",
        role: "LANDLORD",
        status: node.status || "ACTIVE"
      });
      node.children?.forEach(prop => {
        prop.children?.forEach((member: any) => {
          users.push({
            id: member.id,
            name: member.name,
            email: member.metadata?.email || "N/A",
            role: member.type.toUpperCase(),
            status: member.status || "ACTIVE",
            relatedEntity: prop.name
          });
        });
      });
    } else if (node.type === "property") {
      node.children?.forEach((member: any) => {
        users.push({
          id: member.id,
          name: member.name,
          email: member.metadata?.email || "N/A",
          role: member.type.toUpperCase(),
          status: member.status || "ACTIVE",
          relatedEntity: node.name
        });
      });
    }
    return users;
  };

  const renderWorkspace = (node: ManagementNode, showBack = false) => {
    const users = getFlattenedUsers(node);

    return (
      <div className="flex-1 flex flex-col h-full bg-slate-50/20 overflow-hidden animate-in fade-in duration-300">
        {/* Mobile Header */}
        {showBack && (
          <div className="p-4 bg-white border-b flex items-center lg:hidden sticky top-0 z-20 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => setSelectedNode(null)} className="font-bold">
              <ChevronLeft className="w-4 h-4 mr-1 text-primary" /> 管理索引
            </Button>
          </div>
        )}

        {/* 主滾動區 - 移除 max-width 限制 */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-10 space-y-8 scrollbar-thin">
          {/* Workspace Header - 寬度自適應填滿 */}
          <div className="bg-slate-900 rounded-2xl p-6 lg:p-10 text-white relative shadow-2xl overflow-hidden min-h-[140px] flex items-center w-full">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]" />
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 w-full relative z-10">
              <div className="flex items-center gap-6 min-w-0">
                <div className="size-16 lg:size-20 bg-white/10 shrink-0 rounded-xl flex items-center justify-center ring-1 ring-white/10 shadow-inner backdrop-blur-md text-white">
                  {node.type === "landlord" ? <Building2 className="w-8 h-8 lg:w-10 lg:h-10" /> : <Home className="w-8 h-8 lg:w-10 lg:h-10 text-emerald-400" />}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h2 className="text-2xl lg:text-3xl font-bold tracking-tight truncate leading-tight">{node.name}</h2>
                    <Badge className="bg-primary text-primary-foreground border-none font-black text-[9px] uppercase tracking-widest px-2.5 h-6">
                      {node.type} PORTAL
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400 font-bold flex items-center gap-2 uppercase tracking-wider">
                    {node.subtitle || "Integrated Management Interface"} 
                    <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 shrink-0">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-900/30 px-6 lg:px-8 font-bold rounded-xl h-12 lg:h-14 text-sm lg:text-base">快速管理</Button>
                <Button size="lg" variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl h-12 lg:h-14 px-6 lg:px-8 text-sm lg:text-base">數據報告</Button>
              </div>
            </div>
          </div>

          {/* Tabs Container - 對齊 PC 端寬螢幕適配 */}
          <Tabs defaultValue="overview" className="flex flex-col space-y-6 w-full">
            <div className="bg-white rounded-xl border p-2 shadow-sm shrink-0 w-full flex">
                <TabsList className="bg-slate-50 w-full lg:w-fit rounded-lg gap-1 border-none h-12 p-1 flex-wrap overflow-x-auto overflow-y-hidden no-scrollbar">
                    <TabsTrigger value="overview" className="flex-1 lg:flex-none px-6 lg:px-12 h-10 rounded-md font-bold text-xs data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all focus-visible:ring-0 whitespace-nowrap">總覽控制台</TabsTrigger>
                    <TabsTrigger value="users" className="flex-1 lg:flex-none px-6 lg:px-12 h-10 rounded-md font-bold text-xs data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all focus-visible:ring-0 text-muted-foreground whitespace-nowrap">成員清單 ({users.length})</TabsTrigger>
                    <TabsTrigger value="settings" className="flex-1 lg:flex-none px-6 lg:px-12 h-10 rounded-md font-bold text-xs data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all focus-visible:ring-0 text-muted-foreground whitespace-nowrap">工作區內部項</TabsTrigger>
                </TabsList>
            </div>

            <div className="outline-none flex-1 w-full">
              <TabsContent value="overview" className="m-0 space-y-8 pb-10 w-full animate-in fade-in slide-in-from-top-1 duration-400">
                {/* 狀態卡片 - PC 適配 4 欄 */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                  {[
                    { label: "管理實體數", value: node.children?.length || 0, color: "text-blue-600", icon: <Building2 className="w-5 h-5"/> },
                    { label: "授權人員數", value: users.length, color: "text-amber-600", icon: <UsersIcon className="w-5 h-5"/> },
                    { label: "系統穩定度", value: "良好 (99%)", color: "text-emerald-600", icon: <ShieldCheck className="w-5 h-5"/> },
                    { label: "帳號等級", value: "PLATINUM", color: "text-slate-600", icon: <Zap className="w-5 h-5"/> }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between min-h-[120px] transition-all hover:border-slate-200">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                         <span className={cn("opacity-20", stat.color)}>{stat.icon}</span>
                      </div>
                      <p className={cn("text-3xl font-bold tracking-tight mt-2", stat.color)}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* 列表區 - 寬度自適應展開 */}
                <div className="bg-white rounded-2xl border shadow-sm p-10 space-y-8 w-full">
                  <div className="flex items-center justify-between border-b pb-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
                       <MapPin className="w-5 h-5 text-blue-600" /> 核心管理範疇 (資產網格)
                    </h3>
                    <Button variant="link" size="sm" className="font-bold text-xs">展開詳細清單</Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {node.children?.map((item: any) => (
                      <div key={item.id} className="group p-6 bg-slate-50/50 hover:bg-white rounded-2xl border-2 border-transparent hover:border-primary/10 hover:shadow-2xl transition-all cursor-pointer flex items-center gap-6">
                        <div className="size-14 bg-white rounded-xl flex items-center justify-center border shadow-sm group-hover:bg-primary group-hover:text-white transition-all scale-100 group-hover:scale-105 duration-300">
                          <Home className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-base truncate text-slate-800">{item.name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase mt-1 tracking-widest opacity-60">ID: {item.id.slice(0, 8)}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-200 ml-auto group-hover:text-primary transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="users" className="m-0 space-y-6 w-full animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-5 rounded-2xl border shadow-sm gap-6 w-full">
                   <div className="relative w-full sm:w-[450px]">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input placeholder="快篩工作區的人員識別資訊..." className="pl-10 h-14 bg-slate-50 border-none text-sm font-bold" />
                   </div>
                   <Button size="lg" className="w-full sm:w-auto font-black text-sm h-14 px-12 rounded-xl">新增授權成員</Button>
                </div>
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden min-h-[400px]">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-10 py-5 font-black text-slate-400 uppercase tracking-widest text-[10px]">識別姓名 / 電子郵件帳號</th>
                        <th className="px-10 py-5 font-black text-slate-400 uppercase tracking-widest text-[10px]">角色與存取等級</th>
                        <th className="px-10 py-5 font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">權限管理</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-10 py-6">
                            <p className="font-black text-slate-900 group-hover:text-primary transition-colors text-base mb-1">{u.name}</p>
                            <p className="text-[11px] text-slate-400 font-medium tracking-tight h-4">{u.email}</p>
                          </td>
                          <td className="px-10 py-6">
                            <Badge className="bg-primary/5 text-primary border-none text-[8px] font-black uppercase px-4 h-7 tracking-widest">{u.role}</Badge>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <Button variant="ghost" size="sm" className="h-10 font-bold text-[10px] uppercase text-primary hover:bg-white border-2 border-transparent hover:border-slate-100 rounded-xl transition-all px-8">Manage Access</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
      {/* Index Area - 固定 350px */}
      <div className={cn(
        "w-full lg:w-[350px] transition-all duration-300 shrink-0 flex flex-col bg-white border-r",
        isMobile && selectedNode ? "hidden" : "flex"
      )}>
        <ManagementTree onNodeSelect={setSelectedNode} />
      </div>

      {/* Main Area - 自適應填滿剩餘 PC 空間 */}
      <div className={cn(
        "flex-1 flex flex-col bg-slate-50/10 transition-all duration-300 overflow-hidden min-w-0",
        isMobile ? (selectedNode ? "flex" : "hidden") : "flex"
      )}>
        {selectedNode ? (
          renderWorkspace(selectedNode, isMobile)
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-slate-300 bg-slate-50/10 w-full">
             <div className="size-28 rounded-[36px] border-4 border-dashed border-slate-100 flex items-center justify-center opacity-30 shadow-sm bg-white animate-in zoom-in-50 duration-500">
                <ShieldCheck className="w-12 h-12" />
             </div>
             <p className="mt-8 text-xs font-black uppercase tracking-[0.4em] text-slate-400 animate-in slide-in-from-bottom-2 duration-700">Strategic Asset Console</p>
             <p className="text-[10px] font-bold mt-4 text-slate-300 uppercase tracking-widest italic animate-pulse">Initializing Management Gateway...</p>
          </div>
        )}
      </div>
    </div>
  );
}