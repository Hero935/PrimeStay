"use client";

import { useState, useEffect } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Home, MapPin, Square, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { ManagerAssignment } from "./ManagerAssignment";

/**
 * 房源管理頁面
 * Landlord 視角，包含房源建立與管理員指派
 */
export default function PropertiesPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 表單狀態
  const [address, setAddress] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [type, setType] = useState("套房");
  const [size, setSize] = useState("");
  const [rent, setRent] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrgId) {
      fetchProperties(selectedOrgId);
    }
  }, [selectedOrgId]);

  const fetchOrganizations = async () => {
    try {
      const res = await fetch("/api/user/organizations");
      const { data } = await res.json();
      setOrganizations(data || []);
      if (data && data.length > 0) {
        setSelectedOrgId(data[0].id);
      }
    } catch (err) {
      toast.error("載入組織失敗");
    }
  };

  const fetchProperties = async (orgId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/properties?organizationId=${orgId}`);
      const { data } = await res.json();
      setProperties(data || []);
    } catch (err) {
      toast.error("載入房源失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: selectedOrgId,
          address,
          roomNumber,
          type,
          size,
          defaultRent: rent,
          photos,
        }),
      });

      if (res.ok) {
        toast.success("新增房源成功");
        setAddress("");
        setRoomNumber("");
        setPhotos([]);
        setSize("");
        setRent("");
        fetchProperties(selectedOrgId);
      } else {
        toast.error("新增失敗：內容不完整或權限不足");
      }
    } catch (err) {
      toast.error("系統發生錯誤");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">房源管理</h1>
          <p className="text-slate-500">管理您的物件與代管分派</p>
        </div>
        <div className="flex items-center gap-2">
          {organizations.length > 1 && (
            <select
              className="border p-1 text-sm rounded shadow-sm bg-white"
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 新增房源表單 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-4 h-4" /> 新增房源物件
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddProperty} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">基本地址</label>
                  <input
                    type="text"
                    required
                    placeholder="例如：台北市信義區忠孝東路..."
                    className="w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">房號</label>
                    <input
                      type="text"
                      required
                      placeholder="如：A01"
                      className="w-full border rounded-lg p-2 text-sm"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">坪數</label>
                    <input
                      type="number"
                      placeholder="坪"
                      className="w-full border rounded-lg p-2 text-sm"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">預設月租金</label>
                  <input
                    type="number"
                    placeholder="TWD"
                    className="w-full border rounded-lg p-2 text-sm"
                    value={rent}
                    onChange={(e) => setRent(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">上傳物件封面</label>
                  <CldUploadWidget
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "primestay_preset"}
                    onSuccess={(result: any) => {
                      setPhotos((prev) => [...prev, result.info.secure_url]);
                    }}
                  >
                    {({ open }) => (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => open()}
                        className="w-full border-dashed border-2 py-8 flex flex-col gap-2"
                      >
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                        <span className="text-xs text-slate-400">點擊或拖放照片到此處</span>
                      </Button>
                    )}
                  </CldUploadWidget>
                  <div className="grid grid-cols-4 gap-2">
                    {photos.map((url, idx) => (
                      <div key={idx} className="aspect-square rounded-md overflow-hidden border">
                        <img src={url} alt="Room" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-slate-900"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "建立中..." : "建立房源物件"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* 房源列表 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
               <Home className="w-5 h-5 text-slate-400" />
               現有房源 ({properties.length})
            </h2>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {[1, 2, 3, 4].map(i => <Card key={i} className="h-48 animate-pulse bg-slate-100" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-900">
              {properties.map((p) => (
                <Card key={p.id} className="overflow-hidden bg-white hover:shadow-md transition-shadow">
                  <div className="flex h-36">
                    <div className="w-1/3 bg-slate-100 relative">
                      {p.photos[0] ? (
                        <img src={p.photos[0]} alt="Room" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                           <ImageIcon />
                        </div>
                      )}
                      <Badge className="absolute top-2 left-2 text-[10px]" variant={p.status === 'AVAILABLE' ? 'default' : 'secondary'}>
                        {p.status === 'AVAILABLE' ? '待出租' : '已出租'}
                      </Badge>
                    </div>
                    <CardContent className="w-2/3 p-4 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-sm truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {p.address}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1"><Home className="w-3 h-3" /> {p.roomNumber}</span>
                          <span className="flex items-center gap-1"><Square className="w-3 h-3" /> {Number(p.size)} 坪</span>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-blue-600 mt-2">${Number(p.defaultRent).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">/月</span></p>
                    </CardContent>
                  </div>
                  {/* 分派功能 */}
                  <div className="px-4 pb-4">
                    <ManagerAssignment 
                       propertyId={p.id} 
                       currentManagerId={p.managerId} 
                       onAssigned={() => fetchProperties(selectedOrgId)} 
                    />
                  </div>
                </Card>
              ))}
              {properties.length === 0 && (
                <div className="col-span-full py-12 text-center bg-white border border-dashed rounded-xl border-slate-200">
                   <p className="text-slate-400 text-sm italic">尚無房源物件，請從左側新增。</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}