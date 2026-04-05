# 邀請功能整合任務清單

## 階段 1: 基礎邏輯與通用組件建立
- [x] 建立 `src/hooks/use-invitation.ts`：整合 API 呼叫、複製邏輯與載入狀態
- [x] 建立 `src/components/invitations/InviteResultView.tsx`：用於顯示生成後的邀請碼與複製按鈕
- [x] 建立 `src/components/invitations/InviteFormContent.tsx`：負責渲染角色特定的選擇表單（如組織或房源）

## 階段 2: 房東端 (Landlord) 重構
- [x] 重構 `src/app/landlord/members/InviteMemberDialog.tsx`：使用通用 Hook 與組件
- [x] 確保房員管理頁面功能正常

## 階段 3: 管理員端 (Admin) 重構與整合
- [x] 修改 `src/app/admin/settings/page.tsx`：將現有的 `GenerateLandlordInviteForm` 替換為觸發 `InviteDialog` 的按鈕
- [x] 移除或廢棄原本的 `src/app/admin/settings/GenerateLandlordInviteForm.tsx`

## 階段 4: 測試與文件更新
- [x] 驗證 Admin 邀請 Landlord 流程
- [x] 驗證 Landlord 邀請 Manager/Tenant 流程
- [x] 更新 `readme.md` 描述新的組件結構
- [x] 撰寫任務完成報告 `report.md`

## 階段 5: 房東儀表板數據實作 (Dashboard Data Implementation)
- [x] 更新 `docs/ui_design_spec.md` 營收趨勢與最近動態規格
- [x] 更新 `spec.md` Dashboard 實作細節
- [x] 建立 `GET /api/landlord/stats/revenue` API
- [x] 修改 `RevenueChart.tsx` 以串接真實數據並加入動畫效果
- [x] 重構 `src/app/landlord/page.tsx` 串接 Server Side 營收趨勢與「最近動態」數據
- [x] 建立房東儀表板數據實作 Checkpoint (重要任務完成)
- [x] 修復 Recharts ResponsiveContainer 在 Next.js 中的寬高計算警告 (-1/-1 錯誤)