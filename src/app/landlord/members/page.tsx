"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, UserX, UserCheck, Shield, User } from "lucide-react";
import { toast } from "sonner";

interface Member {
  id: string;
  name: string | null;
  email: string;
  systemRole: string;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
  memberRole?: string;
  contracts?: any[];
}

/**
 * Landlord 成員管理頁面
 * 用於管理代管團隊 (Manager) 與房客 (Tenant)
 */
export default function LandlordMembersPage() {
  const [managers, setManagers] = useState<Member[]>([]);
  const [tenants, setTenants] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/landlord/members");
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setManagers(data.managers || []);
      setTenants(data.tenants || []);
    } catch (error) {
      toast.error("讀取成員列表失敗");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: "ACTIVE" | "SUSPENDED") => {
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const response = await fetch(`/api/landlord/members/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("更新失敗");
      toast.success(newStatus === "SUSPENDED" ? "已停權該帳號" : "已恢復該帳號");
      fetchMembers();
    } catch (error) {
      toast.error("操作失敗");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">成員管理</h1>
          <p className="text-slate-500">管理您的代管團隊與房客狀態</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Mail className="w-4 h-4 mr-2" />
            邀請代管人員
          </Button>
          <Button size="sm">
            <Mail className="w-4 h-4 mr-2" />
            邀請房客
          </Button>
        </div>
      </div>

      <Card>
        <Tabs defaultValue="managers">
          <CardHeader className="pb-0">
            <TabsList className="w-fit">
              <TabsTrigger value="managers">代管團隊 ({managers.length})</TabsTrigger>
              <TabsTrigger value="tenants">房客列表 ({tenants.length})</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="pt-6">
            <TabsContent value="managers" className="mt-0 space-y-4">
              {managers.map((manager) => (
                <div key={manager.id} className="flex items-center justify-between p-4 border rounded-xl bg-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-full">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{manager.name || "未命名"}</p>
                        {manager.memberRole === "OWNER" && (
                          <Badge variant="outline" className="text-[10px]">Owner</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">{manager.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={manager.status === "ACTIVE" ? "default" : "destructive"}>
                      {manager.status === "ACTIVE" ? "正常" : "已停權"}
                    </Badge>
                    {manager.memberRole !== "OWNER" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleStatus(manager.id, manager.status)}
                      >
                        {manager.status === "ACTIVE" ? <UserX className="w-4 h-4 text-slate-400" /> : <UserCheck className="w-4 h-4 text-green-500" />}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {managers.length === 0 && !isLoading && (
                <p className="text-center text-slate-400 py-12">目前無代管人員</p>
              )}
            </TabsContent>

            <TabsContent value="tenants" className="mt-0 space-y-4">
              {tenants.map((tenant) => (
                <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-xl bg-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-full">
                      <User className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{tenant.name || "未命名"}</p>
                      <p className="text-sm text-slate-500">{tenant.email}</p>
                      {tenant.contracts && tenant.contracts.length > 0 && (
                        <p className="text-xs text-blue-600 font-medium mt-1">
                          🏠 {tenant.contracts[0].property.address} - {tenant.contracts[0].property.roomNumber}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={tenant.status === "ACTIVE" ? "default" : "destructive"}>
                      {tenant.status === "ACTIVE" ? "正常" : "已停權"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleStatus(tenant.id, tenant.status)}
                    >
                      {tenant.status === "ACTIVE" ? <UserX className="w-4 h-4 text-slate-400" /> : <UserCheck className="w-4 h-4 text-green-500" />}
                    </Button>
                  </div>
                </div>
              ))}
              {tenants.length === 0 && !isLoading && (
                <p className="text-center text-slate-400 py-12">目前無房客資料</p>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </>
  );
}