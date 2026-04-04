import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Mail } from "lucide-react";

/**
 * 帳號停權通知頁面
 * 當使用者的 status 為 SUSPENDED 時，middleware 會強制導向至此頁面
 */
export default function SuspendedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md border-destructive/20 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-destructive">
            帳號已被停用
          </CardTitle>
          <CardDescription className="pt-2 text-base">
            您的帳號目前處於停權狀態，無法存取系統功能。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center text-sm text-muted-foreground">
          <p>
            這可能是因為違反了服務條款、帳號安全性考量或是行政管理的必要措施。
          </p>
          <div className="flex items-center justify-center gap-2 py-2 font-medium text-foreground">
            <Mail className="h-4 w-4" />
            <span>聯絡支援團隊：support@primestay.com</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button asChild variant="outline" className="w-full">
            <Link href="/api/auth/signout">登出帳號</Link>
          </Button>
          <Button asChild variant="link" className="text-xs text-muted-foreground">
            <Link href="/">回到首頁</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}