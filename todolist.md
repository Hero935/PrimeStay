# 🚀 任務清單：整合式組織與用戶管理實作 (Integrated Tree Management)

## Phase 1: 基礎架構與數據準備 (Backend)
- [ ] 建立 `GET /api/admin/management/tree` 端點 (ADMIN 專用)
- [ ] 建立 `GET /api/landlord/management/tree` 端點 (LANDLORD/MANAGER 專用)
- [ ] 實作資料過濾邏輯：
    - [ ] ADMIN: 遞迴查詢全系統所有 Organization, Property, Manager, Tenant。
    - [ ] LANDLORD: 固定根節點為所屬 Organization，並載入底下所有資料。
    - [ ] MANAGER: 只載入其負責的 Property 分支，隱藏其他無權限房源。
- [ ] 統一 API 返回格式為 `React Arborist` 相容的 `children` 遞迴結構。
- [ ] 撰寫 API 單元測試，確保 role-based filtering 正確。

## Phase 2: 管理樹 UI 組件開發 (Frontend - PC)
- [ ] 安裝 `react-arborist` 函式庫
- [ ] 建立 `ManagementTree` 主組件 (Next.js Client Component)
- [ ] 實作 `CustomNodeRenderer`，視覺化區分：
    - [ ] Organization (🏢)
    - [ ] Landlord (👤)
    - [ ] Property (🏠) - 串接狀態顯示 (綠/藍/紅)
    - [ ] Manager (🛠️)
    - [ ] Tenant (🔑) - 顯示合約倒數
- [ ] 整合 `Shadcn UI` 的右側詳情面板 (Side Panel)

## Phase 3: 手機端響應式優化 (Frontend - Mobile)
- [ ] 使用 `Responsive Drawer` (Vaul) 實作手機端的節點操作介面。
- [ ] 優化手機橫向與縱向的樹狀層級展示邏輯 (由多欄改為鑽取模式)。

## Phase 4: 高級互動功能
- [ ] 實作節點搜尋與實時過濾功能。
- [ ] 加入 `Framer Motion` 動態展開與收合動畫。
- [ ] 實作節點右鍵選單 (Context Menu)：
    - [ ] 快速停權/復權
    - [ ] 快速發送簡訊/Email 給房客
    - [ ] 指派 Manager。

## Phase 5: 驗收與報告
- [ ] 撰寫 `report.md` 最終報告。
- [ ] 更新 `readme.md` 中的檔案描述與系統架構圖。
- [ ] 建立里程碑 Checkpoint。

---
*狀態: [ ]待處理 [-]進行中 [x]已完成*