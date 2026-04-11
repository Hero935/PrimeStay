# 🏗️ PrimeStay - 高端租屋代管 SaaS 平台

## 📝 專案描述
PrimeStay 是一款專為高端租賃市場設計的 SaaS 代管平台。透過獨家的 **Nexus Pulse** 戰略面板，管理員與房東能以極致扁平化的視角掌控「組織、房東、房源與房客」的正向生態循環。本次重構強化了管理中心的階層導航與深度資料聚合邏輯。

## 📂 檔案結構 (核心)
```text
src/
 ├── app/
 │    └── admin/management/     # 管理中樞入口
 ├── components/
 │    └── management/           # 戰略索引與工作區核心組件
 ├── api/
 │    └── management/tree/      # 階層資料 API (Nexus Index)
 └── docs/
      └── roles.md              # 權限、層級與 UI 映射規格書
```

## 🛠️ 使用技術
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Shadcn UI
- **Backend**: Prisma ORM, PostgreSQL, NextAuth.js
- **Icons**: Lucide React
- **Documentation**: Mermaid UML

## 📄 核心檔案清單與說明
| 檔案路徑 | 簡短說明 |
| :--- | :--- |
| `src/components/management/ManagementTree.tsx` | 遞迴層級索引樹，支援 Lazy Loading 與狀態脈動指示。 |
| `src/components/management/ManagementViewWrapper.tsx` | 管理導航主視圖，處理層級感知的 UI 切換與深度資料聚合。 |
| `src/app/api/management/tree/route.ts` | 核心 Nexus Index API，提供跨層級統計 (propertiesCount) 與 `deepUsers` 快取。 |
| `docs/roles.md` | 定義系統行為、階層映射與統計邏輯的權威文檔。 |
| `spec.md` | 本次管理中心索引重構的技術規格書。 |
| `report.md` | 任務修正報告與各階段 Checkpoint 紀錄。 |
| `todolist.md` | 任務執行進度追蹤清單。 |

## 🚀 安裝及執行方式
1. **環境配置**: 複製 `.env.example` 並更名為 `.env`，設定資料庫連線。
2. **安裝依賴**: `npm install`
3. **資料庫初始化**: `npx prisma db push` 
4. **啟動開發伺服器**: `npm run dev`
5. **進入管理台**: 登入後訪問 `/admin/management` 開啟戰略面板。