"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, UserX, UserCheck, Shield, User, Trash2, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";
import { InviteMemberDialog } from "./InviteMemberDialog";

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

interface Invitation {
  id: string;
  code: string;
  targetRole: "TENANT" | "MANAGER";
  expiresAt: string;
  property?: {
    address: string;
    roomNumber: string;
  };
}

/**
 * Landlord 成員管理頁面
 * 用於管理代管團隊 (Manager) 與房客 (Tenant)
 */
export default function LandlordMembersPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  const [managers, setManagers] = useState<Member[]>([]);
  const [tenants, setTenants] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteTargetRole, setInviteTargetRole] = useState<"TENANT" | "MANAGER">("MANAGER");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([fetchMembers(), fetchInvitations()]);
    setIsLoading(false);
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/landlord/members");
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setManagers(data.managers || []);
      setTenants(data.tenants || []);
    } catch (error) {
      toast.error("讀取成員列表失敗");
    }
  };

  const openInviteDialog = (role: "TENANT" | "MANAGER") => {
    setInviteTargetRole(role);
    setIsInviteOpen(true);
  };

  const fetchInvitations = async () => {
    try {
      const orgRes = await fetch("/api/landlord/organization");
      const orgData = await orgRes.json();
      if (orgData.data?.id) {
        const res = await fetch(`/api/invitations?organizationId=${orgData.data.id}`);
        const data = await res.json();
        setInvitations(data.data || []);
      }
    } catch (error) {
      console.error("獲取邀請失敗:", error);
    }
  };

  const deleteInvitation = async (id: string) => {
    if (!confirm("確定要撤銷此邀請嗎？")) return;
    try {
      const response = await fetch(`/api/invitations/${id}`, { method: "DELETE" });
      if (response.ok) {
        toast.success("已撤銷邀請");
        fetchInvitations();
      } else {
        throw new Error("撤銷失敗");
      }
    } catch (error) {
      toast.error("操作失敗");
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
          {userRole === "LANDLORD" && (
            <Button variant="outline" size="sm" onClick={() => openInviteDialog("MANAGER")}>
              <Mail className="w-4 h-4 mr-2" />
              邀請代管人員
            </Button>
          )}
          <Button size="sm" onClick={() => openInviteDialog("TENANT")}>
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
              <TabsTrigger value="invitations">邀請管理 ({invitations.length})</TabsTrigger>
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

            <TabsContent value="invitations" className="mt-0 space-y-4">
              {invitations.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-4 border rounded-xl bg-white transition-all hover:border-blue-100">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-lg">
                        {invite.code}
                      </span>
                      <Badge variant="outline">
                        {invite.targetRole === "TENANT" ? "房客邀請" : "代管邀請"}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-1 text-sm text-slate-500 mt-1">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>有效期至: {new Date(invite.expiresAt).toLocaleDateString()}</span>
                      </div>
                      {invite.property && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>預計入住: {invite.property.address} - {invite.property.roomNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                      onClick={() => deleteInvitation(invite.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {invitations.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <p className="text-slate-400">目前無待使用的有效邀請碼</p>
                  <Button 
                    variant="link" 
                    className="text-blue-600 mt-2"
                    onClick={() => openInviteDialog("MANAGER")}
                  >
                    立即生成邀請碼
                  </Button>
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      <InviteMemberDialog
        isOpen={isInviteOpen}
        onOpenChange={setIsInviteOpen}
        targetRole={inviteTargetRole}
        onSuccess={fetchInvitations}
      />
    </>
  );
}