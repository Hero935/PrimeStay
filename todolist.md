# 📋 PrimeStay 項目開發進度表

## 1. 🏗️ 環境與基礎設施 (Environment & Infrastructure)
- [x] 初始化 Next.js 14 專案 (App Router, TypeScript, Tailwind CSS)
- [x] 配置 `prisma` 並定義資料模型 (User, Organization, Property, Contract, Billing, Payment, Maintenance)
- [x] 部署 PostgreSQL 資料庫到 Railway 並測試連線
- [x] 設定 Cloudinary 帳號與 API 存取權限

## 2. 🔐 身份認證與組織架構 (Auth & Org)
- [x] 整合 NextAuth.js (支援 Email/Password 與 Credentials Provider)
- [x] 實作多組織 (Organization) 資料隔離邏輯
- [x] 實作權認 Middleware，防範角色越權存取

## 3. 邀請碼與自動註冊流程 (Invitation System)
- [x] 實作 `Invitation` 資料表與 API
- [x] 開發生成邀請碼的功能 (支援不同角色：LANDLORD, MANAGER, TENANT)
- [x] 實作房客憑邀請碼註冊並「自動綁定」房源與租約的功能

## 4. 🏠 房源與租約管理 (Rental Management)
- [x] 開發房源 CRUD 並整合 Cloudinary 圖片上傳
- [x] 實作租約 (Contract) 管理與預設值自動計算邏輯
- [x] 設備清單 (Equipment List) 的 JSON 管理介面

## 5. 💰 帳單與財務流程 (Billing & Financials)
- [x] 實作定時生成帳單 (Billing) 的背景任務邏輯
- [x] 實作房客回報水電度數的介面
- [x] 整合 Cloudinary 用於房客上傳匯款憑證
- [x] 房東與代管的帳單「審核與撥款」流程

## 6. 🛠️ 維修申請系統 (Maintenance)
- [x] 實作房客提交維修單 (支援圖片上傳)
- [x] 開發房東回覆與維修進度追蹤 (PENDING, PROCESSING, COMPLETED)

## 7. 🚀 部署與產品化 (Deployment)
- [x] Railway 生產環境變數配置
- [x] 生成啟動本機伺服器的批次檔 (`start.bat`)
- [x] 生成 Git 忽略檔案 (`.gitignore`)
- [x] 撰寫 `README.md` (包含專案描述、安裝、執行方式)
- [x] 完成 `report.md` 結案報告
## 8. 🐛 Bug Fixes & Improvements
- [x] 修復房東控制台功能按鈕無反應的問題 (2026-04-03)
- [x] 修復 Cloudinary 前端環境變數缺失引起的 CldUploadWidget 崩潰 bug (2026-04-03)
- [x] 檢視項目現況並優化 .gitignore 配置 (2026-04-03)
- [x] 更新 `docs\db_design.md` 及 `docs\ui_design_spec.md` 設計文檔 (2026-04-03)
- [x] 根據 `spec.md` 規範更新 `docs\roles.md` 角色權限文檔 (2026-04-03)

## 9. 🔑 系統管理員功能 (Admin Panel) (2026-04-04)
- [x] 修正 `src/app/page.tsx`：ADMIN 登入後導向 `/admin`（原誤導向 `/landlord`）
- [x] 重構 `src/components/layout/AppSidebar.tsx`：依角色三分支顯示選單（ADMIN / 房東-代管 / 房客）
- [x] 新增 `src/app/admin/layout.tsx`：Admin 區路由保護 Layout
- [x] 新增 `src/app/admin/page.tsx`：系統儀表板（統計卡片、組織列表、待處理邀請）
- [x] 新增 `src/app/api/admin/stats/route.ts`：平行查詢 6 項統計的 API
- [x] 新增 `src/app/api/admin/organizations/route.ts`：組織完整資訊 API
- [x] 新增 `src/app/admin/organizations/page.tsx`：組織詳細管理頁（唯讀總覽）
- [x] 新增 `src/app/admin/invitations/page.tsx`：房東邀請記錄頁（含狀態統計）
- [x] 新增 `src/app/admin/settings/page.tsx`：系統設定頁（版本資訊、角色說明）
- [x] 新增 `src/app/admin/settings/GenerateLandlordInviteForm.tsx`：Client Component 產生邀請碼表單
- [x] 更新 `docs/ui_design_spec.md`：新增 4.0 系統管理員儀表板設計規格章節
- [x] 更新 `docs/roles.md`：記錄系統管理員對用戶狀態（停權/恢復）的管理權限規劃
- [x] 修復 `PATCH /api/landlord/organization`：修正 Prisma schema 欄位缺失導致的 500 錯誤
- [x] 修復 `GET /api/landlord/audit-logs`：修正 `prisma.auditLog` 未定義導致的 500 錯誤
- [x] 修復 `src/app/landlord/audit-logs/page.tsx`：修正 JSX 語法錯誤導致的編譯失敗
- [x] 修復房東房源管理：更新「新增房源」表單欄位以符合 `db_design.md` (2026-04-04)
- [x] 實作房源編輯與刪除功能：包含前端 UI 邏輯與後端 `api/properties/[id]` 介面 (2026-04-04)
- [x] 修復房源詳情 API：處理 Next.js 16 非同步 `params` 導致的 500 錯誤 (2026-04-04)
- [x] 修復 Cloudinary 上傳失敗問題：將 `uploadPreset` 同時作為屬性與 `options` 參數傳遞，並加強錯誤診斷日誌 (2026-04-04)
- [x] 修復房源指派 API：處理 Next.js 15+ 非同步 `params` 並解決 Prisma `auditLog` 類型缺失問題 (2026-04-04)
- [x] 修復房東儀表板成員管理：實作「邀請代管人員」與「邀請房客」功能，包含對話框組件、邀請碼生成與邀請列表管理/撤銷 (2026-04-04)
- [x] 修復房東儀表板數據顯示：修正「總預估營收」為寫死假資料的問題，改為動態從資料庫加總活躍租約租金 (2026-04-04)