# 👑 系統管理員治理中樞 UI 設計規範 (admin_ui_design_spec.md)

## 1. 定義與願景
本文件定義系統管理員 (`SYSTEM_ADMIN`) 的介面規範，專注於「上帝視角」的全平台監控與治理。
- **核心角色行為**: 參閱 [`docs/roles.md`](docs/roles.md) 1.1 節及 7.1 節 (上帝視角)。
- **開發規範依據**: 遵循 [`docs/ui_design_spec.md`](docs/ui_design_spec.md) 的基礎配色與元件型態。

## 2. 佈局結構 (Nexus Shell)
管理員介面由 `AdminAICShell` 封裝，提供高權限操作的視覺緩衝與安全標示。

- **側邊收納導航 (Sidebar)**: 
  - 頂部顯示「PrimeStay Admin」標誌。
  - 功能選單：概覽 (Dashboard)、地圖/組織管理、邀請發送、稽核日誌、系統設定。
- **治理操作抽屜 (Action Vault)**: 
  - 介面右側提供常駐或快捷呼叫的 `QuickActionDrawer`，用於快速停權用戶或調整組織方案。
- **麵包屑導航**: [`spec.md`](spec.md) 中規範的階層路徑，例如：`管理員 / 組織管理 / [組織名稱]`。

## 3. 核心頁面設計

### 3.1 治理儀表板 (Audit Dashboard)
- **全平台指標卡片 (Global Stats)**: 
  - 總組織數、總活躍用戶、本月平台營收總計 (Gross Revenue)。
  - 採用 [`ui_design_spec.md`](docs/ui_design_spec.md) 2.1 節的 `Blue 500` 主色。
- **異常活動預警 (AIC Diagnostics)**: 
  - 顯示最近 24 小時內「高頻報修」或「大額欠費」的組織警告訊息。

### 3.2 組織治理中心 (Organization Management)
- **組織清冊 (Tree View)**: 
  - 支援 [`roles.md`](docs/roles.md) 6.2 節所述的深度向上彙總統計。
  - 列表顯示：組織名稱、擁有者 (Owner)、目前訂閱方案、房源總數。
- **方案變更 (Plan Manager)**: 
  - 提供專屬對話框 (`OrgPlanManager`)，可即時調整該組織的訂閱等級 (Starter / Pro / Elite)。

### 3.3 全平台用戶管理 (Global User Control)
- **跨組織搜索**: 可依 Email、姓名、系統角色搜尋全平台所有帳號。
- **生命週期管理 (UserStatusToggle)**: 
  - 視覺化開關：`ACTIVE` (綠色) / `SUSPENDED` (紅色)。
  - 停權後依照 [`roles.md`](docs/roles.md) 第 4 節邏輯，自動於 UI 標示其名下資產為隱藏。

### 3.4 創世邀請 (Genesis Entry)
- **邀請發送介面**:
  - 設定：Email、目標角色 (Landlord / Manager)、預設方案。
  - 生成 `Genesis Link`：符合 [`roles.md`](docs/roles.md) 3.1 節流程，點擊連結即建立組織。
- **邀請進度追蹤**: 顯示「已發送」、「已兌換」、「已過期」狀態。

## 4. 尚未實作及設計建議 (Next Steps & Recommendations)

1.  **AIC 智慧診斷儀表板 (Intelligent Diagnostics)**: 
    - *建議*: 實作 `AICDiagnostics` 元件，串接 AI 偵測異常現金流或重複報修請求。
2.  **大圖釘地圖視角 (Global Map View)**: 
    - *建議*: 在組織管理中加入地圖分佈，顯示目前平台房源分佈密集度。
3.  **治理日誌深度搜索 (Audit Deep Search)**: 
    - *未實作*: 目前僅有基礎日誌清單，建議增加「對象追蹤」視圖，可點擊單一用戶查看其所有歷史操作。
4.  **全平台通知公告 (Broadcast System)**:
    - *建議*: 在頂部工具列增加廣播功能，Admin 可發送全平台停機或維護公告。

## 5. 現況設計與文檔核心差異 (Core Discrepancies)

- **多組織切換**: `roles.md` 提到 Manager 可加入多個組織，但目前 Admin UI 的「組織治理」主要還是單向列表，缺乏「用戶擁有的組織」之反向關聯視圖。
- **Genesis 流程自動化**: 目前程式實作中，註冊後自動初始化組織的邏輯已具備，但在 UI 上的「建立者」發起感不強，建議強化 `GenesisInviteModal` 的方案預設視覺。