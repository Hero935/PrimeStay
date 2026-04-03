import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Receipt,
  Wrench,
  TrendingUp,
  Users,
  AlertCircle
} from "lucide-react";

/**
 * 房東管理後台儀表板 - 高規格版本
 */
export default async function LandlordDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // 模擬數據 (實際應從 API/DB 獲取)
  const stats = [
    { title: "總預估營收", value: "$124,500", description: "+12.5% 自上月", icon: TrendingUp, color: "text-emerald-600" },
    { title: "所有房源", value: "12", description: "3 個待招租", icon: Building2, color: "text-blue-600" },
    { title: "當期租客", value: "24", description: "包含合租人", icon: Users, color: "text-violet-600" },
    { title: "待處理報修", value: "3", description: "2 個急件", icon: Wrench, color: "text-amber-600" },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">儀表板</h1>
        <p className="text-muted-foreground">歡迎回來, {session.user?.name}。這是您的物業管理概況。</p>
      </div>

      {/* 數據快訊卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* 營收趨勢 (佔位符) */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>營收趨勢</CardTitle>
            <CardDescription>最近 6 個月的租金收入分析</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg bg-slate-50/50 m-4">
             <div className="flex flex-col items-center gap-2 text-muted-foreground">
               <TrendingUp className="h-8 w-8 opacity-20" />
               <p>營收圖表組件載入中...</p>
             </div>
          </CardContent>
        </Card>

        {/* 最近動態 */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>急需處理</CardTitle>
            <CardDescription>您有 3 項任務需要處理</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "帳單逾期", detail: "A01 房客林先生", time: "2天前", status: "danger" },
                { title: "新報修", detail: "B05 水龍頭漏水", time: "3小時前", status: "warning" },
                { title: "合約即將到期", detail: "C02 陳小姐", time: "1週後", status: "info" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors border">
                  <div className={`mt-1 h-2 w-2 rounded-full ${
                    item.status === 'danger' ? 'bg-red-500' : item.status === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.detail} ({item.time})</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}