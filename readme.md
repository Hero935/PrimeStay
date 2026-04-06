# 🏠 PrimeStay - 專業房產租賃管理平台 (SaaS 版)

PrimeStay 是一款專為房東、代管業者設計的一站式房務管理系統。提供靈活的 SaaS 訂閱模型，讓管理從一間套房成長到大型代管公司都能得心應手。

## 🚀 核心功能 (Featured Capabilities)

*   **多層級角色管理 (RBAC)**: 支援系統管理員 (Admin)、房東 (Landlord)、代管人員 (Manager) 與房客 (Tenant)。
*   **SaaS 訂閱模型**: 基於組織 (Organization) 的計費邏輯，包含 Free、Starter、Pro 三種方案，自動實作房源配額限制。
*   **公開房源探索**: 提供未登入用戶瀏覽公開房源，並具備敏感資訊遮蔽保護。
*   **安全 API 防護**: 內建 `withAuth` 權限守衛，即時攔截停權帳號與非法越權存取。
*   **智能分配系統**: 房東可靈活將房源管理權限指派給特定的代管人員。

## 🛠 使用技術 (Tech Stack)

*   **框架**: Next.js 15+ (App Router)
*   **資料庫**: PostgreSQL (透過 Prisma ORM)
*   **身份驗證**: NextAuth.js
*   **UI 元件**: Tailwind CSS + Shadcn UI + Lucide Icons
*   **圖片託管**: Cloudinary (具備簽名安全上傳)

## 📁 檔案結構 (Project Structure)

```text
src/
├── app/
│   ├── api/             # API 路由
│   │   ├── properties/  # 房源管理與詳情
│   │   └── user/        # 用戶組織與方案升級
│   ├── properties/      # 公開展示頁面 (Explore, Detail)
│   ├── landlord/        # 房東/代管專屬後台
│   └── pricing/         # 方案訂閱選擇頁面
├── components/          # 共享 UI 元件
├── hooks/               # 自定義 React Hooks
└── lib/                 # 工具函式 (Prisma, API Guards)
```

## 📋 檔案清單與說明

| 檔案名稱 | 說明 |
| :--- | :--- |
| `src/lib/api-guards.ts` | 通用 API 權限包裝器，負責登入、角色與狀態檢查。 |
| `src/app/properties/explore/page.tsx` | 公開房源探索中心。 |
| `src/app/properties/[id]/page.tsx` | 混合權限房源詳情頁，訪客僅能看到非敏感資訊。 |
| `src/app/pricing/page.tsx` | 方案購買與升級模擬頁面。 |
| `src/components/layout/PlanUsageProgress.tsx` | 用於 Sidebar 的方案配額監控元件。 |
| `src/app/api/user/organizations/upgrade/route.ts` | 方案升級後的資料同步 API。 |

## ⚙️ 安裝與執行 (Installation)

1. **環境變數設定**: 複製 `.env.example` 為 `.env` 並填寫資料庫連結、NextAuth 密鑰與 Cloudinary 配置。
2. **安裝依賴**:
   ```bash
   npm install
   ```
3. **資料庫迁移**:
   ```bash
   npx prisma db push
   ```
4. **啟動開發環境**:
   ```bash
   npm run dev
   ```

---
*本案已建立 Checkpoint: 完成 SaaS 基礎建設與公開瀏覽閉環。*