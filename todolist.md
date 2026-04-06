# 🚀 PrimeStay 管理後台 (Admin Management) 功能實作清單

## 1. 核心功能補完 (Core Functionality)
- [ ] **快速管理 (Quick Management)**: 實作點擊按鈕後開啟 `QuickActionDrawer` 或 `Dialog`
    - [ ] 支援針對選中實體進行「停權/啟動」操作
    - [ ] 支援快速調整組織方案等級
- [ ] **數據報告 (Data Report)**: 實作跳轉至相關數據分析頁面或開啟分析側拉窗
    - [ ] 串接至房東/組織的財務報告
    - [ ] 串接至房源出租率分析
- [ ] **執行全網掃描 (Full Network Scan)**: 實作掃描模擬邏輯
    - [ ] 點擊後觸發 Loading 狀態與掃描進度條
    - [ ] 掃描完成後更新右側 `Diagnostic DNA` 與 `Advisor insight`

## 2. UI/UX 優化 (UI/UX Enhancements)
- [ ] **即時指標對接**: 將診斷面板中的百分比（如 Utilization）與實際資料連動
- [ ] **DNA 動畫演進**: 掃描時 DNA Sparkline 應有動態波形變化
- [ ] **二次確認保護**: 針對危險操作（如停權）增加影響力評估提示

## 3. 系統整合 (System Integration)
- [ ] **API 實作**: 建立 `/api/admin/diagnostics` 用於處理掃描請求
- [ ] **日誌追蹤**: 掃描或管理操作後應產生 Audit Log