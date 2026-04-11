eadme.md</path>
<content lines="1-50">
 1 | # 🏗️ PrimeStay - 高端租屋代管 SaaS 平台
 2 | 
 3 | ## 📝 專案描述
 4 | PrimeStay 是一款專為高端租賃市場設計的 SaaS 代管平台。透過獨家的 **Nexus Pulse** 戰略面板，管理員與房東能以極致扁平化的視角掌控「組織、房東、房源與房客」的正向生態循環。
 5 | 
 6 | ## 📂 檔案結構 (核心)
 7 | ```text
 8 | src/
 9 |  ├── app/
 10 |  │    └── admin/management/     # 管理中樞入口
 11 |  ├── components/
 12 |  │    └── management/           # 戰略索引與工作區核心組件
 13 |  ├── api/
 14 |  │    └── management/tree/      # 階層資料 API (Nexus Index)
 15 |  └── docs/
 16 |       └── roles.md              # 權限、層級與 UI 映射規格書
 17 | ```
 18 | 
 19 | ## 🛠️ 使用技術
 20 | - **Frontend**: Next.js 14 (App Router), Tailwind CSS, Shadcn UI
 21 | - **Backend**: Prisma ORM, PostgreSQL, NextAuth.js
 22 | - **Icons**: Lucide React
 23 | - **Documentation**: Mermaid UML
 24 | 
 25 | ## 📄 核心檔案清單與說明
 26 | | 檔案路徑 | 簡短說明 |
 27 | | :--- | :--- |
 28 | | `src/components/management/ManagementTree.tsx` | 遞迴層級索引樹，支援 Lazy Loading 與狀態脈動指示。 |
 29 | | `src/components/management/ManagementViewWrapper.tsx` | 管理導航主視圖，處理層級感知的 UI 切換與人員過濾。 |
 30 | | `src/app/api/management/tree/route.ts` | 核心 Nexus Index API，負載所有角色的階層對齊邏輯。 |
 31 | | `docs/roles.md` | 定義系統行為、階層映射與停權影響的權威文檔。 |
 32 | | `report.md` | 任務修正報告。 |
 33 | | `todolist.md` | 任務執行進度追蹤。 |
 34 | 
 35 | ## 🚀 安裝及執行方式
 36 | 1. **環境配置**: 複製 `.env.example` 並更名為 `.env`，設定資料庫連線。
 37 | 2. **安裝依賴**: `npm install`
 38 | 3. **資料庫初始化**: `npx prisma db push` 
 39 | 4. **啟動開發伺服器**: `npm run dev`
 40 | 5. **進入管理台**: 登入後訪問 `/admin/management` 開啟戰略面板。