# PrimeStay Admin Intelligence & Command (AIC) v3

## 專案描述
PrimeStay AIC v3 是 PrimeStay 租賃平台的管理端核心治理系統。本系統採用最新的「戰略診斷」架構，將傳統的後台管理介面提升為具備實時監控、成本預警與全域治理能力的戰略中樞。介面設計遵循「零滾動 (Zero-Scroll)」原則，確保管理員在 100vh 的單一視野內即可掌握全平台的營運脈動。

## 檔案結構
```text
c:\Scorpio\projects\PrimeStay
├── docs/                      # 系統開發與設計規範文件
│   ├── admin_v2_design_spec.md # AIC v3 治理與視覺詳盡規範
│   ├── ui_design_spec.md      # 全平台通用 UI/UX 規範
│   ├── roles.md               # 系統角色權限與停權政策 (SSOT)
│   └── management_integration_spec.md # 治理中心整合設計規範
├── src/
│   ├── app/admin/             # Admin 模組路由與頁面
│   ├── components/admin/      # AIC v3 特有高密度 UI 組件
│   └── components/invitations/# 統一邀請系統組件
├── spec.md                    # 組織與用戶管理技術規格
├── todolist.md                # 開發任務追蹤清單
├── report.md                  # 任務執行與階段完成報告
└── readme.md                  # 專案總覽說明 (本檔案)
```

## 使用技術
- **Frontend**: Next.js 14 (App Router), Tailwind CSS
- **UI Architecture**: shadcn/ui (Radix UI), Lucide Icons
- **Command & Control**: 全域指令列 (Cmd+K) 整合
- **Data Visualization**: Recharts (用於戰略熱圖)、互動式 Sparklines、預測性警戒組件
- **State Management**: React Hooks + LocalStorage (用於 Pinned Nodes 持久化)
- **Security**: OwnershipGuard (後端 API 所有權驗證機制)
- **Performance**: Layered Lazy Loading (節點分層加載)
- **Database**: PostgreSQL with Prisma ORM

## 檔案清單說明
| 檔案路徑 | 說明 |
| :--- | :--- |
| `src/components/admin/AdminAICShell.tsx` | AIC v3 核心三欄式布局殼層。 |
| `src/components/admin/AICDiagnostics.tsx` | 包含 MRR、DB 脈動、出租率熱圖等診斷組件。 |
| `src/components/admin/AICActionVault.tsx` | 右側命令與告警面板，整合統一邀請系統。 |
| `src/app/admin/layout.tsx` | Admin 路由層級配置，包含側邊欄預設狀態設置。 |
| `src/app/admin/management/page.tsx` | Nexus 整合資產索引 (Nexus Index) 入口。 |
| `src/components/management/ManagementTree.tsx` | 遞迴式管理樹，支援 **Pin 釘選**、狀態過濾器與分層延遲加載。 |
| `src/components/management/ManagementViewWrapper.tsx` | AIC 指揮中心主容器，整合 **診斷 DNA 一鍵修復**、互動式負載圖表。 |
| `src/components/management/CommandPalette.tsx` | 全域導航搜尋引擎，支援 Cmd+K 快速定位與跳轉。 |
| `src/app/api/management/batch/route.ts` | 批次治理 API，支援成員狀態的批量變更 (停權/恢復)。 |
| `docs/management_integration_spec.md` | 用於說明管理功能統合後的設計規範與 UML 操作流程。 |

## 安裝及執行方式
1. **依賴安裝**:
   ```powershell
   npm install
   ```
2. **資料庫同步 (重要)**:
   由於涉及到 `Organization.plan` 等新欄位，請執行資料庫推動以同步 Schema：
   ```powershell
   npx prisma db push
   ```
3. **啟動開發伺服器**:
   ```powershell
   npm run dev
   ```
4. **進入管理介面**:
   以具備 `ADMIN` 角色的帳號登入後，造訪 `/admin` 即可進入 AIC v3 治理中樞。