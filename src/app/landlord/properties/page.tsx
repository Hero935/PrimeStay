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
 * Landlord 視角，包含房源建立、編輯、刪除與管理員指派
 */
export default function PropertiesPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 表單狀態
  const [address, setAddress] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [type, setType] = useState("獨立套房");
  const [size, setSize] = useState("");
  const [rent, setRent] = useState("");
  const [deposit, setDeposit] = useState("");
  const [electricityFee, setElectricityFee] = useState("5");
  const [waterFee, setWaterFee] = useState("0");
  const [managementFee, setManagementFee] = useState("0");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 編輯模式狀態
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);

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

  /**
   * 提交新增或編輯房源
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingPropertyId 
        ? `/api/properties/${editingPropertyId}` 
        : "/api/properties";
      const method = editingPropertyId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: selectedOrgId,
          address,
          roomNumber,
          type,
          size,
          defaultRent: rent,
          defaultDeposit: deposit,
          defaultElectricityFee: electricityFee,
          defaultWaterFee: waterFee,
          defaultManagementFee: managementFee,
          photos,
        }),
      });

      if (res.ok) {
        toast.success(editingPropertyId ? "更新房源成功" : "新增房源成功");
        resetForm();
        fetchProperties(selectedOrgId);
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || (editingPropertyId ? "更新失敗" : "新增失敗"));
      }
    } catch (err) {
      toast.error("系統發生錯誤");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 刪除房源
   */
  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此房源嗎？這將無法復原。")) return;
    
    try {
      const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("房源已刪除");
        fetchProperties(selectedOrgId);
      } else {
        const data = await res.json();
        toast.error(data.error || "刪除失敗");
      }
    } catch (err) {
      toast.error("刪除時發生錯誤");
    }
  };

  /**
   * 進入編輯模式
   */
  const startEdit = (property: any) => {
    setEditingPropertyId(property.id);
    setAddress(property.address);
    setRoomNumber(property.roomNumber);
    setType(property.type);
    setSize(property.size.toString());
    setRent(property.defaultRent.toString());
    setDeposit(property.defaultDeposit?.toString() || "");
    setElectricityFee(property.defaultElectricityFee?.toString() || "0");
    setWaterFee(property.defaultWaterFee?.toString() || "0");
    setManagementFee(property.defaultManagementFee?.toString() || "0");
    setPhotos(property.photos);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * 重置表單
   */
  const resetForm = () => {
    setEditingPropertyId(null);
    setAddress("");
    setRoomNumber("");
    setType("獨立套房");
    setSize("");
    setRent("");
    setDeposit("");
    setElectricityFee("5");
    setWaterFee("0");
    setManagementFee("0");
    setPhotos([]);
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
        {/* 新增/編輯房源表單 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {editingPropertyId ? <Home className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {editingPropertyId ? "編輯房源物件" : "新增房源物件"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">基本地址 *</label>
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
                    <label className="text-xs font-semibold text-slate-500 uppercase">房號 *</label>
                    <input
                      type="text"
                      required
                      placeholder="如：A01"
                      className="w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">類型 *</label>
                    <select
                      required
                      className="w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="獨立套房">獨立套房</option>
                      <option value="分租套房">分租套房</option>
                      <option value="雅房">雅房</option>
                      <option value="整層住家">整層住家</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">坪數 *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="坪"
                      className="w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">預設月租金 *</label>
                    <input
                      type="number"
                      required
                      placeholder="TWD"
                      className="w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      value={rent}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRent(val);
                        // 僅在新增模式且押金為空時，自動計算預設押金 (2個月租金)
                        if (!editingPropertyId && val && !isNaN(Number(val))) {
                          setDeposit((Number(val) * 2).toString());
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">預設押金 *</label>
                    <input
                      type="number"
                      required
                      placeholder="TWD"
                      className="w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">預設管理費</label>
                    <input
                      type="number"
                      placeholder="TWD"
                      className="w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      value={managementFee}
                      onChange={(e) => setManagementFee(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">預設電費 (元/度)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="例如：5"
                      className="w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      value={electricityFee}
                      onChange={(e) => setElectricityFee(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">預設水費 (元/月)</label>
                    <input
                      type="number"
                      placeholder="例如：100"
                      className="w-full border rounded-lg p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      value={waterFee}
                      onChange={(e) => setWaterFee(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">上傳物件封面</label>
                  <CldUploadWidget
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "primestay_preset"}
                    onSuccess={(result: any) => {
                      setPhotos((prev) => [...prev, result.info.secure_url]);
                    }}
                    onError={(error: any) => {
                      console.error("Cloudinary Upload Error:", error);
                      toast.error("圖片上傳失敗");
                    }}
                    options={{
                      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                      maxFiles: 5,
                      clientAllowedFormats: ["png", "jpg", "jpeg"],
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

                <div className="flex gap-2">
                  {editingPropertyId && (
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={resetForm}
                    >
                      取消編輯
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className={`flex-1 ${editingPropertyId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900'}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "提交中..." : editingPropertyId ? "更新房源物件" : "建立房源物件"}
                  </Button>
                </div>
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
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm truncate flex items-center gap-1 flex-1">
                            <MapPin className="w-3 h-3 text-slate-400" /> {p.address}
                          </h4>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => startEdit(p)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 transition-colors"
                              title="編輯"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                            </button>
                            <button 
                              onClick={() => handleDelete(p.id)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-red-600 transition-colors"
                              title="刪除"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1"><Home className="w-3 h-3" /> {p.roomNumber}</span>
                          <span className="flex items-center gap-1"><Square className="w-3 h-3" /> {Number(p.size)} 坪</span>
                          <Badge variant="outline" className="text-[9px] px-1 h-4">{p.type}</Badge>
                        </div>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-sm font-bold text-blue-600 mt-2">${Number(p.defaultRent).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">/月</span></p>
                        <div className="text-[10px] text-slate-400 space-x-2">
                           {Number(p.defaultElectricityFee) > 0 && <span>⚡{Number(p.defaultElectricityFee)}/度</span>}
                           {Number(p.defaultWaterFee) > 0 && <span>💧{Number(p.defaultWaterFee)}</span>}
                        </div>
                      </div>
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