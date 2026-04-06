"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown, Zap, Shield } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

/**
 * 方案選擇與升級頁面 (模擬購買流程)
 */
export default function PricingPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const res = await fetch("/api/user/organizations");
      const { data } = await res.json();
      const ownedOrgs = data?.filter((org: any) => org.memberRole === "OWNER") || [];
      setOrganizations(ownedOrgs);
      if (ownedOrgs.length > 0) {
        setSelectedOrgId(ownedOrgs[0].id);
      }
    } catch (err) {
      toast.error("載入組織資訊失敗");
    } finally {
      setLoading(false);
    }
  };

  const currentOrg = organizations.find(o => o.id === selectedOrgId);

  const handleUpgrade = async (plan: string) => {
    if (!selectedOrgId) {
      toast.error("請先選擇要升級的組織");
      return;
    }

    if (currentOrg?.plan === plan) {
      toast.info("您目前已在使用此方案");
      return;
    }

    setIsProcessing(true);
    try {
      // 呼叫 API 更新方案 (模擬購買成功後的回調)
      const res = await fetch("/api/user/organizations/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: selectedOrgId, plan }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success(`恭喜！您的組織已成功升級為 ${plan} 方案`);
        fetchOrganizations(); // 重新整理狀態
        router.refresh();
      } else {
        toast.error(result.error || "升級失敗");
      }
    } catch (err) {
      toast.error("系統錯誤");
    } finally {
      setIsProcessing(false);
    }
  };

  const plans = [
    {
      id: "FREE",
      name: "Free",
      price: "0",
      description: "適合個人小房東入門體驗",
      features: ["2 間房源上限", "基本合約管理", "標準租單自動產生", "社群支援"],
      icon: <Zap className="size-6 text-slate-400" />,
      color: "bg-slate-50",
      buttonText: "目前方案"
    },
    {
      id: "STARTER",
      name: "Starter",
      price: "299",
      description: "為獨立代管人與成長中房東打造",
      features: ["10 間房源上限", "財務收支統計報表", "報修進度追蹤", "優先電子郵件支援"],
      icon: <Zap className="size-6 text-blue-500" />,
      color: "bg-blue-50",
      highlight: true,
      buttonText: "立即升級"
    },
    {
      id: "PRO",
      name: "Pro",
      price: "999",
      description: "專業管理公司與大量房產擁有者首選",
      features: ["50 間房源上限", "多組織聯合管理", "專屬 PRO 尊榮標記", "1對1 LINE 專人支援"],
      icon: <Crown className="size-6 text-amber-500" />,
      color: "bg-amber-50",
      buttonText: "立即升級"
    }
  ];

  if (loading) return <div className="p-8 text-center">載入中...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight">選擇最適合您的方案</h1>
        <p className="text-slate-500 text-lg">提供多樣化的訂閱計畫，滿足不同階段的管理需求</p>
        
        {organizations.length > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className="text-sm font-medium">切換組織：</span>
            <select 
              className="border p-2 rounded-lg bg-white shadow-sm outline-none"
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
            >
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isCurrent = currentOrg?.plan === plan.id;
          return (
            <Card key={plan.id} className={`relative flex flex-col overflow-hidden transition-all duration-300 ${plan.highlight ? 'ring-2 ring-blue-500 shadow-xl scale-105 z-10' : 'hover:shadow-md'}`}>
               {plan.highlight && (
                 <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                   最受歡迎
                 </div>
               )}
               <CardHeader className={`${plan.color} pb-8`}>
                  <div className="mb-4">{plan.icon}</div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-slate-500 text-sm"> / 月</span>
                  </div>
               </CardHeader>
               <CardContent className="pt-8 flex-1">
                  <ul className="space-y-4">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                        <Check className="size-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
               </CardContent>
               <CardFooter className="pb-8">
                  <Button 
                    className={`w-full h-12 text-md font-bold transition-all ${isCurrent ? 'bg-slate-100 text-slate-400 pointer-events-none' : plan.highlight ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 group-hover:bg-blue-600'}`}
                    disabled={isProcessing || isCurrent}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {isProcessing ? "處理中..." : isCurrent ? "目前方案" : plan.buttonText}
                  </Button>
               </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="mt-20 p-8 rounded-2xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="text-blue-400" /> 企業版定製需求？
          </h3>
          <p className="text-slate-400">當您的房源數量超過 100 間，或是需要客製化系統串接，請直接與我們聯繫。</p>
        </div>
        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 h-12 px-8">
          聯絡業務專員
        </Button>
      </div>
    </div>
  );
}