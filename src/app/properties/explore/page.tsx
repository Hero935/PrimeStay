"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Home, Square, ArrowRight, ImageIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

/**
 * 公開房源探索頁面 (Visitor View)
 * 供未登入用戶查看可用房源，隱藏敏感資訊
 */
export default function ExplorePropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPublicProperties();
  }, []);

  /**
   * 獲取公開房源資料
   */
  const fetchPublicProperties = async () => {
    setLoading(true);
    try {
      // 串接公開搜尋 API
      const res = await fetch("/api/properties?public=true");
      const result = await res.json();
      if (result.success) {
        setProperties(result.data || []);
      } else {
        toast.error(result.error || "無法載入房源");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("系統錯誤，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  // 過濾搜尋結果 (前端簡易過濾)
  const filteredProperties = properties.filter(p => 
    p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 頂部英雄導航區 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              探索您的下一個理想居所
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              PrimeStay 為您精選優質租屋，專業代管，讓租房變得簡單透明。
            </p>
            
            <div className="max-w-xl mx-auto mt-8 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
              <Input 
                placeholder="搜尋區域、道路或房源類型..." 
                className="pl-10 h-12 text-md shadow-sm border-slate-200 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 內容區 */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            精選物件 ({filteredProperties.length})
          </h2>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none">
              全部地區
            </Badge>
            <Badge variant="outline" className="text-slate-500">
              待出租
            </Badge>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[400px] rounded-xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((p) => (
              <Link key={p.id} href={`/properties/${p.id}`}>
                <Card className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer bg-white rounded-xl">
                  {/* 房源圖片 */}
                  <div className="aspect-[4/3] relative overflow-hidden">
                    {p.photos?.[0] ? (
                      <img 
                        src={p.photos[0]} 
                        alt={p.address} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                        <ImageIcon size={48} />
                      </div>
                    )}
                    
                    {/* 標籤 */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                       <Badge className="bg-white/90 backdrop-blur-sm text-slate-900 hover:bg-white border-none shadow-sm">
                         {p.type}
                       </Badge>
                    </div>

                    <div className="absolute bottom-4 left-4">
                       <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-lg font-bold shadow-lg">
                         ${Number(p.defaultRent).toLocaleString()} <span className="text-xs font-normal opacity-80">/ 月</span>
                       </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-lg text-slate-900 line-clamp-1 flex-1">
                          {p.address}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-4 text-slate-500 text-sm">
                        <span className="flex items-center gap-1">
                          <Square size={14} /> {Number(p.size)} 坪
                        </span>
                        <span className="flex items-center gap-1 text-slate-300">|</span>
                        <span className="flex items-center gap-1">
                          <Home size={14} /> {p.roomNumber}
                        </span>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <MapPin size={12} /> 專業機構代管
                        </span>
                        <span className="text-blue-600 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                          查看詳情 <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {filteredProperties.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <div className="bg-white p-8 rounded-full inline-block mb-4 shadow-sm">
                  <Search size={40} className="text-slate-200" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">找不到相符的房源</h3>
                <p className="text-slate-500">試試看不同的關鍵字，或是瀏覽其他區域。</p>
                <Button variant="outline" className="mt-6" onClick={() => setSearchTerm("")}>
                  清除搜尋
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 底部行動呼籲 */}
      {!loading && properties.length > 0 && (
        <section className="bg-slate-900 text-white py-20 mt-12">
          <div className="max-w-4xl mx-auto text-center px-4 space-y-6">
            <h2 className="text-3xl font-bold">成為 PrimeStay 的一員</h2>
            <p className="text-slate-400 text-lg">
              不論您是房東想更輕鬆管理資產，還是房客想尋找高品質租屋，我們都為您準備好了。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/api/auth/signin">立即登入</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10" asChild>
                <Link href="/contact">聯繫客服</Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
