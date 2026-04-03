"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Loader2, Home } from "lucide-react";

/**
 * 登入頁面 - 高規重新設計
 */
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("帳號或密碼錯誤");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("發生系統錯誤，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white relative overflow-hidden px-4">
      {/* 背景裝飾與首頁一致 */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f8f8f8_1px,transparent_1px),linear-gradient(to_bottom,#f8f8f8_1px,transparent_1px)] bg-[size:4rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#f0f9ff,transparent)]"></div>
      </div>

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center mb-8">
           <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-2xl shadow-lg ring-4 ring-slate-50">
             P
           </div>
        </div>

        <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-2xl overflow-hidden">
          <CardHeader className="space-y-1 pb-6 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">歡迎回來</CardTitle>
            <CardDescription>
              請輸入您的帳號密碼以進入 PrimeStay 平台
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">電子郵件</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="rounded-xl h-12 focus-visible:ring-slate-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">密碼</Label>
                  <a href="#" className="text-xs text-blue-600 hover:underline">
                    忘記密碼？
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  className="rounded-xl h-12 focus-visible:ring-slate-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked: boolean) => setRememberMe(checked)}
                  className="rounded-md border-slate-300 data-[state=checked]:bg-slate-900"
                />
                <Label
                  htmlFor="remember"
                  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  記住我的登入資訊
                </Label>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium animate-in slide-in-from-top-2">
                   <AlertCircle className="h-4 w-4" />
                   {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-slate-900 font-bold tracking-wide transition-all active:scale-[0.98] hover:bg-slate-800"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    安全登入中...
                  </>
                ) : (
                  "登入系統"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t bg-slate-50/50 p-6 text-center">
             <p className="text-xs text-muted-foreground">
               還沒有帳號嗎？
               <a href="/register" className="ml-1 font-bold text-slate-900 hover:underline">
                  立即註冊
               </a>
             </p>
             <a href="/" className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-slate-600 transition-colors">
               <Home className="h-3 w-3" /> 返回首頁
             </a>
          </CardFooter>
        </Card>

        <p className="mt-8 text-center text-[10px] uppercase tracking-[0.3em] font-bold text-slate-300">
           Enterprise Grade Security
        </p>
      </div>
    </div>
  );
}