"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Command, Building2, Home, User, ShieldCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  name: string;
  type: string;
  subtitle: string;
}

interface CommandPaletteProps {
  onSelect: (id: string, name: string) => void;
}

/**
 * CommandPalette: 全域指令列組件
 * 提供 Cmd+K 快速搜尋與跳轉功能
 */
export function CommandPalette({ onSelect }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 監聽快捷鍵 Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // 搜尋邏輯 (Debounced)
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const handler = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/management/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
        setSelectedIndex(0);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    onSelect(result.id, result.name);
    setIsOpen(false);
    setQuery("");
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-slate-900/40 backdrop-blur-sm transition-all animate-in fade-in duration-200"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 搜尋列 */}
        <div className="flex items-center px-4 py-3 border-b gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400"
            placeholder="搜尋組織、房源、租客... (Type to search)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                setSelectedIndex((prev) => (prev + 1) % (results.length || 1));
              } else if (e.key === "ArrowUp") {
                setSelectedIndex((prev) => (prev - 1 + results.length) % (results.length || 1));
              } else if (e.key === "Enter" && results[selectedIndex]) {
                handleSelect(results[selectedIndex]);
              } else if (e.key === "Escape") {
                setIsOpen(false);
              }
            }}
          />
          <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-[10px] text-slate-400 font-medium">
            <Command className="w-3 h-3" /> K
          </div>
        </div>

        {/* 結果清單 */}
        <div className="max-h-[300px] overflow-y-auto p-2">
          {isLoading && results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
              <span className="text-xs text-slate-400 font-medium">Searching Nexus Data...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((result, index) => (
                <button
                  key={`${result.id}-${index}`}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all",
                    selectedIndex === index ? "bg-slate-100" : "hover:bg-slate-50"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-md",
                    result.type === "organization" ? "bg-slate-900 text-white" :
                    result.type === "property" ? "bg-blue-100 text-blue-600" :
                    "bg-slate-100 text-slate-600"
                  )}>
                    {result.type === "organization" ? <Building2 className="w-3.5 h-3.5" /> :
                     result.type === "property" ? <Home className="w-3.5 h-3.5" /> :
                     <User className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{result.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{result.subtitle}</p>
                  </div>
                  {selectedIndex === index && (
                    <span className="text-[10px] font-black text-slate-300">ENTER</span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 opacity-40">
              <Command className="w-8 h-8 mb-2" />
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                {query.length >= 2 ? "No results matched" : "Start typing to search"}
              </p>
            </div>
          )}
        </div>

        {/* 底部說明 */}
        <div className="px-4 py-2 border-t bg-slate-50 flex items-center justify-between">
            <div className="flex gap-4">
                <span className="text-[9px] text-slate-400 flex items-center gap-1">
                    <kbd className="px-1 border rounded bg-white">↑↓</kbd> Navigate
                </span>
                <span className="text-[9px] text-slate-400 flex items-center gap-1">
                    <kbd className="px-1 border rounded bg-white">↵</kbd> Select
                </span>
                <span className="text-[9px] text-slate-400 flex items-center gap-1">
                    <kbd className="px-1 border rounded bg-white">esc</kbd> Close
                </span>
            </div>
            <span className="text-[9px] font-black text-slate-300 tracking-tighter italic">Nexus Governance</span>
        </div>
      </div>
    </div>
  );
}