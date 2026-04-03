# 🏠 PrimeStay - 高端租屋代管平台

## 專案描述
PrimeStay 是一個專為多組織代管公司設計的高端租屋管理平台。系統支援房東建立組織、管理代管人員、上傳房源圖片、生成租約邀請碼，並讓租客能透過邀請碼自動註冊並綁定房源，實現一站式的收租、報修與合約管理。

## 檔案結構
```text
/c:/Scorpio/projects/PrimeStay
├── prisma/               # 資料庫定義與種子資料
│   ├── schema.prisma     # ERD 模型定義
│   ├── seed.ts           # 測試資料腳本 (Prisma 7 Driver Adapter 版本)
├── src/
│   ├── app/              # Next.js App Router (頁面與 API)
│   │   ├── api/          # 核心業務邏輯 APIs (Auth, Invitations, Properties, Contracts, Billings, etc.)
│   │   ├── landlord/     # 房東管理後台頁面
│   │   ├── tenant/       # 租客個人面板頁面
│   │   ├── register/     # 憑邀請碼註冊頁面 (Suspense 封裝)
│   │   └── login/        # 統一登入頁面
│   ├── components/       # 可複用 UI 組件
│   ├── lib/              # 工具函式 (Prisma Client, Auth Options)
│   └── middleware.ts     # RBAC 權限控管中心 (處理角色路由過濾)
├── prisma.config.ts      # Prisma 7+ 核心設定檔
├── spec.md               # 系統規格、流程圖、ERD 文件
├── report.md             # 任務完成進度報告
└── todolist.md           # 專案實作清單
```

## 使用技術
- **Frontend**: Next.js 14 (App Router), Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js (JWT Strategy)
- **ORM**: Prisma 7.6.0
- **Database Driver Adapter**: @prisma/adapter-pg (用於雲端 SSL 相容)
- **Database**: PostgreSQL (Aiven/Railway)
- **Image Cloud**: Cloudinary
- **Runtime Environment**: Node.js 20+

## 檔案清單與簡短說明
1. **`prisma/schema.prisma`**: 定義多屬性關係模型，包含組織(Org)與用戶(User)的多對多架構。
2. **`src/middleware.ts`**: 基於 NextAuth Token 實作三層角色權限攔截。
3. **`src/app/api/auth/register/route.ts`**: 具備資料庫交易(Transaction)的註冊流程，確保帳號、邀請碼與組織關係同步建立。
4. **`src/app/landlord/properties/page.tsx`**: 整合 `next-cloudinary` Upload Widget，實現房源圖片雲端管理。
5. **`prisma/seed.ts`**: 適用於 Prisma 7 的獨立種子腳本，用於快速建立開發測試環境。

## 安裝及執行方式

### 1. 安裝依賴
```powershell
npm install
```

### 2. 環境變數設定 (.env)
請在根目錄建立 `.env` 並填入以下必要的連線參數：
```env
DATABASE_URL="postgresql://avnadmin:password@host:port/defaultdb?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
```

### 3. 資料庫初始化與同步
```powershell
npx prisma generate
npx prisma db push
```

### 4. 執行開發環境
```powershell
npm run dev
```

### 5. 運行種子資料 (初始化測試帳號)
```powershell
npx tsx --env-file=.env prisma/seed.ts
```
* 預設測試房東帳號：`landlord@test.com` / `password123`

## 專案維護與擴展
本專案已完成核心架構，未來可擴展功能：
- 對接金流 API 進行自動對帳
- 整合 Email SMTP 發送房客帳單通知
- 擴充 Platform Admin 全系統管控面板