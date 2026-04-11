# 🛰️ AIC 統合治理中心設計規範 (v1)

## 1. 系統願景
將獨立的組織 (`/admin/organizations`) 與用戶 (`/admin/users`) 管理功能整合進全域資產中樞 (`/admin/management`)，打造單一入口的「一站式治理解析終端」。

## 2. 業務流程圖 (Flowchart)

```mermaid
graph TD
    Start([管理員進入 NEXUS PULSE]) --> Search[搜尋實體/用戶名稱]
    Search --> NodeClick[點擊樹狀節點]
    NodeClick --> ContextCheck{識別節點類型}
    
    ContextCheck -- 組織 (Organization) --> LoadOrg[加載方案/配額管理元件]
    ContextCheck -- 人員 (User/Landlord) --> LoadUser[加載身份/停權控制元件]
    ContextCheck -- 房源 (Property) --> LoadProp[加載資產診斷數據]
    
    LoadOrg --> Action[執行治理操作]
    LoadUser --> Action
    
    Action --> Feedback[即時更新左側 Pulse 狀態燈號]
    Feedback --> End([完成治理任務])
```

## 3. 循序圖 (Sequence Diagram) - 停權操作範例

```mermaid
sequenceDiagram
    autonumber
    actor Admin as 管理員
    participant Tree as Management Tree
    participant Vault as Command Vault (Right Panel)
    participant API as Backend API
    participant DB as Database

    Admin->>Tree: 點擊 [用戶: 王小明]
    Tree->>Vault: 觸發選取事件 (userId)
    Vault->>API: 獲取用戶安全日誌
    API-->>Vault: 返回狀態數據
    Admin->>Vault: 點擊 [執行停權 (Global Ban)]
    Vault->>API: POST /api/admin/users/status (SUSPENDED)
    API->>DB: 更新用戶狀態與權限標記
    DB-->>API: 成功回傳
    API-->>Vault: 觸發狀態同步
    Vault-->>Tree: 更新節點樣式 (灰階+刪除線)
    Note over Tree, Vault: 使用者無需重新對接或刷新頁面
```

## 4. 物件關聯圖 (ERD / Asset Lineage)

```mermaid
classDiagram
    class Organization {
        +String id
        +String name
        +String plan
        +Metadata quotas
    }
    class User {
        +String id
        +String systemRole
        +Status status
        +String email
    }
    class Property {
        +String id
        +String status
        +Float occupancy
    }
    
    Organization "1" -- "1" User : Owned by (Landlord)
    Organization "1" -- "n" Property : Contains
    Property "1" -- "n" User : Rented by (Tenant)
    
    note for Organization "治理核心：變更 Plan"
    note for User "安全核心：執行 Ban"
```

## 5. UI 規範：Command Vault 狀態切換
- **Empty State**: 顯示 "Strategic Nexus Gateway" 指引介面。
- **Org Mode**: 面板頂部顯示 `Building2` 圖示，整合原 `OrgPlanManager` 組件。
- **User Mode**: 面板頂部顯示 `ShieldAlert` 圖示，整合原 `UserStatusToggle` 組件。
- **Zero-Scroll**: 確保面板內容在手機與桌機版皆不產生全域滾動條。