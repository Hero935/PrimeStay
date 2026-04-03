import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Receipt, 
  Wrench, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  MapPin,
  Calendar
} from "lucide-react";

/**
 * 租客首頁面板
 */
export default async function TenantDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  // 獲取租客當前有效的租約
  const contract = await prisma.contract.findFirst({
    where: { 
      tenantId: userId,
      status: "OCCUPIED" 
    },
    include: {
      property: true,
    }
  });

  // 獲取待處理帳單
  const pendingBillings = await prisma.billing.findMany({
    where: {
      contract: { tenantId: userId },
      status: { in: ["PENDING_TENANT"] }
    },
    orderBy: { periodStart: "desc" }
  });

  return (
    <div className="space-y-6 pb-12">
      {/* 行動端動態狀態條 */}
      <div className={`flex items-center gap-2 p-3 rounded-2xl border text-sm font-medium ${
        contract ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-700 border-slate-100"
      }`}>
        {contract ? (
          <>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            您的租約狀態：進行中 ({contract.property.address})
          </>
        ) : (
          <>
            <div className="h-2 w-2 rounded-full bg-slate-500" />
            尚未綁定有效租約
          </>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">下午好, {session.user?.name}</h1>
        <p className="text-muted-foreground text-sm">今天有什麼可以幫您的？</p>
      </div>

      {/* 核心應繳帳單卡片 */}
      <Card className={`text-white border-none shadow-xl overflow-hidden relative ${
        pendingBillings.length > 0 ? "bg-slate-900" : "bg-emerald-900"
      }`}>
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Receipt className="h-24 w-24" />
        </div>
        <CardHeader>
          <CardTitle className="text-slate-400 text-xs uppercase tracking-widest">
            {pendingBillings.length > 0 ? "待繳總額" : "本月狀態"}
          </CardTitle>
          <div className="text-4xl font-extrabold mt-2">
            {pendingBillings.length > 0
              ? `$ ${pendingBillings.reduce((acc, curr) => acc + Number(curr.totalAmount), 0).toLocaleString()}`
              : "無欠費"}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">
              {pendingBillings.length > 0 ? `共有 ${pendingBillings.length} 筆帳單待處理` : "您的帳務狀況良好"}
            </span>
          </div>
          {pendingBillings.length > 0 && (
            <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold py-6 rounded-xl transition-all active:scale-[0.98]">
              查看詳情並支付
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 快捷操作區 */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="hover:bg-slate-50 transition-colors cursor-pointer border-slate-200 group">
          <CardContent className="p-4 flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="h-6 w-6 text-blue-600" />
            </div>
            <span className="font-semibold text-sm">快速報修</span>
          </CardContent>
        </Card>
        <Card className="hover:bg-slate-50 transition-colors cursor-pointer border-slate-200 group">
          <CardContent className="p-4 flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Receipt className="h-6 w-6 text-amber-600" />
            </div>
            <span className="font-semibold text-sm">歷史帳單</span>
          </CardContent>
        </Card>
      </div>

      {/* 我的房源資訊 */}
      {contract && (
        <div className="space-y-3">
          <h3 className="font-bold text-lg px-1 text-slate-800">我的租約</h3>
          <Card className="overflow-hidden border-slate-200 shadow-sm transition-all hover:shadow-md">
            <div className="aspect-[21/9] bg-slate-200 relative group overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
               <div className="absolute inset-0 bg-slate-300 animate-pulse group-hover:scale-105 transition-transform duration-500" />
               <div className="absolute bottom-0 left-0 p-4 text-white z-20">
                 <div className="flex items-center gap-1 text-xs opacity-90 mb-1">
                   <Home className="h-3 w-3" />
                   {contract.property.address}
                 </div>
                 <div className="font-bold text-lg">{contract.property.roomNumber} 號房</div>
               </div>
            </div>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <p className="text-slate-400 text-[10px] uppercase font-bold tracking-tighter">租期開始</p>
                   <p className="text-sm font-semibold">{new Date(contract.startDate).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-slate-400 text-[10px] uppercase font-bold tracking-tighter">月租金</p>
                   <p className="text-sm font-bold text-blue-600">${Number(contract.monthlyRent).toLocaleString()}</p>
                </div>
              </div>
              <div className="pt-4 border-t flex justify-center">
                 <Button variant="ghost" size="sm" className="w-full text-slate-600 group">
                   查看完整數位合約 <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                 </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 無數據提示 (未綁定) */}
      {!contract && (
        <Card className="border-dashed py-12 flex flex-col items-center justify-center text-center px-6">
           <AlertCircle className="h-12 w-12 text-slate-300 mb-4" />
           <p className="text-slate-500 font-medium">尚未綁定有效的房源租約</p>
           <p className="text-xs text-slate-400 mt-2">請聯繫您的房東或代管人員發送邀請碼</p>
        </Card>
      )}
    </div>
  );
}