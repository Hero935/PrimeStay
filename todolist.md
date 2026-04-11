# 📋 管理中心架構修正任務清單

## 🎯 目標
確保管理中心索引遵循「組織 > 房東 > 房源 > 房客」階層結構，並在所有使用者角色下保持一致的導航體驗。

## 🛠️ 任務進度
- [x] **建立任務清單**
- [x] **API 階層對齊**
    - [x] 修正 `LANDLORD` 角色起始點為其擁有的組織。
    - [x] 修正 `MANAGER` 角色起始點為其負責組織的房權。
    - [x] 確保 API 下轄內容符合規格映射表。
- [x] **UI 語意化與顯示優化**
    - [x] 實作 `getEntityIcon` 自動切換圖標。
    - [x] 實作動態標題與 Icon (下轄房東清單 / 旗下房源網格)。
    - [x] 修正 `ImpactAdvisor` 補全組織層級警告 (docs/roles.md#4)。
- [x] **邏輯與資料同步**
    - [x] 實作「成員清單」層級感知過濾 (不允許組織層級看到房客/經理)。
    - [x] 修正麵包屑 (Breadcrumbs) 的血緣路徑與類型對應。
    - [x] 解決 Lazy-loaded Node 在選取後右側網格暫時空白的問題。
- [x] **驗證與文件更新**
    - [x] 建立內容規格說明於 docs/roles.md。
    - [x] 修復 `ManagementViewWrapper` 渲染循環 Bug (Maximum update depth exceeded)。
    - [x] 更新 `report.md` 與任務完成進度。
    - [x] 更新 `readme.md`。
    
    ## 🚀 AIC Quick Cmd 治理增強 (待辦項)
    - [x] **組織級影響評估**
        - [x] 擴充 `GovernanceImpactAdvisor` 以支援方案降級的風險提示。
        - [x] 實作方案降級時的房源自動凍結預覽邏輯。
    - [x] **資源可視化 (Entity DNA)**
        - [x] 在 `QuickActionDrawer` 整合 `PlanUsageProgress` 顯示房源與成員配額。
        - [-] 為組織節點增加即時營收 (Monthly Revenue) 概覽小圖 (待後端統計 API 支援)。
    - [x] **深度治理功能**
        - [x] 實作組織層級之「一鍵停權 / 全域啟用」控制開關。
        - [x] 完成「診斷日誌」與「資源映射」按鈕的功能對接。
    
    ## 📌 規格參考
- 結構定義：`docs/roles.md#6`
- UI 映射表：`docs/roles.md#6.2`