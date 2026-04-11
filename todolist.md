# 📋 PrimeStay 治理中心整合計畫任務清單

## 🏗️ 規劃與文件
- [x] 檢視 `docs/roles.md` 並評估整合影響
- [x] 更新 `spec.md` 以反映情境感知治理與風險告知規格
- [x] 重構 `spec.md`：移除重複的 Role 定義並引用 `docs/roles.md`

## 💻 核心實作 - /admin/management
- [x] **`ManagementViewWrapper.tsx` 重構**
    - [x] 將右側 Diagnostic 區塊改造為 `CommandVault`
    - [x] 實作節點類型識別邏輯 (Node Type Context)
    - [x] 實作 `GovernanceImpactAdvisor` 組件，根據選中節點角色顯示停權後的連鎖影響
- [x] **`ManagementTree.tsx` 優化**
    - [x] 調整燈號顏色邏輯：`SUSPENDED` 狀態變為灰色物理熄滅感
    - [x] 強化 `SUSPENDED` 節點文字的灰階與刪除線處理
- [x] **治理功能移植**
    - [x] 整合 `OrgPlanManager` 到 `CommandVault` (組織選取時)
    - [x] 整合 `UserStatusToggle` 到 `CommandVault` (用戶/房東選取時)

## 🧪 驗證與過渡
- [x] 測試從樹狀圖點擊房東後，直接在右側執行停權的完整流程
- [x] 驗證停權警告文字是否符合 `roles.md` 之定義
- [x] 將舊有的 `/admin/organizations` 與 `/admin/users` 路由重新導向至 `/admin/management`
- [x] 更新 `readme.md` 說明文檔
- [x] 建立任務完成 Checkpoint (Commit)