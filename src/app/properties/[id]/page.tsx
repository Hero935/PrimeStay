"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, Home, Square, ArrowLeft, ArrowRight,
  MessageSquare, Phone, ShieldCheck,
  ChevronLeft, ChevronRight, ImageIcon, Crown
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

/**
 * 房源詳情頁面 (公開/登入混合視角)
 * 根據權限顯示不同程度的資訊
 */
export default function PropertyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    if (id) fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${id}`);
      const result = await res.json();
      if (result.success) {
        setProperty(result.data);
      } else {
        toast.error(result.error || "找不到該房源");
        router.push("/properties/explore");
      }
    } catch (err) {
      toast.error("系統錯誤");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-pulse space-y-8">
      <div className="h-10 w-32 bg-slate-200 rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-[500px] bg-slate-200 rounded-xl" />
        <div className="h-[400px] bg-slate-200 rounded-xl" />
      </div>
    </div>
  );

  if (!property) return null;

  const isPublicPreview = property.isPublicPreview;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* 返回導航 */}
        <Button variant="ghost" className="mb-6 group" asChild>
          <Link href="/properties/explore">
            <ArrowLeft className="mr-2 size-4 group-hover:-translate-x-1 transition-transform" /> 返回探索
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側：圖片與詳情 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm ring-1 ring-slate-200">
              {/* 大圖輪播模擬 */}
              <div className="aspect-video relative bg-slate-100">
                {property.photos?.[activePhoto] ? (
                  <img 
                    src={property.photos[activePhoto]} 
                    alt="Property" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ImageIcon size={64} />
                  </div>
                )}
                
                {property.photos?.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between px-4">
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="rounded-full bg-white/80 backdrop-blur"
                      onClick={() => setActivePhoto(prev => (prev > 0 ? prev - 1 : property.photos.length - 1))}
                    >
                      <ChevronLeft />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="rounded-full bg-white/80 backdrop-blur"
                      onClick={() => setActivePhoto(prev => (prev < property.photos.length - 1 ? prev + 1 : 0))}
                    >
                      <ChevronRight />
                    </Button>
                  </div>
                )}

                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                  {activePhoto + 1} / {property.photos?.length || 0}
                </div>
              </div>

              {/* 縮圖列表 */}
              <div className="p-4 flex gap-2 overflow-x-auto">
                {property.photos?.map((url: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhoto(idx)}
                    className={`size-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${activePhoto === idx ? 'border-blue-600 scale-95' : 'border-transparent opacity-60'}`}
                  >
                    <img src={url} className="w-full h-full object-cover" alt="Thumb" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm ring-1 ring-slate-200 space-y-8">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge className="bg-blue-600 hover:bg-blue-600">{property.type}</Badge>
                  <Badge variant="outline" className={property.status === 'AVAILABLE' ? 'text-green-600 border-green-200 bg-green-50' : 'text-slate-400'}>
                    {property.status === 'AVAILABLE' ? '待出租' : '已出租'}
                  </Badge>
                  {property.organization?.plan === "PRO" && (
                    <Badge className="bg-amber-500 text-white border-none shadow-sm flex items-center gap-1">
                      <Crown className="size-3" /> PRO
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{property.address}</h1>
                <p className="text-slate-500 flex items-center gap-1">
                  <MapPin className="size-4" /> 此房源由 {property.organization?.name} 專業管理
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-slate-100">
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-medium">坪數</p>
                  <p className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Square size={18} className="text-blue-500" /> {Number(property.size)} 坪
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-medium">房號</p>
                  <p className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Home size={18} className="text-blue-500" /> {property.roomNumber}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-medium">身分核驗</p>
                  <p className="text-lg font-bold text-green-600 flex items-center gap-2">
                    <ShieldCheck size={18} /> 已認證
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-medium">租金</p>
                  <p className="text-lg font-bold text-blue-600">
                    ${Number(property.defaultRent).toLocaleString()}<span className="text-[10px] text-slate-400 font-normal">/月</span>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-xl">房源描述</h3>
                <p className="text-slate-600 leading-relaxed">
                  這是一個精心維護的 {property.type}，位於優質區域。
                  內部空間約 {property.size} 坪，通風採光良好。
                  由專業機構營運，提供完善的物業管理服務，確保您的居住品質。
                  {isPublicPreview && (
                    <span className="block mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm italic">
                      登入後可查看更詳細的費用資訊、合約範本以及預約看房。
                    </span>
                  )}
                </p>
              </div>

              {/* 費用詳情 (僅限登入成員可見) */}
              {!isPublicPreview && (
                <div className="space-y-4 pt-4">
                  <h3 className="font-bold text-xl">費用細節</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border space-y-2">
                      <p className="text-sm font-semibold text-slate-500">水電與管理</p>
                      <ul className="text-sm space-y-1 text-slate-700">
                        <li>⚡ 電費：{property.defaultElectricityFee} 元 / 度</li>
                        <li>💧 水費：{property.defaultWaterFee} 元 / 月</li>
                        <li>🏢 管理費：{property.defaultManagementFee} 元 / 月</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border space-y-2">
                      <p className="text-sm font-semibold text-slate-500">簽約押金</p>
                      <ul className="text-sm font-bold text-blue-600">
                        <li>💰 預設押金：${Number(property.defaultDeposit).toLocaleString()} 元</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右側：聯繫與操作 */}
          <div className="space-y-6">
            <Card className="rounded-2xl border-none shadow-sm ring-1 ring-slate-200 sticky top-8">
              <CardContent className="p-8 space-y-6">
                <div className="text-center pb-6 border-b">
                  <p className="text-sm text-slate-400 mb-1">月租金</p>
                  <p className="text-4xl font-extrabold text-blue-600">
                    ${Number(property.defaultRent).toLocaleString()}
                  </p>
                </div>

                {isPublicPreview ? (
                  <div className="space-y-4 pt-2">
                    <p className="text-xs text-center text-slate-500">
                      您目前以「訪客身份」預覽，聯繫方式已受限
                    </p>
                    <Button className="w-full h-12 bg-slate-900 border-2 border-slate-900 hover:bg-white hover:text-slate-900 transition-all font-bold group" asChild>
                      <Link href="/auth/signin">
                        登入後聯繫房東 <ArrowRight className="ml-2 size-4" />
                      </Link>
                    </Button>
                    <div className="grid grid-cols-2 gap-3 opacity-30 pointer-events-none">
                      <Button variant="outline" className="h-12"><Phone className="mr-2 size-4" /> 致電</Button>
                      <Button variant="outline" className="h-12"><MessageSquare className="mr-2 size-4" /> 傳訊</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border">
                      <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {property.manager?.name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{property.manager?.name}</p>
                        <p className="text-xs text-slate-400">房源管理專員</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="h-12 hover:bg-blue-50 border-blue-200 text-blue-700">
                        <Phone className="mr-2 size-4" /> 致電
                      </Button>
                      <Button className="h-12 bg-blue-600 hover:bg-blue-700">
                        <MessageSquare className="mr-2 size-4" /> 傳訊
                      </Button>
                    </div>
                    <Button className="w-full h-12 bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 font-bold">
                      立即租屋申請
                    </Button>
                  </div>
                )}

                <div className="bg-slate-50 rounded-xl p-4 text-[10px] text-slate-400 space-y-2">
                  <p className="flex items-center gap-1 uppercase tracking-wider font-bold text-[9px] text-slate-500">
                    <ShieldCheck className="size-3" /> PrimeStay 交易保障
                  </p>
                  <p>透過平台簽約可享有第三方支付租金代收服務、合約法律顧問與維修仲裁保障。</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
