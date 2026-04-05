"use client";

import { useState, useEffect } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

interface RevenueChartProps {
  data: { month: string; amount: number }[];
}

/**
 * 房東營收趨勢圖
 * 採用響應式設計，適配手機與桌面端，支援動畫效果
 */
export function RevenueChart({ data }: RevenueChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  // 確保在客戶端掛載後才渲染圖表，避免寬高計算錯誤的警告
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        className="h-[300px] w-full mt-4 bg-slate-100/50 animate-pulse rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs"
      >
        加載圖表中...
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] mt-4 relative">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 15,
            left: -20,
            bottom: 10,
          }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94A3B8', fontSize: 11 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94A3B8', fontSize: 11 }}
          />
          <Tooltip
            formatter={(value: any) => [`$${Number(value).toLocaleString()}`, "營收"]}
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)'
            }}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#3B82F6"
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}