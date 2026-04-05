# 🎨 PrimeStay UI/UX 高規格設計規範 (ui_design_spec.md)

## 1. 設計願景與目標
本文件旨在為 PrimeStay 平台提供一套「高端、專業、直覺」的視覺與交互規範。
- **目標用戶**: 平台管理員 (Admin)、房東、物業管理員、高端房客。
- **核心價值**: 信任感、效率、跨設備無縫銜接。
- **優先順序**: 行動端體驗優先 (Mobile First) > 數據視覺化 > 簡約美學。

## 2. 視覺風格指南 (Visual Style Guide)

### 2.1 配色方案 (Color Palette)
建議使用冷靜且具備質感的黑色與深藍色系，搭配金色或土耳其藍作為點綴色。
- **Primary**: `#0F172A` (Slate 900) - 導航與主要背景。
- **Secondary**: `#3B82F6` (Blue 500) - 主要動作、連結、選中狀態。
- **Accent**: `#F59E0B` (Amber 500) - 重要提醒、金錢、高品質象徵。
- **Background**: `#F8FAFC` (Slate 50) - 通用底色。
- **Success**: `#10B981` (Emerald 500) - 已繳費、已維修。
- **Danger**: `#EF4444` (Red 500) - 逾期、報修中。

### 2.2 字體規範 (Typography)
- **繁體中文**: `Inter`, `Noto Sans TC`, system-ui.
- **標題**: `font-bold`, `tracking-tight`, 使用 Inter 提升現代感。
- **內文**: `text-slate-600`, 優化行高 (`leading-relaxed`) 以提升閱讀性能。

### 2.3 陰影與圓角 (Elevation & Border Radius)
- **圓角**: 大量使用 `rounded-xl` (12px) 或 `rounded-2xl` (16px) 以呈現現代軟性風格。
- **陰影**: 使用 `shadow-sm` 於平時，`hover:shadow-md` 於交互時。避免濃重黑影。

---

## 3. 佈局策略 (Layout Strategy)

### 3.1 PC 端 (Desktop Layout) - 管理高效化
- **側邊收納導航 (Collapsible Sidebar)**:
  - 提供完整功能的文字標籤。
  - 頂部包含組織切換器 (Organization Switcher)。
- **頂部工具列 (Top Navigation)**:
  - 麵包屑導航 (Breadcrumbs)。
  - 全域搜索 (Cmd+K)。
  - 通知中心 (Notifications) 與用戶選單。
- **內容區**: 寬度限制在 `max-w-7xl`，採用多欄式佈局。

### 3.2 手機端 (Mobile Layout) - 觸控便利化
- **底部導航列 (Bottom Navigation)**:
  - 核心 4-5 個功能點：首頁、房源/租約、帳單、設定。
- **抽屜操作 (Bottom Drawers)**:
  - 所有的「新增」、「編輯」操作皆從底部彈出抽屜，方便大拇指操作。
- **卡片堆疊 (Stacked Cards)**:
  - 將表格轉換為資訊卡片。

---

## 4. 核心頁面設計規範

### 4.0 系統管理員儀表板 (Admin Dashboard)

> 此頁面僅限 `systemRole === "ADMIN"` 的平台管理員存取，路由為 `/admin`。
> 管理員不屬於任何組織，負責監控整個平台的健康狀態與初始化房東帳號。

#### 4.0.1 首頁儀表板 (`/admin`)

- **全平台統計卡片（頂部 4 格）**：
  - 🏢 **組織數量**：目前在平台上運作的 Organization 總數。
  - 👤 **活躍成員數**：具有 `LANDLORD` 或 `MANAGER` 角色的使用者總數。
  - 🏠 **房源總數**：全平台所有 Property 的數量（含空屋 / 出租中 / 維修中）。
  - 🔴 **異常告警數**：逾期帳單 (`OVERDUE`) 與超過 7 天未處理報修 (`PENDING`) 的總數，以紅色醒目顯示。

- **組織列表（中間卡片式列表）**：
  - 顯示所有組織名稱、房東姓名、房源數、入住房客數、組織建立日期。
  - 點擊可進入各組織唯讀詳情頁。

- **待處理邀請（右側邊欄）**：
  - 顯示已發送但尚未被房東接受的邀請連結及其有效期倒數。

- **系統最近操作日誌（底部 Timeline）**：
  - 顯示關鍵系統事件，例如：租約建立、帳單核銷、房東首次登入等。
  - 以時間軸 (Timeline) 形式由新至舊排列，最多顯示最近 20 筆。

#### 4.0.2 側邊欄導航設計 (Admin Sidebar)

系統管理員的側邊欄選單與房東 / 租客**完全分離**，所有路由指向 `/admin/*`：

| 選單項目 | Lucide Icon | 路由 |
| :--- | :--- | :--- |
| 系統儀表板 | `LayoutDashboard` | `/admin` |
| 組織管理 | `Building2` | `/admin/organizations` |
| 用戶管理 | `Users` | `/admin/users` |
| 房東邀請 | `Mail` | `/admin/invitations` |
| 系統設定 | `Settings` | `/admin/settings` |

**導向與連結規則**：
- **嚴格導向**：使用者以 `ADMIN` 身份登入後，根路徑 (`/`) 必須透過 `src/app/page.tsx` 絕對重導向至 `/admin`。
- **防止跨區**：ADMIN 角色之所有選單與內部連結，**禁止出現**非 `/admin` 開頭之路徑（例如禁止指向 `/landlord`）。
- **設定頁面路徑**：全平台系統設定統一使用 `/admin/settings`。
- [`src/middleware.ts`](src/middleware.ts) 已設定 `/admin/:path*` 路由需驗證角色，非 ADMIN 將被導回 `/`。

#### 4.0.3 頁面交互設計細節

- **唯讀 Banner**：管理員在查看各組織的帳單或修繕詳情時，頁面頂端顯示藍色 Banner：
  > ℹ️ 您正以管理員身份檢視此資料，部分操作（如核銷帳單）需由該組織房東執行。
- **告警角標**：當異常告警數 > 0 時，「系統儀表板」選單 Icon 顯示紅色數字角標。
- **全平台搜尋**：頂部搜尋欄支援以 Email 或電話號碼跨組織查找特定使用者。
- **邀請連結管理**：
  - 提供「產生新邀請」按鈕，輸入預計房東的 Email，產生專屬邀請連結並設定 7 天有效期。
  - 已使用 / 已過期的邀請以不同顏色標示，並支援手動撤銷。

#### 4.0.4 錯誤防護 (Safeguards)

- 管理員**不可**直接修改組織內的租約、帳單或報修單，所有互動均為唯讀。
- 刪除組織前必須顯示二次確認 Modal，並列出該組織所有受影響的房客與合約。
- 無法以管理員身份代替房東生成房客邀請碼（僅能發送房東邀請）。

---

### 4.1 房東儀表板 (Landlord Dashboard)
- **視覺化數據**:
  - 顶部 4 個快訊卡片 (總營收、空房數、待處理報修、逾期帳單)。
  - 中間區塊：**營收趨勢圖 (Revenue Trend Chart)**
    - **圖表類型**: 使用 `Recharts` 的 `AreaChart` (面積圖) 以呈現增長感。
    - **數據範圍**: 顯示最近 6 個月的「已核銷總收益」(Billing 狀態為 `COMPLETED`)。
    - **交互設計**:
      - 滑鼠懸停 (Hover) 需顯示 Tooltip，包含月份與精確金額。
      - Y 軸金額自動縮寫 (如 10k, 50k)。
      - 圖表過渡動畫時間 500ms。
- **待辦任務清單**: 顯示「急需處理」項目。
  - **急需處理卡片**: 整合未處理報修與逾期帳單的快捷入口。
  - **最近動態 (Recent Activities)**:
    - **資料來源**: 查詢 `AuditLog` 中屬於該組織的最近 10 筆記錄。
    - **顯示內容**:
      - 使用 Lucide 圖標區分動作類型 (如 `Building` 代表房源異動, `Receipt` 代表帳單)。
      - 顯示「誰」執行了「什麼操作」以及「相關物件」。
      - 顯示相對時間 (如：3 分鐘前、昨天)。

#### 4.1.1 側邊欄導航 (Landlord Sidebar)

| 選單項目 | Lucide Icon | 路由 | 說明 |
| :--- | :--- | :--- | :--- |
| 總覽 | `LayoutDashboard` | `/landlord` | |
| 房源管理 | `Home` | `/landlord/properties` | |
| 成員管理 | `Users` | `/landlord/members` | 管理團隊與房客 |
| 帳單核銷 | `Receipt` | `/landlord/billings` | |
| 維修工單 | `Wrench` | `/landlord/maintenances` | |
| 操作日誌 | `History` | `/landlord/audit-logs` | 監督 Manager |
| 組織設定 | `Settings` | `/landlord/settings` | 僅限 Landlord (Owner) |

#### 4.1.2 成員管理中心 (Member Center)

- **分頁標籤 (Tabs)**:
  - **代管團隊 (Managers)**: 列出組織內所有 Manager，顯示其「負責房源數量」。
  - **房客列表 (Tenants)**: 列出所有房客，可依房源篩選。
- **邀請按鈕**:
  - 「邀請代管人員」：輸入 Email，發送邀請連結。
  - 「邀請房客」：需先選擇欲分派之房源，再產生邀請碼。
- **人員操作**: 支援「停權」、「移除」與「查看操作紀錄」。

#### 4.1.3 房源分派介面 (Assignment UI)

- **房源詳情頁面增補**:
  - 顯示「負責代管人員」區塊。
  - 提供「更改代管人員」按鈕，彈出清單供房東指派。
  - **權責溢位**: 若未指定 Manager，則顯示「⚠️ 此房源目前由您親自管理」。

#### 4.1.4 組織設定 (Organization Settings)

- **基本資訊編輯**:
  - 修改「組織名稱」(Organization Name)。
  - 更新「聯絡電話」、「服務 Email」。
- **品牌設定**:
  - 上傳「組織 Logo」(用於產生租約範本或報表)。
- **安全帳戶**:
  - 變更房東個人密碼、設定二次驗證。

### 4.2 房客行動端中心 (Tenant Mobile Hub) - 深度設計
房客端介面採取完全的行動優先設計，模擬原生 App 的流暢感。

#### 4.2.1 首頁 (Dashboard) 視覺階層
- **動態狀態條 (Status Bar)**: 顯示目前租約狀態 (例如：`✅ 租約進行中` 或 `⚠️ 帳單待繳`)。
- **核心指標卡片 (Core Hero)**:
    - 顯示「本月應繳總額」大字體。
    - 包含快速撥號/傳訊給代管人員的捷徑。
- **進度追蹤 (Progress Timeline)**: 以水平軸線顯示報修進度，讓房客無需點擊即可知道「工人已出發」。

#### 4.2.2 帳單與支付交互流程 (Mobile Billing Workflow)
1. **主動通知期**: 系統推播通知，首頁帳單卡片變為 Amber (警告色)。
2. **水電度數回報**:
    - 點擊「輸入度數」彈出底部抽屜 (Bottom Drawer)。
    - 使用大型數字鍵盤，並提供「上次回報數值」作為參考。
3. **憑證上傳**:
    - 串接 Cloudinary 拍照功能。
    - 上傳後顯示 Lottie 動畫 (打勾)，提供成功回饋感。

#### 4.2.3 沉浸式報修體驗 (Maintenance UX)
- **視覺化分類**: 使用大型 Icon (水電、電器、結構、其他) 供房客快速選擇。
- **相機直連**: 支援直接開啟手機相機連拍，並自動加上浮水印 (確保真實性)。
- **即時狀態**: 報修單狀態變更時，透過介面顏色變化 (灰色 PENDING -> 藍色 PROCESSING -> 綠色 COMPLETED) 提供視覺反饋。

#### 4.2.4 房源與合約管理
- **虛擬鑰匙看板**: 展示房源地址、房間號、大門密碼 (如果適用)。
- **數位合約檢視**: 支援 PDF 直接預覽，並以展開/縮合清單 (Accordion) 條列租約條款。

### 4.3 帳單管理 (Billing Management)
- **狀態標籤**: 採用高對比背景色的軟角標籤。
- **交互**: 點擊帳單列可側開查看明細與匯款收據圖片。

---

## 5. 技術實作路徑 (Technical Roadmap)

### 5.1 元件庫選型
- **Frontend**: `Next.js 14+ (App Router)`, `Tailwind CSS`.
- **UI Framework**: `shadcn/ui` (基於 Radix UI)。
- **Icons**: `Lucide React`。
- **Charts**: `Recharts`。
- **Animations**: `Framer Motion` (用於微交互，如頁面切換、抽屜滑出)。
- **Form Management**: `React Hook Form` + `Zod`.

### 5.2 Responsive UML (響應式組件邏輯)
```mermaid
graph TD
    App[Next.js App] --> Layout{Detect Device/Width}
    Layout -- desktop --> DesktopShell[Sidebar + TopNav]
    Layout -- mobile --> MobileShell[BottomNav + Header]
    
    DesktopShell --> MainContent[Max-w-7xl Padding-8]
    MobileShell --> MainContent[Full-width Padding-4]
    
    MainContent --> Components[Reusable UI Cards]
```

## 6. 使用者體驗細節 (UX Micromoments)
- **Skeleton Loading**: 使用 `Skeleton` 元件取代傳統 Loading Spinner，提升感知速度。
- **Optimistic UI**: 提交報修或上傳憑證後立即顯示「處理中」狀態。
- **Pull-to-refresh**: 行動端下拉更新資料。
- **Empty States**: 沒資料時顯示 `EmptyState` 元件，包含引導按鈕。
- **Toast Notifications**: 使用 `Sonner` 或 `shadcn/ui toast` 提示操作結果。

## 7. 狀態顏色對照表 (Status Color Mapping)

| 模組 | 狀態 (Enum) | 顏色變數 | 說明 |
| :--- | :--- | :--- | :--- |
| **Property** | `AVAILABLE` | `Success` | 待租中 |
| | `RENTED` | `Primary` | 已出租 |
| | `UNDER_MAINTENANCE`| `Danger` | 維修中不可租 |
| **Billing** | `PENDING_TENANT` | `Accent` | 待房客填寫度數/上傳 |
| | `PENDING_APPROVAL` | `Blue-500` | 待房東審核 |
| | `COMPLETED` | `Success` | 已結案 |
| **Maintenance**| `PENDING` | `Slate-400` | 已報修待處理 |
| | `PROCESSING` | `Blue-500` | 進行中 |
| | `COMPLETED` | `Success` | 已修復 |
| | `CANCELLED` | `Slate-200` | 已取消 |