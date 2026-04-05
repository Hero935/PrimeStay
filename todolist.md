# 邀請功能整合任務清單

## 階段 1: 基礎邏輯與通用組件建立
- [ ] 建立 `src/hooks/use-invitation.ts`：整合 API 呼叫、複製邏輯與載入狀態 [-]
- [ ] 建立 `src/components/invitations/InviteResultView.tsx`：用於顯示生成後的邀請碼與複製按鈕 [ ]
- [ ] 建立 `src/components/invitations/InviteFormContent.tsx`：負責渲染角色特定的選擇表單（如組織或房源） [ ]

## 階段 2: 房東端 (Landlord) 重構
- [ ] 重構 `src/app/landlord/members/InviteMemberDialog.tsx`：使用通用 Hook 與組件 [ ]
- [ ] 確保房員管理頁面功能正常 [ ]

## 階段 3: 管理員端 (Admin) 重構與整合
- [ ] 修改 `src/app/admin/settings/page.tsx`：將現有的 `GenerateLandlordInviteForm` 替換為觸發 `InviteDialog` 的按鈕 [ ]
- [ ] 移除或廢棄原本的 `src/app/admin/settings/GenerateLandlordInviteForm.tsx` [ ]

## 階段 4: 測試與文件更新
- [ ] 驗證 Admin 邀請 Landlord 流程 [ ]
- [ ] 驗證 Landlord 邀請 Manager/Tenant 流程 [ ]
- [ ] 更新 `readme.md` 描述新的組件結構 [ ]
- [ ] 撰寫任務完成報告 `report.md` [ ]