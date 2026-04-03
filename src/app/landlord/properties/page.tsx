"use client";

import { useState, useEffect } from "react";
import { CldUploadWidget } from "next-cloudinary";

/**
 * 房源管理頁面
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
      console.error("載入組織失敗");
    }
  };

  const fetchProperties = async (orgId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/properties?organizationId=${orgId}`);
      const { data } = await res.json();
      setProperties(data || []);
    } catch (err) {
      console.error("載入房源失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
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
        alert("新增成功！");
        setAddress("");
        setRoomNumber("");
        setPhotos([]);
        fetchProperties(selectedOrgId);
      }
    } catch (err) {
      alert("新增失敗");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">房源管理</h1>
        <select
          className="border p-2 rounded-md shadow-sm"
          value={selectedOrgId}
          onChange={(e) => setSelectedOrgId(e.target.value)}
        >
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 新增房源表單 */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-xl font-bold mb-4">新增房源</h2>
          <form onSubmit={handleAddProperty} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">地址</label>
              <input
                type="text"
                required
                className="mt-1 block w-full border rounded-md p-2 focus:ring-primary"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">房號</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border rounded-md p-2"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">坪數</label>
                <input
                  type="number"
                  className="mt-1 block w-full border rounded-md p-2"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">預設月租金</label>
              <input
                type="number"
                className="mt-1 block w-full border rounded-md p-2"
                value={rent}
                onChange={(e) => setRent(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">房源照片</label>
              <CldUploadWidget
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "primestay_preset"}
                onSuccess={(result: any) => {
                  setPhotos((prev) => [...prev, result.info.secure_url]);
                }}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-primary hover:text-primary transition-colors"
                  >
                    上傳照片
                  </button>
                )}
              </CldUploadWidget>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {photos.map((url, idx) => (
                  <img key={idx} src={url} alt="Room" className="w-full h-20 object-cover rounded shadow-sm" />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-2 rounded-md font-bold hover:bg-opacity-90 transition-opacity"
            >
              建立房源物件
            </button>
          </form>
        </div>

        {/* 房源列表 */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold">現有房源 ({properties.length})</h2>
          {loading ? (
            <p>載入中...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {properties.map((p) => (
                <div key={p.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {p.photos[0] ? (
                      <img src={p.photos[0]} alt="Room" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">NO IMG</div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{p.address}</h4>
                    <p className="text-sm text-gray-600">房號: {p.roomNumber} | {p.type}</p>
                    <p className="text-sm font-semibold text-primary mt-1">租金: ${Number(p.defaultRent).toLocaleString()}</p>
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold ${p.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.status === 'AVAILABLE' ? '待出租' : '已出租'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}