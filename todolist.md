# 📋 PrimeStay 任務清單

## 🏗️ 基礎架構
- [x] 建立資料庫模型 (Prisma Schema)
- [x] 初始化 Next.js 專案架構
- [x] 設定 TypeScript 配置 (tsconfig.json)

## 🔐 認證與授權
- [x] 實作 NextAuth 認證
- [x] 實作 API 權限檢查機制 (api-guards.ts)

## 📊 管理員功能 (Admin Intelligence & Command)
- [x] 實作後台統計 API (`/api/admin/stats`)
- [x] 優化 MRR 計算邏輯與配置抽離
- [x] 實作全平台用戶管理功能 (含搜尋、封禁治理)
- [x] 實作組織訂閱方案管理 (強制升降級 API & UI)

## 🏢 組織與房源管理
- [ ] 實作組織樹狀結構 API
- [ ] 實作房源建立與方案額度檢查邏輯

## ⚡ 系統優化
- [x] 配置全域定價常數 (`src/lib/constants.ts`)
- [x] 重新產生 Prisma Client 以同步 Schema 變動
## 📁 AIC v3 治理模組優化 (Strategic Governance Phase)
- [x] 重構 /admin/organizations 為「組織手術台」，導入出租率視覺化預警與參數同步篩選。
- [x] 重構 /admin/users 為「治安監控終端」，強化一鍵全域停權與風險標籤治理。
- [x] 重構 /admin/invitations 為「創世門戶」，支援官方雙角色招募與方案預綁定功能。
- [x] 重構 /admin/settings 為「戰略參數中控室」，導入 Feature Flags 與 Threshold 閾值控制台。