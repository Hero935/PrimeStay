# 🚀 PrimeStay 管理後台 (Admin Management) 最終實作狀態清單

## 0. UI/UX 佈局優化 (Layout Optimization)
- [x] **桌面版佈局強化 (Admin Shell Enhancements)**:
    - [x] **側邊面板折疊 (Action Vault Toggle)**：實作桌面版右側「行動面板」與「稽核面板」的切換顯示功能。
    - [x] **動態動畫切換**：使用 `transition-all` 實作平滑的寬度折疊動畫 (300ms)。
    - [x] **狀態持久化**：於 `AdminAICShell` 中管理 `isVaultOpen` 狀態，並提供對應圖標 (`PanelRightClose`/`PanelRightOpen`)。

## 1. 核心指令功能 (Core Command System)
- [x] **快速管理 (AIC Quick Command)**:
    - [x] **節點偵測模組**：實作 `node.type` 過濾，僅限「組織與人員」操作（避免對房源執行停權）。
    - [x] **側拉面板 (Drawer)**：建立 `QuickActionDrawer` 組件提供一站式操作。
    - [x] **指令執行反饋**：點擊「全域停權」或「調整方案」後由 `alert` 模擬系統發出戰略指令確認，解決點擊無效感。
    - [x] **UI 辨識度優化**：停權按鈕修正為「紅底白字 (Rose-600)」並加上陰影增強層次，解決原配色辨識困難問題。
- [x] **數據報告 (Strategic Analysis)**：
    - [x] **實體路徑跳轉**：點擊後根據節點（組織/房源）跳轉至對應管理頁面並開新分頁。
    - [x] **按鈕動態過濾**：自動識別節點屬性，僅在具備數據意義（組織/房源）時顯示按鈕。

## 2. 診斷與監控 (Diagnostics & Monitoring)
- [x] **執行全網掃描 (Full Network Scan)**：
    - [x] **異步掃描模擬**：點擊後進入 0~100% 進度加載與 Loading 狀態。
    - [x] **數據脈動 (Data Pulse)**：實作掃描時數據（Utilization/Latency）隨機抖動動畫，模擬實時偵測。
    - [x] **診斷建議更新**：掃描完成後自動產出新的預測性 `Advisor insight` 字句。
- [x] **血緣感知 (Nexus Lineage)**：
    - [x] 實作 DNA 血緣麵告屑，顯示「組織 > 房東 > 房源」之層級關係。

## 3. 資產與成員視圖 (Asset & Member View)
- [x] **組織樹狀導航 (Nexus Index Tree)**：實作對接 `/api/management/tree`，支援多層級遞迴展開。
- [x] **成員清單 (Users Tab)**：自動提取選中節點及其子項內的所有授權成員並扁平化顯示。
- [x] **關聯實體 (Entities Tab)**：以高密度網格呈現所有下層資產。

## 4. 系統整合建議 (Infrastructure Integration)
- [ ] **API 遷移**：將模擬 `handleStartScan` 對接至 `/api/admin/diagnostics` 真實負載監控。
- [ ] **稽核串接**：將「快速管理」操作與資料庫 `AuditLog` 權限層級正式掛鉤。