# 🛡️ PrimeStay Admin Intelligence & Command (AIC) - 終極治理設計規範 (v3)

## 1. 治中心定位：決策情報與全域掌舵
Admin AIC (v3) 是一個集「商業診斷」、「成本監控」、「成員治理」於一身的高級指令終端。

### 1.1 三大核心認知 (Intelligence)
*   **財務收支門戶 (The Ledger)**：
    - **成本監控**：Database 資料量趨勢、Cloudinary 儲存與 CDN 水位（防止維運成本失控）。
    - **營收監控**：SaaS MRR 月經常性收入、方案分佈比。
*   **生態健康診斷 (Diagnostic)**：
    - **出租率警示 (Occupancy)**：主動標記出租率 < 40% 的房東 (流失預警)。
    - **流量脈動 (Visitor Traffic)**：跨區域訪客進站量 (獲客先行指標)。
*   **系統行為洞察 (Insights)**：
    - **即時日誌流 (System Timeline)**：整合全系統關鍵標籤行為 (簽約、報修、欠費)。

### 1.2 三大治理權限 (Control)
*   **全域身分控制**：跨組織 Cmd+K 搜尋、一鍵全平台停權 (Global Ban)。
*   **資源與訂閱治理**：強制變更組織方案等級、配額重置。
*   **創世級邀請系統**：組合式發送 [房東/代管] 專屬邀請，預設資源池。

---

## 2. 佈局與視覺：明亮專業戰略板 (Bright Professional Dashboard)

### 2.1 零滾動三欄架構 (Zero-Scroll Three-Column)
鎖定屏高至 100vh，各區塊局部滾動，確保戰略紅線永遠在視野內。

1.  **[左] 微導航 (Micro Sidebar)**：包含具備 **動態告警角標** 的 Icon 導航。
2.  **[中] 診斷核心區 (Pulse Area)**：
    - **配色規範**：背景色 `bg-slate-50/50`，卡片 `bg-white` 搭配 `shadow-sm`，強調色 `text-indigo-600`。
    - **收支概覽 (Revenue/Cost Bar)**：今日營收與底層設施支出對比。
    - **健康熱圖 (Heatmap Cards)**：組織健康狀態。
    - **訪客動脈 (Traffic Pulse)**：24H 平台流量折線。
3.  **[右] 管理行動面板 (Action Vault)**：
    - **即時系統日誌 (Audit Stream)**：顯示帶有行為標籤的系統脈動。
    - **告警區 (Alerts)**：DB 容量、欠費、出租率低落警告。

### 2.2 交互與安全保護 (UX & Safeguards)
*   **二次確認保護 (Deletions & Bans)**：執行危險操作時顯示完整影響清單（如預計受影響的房客數）。
*   **磨砂玻璃質感 (Glassmorphism)**：組件邊框極細，數據呈現具備深度。

---

## 3. 技術組件定義
- `StatMiniSparkline`: 指標旁極小化的趨勢折線。
- `OrganizationHeatMapCard`: 點擊後開啟 Action Drawer。
- `ActionAuditFeed`: 具備快速操作入口的人員異動流。

---

## 4. 模組治理定位 (Module Universe)

### 4.1 組織實體治理 (Organization Registry - /admin/organizations)
*   **定位**：手術台 (Operation Table)。用於對特定的營運實體進行精確的「方案調整」與「配額重置」。
*   **核心功能**：全量搜尋、訂閱等級維護、JSON 基礎設施快照。

### 4.2 全域資產中樞 (The Nexus - /admin/management)
*   **定位**：全域架構導航儀 (Architect Explorer)。用於觀察跨組織、地理區域的資產血緣關係。
*   **建議設計**：採用 Tree-view 或圖譜視圖，下鑽至「房東-房源-房客」級聯節點。

### 4.3 身份與行為治理 (Security - /admin/users)
*   **定位**：治安監控終端 (Police Terminal)。專注於「人」的行為合規與全域風險控管。
*   **建議設計**：引入行為風險評分、全域停權 (Global Ban) 影響力評估。

### 4.4 創世入駐門戶 (The Genesis - /admin/invitations)
*   **定位**：擴張門戶 (Expansion Portal)。決定生態系增長的起點。
*   **建議設計**：包含方案預設配額發放、入駐轉換率 (Conversion Rate) 視覺化。

### 4.5 戰略參數中控室 (Control Room - /admin/settings)
*   **定位**：系統心臟 (Command Control Room)。管理全平台運行的核心門檻。
*   **建議設計**：功能旗標 (Feature Flags)、全域費率閾值調整、緊急維護廣播入口。

---

## 5. 跳轉與聯動邏輯 (Deep Linking & Coordination)
*   **診斷至行動**：首頁 (`/admin`) 的「出租率預警」點擊後應跳轉至 `/admin/organizations?status=warning`。
*   **實體至行為**：在組織管理中點擊負責人，應跳轉至 `/admin/users` 並過濾該用戶的所有行為日誌。