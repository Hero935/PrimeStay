"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Mail, Phone, Upload, Save } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { toast } from "sonner";

export default function LandlordSettingsPage() {
  const [orgData, setOrgData] = useState<any>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchOrganization();
  }, []);

  const fetchOrganization = async () => {
    try {
      const res = await fetch("/api/landlord/organization");
      const { data } = await res.json();
      if (data) {
        setOrgData(data);
        setName(data.name || "");
        setPhone(data.phone || "");
        setEmail(data.email || "");
        setLogoUrl(data.logoUrl || "");
      }
    } catch (err) {
      toast.error("載入組織設定失敗");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/landlord/organization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, logoUrl }),
      });
      if (!res.ok) throw new Error("儲存失敗");
      toast.success("組織設定已更新");
      fetchOrganization();
    } catch (err) {
      toast.error("更新失敗");
    } finally {
      setIsSaving(false);
    }
  };

  if (!orgData) return <div className="animate-pulse h-64 bg-slate-100 rounded-xl" />;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">組織設定</h1>
        <p className="text-slate-500">管理您的品牌資訊與組織基本資料</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">基本資訊</CardTitle>
            <CardDescription>這些資訊將會顯示在房客的帳單與合約中</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="org-name">組織名稱</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    id="org-name" 
                    className="pl-10" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="org-phone">服務電話</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                      id="org-phone" 
                      className="pl-10" 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-email">服務 Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                      id="org-email" 
                      className="pl-10" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full md:w-fit" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "儲存中..." : "儲存變更"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">品牌 Logo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-200 overflow-hidden mb-4 flex items-center justify-center bg-slate-50">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <Building2 className="w-12 h-12 text-slate-200" />
              )}
            </div>
            
            <CldUploadWidget
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "primestay_preset"}
              onSuccess={(result: any) => setLogoUrl(result.info.secure_url)}
              onError={(error: any) => {
                console.error("Cloudinary Upload Error:", error);
                toast.error("上傳失敗，請檢查 Cloudinary 配置");
              }}
              options={{
                cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                maxFiles: 1,
                clientAllowedFormats: ["png", "jpg", "jpeg", "svg"],
                sources: ["local", "url"]
              }}
            >
              {({ open }) => (
                <Button variant="outline" size="sm" onClick={() => open()}>
                  <Upload className="mr-2 h-4 w-4" /> 更換 Logo
                </Button>
              )}
            </CldUploadWidget>
            <p className="mt-4 text-[10px] text-slate-400 text-center">
              建議尺寸為 512x512px<br />支援 PNG, JPG, SVG
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}