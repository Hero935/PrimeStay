/**
 * AdminSystemBanner.tsx
 * Admin AIC v3 唯讀守護 Banner (Guardian Banner)
 * 當管理員進入「穿透模式」或「模擬組織」時顯示，確保操作安全。
 */
"use client";

import React from "react";
import { ShieldAlert, Eye, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSystemBannerProps {
  mode?: "READ_ONLY" | "PENETRATION" | "SIMULATION";
  targetOrg?: string;
}

export function AdminSystemBanner({ mode = "READ_ONLY", targetOrg }: AdminSystemBannerProps) {
  const config = {
    READ_ONLY: {
      icon: <Lock className="w-3.5 h-3.5" />,
      text: "SYSTEM_LEVEL: READ-ONLY ACCESS",
      bg: "bg-indigo-600",
      description: "You are in global audit mode. Mutations are restricted."
    },
    PENETRATION: {
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
      text: "VULNERABILITY_MODE: ACTIVE PENETRATION",
      bg: "bg-rose-600",
      description: `Intercepting Organization: ${targetOrg || "ROOT"}. Critical override enabled.`
    },
    SIMULATION: {
      icon: <Eye className="w-3.5 h-3.5" />,
      text: "IDENTITY_FLUX: LANDLORD SIMULATION",
      bg: "bg-amber-600",
      description: "Viewing interface as localized identity. Avoid data corruption."
    }
  }[mode];

  return (
    <div className={cn("flex items-center gap-4 px-6 h-10 w-full text-white shadow-2xl relative z-[100]", config.bg)}>
      <div className="flex items-center gap-2 font-mono font-black text-[10px] tracking-widest shrink-0 border-r border-white/20 pr-4">
        {config.icon}
        {config.text}
      </div>
      <div className="text-[10px] font-medium opacity-90 truncate italic">
        {config.description}
      </div>
      <div className="ml-auto flex items-center gap-4 shrink-0">
          <div className="text-[9px] font-mono opacity-50 uppercase tracking-tighter">Secure Link: AES-256-GCM</div>
          <button className="text-[10px] font-black uppercase text-white h-6 px-3 bg-white/10 hover:bg-white/20 rounded transition-colors">
            Exit Mode
          </button>
      </div>
    </div>
  );
}