# 🏠 PrimeStay - 高端租屋代管平台

PrimeStay 是一個專為高端租賃市場設計的租屋代管系統，旨在簡化房東、代管人員與租客之間的協作流程。透過自動化帳單生成、邀請碼註冊機制以及完善的維修報修系統，提供專業且高效的管理體驗。

## 🌟 專案描述

本系統支援多組織（Organization）架構，並針對不同用戶角色提供精確的權限控管：
- **平台管理員**: 全系統概覽與運維。
- **房東 (Landlord)**: 組織擁有者，負責房源、人員與財務審核。
- **代管人員 (Manager)**: 協助管理房源、租約與帳單催收。
- **租客 (Tenant)**: 查看租約、上傳繳費憑證、提交度數與報修申請。

## 🛠️ 使用技術

- **前端/後端框架**: [Next.js 14 (App Router)](https://nextjs.org/)
- **程式語言**: TypeScript
- **資料庫 ORM**: [Prisma](https://www.prisma.io/)
- **資料庫**: PostgreSQL
- **身份認證**: [NextAuth.js](https://next-auth.js.org/)
- **UI 組件庫**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI + Tailwind CSS)
- **雲端儲存**: [Cloudinary](https://cloudinary.com/) (照片與憑證管理)
- **樣式**: Tailwind CSS

## 📂 檔案結構

```text
PrimeStay/
├── docs/               # 專案設計文件 (資料庫、UI、角色規範)
├── prisma/             # 資料庫 Schema 與 Seed 腳本
├── src/
│   ├── app/            # Next.js App Router (頁面與 API)
│   │   ├── api/        # 後端 API 端點
│   │   ├── landlord/   # 房東管理後台
│   │   ├── tenant/     # 租客端介面
│   │   └── (auth)/     # 登入與註冊流程
│   ├── components/     # 共用 UI 組件
│   ├── hooks/          # 自定義 React Hooks
│   └── lib/            # 工具函式與第三方庫配置 (Auth, Prisma, Cloudinary)
├── public/             # 靜態資源
└── spec.md             # 系統功能規格說明書
```

## 📋 檔案清單說明

| 檔案/目錄 | 說明 |
| :--- | :--- |
| [`src/app/api/`](src/app/api) | 包含認證、房源、租約、帳單、邀請碼與維修等 API 邏輯 |
| [`src/app/landlord/`](src/app/landlord) | 房東與代管專用的儀表板、房源管理、帳單審核頁面 |
| [`src/app/tenant/`](src/app/tenant) | 租客專用的租約查看、繳費回報與報修頁面 |
| [`src/lib/cloudinary.ts`](src/lib/cloudinary.ts) | Cloudinary SDK 配置與圖片處理工具 |
| [`src/lib/auth.ts`](src/lib/auth.ts) | NextAuth 策略設定 (含 Role-based Session) |
| [`prisma/schema.prisma`](prisma/schema.prisma) | 資料實體模型定義 (ER Model) |
| [`start.bat`](start.bat) | 本機開發環境啟動批次檔 |
| [`spec.md`](spec.md) | 詳細的系統流程、UML 圖表與權限規範 |
| [`report.md`](report.md) | 任務完成總結報告 |

## 🚀 安裝及執行方式

### 1. 環境準備
確保您的電腦已安裝 [Node.js](https://nodejs.org/) (建議 v18 以上) 與 PostgreSQL 服務。

### 2. 下載與安裝
```bash
# 安裝相依套件
npm install
```

### 3. 環境變數設定
複製 `.env.example` 為 `.env` 並填入必要的資訊：
- `DATABASE_URL`: PostgreSQL 連線字串
- `NEXTAUTH_SECRET`: NextAuth 加密金鑰
- `CLOUDINARY_URL`: Cloudinary API 配置
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: Cloudinary 空間名稱

### 4. 資料庫初始化
```bash
# 推送 Schema 並產生 Prisma Client
npx prisma db push

# (選填) 執行種子資料
npm run seed
```

### 5. 啟動服務
您可以使用以下指令啟動開發伺服器：
```bash
npm run dev
```
或者在 Windows 環境下直接執行：
```cmd
start.bat