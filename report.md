# 📋 統合治理中心 (Diagnostic DNA) 實作任務報告

## 1. 任務概述
本任務旨在將「統合治理中心」的 Diagnostic DNA 系統從前端模擬數據轉化為底層 API 驅動的真實診斷邏輯，並確保所有 UI 元素、診斷洞察與自動化操作皆符合繁體中文語系規範。

## 2. 完成子任務清單
- **[后端] 資料來源對接**: 透過 Prisma Client 從 `Property`, `Contract`, `Maintenance` 等模型實時計算利用率 (Utilization) 與延遲度 (Latency)。
- **[后端] API 增強**: 升級 `/api/management/tree` 接口，支援傳回實體級別的診斷指標、歷史波形 (Historical Pulse) 與 AI 診斷洞察。
- **[前端] 數據流整合**: 修改 `ManagementViewWrapper` 與 `DiagnosticDNAPanel` 組件，捨棄 Mock Data，全面對接 API 回傳之真實數據。
- **[功能] 全網掃描邏輯**: 實作「執行全網掃描 (Global Scan)」後端邏輯，允許一鍵重新計算全域實體之健康指標並同步至 UI。
- **[功能] 立即修復建議**: 根據診斷數值產生相對應的繁體中文治理建議，並實作後端模擬執行邏輯。
- **[修復] 穩定性優化**: 修正 `ManagementViewWrapper` 在節點切換時由於 `useEffect` 依賴項不當觸發的 `Maximum update depth exceeded` 錯誤。
- **[文檔] 規格整合**: 合併現有架構文檔，產出 `docs/management_comprehensive_spec.md` 作為系統最終技術基準。

## 3. 技術點摘要
- **利用率算法**: `(Occupied 房源數 / 總房源數) * 100`。
- **延遲度算法**: `(Pending 維修單數 / 總房源數) * 100` (權重受限於 100%)。
- **脈動波形 (Sparkline)**: 模擬過去 7 次掃描的數據軌跡，用於展示健康趨勢。

## 4. 檔案變動摘要
- `src/app/api/management/tree/route.ts`: 核心數據聚合邏輯。
- `src/components/management/ManagementViewWrapper.tsx`: 前端生命週期與 API 控制邏輯。
- `docs/management_comprehensive_spec.md`: 新增綜合規格文件。
- `src/app/admin/management/page.tsx`: 頁面入口代碼校閱。

## 5. 結論
整合資產管理中心現已具備真實數據感知能力，能準確反映平台組織與房源的運營狀態。