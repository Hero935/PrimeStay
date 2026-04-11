# 📋 PrimeStay 治理中心整合計畫任務清單

## 🏗️ 規劃與文件
- [x] 檢視 `docs/roles.md` 並評估整合影響
- [x] 更新 `spec.md` 以反映情境感知治理與風險告知規格
- [x] 重構 `spec.md`：移除重複的 Role 定義並引用 `docs/roles.md`
- [x] 生成管理中心設計架構文檔 [`docs/management_center_architecture.md`](docs/management_center_architecture.md)
- [x] 提供 `admin/management` UI 設計建議報告

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

## 🎨 未來 UI/UX 優化 (根據設計建議)
- [x] **管理中心索引 (Tree) 強化**
    - [x] 實作「導航釘選 (Pinned Nodes)」功能，置頂常用組織/房東
    - [x] 增加進階過濾器：支援狀態 (Suspended) 篩選
- [x] **診斷 DNA 交互優化**
    - [x] 實作互動式 Sparklines：點擊圖表柱狀體跳轉模擬稽核日誌
    - [x] 在 Utilization 條形圖整合預測性警戒線 (基於 7 日數據預估)
- [x] **情境感知視覺體驗**
    - [x] 實作「停權氛圍模式」：選中停權節點時，背景網格 (Grid Canvas) 切換為深紅色調
- [x] **治理操作效率提升**
    - [x] 整合全域指令列 (Command Palette `Cmd+K`)
    - [x] 實作成員清單「批次停權/重置角色」功能
- [x] **系統邏輯修補 (Bug Fix & Gaps)**
    - [x] 修正「數據報告」跳轉循環：若目標路由未實作，應引導至內部預覽或顯示開發中
    - [x] 補完「快速管理」：在 `QuickActionDrawer` 加入 `Property` 專屬操作（狀態切換/人員指派）
- [x] **效能與安全強化**
    - [x] 優化 Admin 視圖 API：引入分層延遲加載 (Lazy Loading) 以防止大型數據集延遲
    - [x] 實作 POST/PATCH 行動的後端所屬權驗證 (api-guards.ts)
- [x] **閉環治理解決方案**
    - [x] 將掃描報告中的建議 (Insights) 轉化為可點擊的「一鍵修復」按鈕